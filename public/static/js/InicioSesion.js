const db = require("../db.js");


function setCoockie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + (value || "") + ";" + expires + ";path=/";
}

function validar() {
    const user = document.getElementById('usr').value.trim();
    const password = document.getElementById('psw').value;
    db.conectar();
    db.query("SELECT * FROM usuarios WHERE usuario = ? AND contraseña = ?", [user, password], function(err, results) {
        if (results.length > 0) {
            setCoockie('user', user, 7);
            window.location.href = 'index.html';
        } else {
            showError('Usuario o contraseña incorrectos.');
        }
    });
}


function showError(msg) {
    alert(msg); 
}