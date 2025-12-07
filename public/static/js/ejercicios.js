document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado correctamente. Iniciando scripts...");
    let ejercicioSeleccionadoId = null;

    // Elementos del DOM
    const musculoSelector = document.getElementById('musculo-selector');
    const listaEjerciciosContainer = document.getElementById('lista-ejercicios-seleccion');
    
    // Elementos de detalle
    const nombreEjercicioEl = document.getElementById('nombre-ejercicio');
    const descripcionEjercicioEl = document.getElementById('descripcion-ejercicio');
    const musculoPrincipalEl = document.getElementById('musculo-principal');
    const btnAgregarRutinaMain = document.getElementById('btn-agregar-rutina');

    // Elementos del Dropdown y Modal
    const listaRutinasContainer = document.getElementById('lista-rutinas-para-agregar');
    const btnGuardarConfig = document.getElementById('btn-guardar-configuracion');

    // Mapeo de categorías
    const MUSCLE_TO_CATEGORY_ID = {
        'pecho': 1, 'espalda': 2, 'pierna': 3,   
        'brazos': 4, 'hombro': 5, 'gluteos': 6, 'abdomen': 7
    };

    // Inicialización
    cargarMisRutinas();
    if(btnAgregarRutinaMain) btnAgregarRutinaMain.classList.add('disabled');
    if (musculoSelector) {
        musculoSelector.addEventListener('change', (e) => {
            const catId = MUSCLE_TO_CATEGORY_ID[e.target.value];
            if (catId) getEjerciciosPorCategoria(catId);
        });
    }

 
    if (listaEjerciciosContainer) {
        listaEjerciciosContainer.addEventListener('change', (e) => {
            if (e.target.name === 'ejercicio') {
                getDetallesEjercicio(e.target.value);
            }
        });
    }


    if (listaRutinasContainer) {
        listaRutinasContainer.addEventListener('click', (e) => {
            const itemRutina = e.target.closest('.rutina-item-action');

            if (itemRutina) {
                e.preventDefault();
                
                const idRutina = itemRutina.dataset.id;
                const nombreRutina = itemRutina.dataset.nombre;

                console.log(`Clic en rutina: ${nombreRutina} (ID: ${idRutina})`);

                if (!ejercicioSeleccionadoId) {
                    alert("⚠️ Por favor selecciona un ejercicio primero de la lista izquierda.");
                    return;
                }


                abrirModalConfiguracion(idRutina);
            }
        });
    }

    if (btnGuardarConfig) {
        btnGuardarConfig.addEventListener('click', guardarEjercicioEnRutina);
    }


    // --- Cargar Rutinas en el Dropdown ---
    async function cargarMisRutinas() {
        if (!listaRutinasContainer) return;
        
        try {
            const response = await fetch('/api/mis-rutinas');
            const data = await response.json();

            listaRutinasContainer.innerHTML = ''; // Limpiar

            if (data.success && data.rutinas.length > 0) {
                data.rutinas.forEach(rutina => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <a class="dropdown-item rutina-item-action" href="#" 
                            data-id="${rutina.id_rutina}" 
                            data-nombre="${rutina.nombre}">
                            ${rutina.nombre}
                        </a>`;
                    listaRutinasContainer.appendChild(li);
                });
            } else {
                listaRutinasContainer.innerHTML = '<li><span class="dropdown-item disabled">Sin rutinas creadas</span></li>';
            }

            // Enlaces fijos
            listaRutinasContainer.innerHTML += '<li><hr class="dropdown-divider"></li>';
            listaRutinasContainer.innerHTML += '<li><a class="dropdown-item fw-bold" href="/nueva_rutina">+ Crear nueva rutina</a></li>';

        } catch (error) {
            console.error("Error cargando rutinas:", error);
            listaRutinasContainer.innerHTML = '<li><span class="dropdown-item disabled text-danger">Error de conexión</span></li>';
        }
    }

    // --- Cargar Lista de Ejercicios ---
    async function getEjerciciosPorCategoria(id_categoria) {
        listaEjerciciosContainer.innerHTML = '<p class="text-center mt-2">Cargando...</p>';
        try {
            const response = await fetch(`/api/ejercicios?categoria=${id_categoria}`);
            const data = await response.json();

            listaEjerciciosContainer.innerHTML = ''; // Limpiar

            if (Array.isArray(data) && data.length > 0) {
                // Seleccionar el primero automáticamente
                getDetallesEjercicio(data[0].id_ejercicio);

                data.forEach((ejercicio, index) => {
                    const div = document.createElement('div');
                    div.className = 'opcion p-2 border-bottom';
                    
                    const isChecked = index === 0 ? 'checked' : '';
                    
                    div.innerHTML = `
                        <input type="radio" id="ej-${ejercicio.id_ejercicio}" name="ejercicio" value="${ejercicio.id_ejercicio}" ${isChecked} style="cursor:pointer;">
                        <label for="ej-${ejercicio.id_ejercicio}" style="cursor:pointer; margin-left:8px;">${ejercicio.nombre}</label>
                    `;
                    listaEjerciciosContainer.appendChild(div);
                });
            } else {
                listaEjerciciosContainer.innerHTML = '<p class="text-center text-muted">No hay ejercicios en esta categoría.</p>';
                limpiarDetalles();
            }
        } catch (error) {
            console.error(error);
            listaEjerciciosContainer.innerHTML = '<p class="text-danger">Error al cargar ejercicios.</p>';
        }
    }

    // --- Obtener Detalles ---
    async function getDetallesEjercicio(id) {
        ejercicioSeleccionadoId = id;
        nombreEjercicioEl.textContent = "Cargando...";

        try {
            const response = await fetch(`/api/ejercicios/detalle/${id}`);
            const data = await response.json();

            if (data.success && data.ejercicio) {
                const ej = data.ejercicio;
                nombreEjercicioEl.textContent = ej.nombre;
                descripcionEjercicioEl.textContent = ej.descripcion || "Sin descripción disponible.";
                musculoPrincipalEl.textContent = `Categoría: ${ej.nombre_categoria}`;
                
                // Habilitar botón dropdown
                if(btnAgregarRutinaMain) btnAgregarRutinaMain.classList.remove('disabled');
            }
        } catch (error) {
            console.error("Error detalles:", error);
        }
    }

    function limpiarDetalles() {
        ejercicioSeleccionadoId = null;
        nombreEjercicioEl.textContent = "Selecciona un Ejercicio";
        descripcionEjercicioEl.textContent = "";
        musculoPrincipalEl.textContent = "";
        if(btnAgregarRutinaMain) btnAgregarRutinaMain.classList.add('disabled');
    }

    // --- ABRIR MODAL---
    function abrirModalConfiguracion(idRutina) {
        const modalEl = document.getElementById('modalConfigEjercicio');
        const hiddenInput = document.getElementById('hiddenRutinaId');
        
        if (!modalEl || !hiddenInput) {
            console.error("Error crítico: Falta el modal o el input oculto en el HTML.");
            return;
        }

        hiddenInput.value = idRutina;
        document.getElementById('inputSeries').value = '';
        document.getElementById('inputReps').value = '';

        try {
            const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
            modalInstance.show();
        } catch (err) {
            console.error("Error Bootstrap:", err);
            alert("Error al abrir ventana. Verifica que Bootstrap JS esté cargado.");
        }
    }

    // --- GUARDAR DATOS (POST) ---
    async function guardarEjercicioEnRutina() {
        const idRutina = document.getElementById('hiddenRutinaId').value;
        const series = document.getElementById('inputSeries').value;
        const reps = document.getElementById('inputReps').value;
        const descanso = document.getElementById('inputDescanso').value;

        if (!series || !reps) {
            alert("⚠️ Debes completar Series y Repeticiones.");
            return;
        }

        const payload = {
            id_rutina: idRutina,
            id_ejercicio: ejercicioSeleccionadoId,
            series: series,
            repeticiones: reps,
            descanso: descanso || 60
        };

        try {
            const response = await fetch('/api/rutinas/agregar-detalle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success) {
                alert("✅ ¡Ejercicio agregado correctamente!");
                
                const modalEl = document.getElementById('modalConfigEjercicio');
                const modalInstance = bootstrap.Modal.getInstance(modalEl);
                if(modalInstance) modalInstance.hide();

            } else {
                alert("❌ Error: " + data.message);
            }
        } catch (error) {
            console.error("Error al guardar:", error);
            alert("Error de conexión con el servidor.");
        }
    }

});