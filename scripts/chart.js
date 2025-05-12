let essaisChart;

function updateEssaisChart() {
    const userData = JSON.parse(localStorage.getItem("motusma-data")) || {};

    const essaisCounts = [0, 0, 0, 0, 0, 0];
    for (const key in userData) {
        const essais = userData[key].tries;
        if (essais >= 1 && essais <= 5) {
            essaisCounts[essais - 1]++;
        } else {
            essaisCounts[5]++;
        }
    }

    //si le graphique existe déjà, on le met à jour, sinon on le crée
    if (essaisChart) {
        essaisChart.data.datasets[0].data = essaisCounts;
        essaisChart.update();
    } else {
        const data = {
            labels: ["1", "2", "3", "4", "5", "Perdu"],
            datasets: [{
                label: 'Nombre de Pokémon',
                data: essaisCounts,
            }]
        };

        const config = {
            type: 'bar',
            data: data,
            options: {
                maintainAspectRatio: false,
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Nombre de Pokémon',
                        },
                        ticks: {
                            precision: 0
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Nombre d\'essais'
                        }
                    }
                }
            }
        };

        essaisChart = new Chart(
            document.getElementById('essaisChart'),
            config
        );
    }
}

updateEssaisChart();
window.updateEssaisChart = updateEssaisChart;