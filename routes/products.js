const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Listar todos los productos
router.get('/', async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = `
            SELECT p.*, c.name as category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE 1=1
        `;
        const params = [];

        if (category) {
            query += ' AND p.category_id = ?';
            params.push(category);
        }

        if (search) {
            query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY p.created_at DESC';

        const [products] = await db.pool.query(query, params);
        const [categories] = await db.pool.query('SELECT * FROM categories ORDER BY name');

        res.render('products', {
            products,
            categories,
            selectedCategory: category,
            searchTerm: search,
            message: req.session.message,
            error: req.session.error
        });

        delete req.session.message;
        delete req.session.error;
    } catch (error) {
        console.error(error);
        res.render('products', {
            products: [],
            categories: [],
            error: 'Error al cargar productos'
        });
    }
});

// Ver detalle de producto
router.get('/:id', async (req, res) => {
    try {
        const [products] = await db.pool.query(`
            SELECT p.*, c.name as category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        `, [req.params.id]);

        if (products.length === 0) {
            req.session.error = 'Producto no encontrado';
            return res.redirect('/');
        }

        res.render('product-detail', {
            product: products[0],
            message: req.session.message,
            error: req.session.error
        });

        delete req.session.message;
        delete req.session.error;
    } catch (error) {
        console.error(error);
        req.session.error = 'Error al cargar producto';
        res.redirect('/');
    }
});

module.exports = router;
