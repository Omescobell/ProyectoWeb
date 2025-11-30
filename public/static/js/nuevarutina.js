fetch('/api/categorias')
            .then(res => res.json())
            .then(data => {
                const select = document.getElementById('select-musculo-filtro');
                data.forEach(cat => {
                    const op = document.createElement('option');
                    op.value = cat.id_categoria;
                    op.textContent = cat.nombre;
                    select.appendChild(op);
                });
            });

        // ========== CARGAR EJERCICIOS ==========
        function cargarEjercicios() {
            const cat = document.getElementById("select-musculo-filtro").value;
            const cont = document.getElementById("contenedor-ejercicios-disponibles");

            cont.innerHTML = "Cargando...";

            fetch(`/api/ejercicios?categoria=${cat}`)
                .then(r => r.json())
                .then(ejs => {
                    cont.innerHTML = "";

                    ejs.forEach(e => {
                        const div = document.createElement("div");
                        div.classList.add("opcion-ejercicio");
                        div.innerHTML = `
                            <input type="checkbox" class="chk-ejercicio" data-id="${e.id_ejercicio}">
                            <label>${e.nombre}</label>
                        `;
                        cont.appendChild(div);
                    });
                });
        }

        document.getElementById("select-musculo-filtro").addEventListener("change", cargarEjercicios);
        cargarEjercicios();

        // ========== AGREGAR EJERCICIO A LA TABLA ==========
        document.addEventListener("change", e => {
            if (!e.target.classList.contains("chk-ejercicio")) return;

            const tabla = document.getElementById("tabla-nueva-rutina-body");

            if (e.target.checked) {
                const fila = document.createElement("tr");
                fila.dataset.id = e.target.dataset.id;

                fila.innerHTML = `
                    <td>${e.target.nextElementSibling.textContent}</td>
                    <td><input type="number" class="form-control reps"></td>
                    <td>${document.getElementById('select-musculo-filtro').selectedOptions[0].text}</td>
                    <td><input type="number" class="form-control series"></td>
                `;

                tabla.appendChild(fila);
            } else {
                tabla.querySelector(`tr[data-id="${e.target.dataset.id}"]`)?.remove();
            }
        });

        // ========== CREAR RUTINA ==========
        document.getElementById("btn-crear-rutina").addEventListener("click", () => {
            const nombre = document.getElementById("input-nombre-rutina").value;
            const filas = [...document.querySelectorAll("#tabla-nueva-rutina-body tr")];

            if (!nombre || filas.length === 0) {
                alert("Llena el nombre y selecciona ejercicios");
                return;
            }

            const ejercicios = filas.map(f => ({
                id_ejercicio: f.dataset.id,
                repeticiones: f.querySelector(".reps").value,
                series: f.querySelector(".series").value,
                descanso_segundos: 60
            }));

            fetch('/api/crear_rutina', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, ejercicios })
            })
                .then(r => r.json())
                .then(d => {
                    if (!d.success) return alert("Error creando rutina");
                    alert("Rutina creada correctamente");
                    location.href = "/rutinas";
                });
        });