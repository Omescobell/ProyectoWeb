function setCoockie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + (value || "") + ";" + expires + ";path=/";

}
    document.getElementById('login-Form').addEventListener('submit', async function(event){
    event.preventDefault();
    const nombre = document.getElementById('usr').value;
    const contrasena = document.getElementById('psw').value;

    try{
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre, contrasena })
        });
        
        const data = await response.json();
        
        if(response.ok){
            if(data.success){
                setCoockie('usuarioId', data.usuarioId, 7);
                window.location.href = '/index.ejs';
            }else{
                throw new Error('Credenciales incorrectas');
            }
        }
    }catch(error){
        console.error('Error al iniciar sesión:', error);
        alert('Error al iniciar sesión. Por favor, intente de nuevo.');
    }
});
