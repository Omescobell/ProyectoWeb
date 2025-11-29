const express = require('express');
const cors = require('cors');
const connection = require('./db.js');
const cookieParser = require('cookie-parser');
const app = express();
const path = require('path');

app.use(cors());
app.use(express.json()); 
app.use(express.static("public"));
app.use(cookieParser());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const checkAuth = (req, res, next) => {
    const usuarioId = req.cookies.usuarioId;

    if (usuarioId) {
        req.usuarioId = usuarioId;
        next(); 
    } else {
        res.redirect('/login');
    }
};

//* Rutas
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
    res.render('nuevarutina', { title: 'Nueva Rutina' });
});
app.get('/ejercicios', checkAuth, (req, res) => {
    res.render('ejercicio', { title: 'Ejercicios' });
});

app.post('/api/registro', (req, res) => {
    const { usuario, correo, psw } = req.body;

    if (!usuario || !correo || !psw) {
        return res.status(400).json({ success: false, message: "Faltan datos" });
    }
    const query = "INSERT INTO usuarios (nombre, email, contrasena) VALUES (?, ?, ?)";

    connection.query(query, [usuario, correo, psw], function(err, results) {
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

app.post('/api/login', (req, res) => {
    const { correo, contrasena } = req.body;

    const query = "SELECT * FROM usuarios WHERE email = ? AND contrasena = ?";
    
    connection.query(query, [correo, contrasena], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Error de servidor" });
        }

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

app.get('/logout', (req, res) => {
    res.clearCookie('usuarioId');
    res.redirect('/login');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});