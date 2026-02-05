const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Respuestas mejoradas del chatbot
const responses = {
    saludo: [
        '¡Hola! 👋 Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
        '¡Bienvenido a TIENDA DNA! 🎉 ¿Qué te gustaría saber?',
        '¡Hey! 😊 Estoy aquí para ayudarte. Pregúntame lo que necesites.'
    ],
    despedida: [
        '¡Hasta luego! 👋 Gracias por visitarnos.',
        '¡Que tengas un excelente día! 🌟 Vuelve pronto.',
        '¡Adiós! 😊 Estamos aquí cuando nos necesites.'
    ],
    agradecimiento: [
        '¡De nada! 😊 ¿Hay algo más en lo que pueda ayudarte?',
        '¡Con gusto! 🙌 Estoy para servirte.',
        '¡No hay de qué! ¿Necesitas algo más?'
    ],
    precio: [
        '💰 Los precios están visibles en cada producto. ¿Buscas algo en particular? Escribe "buscar [producto]"',
        '📊 Puedes ver todos los precios en la página principal. Si me dices qué buscas, te ayudo a encontrarlo.'
    ],
    envio: [
        '🚚 Realizamos envíos a todo el país:\n• Tiempo de entrega: 3-5 días hábiles\n• Envío gratis en compras mayores a $500\n• Rastreo disponible',
        '📦 Tu pedido se prepara en 24 horas. Envíos a domicilio en 3-5 días. ¿Tienes más dudas sobre entregas?'
    ],
    pago: [
        '💳 Métodos de pago disponibles:\n• Efectivo contra entrega\n• Transferencia bancaria\n• Tarjeta de crédito/débito\n\n¡Todas las transacciones son seguras!',
        '🔐 Aceptamos efectivo, tarjeta y transferencia. El pago contra entrega es nuestra opción más popular.'
    ],
    stock: [
        '📦 El stock se muestra en tiempo real en cada producto. Si dice "✅ En stock" está disponible para compra inmediata.',
        '🔄 Actualizamos el inventario constantemente. ¿Quieres que busque un producto específico?'
    ],
    devolucion: [
        '↩️ Política de devoluciones:\n• 7 días para devolución sin preguntas\n• Producto en condiciones originales\n• Reembolso en 3-5 días\n• Envío de devolución gratis',
        '✅ Garantía de satisfacción: Si no te gusta, lo devuelves en 7 días y te reembolsamos el 100%.'
    ],
    contacto: [
        '📞 Contáctanos:\n• Chat: Estás hablando conmigo 😊\n• Email: soporte@tiendadna.com\n• Horario: Lun-Vie 9am-6pm',
        '💬 Puedo ayudarte con la mayoría de consultas. Para temas específicos, escribe a soporte@tiendadna.com'
    ],
    cuenta: [
        '👤 Sobre tu cuenta:\n• Regístrate para comprar\n• Ve tus pedidos en "Mis Pedidos"\n• Actualiza tu perfil cuando quieras',
        '🔑 Para crear una cuenta, haz clic en "Registrarse" en el menú. Es rápido y gratis.'
    ],
    pedido: [
        '📋 Para ver tus pedidos:\n1. Inicia sesión\n2. Ve a "Mis Pedidos" en el menú\n3. Ahí verás el estado de cada compra',
        '🔍 Puedes rastrear tus pedidos en la sección "Mis Pedidos". ¿Tienes algún problema con un pedido?'
    ],
    carrito: [
        '🛒 Tu carrito:\n• Agrega productos con "Agregar al Carrito"\n• Modifica cantidades desde el carrito\n• Procede al pago cuando estés listo',
        '💡 Tip: Los productos en tu carrito se guardan mientras tengas la sesión activa.'
    ],
    ayuda: [
        '❓ Puedo ayudarte con:\n• 🔍 Buscar productos\n• 💰 Precios\n• 🚚 Envíos\n• 💳 Pagos\n• ↩️ Devoluciones\n• 📋 Pedidos\n\n¿Qué necesitas saber?',
        '🤖 Soy tu asistente virtual. Pregúntame sobre productos, envíos, pagos, o escribe "buscar [producto]" para encontrar algo.'
    ],
    promocion: [
        '🎁 ¡Ofertas actuales!\n• Envío gratis en compras +$500\n• 10% descuento en tu primera compra\n• Nuevos productos cada semana',
        '🔥 ¡No te pierdas nuestras ofertas! Revisa la página principal para ver los productos destacados.'
    ],
    productos: [
        '🛍️ Tenemos gran variedad de productos. Escribe "buscar [lo que necesitas]" y te muestro opciones.',
        '📱 Explora nuestra tienda en la página principal o dime qué buscas y te ayudo a encontrarlo.'
    ],
    default: [
        '🤔 No estoy seguro de entender. Intenta preguntarme sobre:\n• Productos y precios\n• Envíos y entregas\n• Formas de pago\n• Devoluciones',
        '💭 Hmm, no tengo información sobre eso. ¿Puedes reformular tu pregunta? O escribe "ayuda" para ver qué puedo hacer.',
        '❓ No encontré una respuesta para eso. Prueba con "buscar [producto]" o pregunta sobre envíos, pagos o devoluciones.'
    ]
};

// Detectar intención del mensaje mejorada
function detectIntent(message) {
    const msg = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Saludos
    if (msg.match(/^(hola|buenos|buenas|hey|hi|saludos|que tal|ola)/)) return 'saludo';

    // Despedidas
    if (msg.match(/adios|bye|chao|hasta luego|nos vemos|me voy/)) return 'despedida';

    // Agradecimientos
    if (msg.match(/gracias|thank|agradec|te lo agradezco/)) return 'agradecimiento';

    // Ayuda general
    if (msg.match(/^(ayuda|help|menu|opciones|que puedes|como funciona)/)) return 'ayuda';

    // Precios
    if (msg.match(/precio|costo|cuanto|vale|cuesta|barato|caro|oferta|descuento/)) return 'precio';

    // Envíos
    if (msg.match(/envio|entrega|llega|despacho|shipping|demora|tarda|cuando llega|domicilio/)) return 'envio';

    // Pagos
    if (msg.match(/pago|pagar|tarjeta|efectivo|transferencia|debito|credito|metodo/)) return 'pago';

    // Stock
    if (msg.match(/stock|disponible|hay|tienen|queda|agotado|inventario/)) return 'stock';

    // Devoluciones
    if (msg.match(/devol|cambio|reembolso|garantia|reclamo|problema con/)) return 'devolucion';

    // Contacto
    if (msg.match(/contacto|telefono|email|correo|llamar|hablar|humano|persona|atencion/)) return 'contacto';

    // Cuenta
    if (msg.match(/cuenta|registr|login|sesion|contrasena|password|perfil/)) return 'cuenta';

    // Pedidos
    if (msg.match(/pedido|orden|compra|estado|rastrear|seguimiento|donde esta mi/)) return 'pedido';

    // Carrito
    if (msg.match(/carrito|cart|canasta|agregar|quitar/)) return 'carrito';

    // Promociones
    if (msg.match(/promocion|oferta|descuento|cupon|rebaja|sale/)) return 'promocion';

    // Productos generales
    if (msg.match(/producto|catalogo|que venden|que tienen|articulo/)) return 'productos';

    return 'default';
}

// Obtener respuesta aleatoria
function getResponse(intent) {
    const options = responses[intent];
    return options[Math.floor(Math.random() * options.length)];
}

// Endpoint para mensajes del chatbot
router.post('/message', async (req, res) => {
    const { message } = req.body;

    if (!message || message.trim() === '') {
        return res.json({ response: '¿En qué puedo ayudarte? 😊' });
    }

    try {
        const msg = message.toLowerCase();

        // Comando: mostrar productos populares
        if (msg.match(/^(populares|mas vendidos|destacados|recomendados)/)) {
            const [products] = await db.pool.query(
                'SELECT name, price FROM products ORDER BY created_at DESC LIMIT 5'
            );

            if (products.length > 0) {
                let productList = products.map(p => `• ${p.name}: $${parseFloat(p.price).toFixed(2)}`).join('\n');
                return res.json({
                    response: `🌟 Productos destacados:\n\n${productList}\n\n¿Te interesa alguno?`
                });
            }
        }

        // Comando: buscar productos
        const searchMatch = msg.match(/(?:buscar?|busco|quiero|necesito|tienes?|hay|donde encuentro)\s+(.+)/i);

        if (searchMatch) {
            const searchTerm = searchMatch[1].trim().replace(/[?¿]/g, '');
            const [products] = await db.pool.query(
                'SELECT name, price, stock FROM products WHERE name LIKE ? OR description LIKE ? LIMIT 5',
                [`%${searchTerm}%`, `%${searchTerm}%`]
            );

            if (products.length > 0) {
                let productList = products.map(p => {
                    const stockStatus = p.stock > 0 ? '✅' : '❌';
                    return `• ${p.name}: $${parseFloat(p.price).toFixed(2)} ${stockStatus}`;
                }).join('\n');
                return res.json({
                    response: `🔍 Encontré ${products.length} resultado(s) para "${searchTerm}":\n\n${productList}\n\n✅ = En stock | ❌ = Agotado`
                });
            } else {
                return res.json({
                    response: `😕 No encontré productos con "${searchTerm}". Intenta con otro término o revisa nuestro catálogo en la página principal.`
                });
            }
        }

        // Comando: cuántos productos hay
        if (msg.match(/cuantos productos|total productos|inventario total/)) {
            const [result] = await db.pool.query('SELECT COUNT(*) as total FROM products WHERE stock > 0');
            return res.json({
                response: `📊 Actualmente tenemos ${result[0].total} productos disponibles en la tienda. ¡Explora nuestro catálogo!`
            });
        }

        // Respuesta basada en intención
        const intent = detectIntent(message);
        const response = getResponse(intent);

        res.json({ response });
    } catch (error) {
        console.error(error);
        res.json({ response: '😅 Ups, tuve un pequeño problema. ¿Puedes intentar de nuevo?' });
    }
});

module.exports = router;
