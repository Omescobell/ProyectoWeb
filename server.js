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
app.set('views', path.join(__dirname, 'public'));
app.use(express.static(path.join(__dirname, 'public')));

//* Rutas
app.get('/', checkAuth, (req, res) => {
    res.render('index', { title: 'Pagina Principal' });
});
app.get('/login', (req, res) => {
    res.render('login', { title: 'Inicio de Sesión' });
});
app.get('/register', (req, res) => {
    res.render('register', { title: 'Registro' });
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

//* Middleware
const checkAuth = (req, res, next) => {
    const usuarioId = req.cookies.usuarioId;

    if (usuarioId) {
        req.usuarioId = usuarioId;
        next(); 
    } else {
        res.redirect('/login');
    }
};