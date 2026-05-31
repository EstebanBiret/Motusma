let attemptsChart;

function updateAttemptsChart() {
    const userData = JSON.parse(localStorage.getItem(STORAGE_KEYS.DATA)) || {};

    const attemptCounts = [0, 0, 0, 0, 0, 0];
    for (const key in userData) {
        const attempts = userData[key].tries;
        if (attempts >= 1 && attempts <= 5) {
            attemptCounts[attempts - 1]++;
        } else {
            attemptCounts[5]++;
        }
    }

    if (attemptsChart) {
        attemptsChart.data.datasets[0].data = attemptCounts;
        attemptsChart.update();
    } else {
        const data = {
            labels: ["1", "2", "3", "4", "5", "Perdu"],
            datasets: [{
                label: 'Nombre de Pokémon',
                data: attemptCounts,
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

        attemptsChart = new Chart(
            document.getElementById('attemptsChart'),
            config
        );
    }
}

updateAttemptsChart();
window.updateAttemptsChart = updateAttemptsChart;