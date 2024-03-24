let currentPokemonId = null;
let flavorText;

document.addEventListener("DOMContentLoaded", () => {
  const MAX_POKEMONS = 151;
  const pokemonID = new URLSearchParams(window.location.search).get("id");
  const id = parseInt(pokemonID, 10);

  if (id < 1 || id > MAX_POKEMONS) {
    return (window.location.href = "./index.html");
  }

  currentPokemonId = id;
  loadPokemon(id);
});

async function loadPokemon(id) {
  try {
    const [pokemon, pokemonSpecies] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) =>
        res.json()
      ),
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then((res) =>
        res.json()
      ),
    ]);

    if (currentPokemonId === id) {
      flavorText = saucissonPinard(pokemonSpecies);
      displayPokemonDetails(pokemon);      

      const [leftArrow, rightArrow] = ["#leftArrow", "#rightArrow"].map((sel) =>
        document.querySelector(sel)
      );
      leftArrow.removeEventListener("click", navigatePokemon);
      rightArrow.removeEventListener("click", navigatePokemon);

      if (id !== 1) {
        leftArrow.addEventListener("click", () => {
          navigatePokemon(id - 1);
        });
      }
      if (id !== 151) {
        rightArrow.addEventListener("click", () => {
          navigatePokemon(id + 1);
        });
      }

      window.history.pushState({}, "", `./detail.html?id=${id}`);
    }

    return true;
  } catch (error) {
    console.error("Une erreur d'amour s'est produite ... -->", error);
    window.location.href = "index.html";
    return false;
  }
}

async function navigatePokemon(id) {
  currentPokemonId = id;
  await loadPokemon(id);
}

function formatDate(dateString) {
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', options);
}

const typeColors = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  grass: "#78C850",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#fc92c3"
};

const typeTrad = {
  normal: "normal",
  fire: "feu",
  water: "eau",
  electric: "electrik",
  grass: "plante",
  ice: "glace",
  fighting: "combat",
  poison: "poison",
  ground: "sol",
  flying: "vol",
  psychic: "psy",
  bug: "insecte",
  rock: "pierre",
  ghost: "spectre",
  dragon: "dragon",
  dark: "ténèbres",
  steel: "acier",
  fairy: "fée",
};

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

function setElementStyles(elements, cssProperty, value) {
  elements.forEach((element) => {
    element.style[cssProperty] = value;
  });
}

function rgbaFromHex(hexColor) {
  return [
    parseInt(hexColor.slice(1, 3), 16),
    parseInt(hexColor.slice(3, 5), 16),
    parseInt(hexColor.slice(5, 7), 16),
  ].join(", ");
}

function setTypeBackgroundColor(pokemon) {
  const mainType = pokemon.types[0].type.name;
  const color = typeColors[mainType];

  if (!color) {
    console.warn(`Color not defined for type: ${mainType}`);
    return;
  }

  const detailMainElement = document.querySelector(".detail-main");
  setElementStyles([detailMainElement], "backgroundColor", color);
  setElementStyles([detailMainElement], "borderColor", color);

  setElementStyles(
    document.querySelectorAll(".power-wrapper > p"),
    "backgroundColor",
    color
  );

  setElementStyles(
    document.querySelectorAll(".stats-wrap p.stats"),
    "color",
    color
  );

  setElementStyles(
    document.querySelectorAll(".stats-wrap .progress-bar"),
    "color",
    color
  );

  const rgbaColor = rgbaFromHex(color);
  const styleTag = document.createElement("style");
  styleTag.innerHTML = `
    .stats-wrap .progress-bar::-webkit-progress-bar {
        background-color: rgba(${rgbaColor}, 0.5);
    }
    .stats-wrap .progress-bar::-webkit-progress-value {
        background-color: ${color};
    }
  `;
  document.head.appendChild(styleTag);
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function createAndAppendElement(parent, tag, options = {}) {
  const element = document.createElement(tag);
  Object.keys(options).forEach((key) => {
    element[key] = options[key];
  });
  parent.appendChild(element);
  return element;
}

function displayPokemonDetails(pokemon) {

  let userData = JSON.parse(localStorage.getItem('user_data'));
  let encountered = null;

  if(userData){
    encountered = userData[`pkmn_${currentPokemonId}`];
  }
  
  if (encountered) {

    const { name, id, types, weight, height, stats } = pokemon;
    const capitalizePokemonName = nomTrad[capitalizeFirstLetter(name)];
    document.querySelector("title").textContent = capitalizePokemonName;

    const detailMainElement = document.querySelector(".detail-main");
    detailMainElement.classList.add(name.toLowerCase());

    document.querySelector(".name-wrap .name").textContent = capitalizePokemonName;

    document.querySelector(
      ".pokemon-id-wrap .body2-fonts"
    ).textContent = `#${String(id).padStart(3, "0")}`;

    const imageElement = document.querySelector(".detail-img-wrapper img");
    imageElement.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${id}.svg`;
    imageElement.alt = capitalizePokemonName;

    const typeWrapper = document.querySelector(".power-wrapper");
    typeWrapper.innerHTML = "";
    types.forEach(({ type }) => {
      createAndAppendElement(typeWrapper, "p", {
        className: `body3-fonts type ${type.name}`,
        textContent: typeTrad[type.name],
      });
    });

    if(encountered.catch) {
      document.querySelector(".captureInfos").textContent = 'Capturé le ' + formatDate(encountered.date) + 'en ' + encountered.tries + ' essai.s !';
    }
    else {
      document.querySelector(".captureInfos").textContent = 'Rencontré le ' + formatDate(encountered.date);
    }


    document.querySelector(".body3-fonts.pokemon-description").textContent = flavorText;
    document.querySelector(
      ".pokemon-detail-wrap .pokemon-detail p.body3-fonts.weight"
    ).textContent = `${weight / 10}kg`;
    document.querySelector(
      ".pokemon-detail-wrap .pokemon-detail p.body3-fonts.height"
    ).textContent = `${height / 10}m`;

    const statsWrapper = document.querySelector(".stats-wrapper");
    statsWrapper.innerHTML = "";

    const statNameMapping = {
      hp: "HP",
      attack: "ATK",
      defense: "DEF",
      "special-attack": "SATK",
      "special-defense": "SDEF",
      speed: "SPD",
    };

    stats.forEach(({ stat, base_stat }) => {
      const statDiv = document.createElement("div");
      statDiv.className = "stats-wrap";
      statsWrapper.appendChild(statDiv);

      createAndAppendElement(statDiv, "p", {
        className: "body3-fonts stats",
        textContent: statNameMapping[stat.name],
      });

      createAndAppendElement(statDiv, "p", {
        className: "body3-fonts",
        textContent: String(base_stat).padStart(3, "0"),
      });

      createAndAppendElement(statDiv, "progress", {
        className: "progress-bar",
        value: base_stat,
        max: 100,
      });
    });

    setTypeBackgroundColor(pokemon);
  } else {
    document.querySelector(".name-wrap .name").textContent = "Pas rencontré"

    document.querySelector(
      ".pokemon-id-wrap .body2-fonts"
    ).textContent = `#${String(currentPokemonId).padStart(3, "0")}`;
    
    const imageElement = document.querySelector(".detail-img-wrapper img");
    imageElement.src = "images/not-found.svg";
    imageElement.alt = "Pas rencontré";
    document.querySelector(".power-wrapper").innerHTML = "";
    document.querySelector(".captureInfos").innerHTML = "";
    document.querySelector(".body3-fonts.pokemon-description").innerHTML = "";

    document.querySelector(
      ".pokemon-detail-wrap .pokemon-detail p.body3-fonts.weight"
    ).textContent = "-";
    document.querySelector(
      ".pokemon-detail-wrap .pokemon-detail p.body3-fonts.height"
    ).textContent = "-";

    const statsWrapper = document.querySelector(".stats-wrapper");
    statsWrapper.innerHTML = "-";

    const detailMainElement = document.querySelector(".detail-main");
    setElementStyles([detailMainElement], "backgroundColor", "#705848");
    setElementStyles([detailMainElement], "borderColor", "#705848");

    setElementStyles(
      document.querySelectorAll(".power-wrapper > p"),
      "backgroundColor",
      "#705848"
    );

    setElementStyles(
      document.querySelectorAll(".stats-wrap p.stats"),
      "color",
      "#705848"
    );

    setElementStyles(
      document.querySelectorAll(".stats-wrap .progress-bar"),
      "color",
      "#705848"
    );

    const rgbaColor = rgbaFromHex("#705848");
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
      .stats-wrap .progress-bar::-webkit-progress-bar {
          background-color: rgba(${rgbaColor}, 0.5);
      }
      .stats-wrap .progress-bar::-webkit-progress-value {
          background-color: #705848;
      }
    `;
    document.head.appendChild(styleTag);

  }
}

function saucissonPinard(pokemonSpecies) {
  for (let entry of pokemonSpecies.flavor_text_entries) {
    if (entry.language.name === "fr") {
      let flavor = entry.flavor_text.replace(/\f/g, " ");
      return flavor;
    }
  }
  return "";
}

function closePokedexDetails() {
  window.location.href = 'index.html';
}