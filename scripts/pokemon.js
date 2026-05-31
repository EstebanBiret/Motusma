const LIST_WRAPPER = document.querySelector(".list-wrapper");

let allPokemons = [];

document.getElementById("pokedex-counter").textContent = `[${getNbCatch()}/${MAX_POKEMON}]`;

fetch(`https://pokeapi.co/api/v2/pokemon?limit=${MAX_POKEMON}`)
  .then((response) => response.json())
  .then((data) => {
    allPokemons = data.results;
    displayPokemons(allPokemons);
  })
  .catch((error) => {
    console.error("Erreur lors du chargement de la liste Pokémon:", error);
    LIST_WRAPPER.innerHTML = "<p style='color:#fff;text-align:center;'>Impossible de charger le Pokédex. Vérifie ta connexion.</p>";
  });

async function fetchPokemonDataBeforeRedirect(id) {
  try {
    await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) => res.json()),
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then((res) => res.json()),
    ]);
    return true;
  } catch (error) {
    console.error("Failed to fetch Pokemon data before redirect");
    return false;
  }
}

function displayPokemons(pokemon) {
  LIST_WRAPPER.innerHTML = "";

  pokemon.forEach((pokemon) => {
    const POKEMON_ID = pokemon.url.split("/")[6];
    const LIST_ITEM = document.createElement("div");
    LIST_ITEM.className = "list-item";

    let pokemonName = POKEMON_NAMES_FR[capitalize(pokemon.name)];
    let pokemonImageSrc = `/sprites/${POKEMON_ID}.svg`;
    let pokeballElement = '';
    const POKEBALL_IMAGE = 'images/pokeball.png';

    const userData = JSON.parse(localStorage.getItem(STORAGE_KEYS.DATA));
    const encountered = userData ? userData[`pkmn_${POKEMON_ID}`] : null;

    if (!encountered) {
      pokemonName = "---";
      pokemonImageSrc = "images/not-found.svg";
    } else if (encountered.catch) {
      pokeballElement = `<img src="${POKEBALL_IMAGE}" width="20px" height="20px"/>`;
    }

    LIST_ITEM.innerHTML = `
        <div class="number-wrap">
          <p class="caption-fonts">#${POKEMON_ID}</p>
          ${pokeballElement}
        </div>
        <div class="img-wrap">
          <img src="${pokemonImageSrc}" alt="${pokemonName}" />
        </div>
        <div class="name-wrap">
          <p class="body3-fonts">${pokemonName}</p>
        </div>
    `;

    LIST_ITEM.addEventListener("click", async () => {
      const SUCCES = await fetchPokemonDataBeforeRedirect(POKEMON_ID);
      if (SUCCES) {
        window.location.href = `./detail.html?id=${POKEMON_ID}`;
      }
    });

    LIST_WRAPPER.appendChild(LIST_ITEM);
  });
}

function closePokedex() {
  window.location.href = "./";
}