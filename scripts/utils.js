const MAX_POKEMON = 151;

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

const MOIS_FR = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
];

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function normalizeString(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
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

const POKEMON_NAMES_FR = {
    'Bulbasaur': 'Bulbizarre',  'Ivysaur': 'Herbizarre',  'Venusaur': 'Florizarre',
    'Charmander': 'Salamèche',  'Charmeleon': 'Reptincel', 'Charizard': 'Dracaufeu',
    'Squirtle': 'Carapuce',     'Wartortle': 'Carabaffe',  'Blastoise': 'Tortank',
    'Caterpie': 'Chenipan',     'Metapod': 'Chrysacier',   'Butterfree': 'Papilusion',
    'Weedle': 'Aspicot',        'Kakuna': 'Coconfort',     'Beedrill': 'Dardargnan',
    'Pidgey': 'Roucool',        'Pidgeotto': 'Roucoups',   'Pidgeot': 'Roucarnage',
    'Rattata': 'Rattata',       'Raticate': 'Rattatac',    'Spearow': 'Piafabec',
    'Fearow': 'Rapasdepic',     'Ekans': 'Abo',            'Arbok': 'Arbok',
    'Pikachu': 'Pikachu',       'Raichu': 'Raichu',        'Sandshrew': 'Sabelette',
    'Sandslash': 'Sablaireau',  'Nidoran-f': 'Nidoran♀',   'Nidorina': 'Nidorina',
    'Nidoqueen': 'Nidoqueen',   'Nidoran-m': 'Nidoran♂',   'Nidorino': 'Nidorino',
    'Nidoking': 'Nidoking',     'Clefairy': 'Mélofée',     'Clefable': 'Mélodelfe',
    'Vulpix': 'Goupix',         'Ninetales': 'Feunard',    'Jigglypuff': 'Rondoudou',
    'Wigglytuff': 'Grodoudou',  'Zubat': 'Nosferapti',     'Golbat': 'Nosferalto',
    'Oddish': 'Mystherbe',      'Gloom': 'Ortide',         'Vileplume': 'Rafflesia',
    'Paras': 'Paras',           'Parasect': 'Parasect',    'Venonat': 'Mimitoss',
    'Venomoth': 'Aéromite',     'Diglett': 'Taupiqueur',   'Dugtrio': 'Triopikeur',
    'Meowth': 'Miaouss',        'Persian': 'Persian',      'Psyduck': 'Psykokwak',
    'Golduck': 'Akwakwak',      'Mankey': 'Férosinge',     'Primeape': 'Colossinge',
    'Growlithe': 'Caninos',     'Arcanine': 'Arcanin',     'Poliwag': 'Ptitard',
    'Poliwhirl': 'Têtarte',     'Poliwrath': 'Tartard',    'Abra': 'Abra',
    'Kadabra': 'Kadabra',       'Alakazam': 'Alakazam',    'Machop': 'Machoc',
    'Machoke': 'Machopeur',     'Machamp': 'Mackogneur',   'Bellsprout': 'Chétiflor',
    'Weepinbell': 'Boustiflor', 'Victreebel': 'Empiflor',  'Tentacool': 'Tentacool',
    'Tentacruel': 'Tentacruel', 'Geodude': 'Racaillou',    'Graveler': 'Gravalanch',
    'Golem': 'Grolem',          'Ponyta': 'Ponyta',        'Rapidash': 'Galopa',
    'Slowpoke': 'Ramoloss',     'Slowbro': 'Flagadoss',    'Magnemite': 'Magnéti',
    'Magneton': 'Magnéton',     'Farfetchd': 'Canarticho', 'Doduo': 'Doduo',
    'Dodrio': 'Dodrio',         'Seel': 'Otaria',          'Dewgong': 'Lamantine',
    'Grimer': 'Tadmorv',        'Muk': 'Grotadmorv',       'Shellder': 'Kokiyas',
    'Cloyster': 'Crustabri',    'Gastly': 'Fantominus',    'Haunter': 'Spectrum',
    'Gengar': 'Ectoplasma',     'Onix': 'Onix',            'Drowzee': 'Soporifik',
    'Hypno': 'Hypnomade',       'Krabby': 'Krabby',        'Kingler': 'Krabboss',
    'Voltorb': 'Voltorbe',      'Electrode': 'Électrode',  'Exeggcute': 'Noeunoeuf',
    'Exeggutor': 'Noadkoko',    'Cubone': 'Osselait',      'Marowak': 'Ossatueur',
    'Hitmonlee': 'Kicklee',     'Hitmonchan': 'Tygnon',    'Lickitung': 'Excelangue',
    'Koffing': 'Smogo',         'Weezing': 'Smogogo',      'Rhyhorn': 'Rhinocorne',
    'Rhydon': 'Rhinoféros',     'Chansey': 'Leveinard',    'Tangela': 'Saquedeneu',
    'Kangaskhan': 'Kangourex',  'Horsea': 'Hypotrempe',    'Seadra': 'Hypocéan',
    'Goldeen': 'Poissirène',    'Seaking': 'Poissoroy',    'Staryu': 'Stari',
    'Starmie': 'Staross',       'Mr-mime': 'M. Mime',      'Scyther': 'Insécateur',
    'Jynx': 'Lippoutou',        'Electabuzz': 'Élektek',   'Magmar': 'Magmar',
    'Pinsir': 'Scarabrute',     'Tauros': 'Tauros',        'Magikarp': 'Magicarpe',
    'Gyarados': 'Léviator',     'Lapras': 'Lokhlass',      'Ditto': 'Métamorph',
    'Eevee': 'Évoli',           'Vaporeon': 'Aquali',      'Jolteon': 'Voltali',
    'Flareon': 'Pyroli',        'Porygon': 'Porygon',      'Omanyte': 'Amonita',
    'Omastar': 'Amonistar',     'Kabuto': 'Kabuto',        'Kabutops': 'Kabutops',
    'Aerodactyl': 'Ptéra',      'Snorlax': 'Ronflex',      'Articuno': 'Artikodin',
    'Zapdos': 'Électhor',       'Moltres': 'Sulfura',      'Dratini': 'Minidraco',
    'Dragonair': 'Draco',       'Dragonite': 'Dracolosse', 'Mewtwo': 'Mewtwo',
    'Mew': 'Mew',
};