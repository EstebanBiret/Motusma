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

const PSEUDO_OVERLAY = document.getElementById("pseudo-overlay");
const RESULTS_OVERLAY = document.getElementById("results-overlay");
const STATS_OVERLAY = document.getElementById("stats-overlay");
const HELP_OVERLAY = document.getElementById("help-overlay");

const PSEUDO_INPUT = document.getElementById('pseudo-input');
const RESULTS_TITRE = document.getElementById("results-titre");
const RESULTS_TEXT = document.getElementById("results-text");

MOT_INVALIDE_MODAL.style.visibility = "hidden";
MOT_INVALIDE_MODAL.style.bottom = "-" + MOT_INVALIDE_MODAL.clientHeight + "px";

function majFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }

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
        if (currentPosition > 1) {
            currentPosition--;
            index--;
        } else {
            return;
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

    let todayTriesCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith("motusma-today-tries="));
    const todayTries = JSON.parse(decodeURIComponent(todayTriesCookie.split('=')[1]));
    const currentRowArray = todayTries[currentRow];
    for (let i = 0; i < guessedWord.length; i++) {
        currentRowArray.push(guessedWord[i]);
    }
    document.cookie = `motusma-today-tries=${JSON.stringify(todayTries)}; expires=${tomorrow.toUTCString()}; path=/`;

    const targetLetterCounts = {};
    for (const letter of targetPokemon) {
        targetLetterCounts[letter] = (targetLetterCounts[letter] || 0) + 1;
    }

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

    if (allLettersCorrect && currentRowCells.length === targetPokemon.length) {
        currentRow++;
        for (const letter of 'abcdefghijklmnopqrstuvwxyz') {
            if (guessedWord.toLowerCase().includes(letter)) {
                updateKeyboardButtonColor(letter);
            }
        }
        currentRow--;

        justFinishedGame(true, nbTries);
        return;
    }

    else if(currentRow + 1 >= 5) {
        currentRow++;
        for (const letter of 'abcdefghijklmnopqrstuvwxyz') {
            if (guessedWord.toLowerCase().includes(letter)) {
                updateKeyboardButtonColor(letter);
            }
        }
        currentRow--;

        justFinishedGame(false, nbTries);
        return;
    }

    currentRow++;
    currentPosition = 1;
    currentIndex = 1;
    numberOfLetters = 0;

    for (const letter of 'abcdefghijklmnopqrstuvwxyz') {
        if (guessedWord.toLowerCase().includes(letter)) {
            updateKeyboardButtonColor(letter);
        }
    }

    setFirstLetter();
}

function justFinishedGame(hasWon, nbTries) {
    hasWon ? document.cookie = `${"motusma-nb-tries="}${nbTries}; expires=${tomorrow.toUTCString()}; path=/` : document.cookie = `${"motusma-nb-tries="}${6}; expires=${tomorrow.toUTCString()}; path=/`;
    updateFinishTodayCookie("motusma-finish-today", btoa("true"));

    disableKeydownListener();
    disableVirtualKeyboard();
    hasWon ? updateUserData(true, getPokemonIdByName(targetPokemon), nbTries) : updateUserData(false, getPokemonIdByName(targetPokemon), 6);
    updateEssaisChart();
    hasWon ? win(targetPokemon) : lose(targetPokemon);

    SPAN_FOUND.textContent = getNbFound() + "/"+ MAX_POKEMON;
    if(hasWon) SPAN_CATCH.textContent = getNbCatch() + "/"+ MAX_POKEMON;

    return;
}

function setFirstRow() {
    const currentRowCells = document.querySelectorAll(`#row-${currentRow} td`);
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

        if(allLettersCorrect) {
            displayResultsComeBack();
        }

        else {
            currentRow++;
            currentPosition = 1;
            currentIndex = 1;
            numberOfLetters = 0;

            if(currentRow>= 5){
                displayResultsComeBack();
                return;
            }
            else if(todayTries[currentRow].length === 0) {
                setFirstLetter();
            }
            else { 
                setFirstRow() 
            }
        }

    }

}

function handleInput(key) {
    if (key === 'Backspace' || key === 'backspace') {
        if (currentPosition > 1) {
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

function keydownHandler(event) {
    const rowCells = document.querySelectorAll(`#row-${currentRow} td`);

    if(rowCells[targetPokemon.length - 1].textContent =='' || event.key == 'Backspace') {
        handleInput(event.key);
    }

    if (event.key === 'Enter') {
        checkGuess();
    }
}

function disableKeydownListener() {
    window.removeEventListener('keydown', keydownHandler);
}

function disableVirtualKeyboard() {
    const keyboardButtons = document.querySelectorAll('.keyboard-button');
    keyboardButtons.forEach(button => {
        button.disabled = true;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
    });
}

function enableKeydownListener() {
    window.addEventListener('keydown', keydownHandler);
}

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
    if (!isGameFinished()) {
        enableKeydownListener();
        enableVirtualKeyboard();
    }
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
    if (!isGameFinished()) {
        enableKeydownListener();
        enableVirtualKeyboard();
    }
    HELP.style.display='none';
    HELP_OVERLAY.style.display="none";
}

function isGameFinished() {
    const cookie = getCookie("motusma-finish-today");
    if (!cookie) return false;
    try {
        return atob(cookie) === "true";
    } catch (e) {
        return false;
    }
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

function existingGame() {
    targetPokemon = atob(getCookie("motusma-answer"));
    generateWordGrid(targetPokemon.length);
    setFirstRow();
}

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
            button.blur();
        });
    });

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

function updateKeyboardButtonColor(letter) {
    const keyboardButtons = document.querySelectorAll('.keyboard-button');
    let keyboardButton = null;

    keyboardButtons.forEach(button => {
        if (button.textContent.toLowerCase() === letter) {
            keyboardButton = button;
        }
    });

    if (!keyboardButton) return;

    const current = keyboardButton.style.backgroundColor;
    if (current === 'rgb(243, 100, 69)') {
        return;
    }

    let cellColor = null;
    let letterWasGuessed = false;
    for (let row = 0; row < currentRow; row++) {
        const rowCells = document.querySelectorAll(`#row-${row} td`);
        rowCells.forEach(cell => {
            if (cell.textContent.toLowerCase() === letter) {
                letterWasGuessed = true;
                const bg = cell.style.backgroundColor;
                if (bg === 'rgb(243, 100, 69)') {
                    cellColor = 'rgb(243, 100, 69)';
                } else if (bg === 'rgb(240, 218, 26)'
                           && cellColor !== 'rgb(243, 100, 69)') {
                    cellColor = 'rgb(240, 218, 26)';
                }
            }
        });
    }

    if (cellColor) {
        keyboardButton.style.backgroundColor = cellColor;
    } else if (letterWasGuessed) {
        keyboardButton.style.backgroundColor = '#bdbdbd';
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

async function displayResultsComeBack() {
    if (atob(getCookie("motusma-finish-today")) == "true"){
        await loadPokemonData();
        disableKeydownListener();
        disableVirtualKeyboard();
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

let tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(0, 0, 0, 0);

loadPokemonData().then(data => {
    if (data) {
        pokemonData = data;
        pokemonList = data.map(pokemon => normalizeString(pokemon.name.french.toLowerCase()));

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

        SPAN_FOUND.textContent = getNbFound() + "/"+ MAX_POKEMON;
        SPAN_CATCH.textContent = getNbCatch() + "/"+ MAX_POKEMON;

        pseudo.textContent = getMotusmaInfoField("pseudo");
        debutAventure.textContent = getMotusmaInfoField("startJourney");

        const todayTriesCookie = getCookie("motusma-today-tries");

        if (!todayTriesCookie || todayTriesCookie === "[[], [], [], [], []]") {
            newGame();
        } else {
            existingGame();

        }

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

        initVirtualKeyboard();

        initTooltips();

    } else { 
        console.error('Impossible de charger les données.');
    }
}).catch(error => {
    console.error("Erreur loadPokemonData", error);
});