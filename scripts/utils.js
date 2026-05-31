const MAX_POKEMON = 151;
const MAX_ATTEMPTS = 5;
const LOSS_SCORE = MAX_ATTEMPTS + 1;

const COLORS = {
    PLACED:    'rgb(243, 100, 69)',  
    MISPLACED: 'rgb(240, 218, 26)',
    ABSENT:    '#bdbdbd',            
};

const STORAGE_KEYS = {
    INFOS:        'motusma-infos',
    DATA:         'motusma-data',
    ANSWER:       'motusma-answer',
    TODAY_TRIES:  'motusma-today-tries',
    NB_TRIES:     'motusma-nb-tries',
    FINISH_TODAY: 'motusma-finish-today',
};

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function normalizeString(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function formatFrenchDate(dateInput) {
    const date = new Date(dateInput);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getNbCatch() {
    const userData = JSON.parse(localStorage.getItem(STORAGE_KEYS.DATA)) || {};
    let nb = 0;
    for (let i = 1; i <= MAX_POKEMON; i++) {
        if (userData[`pkmn_${i}`] && userData[`pkmn_${i}`].catch) nb++;
    }
    return nb;
}

function getNbFound() {
    const userData = JSON.parse(localStorage.getItem(STORAGE_KEYS.DATA)) || {};
    let nb = 0;
    for (let i = 1; i <= MAX_POKEMON; i++) {
        if (userData[`pkmn_${i}`]) nb++;
    }
    return nb;
}

let _pokemonDbCache = null;

async function loadPokemonDb() {
    if (_pokemonDbCache) return _pokemonDbCache;
    try {
        const response = await fetch('data/bd.json');
        _pokemonDbCache = await response.json();
        return _pokemonDbCache;
    } catch (error) {
        console.error('Failed to load the Pokémon database:', error);
        return null;
    }
}

const DISPLAY_NAME_OVERRIDES = {
    29:  'Nidoran♀',
    32:  'Nidoran♂',
    122: 'M. Mime',
};

function frenchNameById(db, id) {
    if (DISPLAY_NAME_OVERRIDES[id]) return DISPLAY_NAME_OVERRIDES[id];
    const match = db.find(p => p.id === Number(id));
    return match ? match.name.french : `#${id}`;
}

function fnv1aHash(str) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
}