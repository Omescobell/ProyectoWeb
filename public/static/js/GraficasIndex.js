document.addEventListener('DOMContentLoaded', () => {

    const palette = {
        primary: '#6a3d9a',
        secondary: '#8e6cbb',
        tertiary: '#b39ddb',
        light: '#d1c4e9',
        lighter: '#e7e0f2',
        accent: '#c3b1e1',
        darkText: '#4a3357',
    };

    // ==========================================
    // 1) GRUPO MUSCULAR MÁS ENTRENADO (PIE CHART)
    // ==========================================
    fetch('/api/graficas/grupos-musculares')
        .then(res => res.json())
        .then(data => {
            const labels = data.map(item => item.grupo);
            const valores = data.map(item => item.total);

            const ctx = document.getElementById('gruposMuscularesChart');
            if (!ctx) return;

            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels,
                    datasets: [{
                        data: valores,
                        backgroundColor: [
                            palette.primary,
                            palette.secondary,
                            palette.tertiary,
                            palette.light,
                            palette.lighter,
                            palette.accent
                        ],
                        borderColor: '#fff',
                        borderWidth: 2,
                        hoverOffset: 10
                    }]
                },
                options: {
                    plugins: {
                        legend: { position: 'right' }
                    }
                },
                plugins: [ChartDataLabels]
            });
        });

    // =====================================================
    // 2) TABLA: EJERCICIOS QUE MÁS APARECEN EN LAS RUTINAS
    // =====================================================
    fetch('/api/graficas/ejercicios-mas-realizados')
        .then(res => res.json())
        .then(data => {
            const table = document.querySelector(".exercise-table");
            if (!table) return;

            table.innerHTML = `
                <div class="row header-row">
                    <div class="col">Nombre</div>
                    <div class="col">Veces</div>
                </div>
            `;

            data.forEach(item => {
                table.innerHTML += `
                    <div class="row table-row">
                        <div class="col">${item.ejercicio}</div>
                        <div class="col">${item.veces}</div>
                    </div>
                `;
            });
        });

    // ======================================================
    // 3) GRÁFICA DE BARRAS — EJERCICIOS MÁS REALIZADOS
    // ======================================================
    fetch('/api/graficas/ejercicios-mas-realizados')
        .then(res => res.json())
        .then(data => {
            const labels = data.map(item => item.ejercicio);
            const valores = data.map(item => item.veces);

            const ctx = document.getElementById('ejerciciosMasHacesChart');
            if (!ctx) return;

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        data: valores,
                        backgroundColor: [
                            palette.primary,
                            palette.secondary,
                            palette.tertiary,
                            palette.light,
                            palette.accent
                        ]
                    }]
                },
                options: {
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true }
                    }
                },
                plugins: [ChartDataLabels]
            });
        });
});
