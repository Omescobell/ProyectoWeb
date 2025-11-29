// Usuario de prueba
const DEMO_USER = 'Admin';
const DEMO_PASSWORD = '1234';

function validar() {
    const user = document.getElementById('usr').value.trim();
    const password = document.getElementById('psw').value;

    if (user !== DEMO_USER) {
        showError('Usuario incorrecto.');
        return;
    }

    if (password !== DEMO_PASSWORD) {
        showError('Contraseña incorrecta.');
        return;
    }

    sessionStorage.setItem('user', user);
    window.location.href = 'index.html'; 
}

function showError(msg) {
    alert(msg); 
}