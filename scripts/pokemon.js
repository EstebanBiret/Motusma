const LIST_WRAPPER = document.querySelector('.list-wrapper');

document.getElementById('pokedex-counter').textContent = `[${getNbCatch()}/${MAX_POKEMON}]`;

loadPokemonDb()
    .then((db) => {
        if (!db) throw new Error('empty database');
        displayPokemons(db);
    })
    .catch((error) => {
        console.error('Failed to load the Pokédex list:', error);
        LIST_WRAPPER.innerHTML =
            "<p style='color:#fff;text-align:center;'>Impossible de charger le Pokédex.</p>";
    });

function displayPokemons(db) {
    LIST_WRAPPER.innerHTML = '';
    const userData = JSON.parse(localStorage.getItem(STORAGE_KEYS.DATA)) || {};
    const POKEBALL_IMAGE = 'assets/images/pokeball.png';

    db.forEach((pokemon) => {
        const id = pokemon.id;
        const listItem = document.createElement('div');
        listItem.className = 'list-item';

        let pokemonName = frenchNameById(db, id);
        let pokemonImageSrc = `assets/sprites/${id}.svg`;
        let pokeballElement = '';

        const encountered = userData[`pkmn_${id}`];
        if (!encountered) {
            pokemonName = '---';
            pokemonImageSrc = 'assets/images/not-found.svg';
        } else if (encountered.catch) {
            pokeballElement = `<img src="${POKEBALL_IMAGE}" width="20px" height="20px"/>`;
        }

        listItem.innerHTML = `
            <div class="number-wrap">
              <p class="caption-fonts">#${id}</p>
              ${pokeballElement}
            </div>
            <div class="img-wrap">
              <img src="${pokemonImageSrc}" alt="${pokemonName}" />
            </div>
            <div class="name-wrap">
              <p class="body3-fonts">${pokemonName}</p>
            </div>
        `;

        listItem.addEventListener('click', () => {
            window.location.href = `./detail.html?id=${id}`;
        });

        LIST_WRAPPER.appendChild(listItem);
    });
}

function closePokedex() {
    window.location.href = './';
}