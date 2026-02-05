const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Middleware para verificar login
function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    next();
}

// Ver historial de pedidos
router.get('/', requireLogin, async (req, res) => {
    try {
        const [orders] = await db.pool.query(`
            SELECT * FROM orders
            WHERE user_id = ?
            ORDER BY created_at DESC
        `, [req.session.user.id]);

        // Obtener items de cada pedido
        for (let order of orders) {
            const [items] = await db.pool.query(`
                SELECT * FROM order_items
                WHERE order_id = ?
            `, [order.id]);
            order.items = items;
        }

        res.render('orders', {
            orders,
            message: req.session.message,
            error: req.session.error
        });

        delete req.session.message;
        delete req.session.error;
    } catch (error) {
        console.error(error);
        res.render('orders', {
            orders: [],
            error: 'Error al cargar pedidos'
        });
    }
});

// Procesar checkout (crear pedido desde carrito)
router.post('/checkout', requireLogin, async (req, res) => {
    const userId = req.session.user.id;

    try {
        // Obtener items del carrito
        const [cartItems] = await db.pool.query(`
            SELECT c.*, p.name, p.price, p.stock
            FROM cart c
            INNER JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
        `, [userId]);

        if (cartItems.length === 0) {
            req.session.error = 'El carrito está vacío';
            return res.redirect('/cart');
        }

        // Calcular total
        let total = 0;
        for (const item of cartItems) {
            if (item.quantity > item.stock) {
                req.session.error = `No hay suficiente stock de ${item.name}`;
                return res.redirect('/cart');
            }
            total += item.price * item.quantity;
        }

        // Crear pedido
        const [orderResult] = await db.pool.query(
            'INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)',
            [userId, total, 'Pendiente']
        );

        const orderId = orderResult.insertId;

        // Crear items del pedido y actualizar stock
        for (const item of cartItems) {
            await db.pool.query(
                'INSERT INTO order_items (order_id, product_id, product_name, price, quantity) VALUES (?, ?, ?, ?, ?)',
                [orderId, item.product_id, item.name, item.price, item.quantity]
            );

            // Reducir stock
            await db.pool.query(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.quantity, item.product_id]
            );
        }

        // Vaciar carrito
        await db.pool.query('DELETE FROM cart WHERE user_id = ?', [userId]);
        req.session.cartCount = 0;

        req.session.message = `Pedido #${orderId} creado exitosamente`;
        res.redirect('/orders');
    } catch (error) {
        console.error(error);
        req.session.error = 'Error al procesar el pedido';
        res.redirect('/cart');
    }
});

// Ver detalle de un pedido
router.get('/:id', requireLogin, async (req, res) => {
    try {
        const [orders] = await db.pool.query(`
            SELECT * FROM orders
            WHERE id = ? AND user_id = ?
        `, [req.params.id, req.session.user.id]);

        if (orders.length === 0) {
            req.session.error = 'Pedido no encontrado';
            return res.redirect('/orders');
        }

        const [items] = await db.pool.query(`
            SELECT * FROM order_items
            WHERE order_id = ?
        `, [req.params.id]);

        res.render('order-detail', {
            order: orders[0],
            items,
            message: req.session.message,
            error: req.session.error
        });

        delete req.session.message;
        delete req.session.error;
    } catch (error) {
        console.error(error);
        req.session.error = 'Error al cargar pedido';
        res.redirect('/orders');
    }
});

module.exports = router;
