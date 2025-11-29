function registrarUsuario(event) {
      event.preventDefault(); // Evita recargar la página

    const usuario = document.getElementById('usuario').value.trim();
    const correo = document.getElementById('correo').value.trim(); 
    const psw = document.getElementById('psw').value;
    const psw2 = document.getElementById('psw2').value;

    if (psw !== psw2) {
        alert('Las contraseñas no coinciden.');
        return;
    }

    if (psw.length < 4) {
        alert('La contraseña debe tener al menos 4 caracteres.');
        return;
    }

      // Guardar datos simuladamente, en lo que implementamos la bd
    const nuevoUsuario = { nombre, correo, usuario, psw };
    localStorage.setItem('usuarioRegistrado', JSON.stringify(nuevoUsuario));

    alert('Registro exitoso. Ahora puedes iniciar sesión.');
    window.location.href = 'login.html'; 
}