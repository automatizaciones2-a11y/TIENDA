const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Middleware para verificar si está logueado
function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    next();
}

// Ver carrito
router.get('/', requireLogin, async (req, res) => {
    try {
        const [items] = await db.pool.query(`
            SELECT c.*, p.name, p.price, p.stock, p.image 
            FROM cart c 
            INNER JOIN products p ON c.product_id = p.id 
            WHERE c.user_id = ?
        `, [req.session.user.id]);

        let total = 0;
        items.forEach(item => {
            total += item.price * item.quantity;
        });

        res.render('cart', { 
            items, 
            total,
            message: req.session.message,
            error: req.session.error
        });

        delete req.session.message;
        delete req.session.error;
    } catch (error) {
        console.error(error);
        res.render('cart', { 
            items: [], 
            total: 0,
            error: 'Error al cargar el carrito'
        });
    }
});

// Agregar al carrito
router.post('/add/:productId', requireLogin, async (req, res) => {
    const productId = req.params.productId;
    const userId = req.session.user.id;

    try {
        // Verificar stock
        const [product] = await db.pool.query(
            'SELECT stock FROM products WHERE id = ?',
            [productId]
        );

        if (product.length === 0 || product[0].stock <= 0) {
            req.session.error = 'Producto sin stock';
            return res.redirect('/');
        }

        // Verificar si ya está en el carrito
        const [existing] = await db.pool.query(
            'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );

        if (existing.length > 0) {
            // Actualizar cantidad
            const newQuantity = existing[0].quantity + 1;
            
            if (newQuantity <= product[0].stock) {
                await db.pool.query(
                    'UPDATE cart SET quantity = ? WHERE id = ?',
                    [newQuantity, existing[0].id]
                );
                req.session.message = 'Cantidad actualizada en el carrito';
            } else {
                req.session.error = 'No hay suficiente stock';
            }
        } else {
            // Agregar nuevo
            await db.pool.query(
                'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, 1)',
                [userId, productId]
            );
            req.session.message = 'Producto agregado al carrito';
        }

        // Actualizar conteo del carrito
        const [cart] = await db.pool.query(
            'SELECT SUM(quantity) as total FROM cart WHERE user_id = ?',
            [userId]
        );
        req.session.cartCount = cart[0].total || 0;

        res.redirect('/');
    } catch (error) {
        console.error(error);
        req.session.error = 'Error al agregar al carrito';
        res.redirect('/');
    }
});

// Actualizar cantidad
router.post('/update/:cartId', requireLogin, async (req, res) => {
    const cartId = req.params.cartId;
    const action = req.body.action;

    try {
        const [item] = await db.pool.query(`
            SELECT c.quantity, p.stock 
            FROM cart c 
            INNER JOIN products p ON c.product_id = p.id 
            WHERE c.id = ? AND c.user_id = ?
        `, [cartId, req.session.user.id]);

        if (item.length === 0) {
            return res.redirect('/cart');
        }

        let newQuantity = item[0].quantity;

        if (action === 'increase') {
            newQuantity++;
            if (newQuantity <= item[0].stock) {
                await db.pool.query('UPDATE cart SET quantity = ? WHERE id = ?', [newQuantity, cartId]);
            } else {
                req.session.error = 'No hay suficiente stock';
            }
        } else if (action === 'decrease') {
            newQuantity--;
            if (newQuantity > 0) {
                await db.pool.query('UPDATE cart SET quantity = ? WHERE id = ?', [newQuantity, cartId]);
            } else {
                await db.pool.query('DELETE FROM cart WHERE id = ?', [cartId]);
            }
        } else if (action === 'remove') {
            await db.pool.query('DELETE FROM cart WHERE id = ?', [cartId]);
        }

        // Actualizar conteo
        const [cart] = await db.pool.query(
            'SELECT SUM(quantity) as total FROM cart WHERE user_id = ?',
            [req.session.user.id]
        );
        req.session.cartCount = cart[0].total || 0;

        res.redirect('/cart');
    } catch (error) {
        console.error(error);
        res.redirect('/cart');
    }
});

module.exports = router;
