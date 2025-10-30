// static/js/GraficasIndex.js

document.addEventListener('DOMContentLoaded', () => {

    const palette = {
        primary: '#6a3d9a',   // Morado oscuro
        secondary: '#8e6cbb', // Morado medio
        tertiary: '#b39ddb',  // Morado claro
        light: '#d1c4e9',     // Lavanda
        lighter: '#e7e0f2',   // Lavanda claro
        accent: '#c3b1e1',    // Morado
        darkText: '#4a3357',  // Oscuro morado
    };

    // Gráfica de Pastel
    const gruposMuscularesCtx = document.getElementById('gruposMuscularesChart');
    if (gruposMuscularesCtx) {
        // Datos de ejemplo. Aqui es donde se van a cargar los datos ya tratados de la base.
        const gruposMuscularesData = {
            labels: ['Pierna', 'Pecho', 'Espalda', 'Bíceps', 'Tríceps', 'Hombros', 'Abdomen'],
            datasets: [{
                data: [25, 18, 15, 12, 10, 10, 10], // Aqui tienen que ser datos porcentuales, pero ya en este formato
                backgroundColor: [
                    palette.primary,
                    palette.secondary,
                    palette.tertiary,
                    palette.light,
                    palette.lighter,
                    palette.accent,
                    palette.darkText
                ],
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverOffset: 10
            }]
        };

        new Chart(gruposMuscularesCtx, {
            type: 'pie', // 'pie' para pastel completo, 'doughnut' para dona
            data: gruposMuscularesData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: palette.darkText,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += context.parsed + '%';
                                }
                                return label;
                            }
                        }
                    },
                    datalabels: {
                        color: '#ffffff', 
                        formatter: (value, ctx) => {
                            const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100) + '%';
                            return percentage;
                        },
                        font: {
                            weight: 'bold',
                            size: 10
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    }

    // --- Gráfica de Barras
    const ejerciciosMasHacesCtx = document.getElementById('ejerciciosMasHacesChart');
    if (ejerciciosMasHacesCtx) {
        // Datos de ejemplo. Aquí es donde conectarías con tu BD.
        const ejerciciosMasHacesData = {
            labels: ['Sentadilla', 'Press Banca', 'Peso Muerto', 'Dominadas', 'Remo'],
            datasets: [{
                label: 'Veces Realizadas',
                data: [150, 120, 90, 80, 70], // Aqui tienen que ser datos porcentuales, pero ya en este formato
                backgroundColor: [
                    palette.primary,
                    palette.secondary,
                    palette.tertiary,
                    palette.light,
                    palette.accent
                ],
                borderColor: palette.primary,
                borderWidth: 1
            }]
        };

        new Chart(ejerciciosMasHacesCtx, {
            type: 'bar',
            data: ejerciciosMasHacesData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'x', // y para horizontal, x para vertical
                plugins: {
                    legend: {
                        display: false 
                    },
                    title: {
                        display: false,
                    },
                    datalabels: {
                        anchor: 'end',
                        align: 'end',
                        color: palette.darkText,
                        formatter: (value) => value + ' veces',
                        font: {
                            weight: 'bold',
                            size: 10
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            color: palette.darkText,
                            font: {
                                size: 10
                            }
                        },
                        grid: {
                            color: palette.lighter // Líneas de la cuadrícula
                        }
                    },
                    y: {
                        ticks: {
                            color: palette.darkText,
                            font: {
                                size: 10
                            }
                        },
                        grid: {
                            color: palette.lighter
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    }
});