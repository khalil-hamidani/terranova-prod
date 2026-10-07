const db = require('../config/db');

exports.createContact = async (req, res, next) => {
    try {
        const { nomComplet, email, telephone, sujet, message } = req.body;
        
        if (!nomComplet || !email || !message) {
            return res.status(400).json({ error: 'Required fields missing' });
        }
        
        await db.query(
            'INSERT INTO contacts (nomComplet, email, telephone, sujet, message) VALUES (?, ?, ?, ?, ?)',
            [nomComplet, email, telephone || null, sujet || null, message]
        );
        
        res.status(201).json({ success: true });
    } catch (err) { 
        next(err); 
    }
};