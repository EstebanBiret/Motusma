let pokemonList = [];
let numRows = 5;
let targetPokemon;
let numberOfLetters = 0;
let currentRow = 0;
let currentPosition = 1;
let currentIndex = 1;
let pokemonData;

const moisEnFrancais = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre"
];

const TOOLTIPS = document.querySelectorAll('.tooltip-trigger');

const SAC_TEXT = document.getElementById('left-title');
const OPTIONS_TEXT = document.getElementById('right-title');

const IMG_MUSIC = document.getElementById('img-music');

const MOT_INVALIDE_MODAL = document.getElementById("mot-invalide");

const imgTheme = document.getElementById('img-theme');
const main = document.getElementById("main");
const results = document.getElementById("results");
const HELP = document.getElementById("help");
const pokeball = document.getElementById("pokeball-results");
const pseudo = document.getElementById("pseudo");
const debutAventure = document.getElementById("debut-aventure");
const stats = document.getElementById("stats");
const results_pokemon = document.getElementById("results-pokemon");
const formPseudo = document.getElementById('form-changer-pseudo');
let bg_music = new Audio('sounds/music.mp3');
bg_music.loop = true;
let isMusicPlaying = false;
let musicHasStarted = false;
const SPAN_FOUND = document.querySelector("#found span");
const SPAN_CATCH = document.querySelector("#catch span");
const MAX_POKEMON = 151;

//overlays
const PSEUDO_OVERLAY = document.getElementById("pseudo-overlay");
const RESULTS_OVERLAY = document.getElementById("results-overlay");
const STATS_OVERLAY = document.getElementById("stats-overlay");
const HELP_OVERLAY = document.getElementById("help-overlay");

//autres
const PSEUDO_INPUT = document.getElementById('pseudo-input');
const RESULTS_TITRE = document.getElementById("results-titre");
const RESULTS_TEXT = document.getElementById("results-text");

//hide invalidWord msg
MOT_INVALIDE_MODAL.style.visibility = "hidden";
MOT_INVALIDE_MODAL.style.bottom = "-" + MOT_INVALIDE_MODAL.clientHeight + "px";

function majFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }

//démarrer ou arrêter la musique
function toggleMusic() {
    if (isMusicPlaying) {
        bg_music.volume = 0;
    } else {
        if(!musicHasStarted) {
            musicHasStarted = true;
            bg_music.play()
        }
        bg_music.volume = 1;
    }
    isMusicPlaying = !isMusicPlaying;
    IMG_MUSIC.src = isMusicPlaying ? "images/music.svg" : "images/no-music.svg";
}

//afficher modal mot invalide
function showModalInvalidWord() {
    MOT_INVALIDE_MODAL.style.visibility = "visible";
    MOT_INVALIDE_MODAL.style.bottom = "20px";

    setTimeout(function () {
        MOT_INVALIDE_MODAL.style.bottom = "-" + MOT_INVALIDE_MODAL.clientHeight + "px";
        MOT_INVALIDE_MODAL.style.visibility = "hidden";
    }, 2000);
}

//charger les données des pokemons
async function loadPokemonData() {
    try {
        const response = await fetch('bd.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        return null;
    }
}

//avoir le nombre de Pokémon attrapés en utilisant motusma-data
function getNbCatch() {
    const userData = JSON.parse(localStorage.getItem("motusma-data")) || {};
    let nbCatch = 0;
    for (let i = 1; i <= MAX_POKEMON; i++) {
        if (userData[`pkmn_${i}`] && userData[`pkmn_${i}`].catch) {
            nbCatch++;
        }
    }
    return nbCatch;
}

//avoir le nombre de Pokémon vus en utilisant motusma-data
function getNbFound() {
    const userData = JSON.parse(localStorage.getItem("motusma-data")) || {};
    let nbFound = 0;
    for (let i = 1; i <= MAX_POKEMON; i++) {
        if (userData[`pkmn_${i}`]) {
            nbFound++;
        }
    }
    return nbFound;
}

//fermer les modals quand on cliquer à côté
PSEUDO_OVERLAY.addEventListener('click', function(event) {
    if (event.target === this) {
      closePseudo();
    }
});

RESULTS_OVERLAY.addEventListener('click', function(event) {
    if (event.target === this) {
      closeResults();
    }
});

STATS_OVERLAY.addEventListener('click', function(event) {
    if (event.target === this) {
      closeStats();
    }
});

HELP_OVERLAY.addEventListener('click', function(event) {
    if (event.target === this) {
      closeHelp();
    }
});

//générer la grille de mots
function generateWordGrid(wordLength) {
    const WORD_GRID = document.getElementById('word-grid');

    for (let i = 0; i < 5; i++) {
        const ROW = document.createElement('tr');
        ROW.id = 'row-' + i;

        for (let j = 0; j < wordLength; j++) {
            const CELL = document.createElement('td');
            CELL.id = 'cell-' + j;
            ROW.appendChild(CELL);
        }

        WORD_GRID.appendChild(ROW);
    }
}

function isValidFrenchWord(word) {
    return motsValides.includes(word.toLowerCase());
}

function isValidPokemonName(word) {
    return pokemonList.includes(word.toLowerCase());
}

function updateGridWithGuess(del, key) {
    const currentRowCells = document.querySelectorAll(`#row-${currentRow} td`);
    let index = currentPosition; 

    if (del) {
        if (currentPosition !== 0) {
            currentPosition--;
            index--;
        }
    }

    const cell = currentRowCells[index];

    if (key && /^[a-zA-Z]$/.test(key)) {
        cell.textContent = key.toUpperCase();        
        currentPosition++;
        updateKeyboardButtonColor(key.toLowerCase());
    } else {
        cell.textContent = '';
        cell.style.backgroundColor = 'transparent';
    }
}

function updateKeyboardButtonColor(letter) {
    const keyboardButtons = document.querySelectorAll('.keyboard-button');
    let keyboardButton = null;

    // Trouver le bouton correspondant à la lettre
    keyboardButtons.forEach(button => {
        if (button.textContent.toLowerCase() === letter) {
            keyboardButton = button;
        }
    });

    if (!keyboardButton) return;

    // Vérifier si la lettre est déjà colorée
    if (keyboardButton.style.backgroundColor) {
        return;
    }

    // Vérifier la couleur de toutes les cellules de la ligne actuelle
    const currentRowCells = document.querySelectorAll(`#row-${currentRow} td`);
    let cellColor = null;

    currentRowCells.forEach(cell => {
        if (cell.textContent.toLowerCase() === letter) {
            if (cell.style.backgroundColor === 'rgb(243, 100, 69)') {
                cellColor = 'rgb(243, 100, 69)';
            } else if (cell.style.backgroundColor === 'rgb(240, 218, 26)') {
                cellColor = 'rgb(240, 218, 26)';
            }
        }
    });

    if (cellColor) {
        keyboardButton.style.backgroundColor = cellColor;
    } else {
        keyboardButton.style.backgroundColor = '#666666';
    }
}

function chooseRandomPokemon() {
    const today = new Date();
    const dayOfMonth = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    let index = (((dayOfMonth * 4 + month * 7 + year * 13) % MAX_POKEMON) + 1 ) * Math.sin(dayOfMonth) * Math.cos(month) * Math.tan(year) * 1000 % MAX_POKEMON;
    index = Math.abs(index); 
    index = Math.round(index);
    if(index === 0) index = 1;

    return pokemonList[index-1];
}

function checkGuess() {
    const currentRowCells = document.querySelectorAll(`#row-${currentRow} td`);
    let allLettersCorrect = true;
    let guessedWord = '';
    
    if(atob(getCookie("motusma-finish-today")) == "true") {
        return;
    }

    for (const cell of currentRowCells) {
        guessedWord += cell.textContent.toLowerCase();
    }

    if (guessedWord === '' || (!isValidFrenchWord(guessedWord) && !isValidPokemonName(guessedWord) || currentRowCells[targetPokemon.length -1].textContent == '')) {
        showModalInvalidWord();
        return;
    }

    //on met à jour les essais
    let todayTriesCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith("motusma-today-tries="));
    const todayTries = JSON.parse(decodeURIComponent(todayTriesCookie.split('=')[1]));
    const currentRowArray = todayTries[currentRow];
    for (let i = 0; i < guessedWord.length; i++) {
        currentRowArray.push(guessedWord[i]);
    }
    document.cookie = `motusma-today-tries=${JSON.stringify(todayTries)}; expires=${tomorrow.toUTCString()}; path=/`;

    //pour lettre jaune
    const targetLetterCounts = {};
    for (const letter of targetPokemon) {
        targetLetterCounts[letter] = (targetLetterCounts[letter] || 0) + 1;
    }

    //savoir si le mot a été trouvé
    for (let i = 0; i < targetPokemon.length; i++) {
        const guessedLetter = currentRowCells[i].textContent.toLocaleLowerCase();
        const targetLetter = targetPokemon[i];

        if (guessedLetter === targetLetter) {
            currentRowCells[i].style.backgroundColor = 'rgb(243, 100, 69)';
            targetLetterCounts[guessedLetter]--;
        }
        else {
            allLettersCorrect = false;
        }
    }

    for (let i = 0; i < targetPokemon.length; i++) {
        const guessedLetter = currentRowCells[i].textContent.toLocaleLowerCase();

        if (currentRowCells[i].style.backgroundColor !== 'rgb(243, 100, 69)' && targetPokemon.includes(guessedLetter)) {
            targetLetterCounts[guessedLetter]--;
            if (targetLetterCounts[guessedLetter] >= 0) {
                currentRowCells[i].style.backgroundColor = 'rgb(240, 218, 26)';
            }
        }
    }

    let nbTries = currentRow + 1

    // Mettre à jour les couleurs du clavier pour toutes les lettres utilisées
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    for (const letter of alphabet) {
        if (guessedWord.toLowerCase().includes(letter)) {
            updateKeyboardButtonColor(letter);
        }
    }

    //VICTOIRE
    if (allLettersCorrect && currentRowCells.length === targetPokemon.length) {
        justFinishedGame(true, nbTries);
    }

    //DÉFAITE
    else if(currentRow + 1 >= 5) {
        justFinishedGame(false, nbTries);
    }

    currentRow++;
    currentPosition = 1;
    currentIndex = 1;
    numberOfLetters = 0;
    setFirstLetter();
}

//fonction quand on vient de terminer une partie (gagnant ou pas), afin de mettre à jour les données etc.
function justFinishedGame(hasWon, nbTries) {
    hasWon ? document.cookie = `${"motusma-nb-tries="}${nbTries}; expires=${tomorrow.toUTCString()}; path=/` : document.cookie = `${"motusma-nb-tries="}${6}; expires=${tomorrow.toUTCString()}; path=/`;
    updateFinishTodayCookie("motusma-finish-today", btoa("true"));

    disableKeydownListener();
    disableVirtualKeyboard();
    hasWon ? updateUserData(true, getPokemonIdByName(targetPokemon), nbTries) : updateUserData(false, getPokemonIdByName(targetPokemon), 6);
    updateEssaisChart();
    hasWon ? win(targetPokemon) : lose(targetPokemon);

    //maj les données du pokédex
    SPAN_FOUND.textContent = getNbFound() + "/"+ MAX_POKEMON;
    if(hasWon) SPAN_CATCH.textContent = getNbCatch() + "/"+ MAX_POKEMON;

    return;
}

//quand une game en cours et qu'on revient, on affiche d'abord la première ligne
function setFirstRow() {
    const currentRowCells = document.querySelectorAll(`#row-${currentRow} td`); //0 au début
    const todayTriesCookie = getCookie("motusma-today-tries");

    let allLettersCorrect = true;

    const targetLetterCounts = {};
    for (const letter of targetPokemon.toUpperCase()) {
        targetLetterCounts[letter] = (targetLetterCounts[letter] || 0) + 1;
    }

    if(todayTriesCookie) {
        const todayTries = JSON.parse(decodeURIComponent(todayTriesCookie));

        currentRowCells.forEach((cell, index) => {
            const guessedLetter = (todayTries[currentRow][index] || '').toUpperCase();
            cell.textContent = guessedLetter;

            // Mettre à jour la couleur du clavier pour chaque lettre
            if (guessedLetter) {
                updateKeyboardButtonColor(guessedLetter.toLowerCase());
            }
            const targetLetter = targetPokemon[index].toUpperCase();

            if (guessedLetter === targetLetter) {
                cell.style.backgroundColor = 'rgb(243, 100, 69)';
                targetLetterCounts[guessedLetter]--;
            } else {
                allLettersCorrect = false;
            }
        });

        for (let i = 0; i < targetPokemon.length; i++) {
            const guessedLetter = (todayTries[currentRow][i] || '').toUpperCase();
    
            if (currentRowCells[i].style.backgroundColor !== 'rgb(243, 100, 69)' && targetPokemon.toUpperCase().includes(guessedLetter)) {
                targetLetterCounts[guessedLetter]--;
                if (targetLetterCounts[guessedLetter] >= 0) {
                    currentRowCells[i].style.backgroundColor = 'rgb(240, 218, 26)';
                }
            }
        }

        //gagné
        if(allLettersCorrect) {
            displayResultsComeBack();
        }

        //perdu ou en cours
        else {
            currentRow++;
            currentPosition = 1;
            currentIndex = 1;
            numberOfLetters = 0;

            //perdu, car dépassé les 6 essais
            if(currentRow>= 5){ 
                displayResultsComeBack();
                return;
            }
            else if(todayTries[currentRow].length === 0) { //on reprend le jeu normal
                setFirstLetter();
            }
            else { //on continue à maj la grille
                setFirstRow() //récursif
            }
        }
        
    }

}

function handleInput(key) {
    if (key === 'Backspace' || key === 'backspace') {
        if (numberOfLetters > 0) {
            numberOfLetters--;
            updateGridWithGuess(true, key);
        }
    } 
    else if (/^[a-zA-Z]$/.test(key) && numberOfLetters < targetPokemon.length) {
        numberOfLetters++;
        updateGridWithGuess(false, key);
    }
}

function share() {

    let text = "";
    if(getCookie("motusma-nb-tries") == "6") {
        text = "Je n'ai pas trouvé le Pokémon du jour sur " + window.location.href + ' :( \n' ;
    }
    else {
        text = "J'ai trouvé le Pokémon du jour en " + getCookie("motusma-nb-tries") + " essai" + (getCookie("motusma-nb-tries") == "1" ? "" : "s") + " sur " + window.location.href + ' ! \n' ;
    }
    navigator.clipboard.writeText(text);

    const NOTIF = document.createElement('div');
    NOTIF.className = 'notification';
    NOTIF.textContent = 'Copié dans le presse-papiers.';
    document.body.appendChild(NOTIF);

    NOTIF.style.bottom = '-4em';
    NOTIF.style.opacity = '0';

    setTimeout(function () {
        NOTIF.style.bottom = '2em';
        NOTIF.style.opacity = '1';
    }, 10);

    setTimeout(function () {

        NOTIF.style.bottom = '-4em';
        NOTIF.style.opacity = '0';

        setTimeout(function () {
            document.body.removeChild(NOTIF);
        }, 500);
    }, 1000);
}

//au début d'une partie
function setFirstLetter() {
    const rowCells = document.querySelectorAll(`#row-${currentRow} td`);
    const firstLetterCell = rowCells[0];

    //1ère lettre du Pokémon à trouver
    firstLetterCell.textContent = targetPokemon[0].toUpperCase();
    firstLetterCell.style.backgroundColor = 'rgb(243, 100, 69)';

    firstLetterCell.contentEditable = false;
}

function normalizeString(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

//fonction pour afficher les résultats quand on vient de finir une partie, gagnante ou non
function displayResults(pokemonName, sound, title, message) {
    const pkmn_id = getPokemonIdByName(pokemonName);
    pokeball.classList.remove('disabled');
    RESULTS_TITRE.textContent = title;
    RESULTS_TEXT.textContent = message;
    openResults();
    results_pokemon.src = `/sprites/${pkmn_id}.svg`;
}

function win(pokemonName) {
    const answer = atob(getCookie("motusma-answer"));
    const tries = getCookie("motusma-nb-tries");
    displayResults(
        pokemonName,
        'win',
        "Nom de Zeus !",
        `Tu as trouvé ${majFirstLetter(answer)} #${getPokemonIdByName(answer)} en ${tries} essai${tries == "1" ? "" : "s"}.`
    );
}

function lose(pokemonName) {
    const answer = atob(getCookie("motusma-answer"));
    displayResults(
        pokemonName,
        'lose',
        "Nom d'une pipe en bois !",
        `Le Pokémon du jour était ${majFirstLetter(answer)} #${getPokemonIdByName(answer)}`
    );
}

// Fonction pour gérer l'événement de la touche enfoncée
function keydownHandler(event) {
    const rowCells = document.querySelectorAll(`#row-${currentRow} td`);

    if(rowCells[targetPokemon.length - 1].textContent =='' || event.key == 'Backspace') {
        handleInput(event.key);
    }
   
    if (event.key === 'Enter') {
        checkGuess();
    }
}

// Fonction pour désactiver l'écouteur d'événements
function disableKeydownListener() {
    window.removeEventListener('keydown', keydownHandler);
}

// Fonction pour désactiver le clavier virtuel
function disableVirtualKeyboard() {
    const keyboardButtons = document.querySelectorAll('.keyboard-button');
    keyboardButtons.forEach(button => {
        button.disabled = true;

        //je remets ça pck disabled met un style par défaut
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
    });
}

// Fonction pour réactiver l'écouteur d'événements
function enableKeydownListener() {
    window.addEventListener('keydown', keydownHandler);
}

// Fonction pour réactiver le clavier virtuel
function enableVirtualKeyboard() {
    const keyboardButtons = document.querySelectorAll('.keyboard-button');
    keyboardButtons.forEach(button => {
        button.disabled = false;
    });
}

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
            return decodeURIComponent(cookie.substring(name.length + 1));
        }
    }
    return null;
}

function updateFinishTodayCookie(cookieName, newValue) {
    const cookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith(`${cookieName}=`));
    if (cookie) {
        const [name, value] = cookie.split('=');
        document.cookie = `${name}=${newValue}; expires=${tomorrow.toUTCString()}; path=/`;
    }
}

function openPokedex() {
    window.location.href = "./pokedex.html";
}

function openStats() {
    stats.style.display="flex";
    results.style.display="none";
    RESULTS_OVERLAY.style.display="none";
    STATS_OVERLAY.style.display="flex";
    disableKeydownListener();
    disableVirtualKeyboard();
}

function closeStats() {
    enableKeydownListener();
    enableVirtualKeyboard();
    stats.style.display='none';
    STATS_OVERLAY.style.display="none";
}

function openHelp() {
    HELP.style.display="flex";
    HELP_OVERLAY.style.display="flex";
    disableKeydownListener();
    disableVirtualKeyboard();
}

function closeHelp() {
    enableKeydownListener();
    enableVirtualKeyboard();
    HELP.style.display='none';
    HELP_OVERLAY.style.display="none";
}

function openResults() {
    results.style.display = "flex";
    RESULTS_OVERLAY.style.display="flex";
}

function closeResults() {
    results.style.display = "none";
    RESULTS_OVERLAY.style.display="none";
}

function openPseudo() {
    formPseudo.style.display="flex";
    PSEUDO_INPUT.value = getMotusmaInfoField("pseudo");
    PSEUDO_OVERLAY.style.display="flex";
}

function closePseudo() {
    formPseudo.style.display="none";
    PSEUDO_OVERLAY.style.display="none";
}

function newPseudo(event) {
    event.preventDefault();
    const newPseudo = PSEUDO_INPUT.value;

    if (newPseudo.trim() !== '') {
        setMotusmaInfoField("pseudo", newPseudo);
        pseudo.textContent = getMotusmaInfoField("pseudo");
        formPseudo.style.display="none";
        PSEUDO_OVERLAY.style.display="none";
    }
}

function toggleTheme() {
    const htmlElement = document.querySelector('html');

    const tds = document.querySelectorAll('td');
    const keyboardButtons = document.querySelectorAll('.keyboard-button');

    tds.forEach(td => {
        if (getMotusmaInfoField("theme") === "dark") {
            td.style.color = '#000';
            td.style.boxShadow ='inset 0 0 0 3px #000';
        } else {
            td.style.color = '#fff'; 
            td.style.boxShadow = 'inset 0 0 0 3px #fff';
        }
    });

    keyboardButtons.forEach(button => {
        if (getMotusmaInfoField("theme") === "dark") {
            button.style.color = '#000';
            button.style.backgroundColor = '#fff';
            button.style.border = '2px solid #000';
        } else {
            button.style.color = '#fff';
            button.style.backgroundColor = '#110644';
            button.style.border = '2px solid #fff';
        }

        //puis on remet les couleurs des touches
        updateKeyboardButtonColor(button.textContent.toLowerCase());
    });

    if (imgTheme.src.includes("sun")) {        
        setMotusmaInfoField("theme", "dark")
        htmlElement.style.backgroundImage = "url('images/night.png')";
        imgTheme.src = "images/moon.svg";
        SAC_TEXT.style.color = '#fff';
        OPTIONS_TEXT.style.color = '#fff';
    } else {
        setMotusmaInfoField("theme", "light")
        htmlElement.style.backgroundImage = "url('images/day.png')";
        imgTheme.src = "images/sun.svg";
        SAC_TEXT.style.color = '#000';
        OPTIONS_TEXT.style.color = '#000';
    }
}

function newGame() {
    document.cookie = `${"motusma-finish-today="}${btoa("false")}; expires=${tomorrow.toUTCString()}; path=/`;
    document.cookie = `${"motusma-today-tries="}${"[[], [], [], [], []]"}; expires=${tomorrow.toUTCString()}; path=/`;

    targetPokemon = chooseRandomPokemon();
    document.cookie = `${"motusma-answer="}${btoa(targetPokemon)}; expires=${tomorrow}; path=/`;

    generateWordGrid(targetPokemon.length);
    setFirstLetter();
}

//si l'on a déjà joué aujourd'hui (en cours, gagné ou perdu)
function existingGame() {
    targetPokemon = atob(getCookie("motusma-answer"));
    generateWordGrid(targetPokemon.length);
    setFirstRow();
}

//permet de récupérer un champ des infos
function getMotusmaInfoField(field) {
    const rawData = localStorage.getItem("motusma-infos");
    if (!rawData) return null;

    try {
        const infos = JSON.parse(rawData);
        return infos[field] ?? null;
    } catch (e) {
        console.error("Erreur parsing motusma-infos:", e);
        return null;
    }
}

//permet de maj un champ des infos
function setMotusmaInfoField(field, value) {
    let infos = {};
    const rawData = localStorage.getItem("motusma-infos");

    try {
        if (rawData) {
            infos = JSON.parse(rawData);
        }
    } catch (e) {
        console.error("Erreur parsing motusma-infos:", e);
    }

    infos[field] = value;
    localStorage.setItem("motusma-infos", JSON.stringify(infos));
}

//affichage des tooltips au survol
function initTooltips() {
    TOOLTIPS.forEach(trigger => {
        const TOOLTIP = trigger.nextElementSibling;
    
        trigger.addEventListener('mouseenter', () => {
          const TOOLTIP_CONTENT = trigger.getAttribute('data-tooltip');
          TOOLTIP.querySelector('.tooltip-inner').textContent = TOOLTIP_CONTENT;
          TOOLTIP.setAttribute('aria-hidden', 'false');
    
          const RECT = trigger.getBoundingClientRect();
          const SCROLL_Y = window.scrollY || window.pageYOffset;
    
          TOOLTIP.style.top = `${RECT.bottom + SCROLL_Y + 5}px`;
          TOOLTIP.style.left = `${RECT.left + (RECT.width / 2) - (TOOLTIP.offsetWidth / 2)}px`;
        });
    
        trigger.addEventListener('mouseleave', () => {
            TOOLTIP.setAttribute('aria-hidden', 'true');
        });
    });
}

function initVirtualKeyboard() {
    const keyboard = document.getElementById('virtual-keyboard');
    if (!keyboard) return;

    const keyboardButtons = keyboard.querySelectorAll('.keyboard-button');
    
    keyboardButtons.forEach(button => {
        button.addEventListener('click', () => {
            const key = button.textContent;
            handleVirtualKey(key);
        });
    });

    // Mettre à jour les couleurs du clavier lors du chargement
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    for (const letter of alphabet) {
        updateKeyboardButtonColor(letter);
    }
}

function handleVirtualKey(key) {
    if (key === '⌫') {
        handleInput('backspace');
    } else if (key === '→') {
        checkGuess();
    } else {
        handleInput(key.toLowerCase());
        updateKeyboardButtonColor(key.toLowerCase());
    }
}

// Fonction pour mettre à jour les couleurs des touches du clavier
function updateKeyboardButtonColor(letter) {
    const keyboardButtons = document.querySelectorAll('.keyboard-button');
    let keyboardButton = null;

    // Trouver le bouton correspondant à la lettre
    keyboardButtons.forEach(button => {
        if (button.textContent.toLowerCase() === letter) {
            keyboardButton = button;
        }
    });

    if (!keyboardButton) return;

    if (keyboardButton.style.backgroundColor === '#fff' || keyboardButton.style.backgroundColor === '#110644') {
        return;
    }

    // Vérifier toutes les cellules de toutes les lignes pour trouver la couleur la plus significative
    let cellColor = null;
    for (let row = 0; row <= currentRow; row++) {
        const rowCells = document.querySelectorAll(`#row-${row} td`);
        rowCells.forEach(cell => {
            if (cell.textContent.toLowerCase() === letter) {
                if (cell.style.backgroundColor === 'rgb(243, 100, 69)') {
                    cellColor = 'rgb(243, 100, 69)';
                } else if (cell.style.backgroundColor === 'rgb(240, 218, 26)') {
                    cellColor = 'rgb(240, 218, 26)';
                }
            }
        });
    }

    if (cellColor) {
        keyboardButton.style.backgroundColor = cellColor;
    }
}

function getPokemonIdByName(pokemonName) {
    if (!pokemonData) {
        console.error('Les données ne sont pas chargées.');
        return null;
    }
    for (const pokemon of pokemonData) {
      if (normalizeString(pokemon.name.french.toLowerCase()) === pokemonName) {
        return pokemon.id;
      }
    }
    return null;
}

//afficher les résultats si on revient sur le site après avoir terminé la partie du jour (gagnante ou non)
async function displayResultsComeBack() {
    if (atob(getCookie("motusma-finish-today")) == "true"){
        await loadPokemonData();
        if(getCookie("motusma-nb-tries") == "6") {
            lose(targetPokemon);
        }
        else {
            win(targetPokemon);
        }
        results.style.display="";
    }
}

function updateUserData(isCatch, id, nbTries) {
    let userData = JSON.parse(localStorage.getItem("motusma-data"));

    if (!userData){
        userData = {};
    }

    const newPokemonId = id; 
    const newPokemonCatch = isCatch; 
    const newPokemonDate = new Date(); 
    const newPokemonTries = nbTries; 

    const existingPokemon = userData[`pkmn_${newPokemonId}`];

    if (existingPokemon) {
        if (newPokemonTries < existingPokemon.tries){

            const newPokemon = {
                id: newPokemonId,
                catch: newPokemonCatch,
                date: newPokemonDate,
                tries: newPokemonTries
            };

            userData[`pkmn_${newPokemonId}`] = newPokemon;
            localStorage.setItem("motusma-data", JSON.stringify(userData));
        }
    } 
    else {

        const newPokemon = {
            id: newPokemonId,
            catch: newPokemonCatch,
            date: newPokemonDate,
            tries: newPokemonTries
        };

        userData[`pkmn_${newPokemonId}`] = newPokemon;
        localStorage.setItem("motusma-data", JSON.stringify(userData));
    } 
}

window.addEventListener('keydown', keydownHandler);

// ------- SCRIPT ------- //

//cookies
let tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(0, 0, 0, 0);

loadPokemonData().then(data => {
    if (data) {
        pokemonData = data;
        pokemonList = data.map(pokemon => normalizeString(pokemon.name.french.toLowerCase()));

        //1ère visite sur le site 
        if (!localStorage.getItem("motusma-infos")) {
            const currentDate = new Date();
            const formattedDate = `${currentDate.getDate()} ${moisEnFrancais[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

            const infos = {
                theme: "light",
                pseudo: "Anonyme",
                startJourney: formattedDate,
            };
            localStorage.setItem("motusma-infos", JSON.stringify(infos));
            openHelp();
        }

        //données du Pokédex
        SPAN_FOUND.textContent = getNbFound() + "/"+ MAX_POKEMON;
        SPAN_CATCH.textContent = getNbCatch() + "/"+ MAX_POKEMON;

        //données du joueur
        pseudo.textContent = getMotusmaInfoField("pseudo");
        debutAventure.textContent = getMotusmaInfoField("startJourney");

        const todayTriesCookie = getCookie("motusma-today-tries");

        //on regarde si partie en cours ou pas encore commencée
        if (!todayTriesCookie || todayTriesCookie === "[[], [], [], [], []]") {
            newGame();
        } else {
            existingGame();

        }

        //gestion du thème clair ou sombre
        const keyboardButtons = document.querySelectorAll('.keyboard-button');

        if(getMotusmaInfoField("theme") === "dark") {

            const tds = document.querySelectorAll('td');
            tds.forEach(td => {
                td.style.color = '#fff'; 
                td.style.boxShadow = 'inset 0 0 0 3px #fff';
            });

            keyboardButtons.forEach(button => {
                button.style.color = '#fff';
                button.style.backgroundColor = '#110644';
                button.style.border = '2px solid #fff';
            });

            document.querySelector('html').style.backgroundImage = "url('images/night.png')";
            imgTheme.src = "images/moon.svg";
            SAC_TEXT.style.color = '#fff';
            OPTIONS_TEXT.style.color = '#fff';
        }
        else {
            keyboardButtons.forEach(button => {
                button.style.color = '#000';
                button.style.backgroundColor = '#fff';
                button.style.border = '2px solid #000';
            });
        }

        //initialisation du clavier virtuel
        initVirtualKeyboard();

        //initialisation des tooltips
        initTooltips();

    } else { //erreur pittoresque 
        console.error('Impossible de charger les données.');
    }
}).catch(error => {
    console.error("Erreur loadPokemonData", error);
});