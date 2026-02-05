# 🚀 TIENDA ELECTRÓNICA - VERSIÓN NODE.JS

## ⚡ INSTALACIÓN RÁPIDA Y FÁCIL

Esta versión usa **Node.js** en lugar de PHP/Apache. Es mucho más fácil de levantar en red local.

---

## 📋 REQUISITOS

Solo necesitas instalar 2 cosas:

1. **Node.js** (incluye npm)
2. **MySQL** (o XAMPP solo para MySQL)

---

## 🔧 PASO 1: INSTALAR NODE.JS

### Windows:

1. Ve a: **https://nodejs.org/**
2. Descarga la versión **LTS** (recomendada)
3. Ejecuta el instalador
4. Acepta todo y deja las opciones por defecto
5. Reinicia tu computadora

### Verificar instalación:

Abre CMD o PowerShell y escribe:
```bash
node --version
npm --version
```

Si ves los números de versión, ¡está instalado! ✅

---

## 🗄️ PASO 2: INSTALAR MYSQL

### Opción A: Solo MySQL

1. Ve a: **https://dev.mysql.com/downloads/mysql/**
2. Descarga MySQL Community Server
3. Instala y configura con contraseña vacía (o anota tu contraseña)

### Opción B: XAMPP (Más fácil)

1. Instala XAMPP como antes
2. **Solo inicia MySQL** (no necesitas Apache)
3. MySQL debe estar en verde

---

## 📥 PASO 3: INSTALAR LA TIENDA

### 3.1 Extraer archivos

1. Extrae **tienda_nodejs.zip**
2. Coloca la carpeta donde quieras (ejemplo: `C:\tienda_nodejs`)

### 3.2 Abrir terminal en la carpeta

**Windows:**
1. Abre la carpeta `tienda_nodejs` en el explorador
2. Escribe `cmd` en la barra de direcciones
3. Presiona Enter

**O usa esto:**
1. Shift + Click derecho en la carpeta
2. "Abrir ventana de PowerShell aquí"

### 3.3 Instalar dependencias

En la terminal, escribe:
```bash
npm install
```

Esto descarga todas las librerías necesarias. Espera a que termine (puede tardar 1-2 minutos).

---

## 🎯 PASO 4: CONFIGURAR LA BASE DE DATOS

### 4.1 Crear base de datos

1. Abre: **http://localhost/phpmyadmin** (si usas XAMPP)
2. Click en "Nueva"
3. Nombre: **`tienda_local`**
4. Click en "Crear"

### 4.2 Configurar conexión (Opcional)

Si tu MySQL tiene contraseña o configuración diferente:

1. Abre el archivo **`.env`**
2. Edita según tu configuración:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña_aqui
DB_NAME=tienda_local
PORT=3000
```

---

## 🚀 PASO 5: INICIAR EL SERVIDOR

En la terminal, escribe:
```bash
npm start
```

Verás algo así:
```
=================================
🚀 Servidor iniciado exitosamente
=================================
📍 Local: http://localhost:3000
🌐 Red:   http://TU_IP:3000
=================================
```

### ¡LISTO! Tu tienda está funcionando ✅

---

## 🌐 PASO 6: ACCEDER A LA TIENDA

### Desde tu computadora:
```
http://localhost:3000
```

### Desde otros dispositivos en tu red:

1. **Encuentra tu IP:**
   - Windows: Abre CMD y escribe `ipconfig`
   - Busca "Dirección IPv4" (ejemplo: 192.168.1.5)

2. **Accede desde cualquier dispositivo:**
   ```
   http://TU_IP:3000
   ```
   Ejemplo: `http://192.168.1.5:3000`

3. **Todos deben estar en la misma WiFi**

---

## 🔥 CONFIGURAR FIREWALL (Si no pueden acceder)

### Windows 10/11:

1. Busca "Firewall de Windows Defender"
2. Click en "Configuración avanzada"
3. Click en "Reglas de entrada" → "Nueva regla"
4. Selecciona "Puerto" → Siguiente
5. TCP → Puerto específico: **3000**
6. "Permitir la conexión" → Siguiente
7. Marca todo (Dominio, Privado, Público) → Siguiente
8. Nombre: "Tienda Node.js" → Finalizar

---

## 👤 CREDENCIALES POR DEFECTO

**Administrador:**
- Email: `admin@tienda.com`
- Contraseña: `admin123`

---

## 📁 ESTRUCTURA DEL PROYECTO

```
tienda_nodejs/
├── server.js          ← Servidor principal
├── package.json       ← Dependencias
├── .env              ← Configuración
├── config/
│   └── database.js   ← Conexión a MySQL
├── routes/           ← Rutas de la aplicación
│   ├── index.js
│   ├── auth.js
│   ├── cart.js
│   ├── orders.js
│   ├── admin.js
│   └── chatbot.js
├── views/            ← Vistas HTML (EJS)
│   ├── index.ejs
│   ├── login.ejs
│   ├── cart.ejs
│   └── ...
└── public/           ← Archivos estáticos
    ├── css/
    ├── js/
    └── uploads/
```

---

## 🎨 CARACTERÍSTICAS

✅ **Tienda completa** - Productos, carrito, pedidos
✅ **Sistema de usuarios** - Clientes y administradores
✅ **Panel de admin** - Gestión completa
✅ **Chatbot integrado** - Responde 24/7
✅ **Base de datos MySQL** - Toda la información guardada
✅ **Acceso en red local** - Desde cualquier dispositivo
✅ **Fácil de configurar** - 5 minutos de instalación

---

## 🔧 COMANDOS ÚTILES

### Iniciar servidor:
```bash
npm start
```

### Iniciar en modo desarrollo (auto-reload):
```bash
npm run dev
```

### Detener servidor:
Presiona `Ctrl + C` en la terminal

### Reinstalar dependencias:
```bash
npm install
```

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Problema: "npm no se reconoce como comando"
**Solución:**
- Node.js no está instalado o no está en el PATH
- Reinstala Node.js y reinicia la computadora

### Problema: "Error: Cannot find module..."
**Solución:**
```bash
npm install
```

### Problema: "Error de conexión a MySQL"
**Solución:**
- Verifica que MySQL esté corriendo
- Revisa las credenciales en el archivo `.env`
- Si XAMPP: asegúrate que MySQL esté en verde

### Problema: "Puerto 3000 ya está en uso"
**Solución:**
- Cambia el puerto en `.env`:
```env
PORT=8080
```
- O cierra la otra aplicación que usa el puerto 3000

### Problema: "No puedo acceder desde otro dispositivo"
**Solución:**
1. Verifica que ambos estén en la misma WiFi
2. Verifica tu IP con `ipconfig`
3. Configura el firewall (ver Paso 6)
4. Prueba desactivar temporalmente el firewall

### Problema: "La base de datos no se crea automáticamente"
**Solución:**
- Crea manualmente la base de datos `tienda_local` en phpMyAdmin
- Las tablas se crean automáticamente al iniciar el servidor

---

## 🎯 VENTAJAS DE LA VERSIÓN NODE.JS

✅ **Más fácil de levantar** - No necesitas Apache ni XAMPP completo
✅ **Un solo comando** - `npm start` y listo
✅ **Acceso automático en red** - Escucha en 0.0.0.0
✅ **Más moderno** - Node.js es muy popular
✅ **Fácil de extender** - Agregar funciones es sencillo
✅ **Mejor rendimiento** - Node.js es muy rápido

---

## 📊 COMPARACIÓN PHP vs NODE.JS

| Característica | PHP (XAMPP) | Node.js |
|---------------|-------------|---------|
| Instalación | Más compleja | Más simple |
| Dependencias | Apache + MySQL | Solo Node + MySQL |
| Iniciar | XAMPP Panel | npm start |
| Velocidad | Rápida | Muy rápida |
| Modernidad | Tradicional | Moderno |
| Extensibilidad | Buena | Excelente |

---

## 🚀 PRÓXIMOS PASOS

1. **Agrega productos:**
   - Inicia sesión como admin
   - Ve a "Admin" → "Productos"
   - Agrega tus productos

2. **Prueba la tienda:**
   - Crea una cuenta de cliente
   - Agrega productos al carrito
   - Realiza un pedido de prueba

3. **Comparte en tu red:**
   - Da tu IP a otros usuarios
   - Ejemplo: `http://192.168.1.5:3000`

---

## 💡 AGREGAR MÁS FUNCIONES

### Cambiar el puerto:
Edita `.env`:
```env
PORT=8080
```

### Agregar más administradores:
1. Registra un usuario normal
2. En phpMyAdmin, edita la tabla `users`
3. Cambia `role` de `cliente` a `admin`

### Personalizar colores:
Edita `/public/css/style.css`

---

## 📝 NOTAS IMPORTANTES

- ⚠️ **Reinicia el servidor** después de cambiar archivos de código
- 💾 **Haz backups** de tu base de datos regularmente
- 🔒 **Cambia la contraseña del admin** después del primer uso
- 🌐 **Firewall:** Asegúrate de permitir el puerto 3000

---

## 🎉 ¡DISFRUTA TU TIENDA!

Tu tienda está lista para funcionar. Es mucho más fácil de usar que la versión PHP.

**Para usarla cada día:**
1. Abre la terminal en la carpeta
2. Escribe: `npm start`
3. Accede a: `http://localhost:3000`

**Para compartir en tu red:**
- Comparte: `http://TU_IP:3000`

---

## 📞 AYUDA ADICIONAL

Si tienes problemas:
1. Verifica que Node.js esté instalado: `node --version`
2. Verifica que MySQL esté corriendo
3. Lee los mensajes de error en la terminal
4. Revisa la sección de "Solución de Problemas"

---

## ✅ CHECKLIST FINAL

- [ ] Node.js instalado (`node --version` funciona)
- [ ] MySQL corriendo (XAMPP con MySQL en verde)
- [ ] Base de datos `tienda_local` creada
- [ ] Dependencias instaladas (`npm install`)
- [ ] Servidor iniciado (`npm start`)
- [ ] Puedo acceder a `http://localhost:3000`
- [ ] Puedo iniciar sesión como admin
- [ ] He agregado al menos un producto

---

¡Felicidades! Tu tienda está funcionando con Node.js 🎊
