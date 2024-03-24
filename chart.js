// Récupérer les données du localStorage
const userData = JSON.parse(localStorage.getItem('user_data'));

// Initialiser les compteurs pour chaque nombre d'essais
const essaisCounts = [0, 0, 0, 0, 0, 0]; // de 1 à 5 essais, puis "Perdu"

// Parcourir les données pour compter le nombre de Pokémon pour chaque nombre d'essais
for (const key in userData) {
  const essais = userData[key].tries;
  if (essais >= 1 && essais <= 5) {
    essaisCounts[essais - 1]++;
  } else {
    essaisCounts[5]++; // Si essais n'est pas dans la plage de 1 à 5, incrémentez "Perdu"
  }
}

// Créer le graphique
const data = {
  labels: ["1", "2", "3", "4", "5", "Perdu"],
  datasets: [{
    label: 'Nombre de Pokémon',
    data: essaisCounts,
  }]
};


// Configuration du graphique
const config = {
  type: 'bar',
  data: data,
  options: {
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

// Création du graphique
const essaisChart = new Chart(
  document.getElementById('essaisChart'),
  config
);