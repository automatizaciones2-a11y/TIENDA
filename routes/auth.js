const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/database');

// Mostrar formulario de login
router.get('/login', (req, res) => {
    res.render('login', { 
        error: req.session.error,
        message: req.session.message
    });
    delete req.session.error;
    delete req.session.message;
});

// Procesar login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            req.session.error = 'Usuario no encontrado';
            return res.redirect('/auth/login');
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            req.session.error = 'Contraseña incorrecta';
            return res.redirect('/auth/login');
        }

        // Guardar usuario en sesión
        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        // Contar items en carrito
        const [cart] = await db.pool.query(
            'SELECT SUM(quantity) as total FROM cart WHERE user_id = ?',
            [user.id]
        );
        req.session.cartCount = cart[0].total || 0;

        // Redirigir según rol
        if (user.role === 'admin') {
            res.redirect('/admin');
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.error(error);
        req.session.error = 'Error al iniciar sesión';
        res.redirect('/auth/login');
    }
});

// Mostrar formulario de registro
router.get('/register', (req, res) => {
    res.render('register', { 
        error: req.session.error,
        message: req.session.message
    });
    delete req.session.error;
    delete req.session.message;
});

// Procesar registro
router.post('/register', async (req, res) => {
    const { name, email, password, confirm_password } = req.body;

    // Validaciones
    if (!name || !email || !password || !confirm_password) {
        req.session.error = 'Por favor, completa todos los campos';
        return res.redirect('/auth/register');
    }

    if (password !== confirm_password) {
        req.session.error = 'Las contraseñas no coinciden';
        return res.redirect('/auth/register');
    }

    if (password.length < 6) {
        req.session.error = 'La contraseña debe tener al menos 6 caracteres';
        return res.redirect('/auth/register');
    }

    try {
        // Verificar si el email ya existe
        const [existing] = await db.pool.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            req.session.error = 'Este email ya está registrado';
            return res.redirect('/auth/register');
        }

        // Hash de contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar usuario
        await db.pool.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, 'cliente']
        );

        req.session.message = 'Registro exitoso. Por favor inicia sesión.';
        res.redirect('/auth/login');
    } catch (error) {
        console.error(error);
        req.session.error = 'Error al registrar usuario';
        res.redirect('/auth/register');
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
