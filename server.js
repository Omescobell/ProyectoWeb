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

app.get('/nueva_rutina', checkAuth, (req, res) => {
    res.render('nuevarutina', { 
        title: 'Nueva Rutina',
        usuarioNombre: req.cookies.usuarioNombre || "Usuario"
    });
});

app.get('/ejercicios', checkAuth, (req, res) => {
    res.render('ejercicio', { title: 'Ejercicios' });
});


// =======================
//       API GRAFICAS
// =======================

// 1. Grupos musculares usados
app.get('/api/graficas/grupos-musculares', (req, res) => {
    const query = `
        SELECT c.nombre AS grupo, COUNT(*) AS total
        FROM rutina_detalle rd
        INNER JOIN ejercicios e ON rd.id_ejercicio = e.id_ejercicio
        INNER JOIN categorias c ON e.id_categoria = c.id_categoria
        GROUP BY c.nombre;
    `;

    connection.query(query, (err, results) => {
        if (err) return res.status(500).json([]);

        res.json(results);
    });
});

// 2. Ejercicios más realizados
app.get('/api/graficas/ejercicios-mas-realizados', (req, res) => {
    const query = `
        SELECT e.nombre AS ejercicio, COUNT(*) AS veces
        FROM rutina_detalle rd
        INNER JOIN ejercicios e ON rd.id_ejercicio = e.id_ejercicio
        GROUP BY e.nombre
        ORDER BY veces DESC
        LIMIT 5;
    `;

    connection.query(query, (err, results) => {
        if (err) return res.status(500).json([]);

        res.json(results);
    });
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
        if (err) return res.status(500).json({ error: "Error server" });
        res.json(results);
    });
});


// Obtener ejercicios
app.get('/api/ejercicios', (req, res) => {
    const categoriaId = req.query.categoria; 

    let query = "";
    let params = [];

    if (!categoriaId || categoriaId === '0') {
        // Obtener todos
        query = "SELECT id_ejercicio, nombre FROM ejercicios";
    } else {
        //Se filtra por categoria
        query = "SELECT id_ejercicio, nombre FROM ejercicios WHERE id_categoria = ?";
        params = [categoriaId];
    }

    connection.query(query, params, (err, results) => {
        if (err) {
            console.error("Error SQL:", err);
            // Devolvemos array vacío en caso de error para no romper el front con JSON
            return res.status(500).json([]); 
        }
        res.json(results); 
    });
});

// Obtener detalles de un ejercicio
app.get('/api/ejercicios/detalle/:id_ejercicio', (req, res) => {
    const id_ejercicio = req.params.id_ejercicio;
    const query = `
        SELECT 
            e.nombre, 
            e.descripcion, 
            c.nombre as nombre_categoria 
        FROM ejercicios e 
        INNER JOIN categorias c ON e.id_categoria = c.id_categoria 
        WHERE e.id_ejercicio = ?`;

    connection.query(query, [id_ejercicio], (err, results) => {
        if (err) {
            console.error('Error al obtener detalles:', err);
            return res.status(500).json({ success: false, message: "Error al obtener detalles" });
        }
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "Ejercicio no encontrado" });
        }
        res.json({ success: true, ejercicio: results[0] });
    });
});

// Crear rutina
app.post('/api/crear_rutina', (req, res) => {
    const id_usuario = req.cookies.usuarioId;
    const { nombre, ejercicios } = req.body;

    if (!id_usuario)
        return res.status(403).json({ success: false, message: "No autenticado" });

    if (!nombre || ejercicios.length === 0)
        return res.status(400).json({ success: false, message: "Datos incompletos" });

    const queryRutina = "INSERT INTO rutinas (id_usuario, nombre) VALUES (?, ?)";

    connection.query(queryRutina, [id_usuario, nombre], (err, result) => {
        if (err) return res.status(500).json({ success: false });

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
            if (err2) return res.status(500).json({ success: false });

            res.json({ success: true });
        });
    });
});

// Obtener rutinas
app.get('/api/rutinas', checkAuth, (req, res) => {
    const id_usuario = req.cookies.usuarioId;

    const query = `
        SELECT id_rutina, nombre, fecha_creacion
        FROM rutinas
        WHERE id_usuario = ?
        ORDER BY fecha_creacion DESC
    `;

    connection.query(query, [id_usuario], (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json(results);
    });
});
app.get('/api/mis-rutinas', checkAuth, (req, res) => {
    const usuarioId = req.cookies.usuarioId; // O req.usuarioId si usas el middleware
    const query = "SELECT id_rutina, nombre FROM rutinas WHERE id_usuario = ?";
    
    connection.query(query, [usuarioId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Error al cargar rutinas" });
        }
        res.json({ success: true, rutinas: results });
    });
});
app.post('/api/rutinas/agregar-detalle', checkAuth, (req, res) => {
    // Leemos TODOS los datos necesarios del cuerpo de la petición
    const { id_rutina, id_ejercicio, series, repeticiones, descanso } = req.body;

    // Validación
    if (!id_rutina || !id_ejercicio || !series || !repeticiones) {
        return res.status(400).json({ success: false, message: "Faltan datos obligatorios" });
    }

    const query = `
        INSERT INTO rutina_detalle (id_rutina, id_ejercicio, series, repeticiones, descanso_segundos) 
        VALUES (?, ?, ?, ?, ?)
    `;

    // Usamos las variables que acabamos de leer
    connection.query(query, [id_rutina, id_ejercicio, series, repeticiones, descanso || 60], (err, result) => {
        if (err) {
            console.error("Error al agregar ejercicio:", err);
            return res.status(500).json({ success: false, message: "Error en el servidor" });
        }
        res.json({ success: true, message: "Ejercicio agregado correctamente" });
    });
});
// Obtener detalle de rutina
app.get('/api/rutina_detalle', checkAuth, (req, res) => {
    const id_rutina = req.query.id_rutina;

    const query = `
        SELECT rd.series, rd.repeticiones, rd.descanso_segundos,
               e.nombre AS ejercicio, c.nombre AS categoria
        FROM rutina_detalle rd
        INNER JOIN ejercicios e ON rd.id_ejercicio = e.id_ejercicio
        INNER JOIN categorias c ON e.id_categoria = c.id_categoria
        WHERE rd.id_rutina = ?;
    `;

    connection.query(query, [id_rutina], (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json(results);
    });
});

// Eliminar rutina
app.delete('/api/rutina', checkAuth, (req, res) => {
    const id_rutina = req.body.id_rutina;

    const query1 = "DELETE FROM rutina_detalle WHERE id_rutina = ?";
    const query2 = "DELETE FROM rutinas WHERE id_rutina = ?";

    connection.query(query1, [id_rutina], (err) => {
        if (err) return res.status(500).json({ success: false });

        connection.query(query2, [id_rutina], (err2) => {
            if (err2) return res.status(500).json({ success: false });

            res.json({ success: true });
        });
    });
});
// Agregar ejercicio a rutina 

app.post('/api/rutinas/agregar-ejercicio', checkAuth, (req, res) => {

    const { id_rutina, id_ejercicio, series, repeticiones, descanso_segundos } = req.body; 

    if (!id_rutina || !id_ejercicio) {
        return res.status(400).json({ success: false, message: "Datos incompletos" });
    }
    
    // Asegurar valores por defecto si vienen vacíos
    const s = series || 0;
    const r = repeticiones || 0;
    const d = descanso_segundos || 60;

    const query = "INSERT IGNORE INTO rutina_detalle (id_rutina, id_ejercicio, series, repeticiones, descanso_segundos) VALUES (?, ?, ?, ?, ?)";

    connection.query(query, [id_rutina, id_ejercicio, s, r, d], (err, result) => {
        if (err) {
            console.error("Error al agregar ejercicio:", err);
            return res.status(500).json({ success: false, message: "Error en el servidor" });
        }
        res.json({ success: true, message: "Ejercicio agregado correctamente" });
    });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en ${PORT}`));
