const crypto = require('crypto');
const db = require('../config/db');
const WHATSAPP_NUMBER = (process.env.WHATSAPP_NUMBER || '213784472366').replace(/\D/g, '');

const buildOrderMessage = ({ orderNumber, nom, prenom, telephone, email, wilaya, commune, adresse, items, totalAmount }) => {
  const itemLines = items
    .map((item) => `- ${item.name} x${item.quantity} = ${item.price * item.quantity} DA`)
    .join('\n');

  return [
    'Nouvelle commande TerraNova',
    `Commande: ${orderNumber}`,
    `Client: ${prenom} ${nom}`,
    `Téléphone: ${telephone}`,
    `Email: ${email}`,
    `Adresse: ${wilaya}, ${commune} - ${adresse}`,
    '',
    'Articles:',
    itemLines,
    '',
    `Total: ${totalAmount} DA`,
    '',
    'Merci de confirmer la commande.'
  ].join('\n');
};

const buildWhatsAppUrl = (message) => {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

// Create Order (with strict server-side price validation)
exports.createOrder = async (req, res, next) => {
  try {
    const { nom, prenom, telephone, email, wilaya, commune, adresse, notes, items, paymentMethod } = req.body;

    if (!nom || !prenom || !telephone || !email || !wilaya || !commune || !adresse || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Tous les champs obligatoires doivent être renseignés.' });
    }

    // 1. Sanitize & extract unique product IDs
    const productIds = [...new Set(items.map(i => parseInt(i.id, 10)).filter(id => !isNaN(id) && id > 0))];
    if (productIds.length === 0) {
      return res.status(400).json({ error: 'La liste d\'articles est invalide.' });
    }

    // 2. Fetch canonical prices and stock from the database (prevents price tampering)
    const [dbProducts] = await db.query(
      'SELECT id, name, price, stock, isActive FROM products WHERE id IN (?) AND isActive = TRUE',
      [productIds]
    );

    const productMap = new Map(dbProducts.map(p => [p.id, p]));

    let totalAmount = 0;
    const verifiedItems = [];

    for (const item of items) {
      const pid = parseInt(item.id, 10);
      const dbProduct = productMap.get(pid);

      if (!dbProduct) {
        return res.status(400).json({ error: `Article introuvable ou indisponible : ${item.name || pid}` });
      }

      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty < 1 || qty > 500) {
        return res.status(400).json({ error: `Quantité invalide pour l'article : ${dbProduct.name}` });
      }

      const unitPrice = Number(dbProduct.price);
      const subtotal = unitPrice * qty;
      totalAmount += subtotal;

      verifiedItems.push({
        id: dbProduct.id,
        name: dbProduct.name,
        price: unitPrice,
        quantity: qty,
        subtotal
      });
    }

    // 3. Generate cryptographically unguessable order number
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const orderNumber = `TN${Date.now()}-${randomSuffix}`;

    // 4. Create order in database
    const [orderResult] = await db.query(
      `INSERT INTO orders (orderNumber, nom, prenom, telephone, email, wilaya, commune, adresse, notes, totalAmount, status, paymentMethod, paymentStatus) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, 'pending')`,
      [orderNumber, nom, prenom, telephone, email, wilaya, commune, adresse, notes || null, totalAmount, paymentMethod || 'cod']
    );

    const orderId = orderResult.insertId;

    // 5. Insert verified order items
    for (const vItem of verifiedItems) {
      await db.query(
        'INSERT INTO order_items (orderId, productId, productName, productPrice, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
        [orderId, vItem.id, vItem.name, vItem.price, vItem.quantity, vItem.subtotal]
      );
    }

    const orderMessage = buildOrderMessage({
      orderNumber,
      nom,
      prenom,
      telephone,
      email,
      wilaya,
      commune,
      adresse,
      items: verifiedItems,
      totalAmount
    });

    const whatsappUrl = buildWhatsAppUrl(orderMessage);

    res.status(201).json({
      success: true,
      orderId,
      orderNumber,
      totalAmount,
      message: orderMessage,
      whatsappUrl
    });

  } catch (err) {
    next(err);
  }
};

// Get Order Status (Masks PII to prevent data scraping)
exports.getOrderStatus = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;

    const [orders] = await db.query(
      `SELECT o.id, o.orderNumber, o.status, o.totalAmount, o.wilaya, o.commune, o.createdAt,
              CONCAT(SUBSTRING(o.telephone, 1, 4), '****', SUBSTRING(o.telephone, -2)) as maskedTelephone,
              CONCAT(SUBSTRING(o.prenom, 1, 1), '*** ', SUBSTRING(o.nom, 1, 1), '***') as maskedClient,
        (SELECT JSON_ARRAYAGG(JSON_OBJECT(
          'productName', oi.productName,
          'productPrice', oi.productPrice,
          'quantity', oi.quantity,
          'subtotal', oi.subtotal
        )) FROM order_items oi WHERE oi.orderId = o.id) as items
      FROM orders o
      WHERE o.orderNumber = ?`,
      [orderNumber]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[0];
    order.items = order.items ? JSON.parse(order.items) : [];

    res.json(order);
  } catch (err) {
    next(err);
  }
};

