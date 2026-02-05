const express = require('express');
const router = express.Router();
const db = require('../config/database');
const path = require('path');

// Middleware para verificar admin
function requireAdmin(req, res, next) {
    if (!req.session.user || req.session.user.role !== 'admin') {
        req.session.error = 'Acceso denegado';
        return res.redirect('/');
    }
    next();
}

// Panel principal de admin
router.get('/', requireAdmin, async (req, res) => {
    try {
        const [products] = await db.pool.query('SELECT COUNT(*) as total FROM products');
        const [orders] = await db.pool.query('SELECT COUNT(*) as total FROM orders');
        const [users] = await db.pool.query('SELECT COUNT(*) as total FROM users');
        const [recentOrders] = await db.pool.query(`
            SELECT o.*, u.name as user_name
            FROM orders o
            INNER JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
            LIMIT 5
        `);

        res.render('admin', {
            stats: {
                products: products[0].total,
                orders: orders[0].total,
                users: users[0].total
            },
            recentOrders,
            message: req.session.message,
            error: req.session.error
        });

        delete req.session.message;
        delete req.session.error;
    } catch (error) {
        console.error(error);
        res.render('admin', {
            stats: { products: 0, orders: 0, users: 0 },
            recentOrders: [],
            error: 'Error al cargar panel'
        });
    }
});

// Lista de productos (admin)
router.get('/products', requireAdmin, async (req, res) => {
    try {
        const [products] = await db.pool.query(`
            SELECT p.*, c.name as category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.created_at DESC
        `);
        const [categories] = await db.pool.query('SELECT * FROM categories ORDER BY name');

        res.render('admin-products', {
            products,
            categories,
            message: req.session.message,
            error: req.session.error
        });

        delete req.session.message;
        delete req.session.error;
    } catch (error) {
        console.error(error);
        res.render('admin-products', {
            products: [],
            categories: [],
            error: 'Error al cargar productos'
        });
    }
});

// Crear producto
router.post('/products', requireAdmin, async (req, res) => {
    const { name, description, price, stock, category_id } = req.body;

    try {
        let imageName = null;

        // Procesar imagen si se subió
        if (req.files && req.files.image) {
            const image = req.files.image;
            imageName = Date.now() + '-' + image.name.replace(/\s/g, '_');
            const uploadPath = path.join(__dirname, '../public/uploads', imageName);
            await image.mv(uploadPath);
        }

        await db.pool.query(
            'INSERT INTO products (name, description, price, stock, category_id, image) VALUES (?, ?, ?, ?, ?, ?)',
            [name, description, price, stock, category_id || null, imageName]
        );

        req.session.message = 'Producto creado exitosamente';
        res.redirect('/admin/products');
    } catch (error) {
        console.error(error);
        req.session.error = 'Error al crear producto';
        res.redirect('/admin/products');
    }
});

// Editar producto (formulario)
router.get('/products/edit/:id', requireAdmin, async (req, res) => {
    try {
        const [products] = await db.pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        const [categories] = await db.pool.query('SELECT * FROM categories ORDER BY name');

        if (products.length === 0) {
            req.session.error = 'Producto no encontrado';
            return res.redirect('/admin/products');
        }

        res.render('admin-product-edit', {
            product: products[0],
            categories,
            message: req.session.message,
            error: req.session.error
        });

        delete req.session.message;
        delete req.session.error;
    } catch (error) {
        console.error(error);
        req.session.error = 'Error al cargar producto';
        res.redirect('/admin/products');
    }
});

// Actualizar producto
router.post('/products/edit/:id', requireAdmin, async (req, res) => {
    const { name, description, price, stock, category_id } = req.body;
    const productId = req.params.id;

    try {
        let updateQuery = 'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category_id = ?';
        let params = [name, description, price, stock, category_id || null];

        // Procesar imagen si se subió una nueva
        if (req.files && req.files.image) {
            const image = req.files.image;
            const imageName = Date.now() + '-' + image.name.replace(/\s/g, '_');
            const uploadPath = path.join(__dirname, '../public/uploads', imageName);
            await image.mv(uploadPath);
            updateQuery += ', image = ?';
            params.push(imageName);
        }

        updateQuery += ' WHERE id = ?';
        params.push(productId);

        await db.pool.query(updateQuery, params);

        req.session.message = 'Producto actualizado exitosamente';
        res.redirect('/admin/products');
    } catch (error) {
        console.error(error);
        req.session.error = 'Error al actualizar producto';
        res.redirect('/admin/products');
    }
});

// Eliminar producto
router.post('/products/delete/:id', requireAdmin, async (req, res) => {
    try {
        await db.pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        req.session.message = 'Producto eliminado exitosamente';
    } catch (error) {
        console.error(error);
        req.session.error = 'Error al eliminar producto';
    }
    res.redirect('/admin/products');
});

// Lista de pedidos (admin)
router.get('/orders', requireAdmin, async (req, res) => {
    try {
        const [orders] = await db.pool.query(`
            SELECT o.*, u.name as user_name, u.email as user_email
            FROM orders o
            INNER JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        `);

        res.render('admin-orders', {
            orders,
            message: req.session.message,
            error: req.session.error
        });

        delete req.session.message;
        delete req.session.error;
    } catch (error) {
        console.error(error);
        res.render('admin-orders', {
            orders: [],
            error: 'Error al cargar pedidos'
        });
    }
});

// Actualizar estado de pedido
router.post('/orders/:id/status', requireAdmin, async (req, res) => {
    const { status } = req.body;

    try {
        await db.pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
        req.session.message = 'Estado del pedido actualizado';
    } catch (error) {
        console.error(error);
        req.session.error = 'Error al actualizar estado';
    }
    res.redirect('/admin/orders');
});

// Lista de usuarios (admin)
router.get('/users', requireAdmin, async (req, res) => {
    try {
        const [users] = await db.pool.query(`
            SELECT u.*,
                   (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as total_orders,
                   (SELECT COALESCE(SUM(total), 0) FROM orders WHERE user_id = u.id) as total_spent
            FROM users u
            ORDER BY u.created_at DESC
        `);

        res.render('admin-users', {
            users,
            message: req.session.message,
            error: req.session.error
        });

        delete req.session.message;
        delete req.session.error;
    } catch (error) {
        console.error(error);
        res.render('admin-users', {
            users: [],
            error: 'Error al cargar usuarios'
        });
    }
});

// Cambiar rol de usuario
router.post('/users/:id/role', requireAdmin, async (req, res) => {
    const { role } = req.body;
    const userId = req.params.id;

    // No permitir cambiar el rol del usuario actual
    if (parseInt(userId) === req.session.user.id) {
        req.session.error = 'No puedes cambiar tu propio rol';
        return res.redirect('/admin/users');
    }

    try {
        await db.pool.query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
        req.session.message = 'Rol actualizado exitosamente';
    } catch (error) {
        console.error(error);
        req.session.error = 'Error al actualizar rol';
    }
    res.redirect('/admin/users');
});

module.exports = router;
