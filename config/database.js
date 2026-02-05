const mysql = require('mysql2');

// Crear pool de conexiones
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tienda_local',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Promisify para usar async/await
const promisePool = pool.promise();

// Función para crear las tablas
async function initDatabase() {
    try {
        // Crear tabla de usuarios
        await promisePool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('cliente', 'admin') DEFAULT 'cliente',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Crear tabla de categorías
        await promisePool.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Crear tabla de productos
        await promisePool.query(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(200) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                stock INT DEFAULT 0,
                category_id INT,
                image VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
            )
        `);

        // Crear tabla de carrito
        await promisePool.query(`
            CREATE TABLE IF NOT EXISTS cart (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT DEFAULT 1,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                UNIQUE KEY unique_user_product (user_id, product_id)
            )
        `);

        // Crear tabla de pedidos
        await promisePool.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                total DECIMAL(10,2) NOT NULL,
                status VARCHAR(50) DEFAULT 'Pendiente',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Crear tabla de items de pedidos
        await promisePool.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                product_id INT NOT NULL,
                product_name VARCHAR(200) NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                quantity INT NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            )
        `);

        console.log('✅ Tablas de base de datos creadas/verificadas');

        // Limpiar categorías duplicadas (mantener solo el ID más bajo de cada nombre)
        await promisePool.query(`
            DELETE c1 FROM categories c1
            INNER JOIN categories c2
            WHERE c1.id > c2.id AND c1.name = c2.name
        `);

        // Insertar categorías por defecto (solo si no existen)
        const categories = ['Laptops', 'Smartphones', 'Tablets', 'Accesorios', 'Audio', 'Gaming'];
        for (const cat of categories) {
            const [existing] = await promisePool.query('SELECT id FROM categories WHERE name = ?', [cat]);
            if (existing.length === 0) {
                await promisePool.query('INSERT INTO categories (name) VALUES (?)', [cat]);
            }
        }

        console.log('✅ Categorías verificadas (duplicados eliminados)');

        // Crear usuario admin por defecto
        const bcrypt = require('bcryptjs');
        const adminPassword = await bcrypt.hash('admin123', 10);
        
        await promisePool.query(`
            INSERT INTO users (name, email, password, role) 
            SELECT 'Administrador', 'admin@tienda.com', ?, 'admin'
            WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@tienda.com')
        `, [adminPassword]);

        console.log('✅ Usuario administrador creado (admin@tienda.com / admin123)');

    } catch (error) {
        console.error('❌ Error al inicializar base de datos:', error);
    }
}

module.exports = {
    pool: promisePool,
    initDatabase
};
