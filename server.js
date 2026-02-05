const express = require('express');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(fileUpload());

// Configuración de sesiones
app.use(session({
    secret: 'tu-secreto-super-seguro-12345',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        secure: false // Cambiar a true si usas HTTPS
    }
}));

// Middleware para pasar datos a todas las vistas
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.isAdmin = req.session.user?.role === 'admin';
    res.locals.cartCount = req.session.cartCount || 0;

    // Flash messages - pasar a la vista y luego borrar
    res.locals.message = req.session.message || null;
    res.locals.error = req.session.error || null;
    delete req.session.message;
    delete req.session.error;

    next();
});

// Importar rutas
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const chatbotRoutes = require('./routes/chatbot');

// Usar rutas
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/admin', adminRoutes);
app.use('/chatbot', chatbotRoutes);

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log('=================================');
    console.log('🚀 Servidor iniciado exitosamente');
    console.log('=================================');
    console.log(`📍 Local: http://localhost:${PORT}`);
    console.log(`🌐 Red:   http://TU_IP:${PORT}`);
    console.log('=================================');
    console.log('Para encontrar tu IP:');
    console.log('Windows: ipconfig');
    console.log('Mac/Linux: ifconfig');
    console.log('=================================');
});
