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

const checkAuth = (req, res, next) => {
    const usuarioId = req.cookies.usuarioId;

    if (usuarioId) {
        req.usuarioId = usuarioId;
        next(); 
    } else {
        res.redirect('/login');
    }
};