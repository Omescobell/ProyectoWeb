// --- VARIABLES GLOBALES ---
let ejercicioSeleccionadoId = null; // Guarda el ID del ejercicio que el usuario está viendo actualmente
const modalElement = document.getElementById('modalConfigEjercicio');
// Asegúrate de que bootstrap esté cargado en tu HTML para que esto funcione
const modalConfig = new bootstrap.Modal(modalElement); 

// --- MAPEO DE CATEGORÍAS ---
const MUSCLE_TO_CATEGORY_ID = {
    'pecho': 1,
    'espalda': 2,
    'pierna': 3,   
    'brazos': 4, 
    'hombro': 5,   
    'gluteos': 6,
    'abdomen': 7
};

// --- ELEMENTOS DEL DOM ---
const musculoSelector = document.getElementById('musculo-selector');
const listaEjerciciosContainer = document.getElementById('lista-ejercicios-seleccion');
const nombreEjercicioElement = document.getElementById('nombre-ejercicio');
const descripcionEjercicioElement = document.getElementById('descripcion-ejercicio');
const musculoPrincipalElement = document.getElementById('musculo-principal');
const listaRutinasContainer = document.getElementById('lista-rutinas-para-agregar');
const btnGuardarConfig = document.getElementById('btn-guardar-configuracion');

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    cargarMisRutinas();
    // Opcional: Deshabilitar el botón de agregar hasta que se seleccione un ejercicio
    document.getElementById('btn-agregar-rutina').classList.add('disabled');
});

// --- 1. OBTENER EJERCICIOS POR CATEGORÍA ---
async function getEjerciciosPorCategoria(id_categoria) {
    if (!id_categoria) {
        listaEjerciciosContainer.innerHTML = '<p class="text-muted">Selecciona un músculo válido.</p>';
        return;
    }

    try {
        const response = await fetch(`/api/ejercicios/${id_categoria}`);
        const data = await response.json();

        if (data.success) {
            renderEjerciciosList(data.ejercicios);
        } else {
            listaEjerciciosContainer.innerHTML = '<p>Error al cargar ejercicios.</p>';
            console.error('Error:', data.message);
        }
    } catch (error) {
        listaEjerciciosContainer.innerHTML = '<p>Error de conexión.</p>';
        console.error('Error fetch:', error);
    }
}

// --- 2. RENDERIZAR LISTA ---
function renderEjerciciosList(ejercicios) {
    listaEjerciciosContainer.innerHTML = ''; // Limpiar lista anterior

    if (ejercicios.length === 0) {
        listaEjerciciosContainer.innerHTML = '<p>No hay ejercicios para este músculo.</p>';
        limpiarDetalles();
        return;
    }

    // Cargar detalles del primer ejercicio por defecto
    if (ejercicios.length > 0) {
        getDetallesEjercicio(ejercicios[0].id_ejercicio);
    }

    ejercicios.forEach((ejercicio, index) => {
        const opcionDiv = document.createElement('div');
        opcionDiv.className = 'opcion';

        const radioInput = document.createElement('input');
        radioInput.type = 'radio';
        radioInput.id = `ejercicio-${ejercicio.id_ejercicio}`;
        radioInput.name = 'ejercicio';
        radioInput.value = ejercicio.id_ejercicio; 
        
        if (index === 0) radioInput.checked = true;

        const label = document.createElement('label');
        label.htmlFor = `ejercicio-${ejercicio.id_ejercicio}`;
        label.textContent = ejercicio.nombre;
        label.style.cursor = "pointer";

        opcionDiv.appendChild(radioInput);
        opcionDiv.appendChild(label);
        listaEjerciciosContainer.appendChild(opcionDiv);
    });
}

// --- 3. OBTENER DETALLES (Y ACTUALIZAR VARIABLE GLOBAL) ---
async function getDetallesEjercicio(id_ejercicio) {
    if (!id_ejercicio) return;
    
    // ACTUALIZAMOS LA VARIABLE GLOBAL
    ejercicioSeleccionadoId = id_ejercicio;

    // Feedback visual
    nombreEjercicioElement.textContent = "Cargando...";
    
    try {
        const response = await fetch(`/api/ejercicios/detalle/${id_ejercicio}`); 
        const data = await response.json();

        if (data.success && data.ejercicio) {
            const ej = data.ejercicio;
            nombreEjercicioElement.textContent = ej.nombre;
            descripcionEjercicioElement.textContent = ej.descripcion || 'Sin descripción disponible.';
            musculoPrincipalElement.textContent = `Categoría: ${ej.nombre_categoria}`;
            
            // Habilitar el botón de agregar rutina ahora que hay un ejercicio seleccionado
            document.getElementById('btn-agregar-rutina').classList.remove('disabled');
        } else {
            nombreEjercicioElement.textContent = 'Error';
            descripcionEjercicioElement.textContent = 'No se pudo cargar la información.';
        }
    } catch (error) {
        console.error('Error al obtener detalles:', error);
    }
}

function limpiarDetalles() {
    ejercicioSeleccionadoId = null;
    nombreEjercicioElement.textContent = 'Selecciona un Ejercicio';
    descripcionEjercicioElement.textContent = '';
    musculoPrincipalElement.textContent = '';
    document.getElementById('btn-agregar-rutina').classList.add('disabled');
}

// --- 4. CARGAR RUTINAS EN EL DROPDOWN ---
async function cargarMisRutinas() {
    try {
        const response = await fetch('/api/mis-rutinas');
        const data = await response.json();

        listaRutinasContainer.innerHTML = ''; 

        if (data.success && data.rutinas.length > 0) {
            data.rutinas.forEach(rutina => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.className = 'dropdown-item';
                a.href = '#';
                a.textContent = rutina.nombre;
                
                // EVENTO: Al hacer clic en una rutina, ABRIR EL MODAL
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (!ejercicioSeleccionadoId) {
                        alert("Por favor selecciona un ejercicio primero.");
                        return;
                    }
                    abrirModalConfiguracion(rutina.id_rutina);
                });

                li.appendChild(a);
                listaRutinasContainer.appendChild(li);
            });
            
            // Separador y botón de nueva rutina
            listaRutinasContainer.innerHTML += '<li><hr class="dropdown-divider"></li>';
            listaRutinasContainer.innerHTML += '<li><a class="dropdown-item" href="/nueva_rutina"><b>+ Crear nueva rutina</b></a></li>';
        } else {
            listaRutinasContainer.innerHTML = '<li><a class="dropdown-item disabled" href="#">Sin rutinas creadas</a></li>';
            listaRutinasContainer.innerHTML += '<li><a class="dropdown-item" href="/nueva_rutina"><b>+ Crear nueva rutina</b></a></li>';
        }
    } catch (error) {
        console.error('Error cargando rutinas:', error);
        listaRutinasContainer.innerHTML = '<li><a class="dropdown-item disabled" href="#">Error de conexión</a></li>';
    }
}

// --- 5. LÓGICA DEL MODAL ---

function abrirModalConfiguracion(idRutina) {
    // Guardar el ID de la rutina en el campo oculto del modal
    document.getElementById('hiddenRutinaId').value = idRutina;
    
    // Limpiar inputs anteriores para una experiencia limpia
    document.getElementById('inputSeries').value = '';
    document.getElementById('inputReps').value = '';
    document.getElementById('inputDescanso').value = '60'; // Valor por defecto

    // Mostrar el modal usando Bootstrap
    modalConfig.show();
}

// Evento click en el botón "Guardar en Rutina" del Modal
btnGuardarConfig.addEventListener('click', async () => {
    // Obtener datos del formulario del modal
    const idRutina = document.getElementById('hiddenRutinaId').value;
    const series = document.getElementById('inputSeries').value;
    const reps = document.getElementById('inputReps').value;
    const descanso = document.getElementById('inputDescanso').value;

    // Validación simple
    if (!series || !reps) {
        alert("Las series y repeticiones son obligatorias.");
        return;
    }

    try {
        // CAMBIO AQUÍ: La ruta debe coincidir con la del servidor
        const response = await fetch('/api/rutinas/agregar-detalle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_rutina: idRutina,
                id_ejercicio: ejercicioSeleccionadoId, 
                series: series,
                repeticiones: reps,
                descanso: descanso
            })
        });

        const data = await response.json();

        if (data.success) {
            alert(`¡Ejercicio agregado a la rutina correctamente!`);
            modalConfig.hide(); // Cerrar el modal
        } else {
            alert('Error al guardar: ' + data.message);
        }
    } catch (error) {
        console.error(error);
        alert('Error de conexión al guardar ejercicio.');
    }
});

// --- EVENT LISTENERS PRINCIPALES ---
musculoSelector.addEventListener('change', (event) => {
    const selectedMuscle = event.target.value;
    const categoryId = MUSCLE_TO_CATEGORY_ID[selectedMuscle];
    getEjerciciosPorCategoria(categoryId);
});

listaEjerciciosContainer.addEventListener('change', (event) => {
    if (event.target.name === 'ejercicio') {
        const id_ejercicio = event.target.value;
        getDetallesEjercicio(id_ejercicio);
    }
});