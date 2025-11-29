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
    res.render('nueva_rutina', { title: 'Nueva Rutina' });
});
app.get('/ejercicios', checkAuth, (req, res) => {
    res.render('ejercicios', { title: 'Ejercicios' });
});

app.post('/api/registro', (req, res) => {
    const { usuario, correo, contraseña } = req.body;
    db.conectar();
    db.query("INSERT INTO usuarios (usuario, correo, contraseña) VALUES (?, ?, ?)", [usuario, correo, contraseña], function(err, results) {
        if (err) {
            console.error('Error al registrar usuario:', err);
            res.status(500).send('Error al registrar usuario.');
            return;
        }
        console.log('Usuario registrado exitosamente:', results);
        res.json({ success: true, usuarioId: results.insertId });
    });
});

app.post('/api/login', (req, res) => {
    const { usuario, contraseña } = req.body;
    db.conectar();
    db.query("SELECT * FROM usuarios WHERE usuario = ? AND contraseña = ?", [usuario, contraseña], function(err, results) {
        if (results.length > 0) {
            res.cookie('usuarioId', results[0].id);
            res.json({ success: true, usuarioId: results[0].id });
        } else {
            res.json({ success: false });
        }
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});