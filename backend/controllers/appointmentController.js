const db = require('../config/db');

exports.createAppointment = async (req, res, next) => {
    try {
        const { 
            serviceType, nom, prenom, email, telephone, 
            wilaya, commune, surface, servicesSpecifiques, 
            datePreferee, heurePreferee, notes 
        } = req.body;
        
        if (!serviceType || !nom || !prenom || !email || !datePreferee || !heurePreferee) {
            return res.status(400).json({ error: 'Required fields missing' });
        }
        
        await db.query(
            `INSERT INTO appointments 
            (serviceType, nom, prenom, email, telephone, wilaya, commune, surface, servicesSpecifiques, datePreferee, heurePreferee, notes) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [serviceType, nom, prenom, email, telephone, wilaya, commune, surface, servicesSpecifiques, datePreferee, heurePreferee, notes]
        );
        
        res.status(201).json({ success: true });
    } catch (err) { 
        next(err); 
    }
};

exports.deleteAppointment = async (req, res, next) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM appointments WHERE id=?', [id]);
        res.json({ success: true });
    } catch (err) { 
        next(err); 
    }
};