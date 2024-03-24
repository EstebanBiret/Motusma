const inputs = document.querySelectorAll(".col input")

function nextPokemonCountdown() {
    const end = new Date(tomorrow)
    const now = new Date()
    const diff = (end - now) / 1000;

    if (diff < 0) return;

    inputs[0].value = Math.floor(diff / 3600) % 24;
    inputs[1].value = Math.floor(diff / 60) % 60;
    inputs[2].value = Math.floor(diff) % 60;
}

nextPokemonCountdown()

setInterval(
    () => {
        nextPokemonCountdown()
    },
    1000
)