const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Inicializar base de datos al cargar
db.initDatabase();

// Middleware para verificar login
function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    next();
}

// Página principal
router.get('/', async (req, res) => {
    try {
        const [products] = await db.pool.query(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            ORDER BY p.created_at DESC
        `);

        res.render('index', { 
            products,
            message: req.session.message,
            error: req.session.error
        });

        // Limpiar mensajes
        delete req.session.message;
        delete req.session.error;
    } catch (error) {
        console.error(error);
        res.render('index', { 
            products: [], 
            error: 'Error al cargar productos',
            message: null
        });
    }
});

// Perfil de usuario
router.get('/profile', requireLogin, (req, res) => {
    res.render('profile', {
        message: req.session.message,
        error: req.session.error
    });
    delete req.session.message;
    delete req.session.error;
});

module.exports = router;
