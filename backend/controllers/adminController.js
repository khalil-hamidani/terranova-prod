const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');

// Admin Login
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const [users] = await db.query(
      'SELECT * FROM admin_users WHERE username = ? AND isActive = TRUE',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await db.query('UPDATE admin_users SET lastLogin = NOW() WHERE id = ?', [user.id]);

    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

// Create Admin User (only super_admin can do this)
exports.createAdminUser = async (req, res, next) => {
  try {
    const { username, password, email, fullName, role } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Le mot de passe doit comporter au moins 8 caractères' });
    }

    const assignedRole = role === 'super_admin' ? 'super_admin' : 'admin';

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO admin_users (username, password, email, fullName, role) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, email, fullName || null, assignedRole]
    );

    res.status(201).json({ success: true, message: 'Admin user created' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    next(err);
  }
};

// Get Dashboard Stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [productsCount] = await db.query('SELECT COUNT(*) as count FROM products');
    const [ordersCount] = await db.query('SELECT COUNT(*) as count FROM orders');
    const [appointmentsCount] = await db.query('SELECT COUNT(*) as count FROM appointments');
    const [pendingAppointments] = await db.query("SELECT COUNT(*) as count FROM appointments WHERE status = 'pending'");

    // Revenue tracking: count all confirmed, processing, shipped, delivered, or paid orders
    const [totalRevenue] = await db.query(
      `SELECT COALESCE(SUM(totalAmount), 0) as total 
       FROM orders 
       WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered', 'paid') 
          OR paymentStatus = 'paid'`
    );
    const [confirmedOrdersCount] = await db.query(
      `SELECT COUNT(*) as count 
       FROM orders 
       WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered', 'paid') 
          OR paymentStatus = 'paid'`
    );
    const [pendingRevenue] = await db.query(
      `SELECT COALESCE(SUM(totalAmount), 0) as total 
       FROM orders 
       WHERE status = 'pending' AND paymentStatus != 'paid'`
    );
    const [recentOrders] = await db.query('SELECT * FROM orders ORDER BY createdAt DESC LIMIT 5');

    res.json({
      products: productsCount[0].count,
      orders: ordersCount[0].count,
      confirmedOrders: confirmedOrdersCount[0].count,
      appointments: appointmentsCount[0].count,
      pendingAppointments: pendingAppointments[0].count,
      revenue: parseFloat(totalRevenue[0].total) || 0,
      pendingRevenue: parseFloat(pendingRevenue[0].total) || 0,
      recentOrders
    });
  } catch (err) {
    next(err);
  }
};

// Get All Appointments
exports.getAppointments = async (req, res, next) => {
  try {
    const [appointments] = await db.query('SELECT * FROM appointments ORDER BY createdAt DESC');
    res.json(appointments);
  } catch (err) {
    next(err);
  }
};

// Update Appointment Status
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await db.query('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// Delete Appointment
exports.deleteAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM appointments WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// Get All Orders
exports.getOrders = async (req, res, next) => {
  try {
    const [orders] = await db.query(`
      SELECT o.*,
        COALESCE(
          (SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', oi.id,
              'productId', oi.productId,
              'productName', oi.productName,
              'productPrice', oi.productPrice,
              'quantity', oi.quantity,
              'subtotal', oi.subtotal
            )
          ) FROM order_items oi WHERE oi.orderId = o.id),
          JSON_ARRAY()
        ) AS items
      FROM orders o
      ORDER BY o.createdAt DESC
    `);
    const formattedOrders = orders.map(o => {
      let parsedItems = [];
      try {
        parsedItems = typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []);
      } catch (e) {
        parsedItems = [];
      }
      return {
        ...o,
        items: parsedItems
      };
    });
    res.json(formattedOrders);
  } catch (err) {
    next(err);
  }
};

// Update Order Status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'paid', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    let query = 'UPDATE orders SET status = ?';
    const params = [status];

    if (paymentStatus) {
      query += ', paymentStatus = ?';
      params.push(paymentStatus);
    } else if (status === 'paid' || status === 'delivered') {
      query += ", paymentStatus = 'paid'";
    } else if (status === 'cancelled') {
      query += ", paymentStatus = 'failed'";
    }

    query += ' WHERE id = ?';
    params.push(id);

    await db.query(query, params);
    res.json({ success: true, status });
  } catch (err) {
    next(err);
  }
};

// Get All Contacts
exports.getContacts = async (req, res, next) => {
  try {
    const [contacts] = await db.query('SELECT * FROM contacts ORDER BY createdAt DESC');
    res.json(contacts);
  } catch (err) {
    next(err);
  }
};

// Update Contact Status
exports.updateContactStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'read', 'responded'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await db.query('UPDATE contacts SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
