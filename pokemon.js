const MAX_POKEMON = 151;
const listWrapper = document.querySelector(".list-wrapper");

const nomTrad = {
  "Bulbasaur": "Bulbizarre",
  "Ivysaur": "Herbizarre",
  "Venusaur": "Florizarre",
  "Charmander": "Salamèche",
  "Charmeleon": "Reptincel",
  "Charizard": "Dracaufeu",
  "Squirtle": "Carapuce",
  "Wartortle": "Carabaffe",
  "Blastoise": "Tortank",
  "Caterpie": "Chenipan",
  "Metapod": "Chrysacier",
  "Butterfree": "Papilusion",
  "Weedle": "Aspicot",
  "Kakuna": "Coconfort",
  "Beedrill": "Dardargnan",
  "Pidgey": "Roucool",
  "Pidgeotto": "Roucoups",
  "Pidgeot": "Roucarnage",
  "Rattata": "Rattata",
  "Raticate": "Rattatac",
  "Spearow": "Piafabec",
  "Fearow": "Rapasdepic",
  "Ekans": "Abo",
  "Arbok": "Arbok",
  "Pikachu": "Pikachu",
  "Raichu": "Raichu",
  "Sandshrew": "Sabelette",
  "Sandslash": "Sablaireau",
  "Nidoran♀": "Nidoran♀",
  "Nidorina": "Nidorina",
  "Nidoqueen": "Nidoqueen",
  "Nidoran♂": "Nidoran♂",
  "Nidorino": "Nidorino",
  "Nidoking": "Nidoking",
  "Clefairy": "Mélofée",
  "Clefable": "Mélodelfe",
  "Vulpix": "Goupix",
  "Ninetales": "Feunard",
  "Jigglypuff": "Rondoudou",
  "Wigglytuff": "Grodoudou",
  "Zubat": "Nosferapti",
  "Golbat": "Nosferalto",
  "Oddish": "Mystherbe",
  "Gloom": "Ortide",
  "Vileplume": "Rafflesia",
  "Paras": "Paras",
  "Parasect": "Parasect",
  "Venonat": "Mimitoss",
  "Venomoth": "Aéromite",
  "Diglett": "Taupiqueur",
  "Dugtrio": "Triopikeur",
  "Meowth": "Miaouss",
  "Persian": "Persian",
  "Psyduck": "Psykokwak",
  "Golduck": "Akwakwak",
  "Mankey": "Férosinge",
  "Primeape": "Colossinge",
  "Growlithe": "Caninos",
  "Arcanine": "Arcanin",
  "Poliwag": "Ptitard",
  "Poliwhirl": "Têtarte",
  "Poliwrath": "Tartard",
  "Abra": "Abra",
  "Kadabra": "Kadabra",
  "Alakazam": "Alakazam",
  "Machop": "Machoc",
  "Machoke": "Machopeur",
  "Machamp": "Mackogneur",
  "Bellsprout": "Chétiflor",
  "Weepinbell": "Boustiflor",
  "Victreebel": "Empiflor",
  "Tentacool": "Tentacool",
  "Tentacruel": "Tentacruel",
  "Geodude": "Racaillou",
  "Graveler": "Gravalanch",
  "Golem": "Grolem",
  "Ponyta": "Ponyta",
  "Rapidash": "Galopa",
  "Slowpoke": "Ramoloss",
  "Slowbro": "Flagadoss",
  "Magnemite": "Magnéti",
  "Magneton": "Magnéton",
  "Farfetch'd": "Canarticho",
  "Doduo": "Doduo",
  "Dodrio": "Dodrio",
  "Seel": "Otaria",
  "Dewgong": "Lamantine",
  "Grimer": "Tadmorv",
  "Muk": "Grotadmorv",
  "Shellder": "Kokiyas",
  "Cloyster": "Crustabri",
  "Gastly": "Fantominus",
  "Haunter": "Spectrum",
  "Gengar": "Ectoplasma",
  "Onix": "Onix",
  "Drowzee": "Soporifik",
  "Hypno": "Hypnomade",
  "Krabby": "Krabby",
  "Kingler": "Krabboss",
  "Voltorb": "Voltorbe",
  "Electrode": "Électrode",
  "Exeggcute": "Noeunoeuf",
  "Exeggutor": "Noadkoko",
  "Cubone": "Osselait",
  "Marowak": "Ossatueur",
  "Hitmonlee": "Kicklee",
  "Hitmonchan": "Tygnon",
  "Lickitung": "Excelangue",
  "Koffing": "Smogo",
  "Weezing": "Smogogo",
  "Rhyhorn": "Rhinocorne",
  "Rhydon": "Rhinoféros",
  "Chansey": "Leveinard",
  "Tangela": "Saquedeneu",
  "Kangaskhan": "Kangourex",
  "Horsea": "Hypotrempe",
  "Seadra": "Hypocéan",
  "Goldeen": "Poissirène",
  "Seaking": "Poissoroy",
  "Staryu": "Stari",
  "Starmie": "Staross",
  "Mr. Mime": "M. Mime",
  "Scyther": "Insécateur",
  "Jynx": "Lippoutou",
  "Electabuzz": "Élektek",
  "Magmar": "Magmar",
  "Pinsir": "Scarabrute",
  "Tauros": "Tauros",
  "Magikarp": "Magicarpe",
  "Gyarados": "Léviator",
  "Lapras": "Lokhlass",
  "Ditto": "Métamorph",
  "Eevee": "Évoli",
  "Vaporeon": "Aquali",
  "Jolteon": "Voltali",
  "Flareon": "Pyroli",
  "Porygon": "Porygon",
  "Omanyte": "Amonita",
  "Omastar": "Amonistar",
  "Kabuto": "Kabuto",
  "Kabutops": "Kabutops",
  "Aerodactyl": "Ptéra",
  "Snorlax": "Ronflex",
  "Articuno": "Artikodin",
  "Zapdos": "Électhor",
  "Moltres": "Sulfura",
  "Dratini": "Minidraco",
  "Dragonair": "Draco",
  "Dragonite": "Dracolosse",
  "Mewtwo": "Mewtwo",
  "Mew": "Mew",
};

let allPokemons = [];

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

fetch(`https://pokeapi.co/api/v2/pokemon?limit=${MAX_POKEMON}`)
  .then((response) => response.json())
  .then((data) => {
    allPokemons = data.results;
    displayPokemons(allPokemons);
  });

async function fetchPokemonDataBeforeRedirect(id) {
  try {
    const [pokemon, pokemonSpecies] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) =>
        res.json()
      ),
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then((res) =>
        res.json()
      ),
    ]);
    return true;
  } catch (error) {
    console.error("Failed to fetch Pokemon data before redirect");
  }
}

function displayPokemons(pokemon) {
  listWrapper.innerHTML = "";

  pokemon.forEach((pokemon) => {
    const pokemonID = pokemon.url.split("/")[6];
    const listItem = document.createElement("div");
    listItem.className = "list-item";
    let pokemonName = nomTrad[capitalizeFirstLetter(pokemon.name)];
    let pokemonImageSrc = `https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/other/dream-world/${pokemonID}.svg`;
    let pokeballElement = '';
    const pokeball = 'images/pokeball.png'
    let userData = JSON.parse(localStorage.getItem('user_data'));
    let encountered = null;

    if(userData){
      encountered = userData[`pkmn_${pokemonID}`];
    }

    if (!encountered) {
      pokemonName = "---";
      pokemonImageSrc = "images/not-found.svg";
    }
    else {
      if(encountered.catch) {
        pokeballElement = `<img src="${pokeball}" width="20px" height="20px"/>`;
      }
    }

    listItem.innerHTML = `
        <div class="number-wrap">
          <p class="caption-fonts">#${pokemonID}</p>
          ${pokeballElement}
        </div>
        <div class="img-wrap">
          <img src="${pokemonImageSrc}" alt="${pokemonName}" />
        </div>
        <div class="name-wrap">
          <p class="body3-fonts">${pokemonName}</p>
        </div>
    `;

    listItem.addEventListener("click", async () => {
      const success = await fetchPokemonDataBeforeRedirect(pokemonID);
      if (success) {
        window.location.href = `./detail.html?id=${pokemonID}`;
      }
    });

    listWrapper.appendChild(listItem);
  });
}