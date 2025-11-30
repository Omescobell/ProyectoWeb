const express = require('express');
const cors = require('cors');
const connection = require('./db.js');
const cookieParser = require('cookie-parser');
const app = express();
const path = require('path');

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Verificar conexión a BD
connection.connect(err => {
    if (err) console.error("Error al conectar a la BD:", err);
    else console.log("Conectado a la base de datos");
});

// Middleware de autenticación
const checkAuth = (req, res, next) => {
    const usuarioId = req.cookies.usuarioId;
    if (usuarioId) {
        req.usuarioId = usuarioId;
        next();
    } else {
        res.redirect('/login');
    }
};

// =======================
//        RUTAS WEB
// =======================
// =======================
//        RUTAS WEB
// =======================

app.get('/', checkAuth, (req, res) => {
    res.render('index', { title: 'Pagina Principal' });
});

app.get('/index', checkAuth, (req, res) => {
    res.render('index', { title: 'Pagina Principal' });
});

app.get('/login', (req, res) => {
    res.render('login', { title: 'Inicio de Sesión' });
});

app.get('/registro', (req, res) => {
    res.render('registro', { title: 'Registro' });
});

app.get('/rutinas', checkAuth, (req, res) => {
    res.render('rutinas', { title: 'Rutinas' });
});

// ⚠️ ESTA ES LA RUTA CORRECTA PARA TU ARCHIVO nuevarutina.ejs
app.get('/nueva_rutina', checkAuth, (req, res) => {
    res.render('nuevarutina', { title: 'Nueva Rutina' });
});

app.get('/ejercicios', checkAuth, (req, res) => {
    res.render('ejercicio', { title: 'Ejercicios' });
});

// =======================
//          API
// =======================

// Registro
app.post('/api/registro', (req, res) => {
    const { usuario, correo, psw } = req.body;

    if (!usuario || !correo || !psw)
        return res.status(400).json({ success: false, message: "Faltan datos" });

    const query = "INSERT INTO usuarios (nombre, email, contrasena) VALUES (?, ?, ?)";

    connection.query(query, [usuario, correo, psw], function (err, results) {
        if (err) {
            console.error('Error SQL:', err);
            return res.status(500).json({
                success: false,
                message: 'Error al registrar en base de datos. Verifique si el correo ya existe.'
            });
        }

        res.cookie('usuarioId', results.insertId);
        res.cookie('usuarioNombre', usuario, { encode: String });
        res.json({ success: true });
    });
});

// Login
app.post('/api/login', (req, res) => {
    const { correo, contrasena } = req.body;

    const query = "SELECT * FROM usuarios WHERE email = ? AND contrasena = ?";

    connection.query(query, [correo, contrasena], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Error de servidor" });

        if (results.length > 0) {
            const usuario = results[0];
            res.cookie('usuarioId', usuario.id_usuario);
            res.cookie('usuarioNombre', usuario.nombre);
            return res.json({
                success: true,
                usuarioId: usuario.id_usuario,
                usuarioNombre: usuario.nombre
            });
        } else {
            return res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
        }
    });
});

// Logout
app.get('/logout', (req, res) => {
    res.clearCookie('usuarioId');
    res.redirect('/login');
});

// Obtener categorías
app.get('/api/categorias', (req, res) => {
    connection.query("SELECT * FROM categorias", (err, results) => {
        if (err) {
            console.error("Error obteniendo categorías:", err);
            return res.status(500).json({ error: "Error server" });
        }
        res.json(results);
    });
});

// Obtener ejercicios
app.get('/api/ejercicios', (req, res) => {
    const categoria = req.query.categoria;

    let query = "SELECT * FROM ejercicios";
    let params = [];

    if (categoria && categoria !== "todos") {
        query += " WHERE id_categoria = ?";
        params.push(categoria);
    }

    connection.query(query, params, (err, results) => {
        if (err) {
            console.error("Error obteniendo ejercicios:", err);
            return res.status(500).json({ error: "Error server" });
        }
        res.json(results);
    });
});

// Crear una rutina
app.post('/api/crear_rutina', (req, res) => {
    const id_usuario = req.cookies.usuarioId;
    const { nombre, ejercicios } = req.body;

    if (!id_usuario)
        return res.status(403).json({ success: false, message: "No autenticado" });

    if (!nombre || ejercicios.length === 0)
        return res.status(400).json({ success: false, message: "Datos incompletos" });

    const queryRutina = "INSERT INTO rutinas (id_usuario, nombre) VALUES (?, ?)";

    connection.query(queryRutina, [id_usuario, nombre], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ success: false });
        }

        const id_rutina = result.insertId;

        const queryDetalle =
            "INSERT INTO rutina_detalle (id_rutina, id_ejercicio, series, repeticiones, descanso_segundos) VALUES ?";

        const values = ejercicios.map(ej => [
            id_rutina,
            ej.id_ejercicio,
            ej.series,
            ej.repeticiones,
            ej.descanso_segundos
        ]);

        connection.query(queryDetalle, [values], (err2) => {
            if (err2) {
                console.log(err2);
                return res.status(500).json({ success: false });
            }

            res.json({ success: true });
        });
    });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en ${PORT}`));
