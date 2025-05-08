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
const content = document.getElementById("page-content");
const pokeball = document.getElementById("pokeball-results");
const pseudo = document.getElementById("pseudo");
const debutAventure = document.getElementById("debut-aventure");
const music = document.getElementById("img-music");
const stats = document.getElementById("stats");
const results_pokemon = document.getElementById("results-pokemon");
const formPseudo = document.getElementById('form-changer-pseudo');
let bg_music = new Audio('sounds/music.mp3');
bg_music.loop = true;
let isMusicPlaying = false;
let musicHasStarted = false;
const spanFound = document.querySelector("#found span");
const spanCatch = document.querySelector("#catch span");

//hide invalidWord msg
MOT_INVALIDE_MODAL.style.visibility = "hidden";
MOT_INVALIDE_MODAL.style.bottom = "-" + MOT_INVALIDE_MODAL.clientHeight + "px";

//play any sound
function playSound(soundName, type) {
    const audio = new Audio('sounds/' + soundName + '.' + type);
    audio.play();
    audio.onended = function() {
        audio.remove();
    };
}

function majFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }

// Fonction pour démarrer ou arrêter la musique
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

function showModalInvalidWord() {
    MOT_INVALIDE_MODAL.style.visibility = "visible";
    MOT_INVALIDE_MODAL.style.bottom = "20px";

    setTimeout(function () {
        MOT_INVALIDE_MODAL.style.bottom = "-" + MOT_INVALIDE_MODAL.clientHeight + "px";
        MOT_INVALIDE_MODAL.style.visibility = "hidden";
    }, 2000);
}

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

function generateWordGrid(wordLength) {
    const wordGrid = document.getElementById('word-grid');

    for (let i = 0; i < 5; i++) {
        const row = document.createElement('tr');
        row.id = 'row-' + i;

        for (let j = 0; j < wordLength; j++) {
            const cell = document.createElement('td');
            cell.id = 'cell-' + j;
            row.appendChild(cell);
        }

        wordGrid.appendChild(row);
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

    let index = (((dayOfMonth * 4 + month * 7 + year * 13) % 151) + 1 ) * Math.sin(dayOfMonth) * Math.cos(month) * Math.tan(year) * 1000 % 151;
    index = Math.abs(index); 
    index = Math.round(index);
    return pokemonList[index];
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

    let nb_tries = currentRow + 1

    // Mettre à jour les couleurs du clavier pour toutes les lettres utilisées
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    for (const letter of alphabet) {
        if (guessedWord.toLowerCase().includes(letter)) {
            updateKeyboardButtonColor(letter);
        }
    }

    //VICTOIRE
    if (allLettersCorrect && currentRowCells.length === targetPokemon.length) {

        document.cookie = `${"motusma-nb-tries="}${nb_tries}; expires=${tomorrow.toUTCString()}; path=/`;
        win(targetPokemon);

        updateFinishTodayCookie("motusma-finish-today", btoa("true"));

        let pkmn_found = parseInt(localStorage.getItem("motusma-found"), 10) || 0;
        pkmn_found++;
        localStorage.setItem("motusma-found", pkmn_found);

        let pkmn_catch = parseInt(localStorage.getItem("motusma-catch"), 10) || 0;
        pkmn_catch++;
        localStorage.setItem("motusma-catch", pkmn_catch);

        //on maj le pokédex
        fetch(`https://pokeapi.co/api/v2/pokemon?limit=${MAX_POKEMON}`)
        .then((response) => response.json())
        .then((data) => {
            allPokemons = data.results;
            displayPokemons(allPokemons);
        });

        //on maj les stats
        spanFound.textContent = localStorage.getItem("motusma-found") + "/151";
        spanCatch.textContent = localStorage.getItem("motusma-catch") + "/151";

        //on désactive l'écouteur de touches et le clavier virtuel, on maj les données utilisateur et le graphique des stats
        disableKeydownListener();
        disableVirtualKeyboard();
        updateUserData(true, getPokemonIdByName(targetPokemon), nb_tries);
        updateEssaisChart();

        return;
    }

    //DÉFAITE
    if(currentRow + 1 >= 5) {
        
        document.cookie = `${"motusma-nb-tries="}${6}; expires=${tomorrow.toUTCString()}; path=/`;
        lose(targetPokemon);

        updateFinishTodayCookie("motusma-finish-today", btoa("true"));

        let pkmn_found = parseInt(localStorage.getItem("motusma-found"), 10) || 0;
        pkmn_found++;
        localStorage.setItem("motusma-found", pkmn_found);

        //on maj le pokédex
        fetch(`https://pokeapi.co/api/v2/pokemon?limit=${MAX_POKEMON}`)
        .then((response) => response.json())
        .then((data) => {
            allPokemons = data.results;
            displayPokemons(allPokemons);
        });

        //on maj les stats
        spanFound.textContent = localStorage.getItem("motusma-found") + "/151";
        spanCatch.textContent = localStorage.getItem("motusma-catch") + "/151";

        //on désactive l'écouteur de touches et le clavier virtuel, on maj les données utilisateur et le graphique des stats
        disableKeydownListener();
        disableVirtualKeyboard();
        updateUserData(false, getPokemonIdByName(targetPokemon), 6);
        updateEssaisChart();

        return;
    }

    currentRow++;
    currentPosition = 1;
    currentIndex = 1;
    numberOfLetters = 0;
    setFirstLetter();
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
            const guessedLetter = todayTries[currentRow][index].toUpperCase() || '';
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
            const guessedLetter = todayTries[currentRow][i].toUpperCase() || '';
    
            if (currentRowCells[i].style.backgroundColor !== 'rgb(243, 100, 69)' && targetPokemon.toUpperCase().includes(guessedLetter)) {
                targetLetterCounts[guessedLetter]--;
                if (targetLetterCounts[guessedLetter] >= 0) {
                    currentRowCells[i].style.backgroundColor = 'rgb(240, 218, 26)';
                }
            }
        }

        if(allLettersCorrect) {
            displayResultsComeBack();
            pokeball.classList.remove('disabled');
            disableKeydownListener();
            disableVirtualKeyboard();
        }
        else {
            currentRow++;
            currentPosition = 1;
            currentIndex = 1;
            numberOfLetters = 0;
            if(currentRow>= 5){ //perdu, car dépassé les 6 essais
                displayResultsComeBack();
                pokeball.classList.remove('disabled');
                disableKeydownListener();
                disableVirtualKeyboard();
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
    const copyText = "J'ai trouvé le Pokémon du jour en " + getCookie("motusma-nb-tries") + " essais sur " + window.location.href + ' ! \n' ;
    navigator.clipboard.writeText(copyText);

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = 'Copié dans le presse-papiers.';
    document.body.appendChild(notification);

    notification.style.bottom = '-4em';
    notification.style.opacity = '0';

    setTimeout(function () {
        notification.style.bottom = '2em';
        notification.style.opacity = '1';
    }, 10);

    setTimeout(function () {

        notification.style.bottom = '-4em';
        notification.style.opacity = '0';

        setTimeout(function () {
            document.body.removeChild(notification);
        }, 500);
    }, 1000);
}

function setFirstLetter() {
    const rowCells = document.querySelectorAll(`#row-${currentRow} td`);
    const firstLetterCell = rowCells[0];

    firstLetterCell.textContent = targetPokemon[0].toUpperCase();
    firstLetterCell.style.backgroundColor = 'rgb(243, 100, 69)';

    firstLetterCell.contentEditable = false;
}

function normalizeString(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function win(pokemonName) {
    pkmn_id = getPokemonIdByName(pokemonName);
    playSound('win', 'mp3');
    pokeball.classList.remove('disabled');
    document.getElementById("results-titre").textContent = "Nom de Zeus !";
    document.getElementById("results-text").textContent = "Tu as trouvé " + majFirstLetter(atob(getCookie("motusma-answer"))) + " en " + getCookie("motusma-nb-tries") + " essai.s.";
    openResults();
    //results_pokemon.src = `https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/other/dream-world/${pkmn_id}.svg`;
    results_pokemon.src = `/sprites/${pkmn_id}.svg`;
}

function lose(pokemonName) {
    pkmn_id = getPokemonIdByName(pokemonName);
    playSound('lose', 'mp3');
    pokeball.classList.remove('disabled');
    document.getElementById("results-titre").textContent = "Nom d'une pipe en bois !";
    document.getElementById("results-text").textContent = "Le pokémon du jour était  " + majFirstLetter(atob(getCookie("motusma-answer"))) + ".";
    openResults();
    //results_pokemon.src = `https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/other/dream-world/${pkmn_id}.svg`;
    results_pokemon.src = `/sprites/${pkmn_id}.svg`;
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
    document.getElementById("results-overlay").style.display="none";
    document.getElementById("stats-overlay").style.display="flex";
    disableKeydownListener();
    disableVirtualKeyboard();
}

function closeStats() {
    enableKeydownListener();
    enableVirtualKeyboard();
    stats.style.display='none';
    document.getElementById("stats-overlay").style.display="none";
}

function openHelp() {
    HELP.style.display="flex";
    document.getElementById("help-overlay").style.display="flex";
    disableKeydownListener();
    disableVirtualKeyboard();
}

function closeHelp() {
    enableKeydownListener();
    enableVirtualKeyboard();
    HELP.style.display='none';
    document.getElementById("help-overlay").style.display="none";
}

function openResults() {
    results.style.display = "flex";
    document.getElementById("results-overlay").style.display="flex";
}

function closeResults() {
    results.style.display = "none";
    document.getElementById("results-overlay").style.display="none";
}

function openPseudo() {
    formPseudo.style.display="flex";
    document.getElementById('pseudo-input').value = localStorage.getItem("motusma-pseudo");
    document.getElementById("pseudo_overlay").style.display="flex";
}

function closePseudo() {
    formPseudo.style.display="none";
    document.getElementById("pseudo_overlay").style.display="none";
}

function newPseudo(event) {
    event.preventDefault();
    const newPseudo = document.getElementById('pseudo-input').value;

    if (newPseudo.trim() !== '') {
        localStorage.setItem("motusma-pseudo", newPseudo);
        pseudo.textContent = localStorage.getItem("motusma-pseudo");
        formPseudo.style.display="none";
        document.getElementById("pseudo_overlay").style.display="none";
    }
}

function toggleTheme() {
    const htmlElement = document.querySelector('html');

    const tds = document.querySelectorAll('td');
    const keyboardButtons = document.querySelectorAll('.keyboard-button');

    tds.forEach(td => {
        if (localStorage.getItem("motusma-theme") === "dark") {
            td.style.color = '#000';
            td.style.boxShadow ='inset 0 0 0 3px #000';
        } else {
            td.style.color = '#fff'; 
            td.style.boxShadow = 'inset 0 0 0 3px #fff';
        }
    });

    keyboardButtons.forEach(button => {
        if (localStorage.getItem("motusma-theme") === "dark") {
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
        localStorage.setItem("motusma-theme", "dark")
        htmlElement.style.backgroundImage = "url('images/night.png')";
        imgTheme.src = "images/moon.svg";
        SAC_TEXT.style.color = '#fff';
        OPTIONS_TEXT.style.color = '#fff';
    } else {
        localStorage.setItem("motusma-theme", "light")
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

// SCRIPT //

//cookies
let tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(0, 0, 0, 0);

loadPokemonData().then(data => {
    if (data) {
        pokemonData = data;
        pokemonList = data.map(pokemon => normalizeString(pokemon.name.french.toLowerCase()));
        spanFound.textContent = localStorage.getItem("motusma-found") + "/151";
        spanCatch.textContent = localStorage.getItem("motusma-catch") + "/151";

        const todayTriesCookie = getCookie("motusma-today-tries");

        //1ère visite sur le site, on affiche les règles
        if(!localStorage.getItem("motusma-metaphysique")) {
            openHelp();
            localStorage.setItem("motusma-metaphysique", "nan nan");
        }

        //on regarde si partie en cours ou pas encore commencée
        if (!todayTriesCookie || todayTriesCookie === "[[], [], [], [], []]") {
            newGame();
        } else {
            existingGame();
        }

        //gestion du thème clair ou sombre
        const keyboardButtons = document.querySelectorAll('.keyboard-button');

        if(localStorage.getItem("motusma-theme") === "dark") {

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
});

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

if (!localStorage.getItem("motusma-start-journey")) {
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()} ${moisEnFrancais[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    localStorage.setItem("motusma-start-journey", formattedDate);
}

if (!localStorage.getItem("motusma-pseudo") || localStorage.getItem("motusma-pseudo") === '') {
    localStorage.setItem("motusma-pseudo", 'Anonyme');
}

if(!localStorage.getItem("motusma-found")) {
    localStorage.setItem("motusma-found", 0);
}

if(!localStorage.getItem("motusma-catch")) {
    localStorage.setItem("motusma-catch", 0);
}

//afficher les résultats si on revient sur le site après avoir terminé la partie du jour
async function displayResultsComeBack() {
    if (atob(getCookie("motusma-finish-today")) == "true"){
        await loadPokemonData();
        if(getCookie("motusma-nb-tries") == "6") {
            lose(targetPokemon);
        }
        else {
            win(targetPokemon);
        }

        //on permet de cliquer sur la pokéball de résultats, et on met à jour les infos de cette modal
        pokeball.classList.remove('disabled');
        pokemonID = getPokemonIdByName(atob(getCookie("motusma-answer")));
        //results_pokemon.src = `https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/other/dream-world/${pokemonID}.svg`;
        results_pokemon.src = `/sprites/${pokemonID}.svg`;
        results.style.display="";
    }
}

pseudo.textContent = localStorage.getItem("motusma-pseudo");
debutAventure.textContent = localStorage.getItem("motusma-start-journey");

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