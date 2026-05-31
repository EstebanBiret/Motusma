let pokemonList = [];
let targetPokemon;

let currentRow = 0;
let currentPosition = 1;
let pokemonData;
let motsValides = new Set();

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(0, 0, 0, 0);

const TOOLTIPS         = document.querySelectorAll('.tooltip-trigger');
const IMG_MUSIC        = document.getElementById('img-music');
const INVALID_WORD_MODAL = document.getElementById('invalid-word');
const imgTheme         = document.getElementById('img-theme');
const results          = document.getElementById('results');
const HELP             = document.getElementById('help');
const pokeball         = document.getElementById('pokeball-results');
const pseudo           = document.getElementById('pseudo');
const journeyStart    = document.getElementById('journey-start');
const stats            = document.getElementById('stats');
const resultsPokemon  = document.getElementById('results-pokemon');
const pseudoForm       = document.getElementById('pseudo-form');
const SPAN_FOUND       = document.querySelector('#found .card-number');
const SPAN_CATCH       = document.querySelector('#catch .card-number');
const TOTAL_FOUND      = document.querySelector('#found .card-total');
const TOTAL_CATCH      = document.querySelector('#catch .card-total');
const PSEUDO_OVERLAY   = document.getElementById('pseudo-overlay');
const RESULTS_OVERLAY  = document.getElementById('results-overlay');
const STATS_OVERLAY    = document.getElementById('stats-overlay');
const HELP_OVERLAY     = document.getElementById('help-overlay');
const PSEUDO_INPUT     = document.getElementById('pseudo-input');
const RESULTS_TITLE    = document.getElementById('results-title');
const RESULTS_TEXT     = document.getElementById('results-text');

const bgMusic = new Audio('assets/sounds/music.mp3');
bgMusic.loop = true;
let isMusicPlaying = false;
let musicHasStarted = false;

INVALID_WORD_MODAL.style.visibility = 'hidden';
INVALID_WORD_MODAL.style.bottom = '-' + INVALID_WORD_MODAL.clientHeight + 'px';

function toggleMusic() {
    if (isMusicPlaying) {
        bgMusic.volume = 0;
    } else {
        if (!musicHasStarted) {
            musicHasStarted = true;
            bgMusic.play();
        }
        bgMusic.volume = 1;
    }
    isMusicPlaying = !isMusicPlaying;
    IMG_MUSIC.src = isMusicPlaying ? 'assets/images/music.svg' : 'assets/images/no-music.svg';
}

function showModalInvalidWord() {
    INVALID_WORD_MODAL.style.visibility = 'visible';
    INVALID_WORD_MODAL.style.bottom = '20px';
    setTimeout(() => {
        INVALID_WORD_MODAL.style.bottom = '-' + INVALID_WORD_MODAL.clientHeight + 'px';
        INVALID_WORD_MODAL.style.visibility = 'hidden';
    }, 2000);
}

async function loadMotsValides() {
    try {
        const response = await fetch('data/motsValides.json');
        const arr = await response.json();
        motsValides = new Set(arr);
    } catch (error) {
        console.error('Erreur lors du chargement des mots valides:', error);
        motsValides = new Set();
    }
}

PSEUDO_OVERLAY.addEventListener('click', function (event) {
    if (event.target === this) closePseudo();
});
RESULTS_OVERLAY.addEventListener('click', function (event) {
    if (event.target === this) closeResults();
});
STATS_OVERLAY.addEventListener('click', function (event) {
    if (event.target === this) closeStats();
});
HELP_OVERLAY.addEventListener('click', function (event) {
    if (event.target === this) closeHelp();
});

function generateWordGrid(wordLength) {
    const WORD_GRID = document.getElementById('word-grid');
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
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
    return motsValides.has(word.toLowerCase());
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
    let seed = today.getFullYear() * 10000
             + (today.getMonth() + 1) * 100
             + today.getDate();
    seed = (seed ^ 0x9e3779b9) >>> 0;
    seed = Math.imul(seed ^ (seed >>> 16), 0x85ebca6b) >>> 0;
    seed = Math.imul(seed ^ (seed >>> 13), 0xc2b2ae35) >>> 0;
    seed = (seed ^ (seed >>> 16)) >>> 0;
    const index = seed % MAX_POKEMON;
    return pokemonList[index];
}

function computeColors(target, guess) {
    const t = target.toLowerCase();
    const g = guess.toLowerCase();
    const colors = new Array(t.length).fill(null);

    const remaining = {};
    for (const letter of t) {
        remaining[letter] = (remaining[letter] || 0) + 1;
    }

    for (let i = 0; i < t.length; i++) {
        if (g[i] === t[i]) {
            colors[i] = COLORS.PLACED;
            remaining[g[i]]--;
        }
    }

    for (let i = 0; i < t.length; i++) {
        if (colors[i] === null && remaining[g[i]] > 0) {
            colors[i] = COLORS.MISPLACED;
            remaining[g[i]]--;
        }
    }

    return colors;
}

function checkGuess() {
    const currentRowCells = document.querySelectorAll(`#row-${currentRow} td`);
    let allLettersCorrect = true;
    let guessedWord = '';

    if (atob(getCookie(STORAGE_KEYS.FINISH_TODAY)) === 'true') return;

    for (const cell of currentRowCells) {
        guessedWord += cell.textContent.toLowerCase();
    }

    const isIncomplete = currentRowCells[targetPokemon.length - 1].textContent === '';
    const isUnknown    = !isValidFrenchWord(guessedWord) && !isValidPokemonName(guessedWord);
    if (guessedWord === '' || isUnknown || isIncomplete) {
        showModalInvalidWord();
        return;
    }

    const todayTriesCookie = document.cookie.split(';').find(c =>
        c.trim().startsWith(STORAGE_KEYS.TODAY_TRIES + '='));
    const todayTries = JSON.parse(decodeURIComponent(todayTriesCookie.split('=')[1]));
    for (let i = 0; i < guessedWord.length; i++) {
        todayTries[currentRow].push(guessedWord[i]);
    }
    setCookie(STORAGE_KEYS.TODAY_TRIES, JSON.stringify(todayTries));

    const guessColors = computeColors(targetPokemon, guessedWord);
    for (let i = 0; i < targetPokemon.length; i++) {
        if (guessColors[i]) {
            currentRowCells[i].style.backgroundColor = guessColors[i];
        }
        if (guessColors[i] !== COLORS.PLACED) {
            allLettersCorrect = false;
        }
    }

    const attemptCount = currentRow + 1;
    const finishedGame = allLettersCorrect && currentRowCells.length === targetPokemon.length;
    const lostGame     = !finishedGame && (currentRow + 1 >= MAX_ATTEMPTS);

    if (finishedGame || lostGame) {
        currentRow++;
        updateKeyboardColorsForWord(guessedWord);
        currentRow--;

        justFinishedGame(finishedGame, attemptCount);
        return;
    }

    currentRow++;
    currentPosition = 1;
    updateKeyboardColorsForWord(guessedWord);
    setFirstLetter();
}

function updateKeyboardColorsForWord(word) {
    for (const letter of 'abcdefghijklmnopqrstuvwxyz') {
        if (word.toLowerCase().includes(letter)) {
            updateKeyboardButtonColor(letter);
        }
    }
}

function justFinishedGame(hasWon, attemptCount) {
    const finalNbTries = hasWon ? attemptCount : LOSS_SCORE;
    setCookie(STORAGE_KEYS.NB_TRIES, finalNbTries);
    updateFinishTodayCookie(STORAGE_KEYS.FINISH_TODAY, btoa('true'));

    disableKeydownListener();
    disableVirtualKeyboard();

    updateUserData(hasWon, getPokemonIdByName(targetPokemon), finalNbTries);
    updateAttemptsChart();

    if (hasWon) {
        win(targetPokemon);
    } else {
        lose(targetPokemon);
    }

    SPAN_FOUND.textContent = getNbFound();
    if (hasWon) SPAN_CATCH.textContent = getNbCatch();
}

function setFirstRow() {
    const todayTriesCookie = getCookie(STORAGE_KEYS.TODAY_TRIES);
    if (!todayTriesCookie) return;
    const todayTries = JSON.parse(decodeURIComponent(todayTriesCookie));

    while (true) {
        const currentRowCells = document.querySelectorAll(`#row-${currentRow} td`);

        let guessedWord = '';
        currentRowCells.forEach((cell, index) => {
            const guessedLetter = (todayTries[currentRow][index] || '').toUpperCase();
            cell.textContent = guessedLetter;
            guessedWord += guessedLetter;
        });

        const rowColors = computeColors(targetPokemon, guessedWord);
        let allLettersCorrect = true;
        for (let i = 0; i < targetPokemon.length; i++) {
            if (rowColors[i]) {
                currentRowCells[i].style.backgroundColor = rowColors[i];
            }
            if (rowColors[i] !== COLORS.PLACED) {
                allLettersCorrect = false;
            }
        }

        if (allLettersCorrect) {
            refreshFullKeyboard();
            displayResultsComeBack();
            return;
        }

        currentRow++;
        currentPosition = 1;

        if (currentRow >= MAX_ATTEMPTS) {
            refreshFullKeyboard();
            displayResultsComeBack();
            return;
        }

        if (todayTries[currentRow].length === 0) {
            refreshFullKeyboard();
            setFirstLetter();
            return;
        }
    }
}

function handleInput(key) {
    if (key === 'Backspace' || key === 'backspace') {
        if (currentPosition > 1) {
            updateGridWithGuess(true, key);
        }
    } else if (/^[a-zA-Z]$/.test(key) && currentPosition < targetPokemon.length) {
        updateGridWithGuess(false, key);
    }
}

function share() {
    const attemptCount = getCookie(STORAGE_KEYS.NB_TRIES);
    let text;
    if (attemptCount === String(LOSS_SCORE)) {
        text = `Je n'ai pas trouvé le Pokémon du jour sur ${window.location.href} :( \n`;
    } else {
        const pluriel = attemptCount === '1' ? '' : 's';
        text = `J'ai trouvé le Pokémon du jour en ${attemptCount} essai${pluriel} sur ${window.location.href} ! \n`;
    }
    navigator.clipboard.writeText(text);

    const NOTIF = document.createElement('div');
    NOTIF.className = 'notification';
    NOTIF.textContent = 'Copié dans le presse-papiers.';
    document.body.appendChild(NOTIF);

    NOTIF.style.bottom = '-4em';
    NOTIF.style.opacity = '0';
    setTimeout(() => { NOTIF.style.bottom = '2em'; NOTIF.style.opacity = '1'; }, 10);
    setTimeout(() => {
        NOTIF.style.bottom = '-4em';
        NOTIF.style.opacity = '0';
        setTimeout(() => document.body.removeChild(NOTIF), 500);
    }, 1000);
}

function setFirstLetter() {
    const rowCells = document.querySelectorAll(`#row-${currentRow} td`);
    const firstLetterCell = rowCells[0];
    firstLetterCell.textContent = targetPokemon[0].toUpperCase();
    firstLetterCell.style.backgroundColor = COLORS.PLACED;
    firstLetterCell.contentEditable = false;
}

function displayResults(pokemonName, title, message) {
    const pkmn_id = getPokemonIdByName(pokemonName);
    pokeball.classList.remove('disabled');
    RESULTS_TITLE.textContent = title;
    RESULTS_TEXT.textContent = message;
    openResults();
    resultsPokemon.src = `assets/sprites/${pkmn_id}.svg`;
}

function win(pokemonName) {
    const answer = atob(getCookie(STORAGE_KEYS.ANSWER));
    const tries = getCookie(STORAGE_KEYS.NB_TRIES);
    const pluriel = tries === '1' ? '' : 's';
    displayResults(
        pokemonName,
        'Nom de Zeus !',
        `Tu as trouvé ${capitalize(answer)} #${getPokemonIdByName(answer)} en ${tries} essai${pluriel}.`
    );
}

function lose(pokemonName) {
    const answer = atob(getCookie(STORAGE_KEYS.ANSWER));
    displayResults(
        pokemonName,
        "Nom d'une pipe en bois !",
        `Le Pokémon du jour était ${capitalize(answer)} #${getPokemonIdByName(answer)}`
    );
}

function keydownHandler(event) {
    const rowCells = document.querySelectorAll(`#row-${currentRow} td`);
    if (rowCells[targetPokemon.length - 1].textContent === '' || event.key === 'Backspace') {
        handleInput(event.key);
    }
    if (event.key === 'Enter') checkGuess();
}

function disableKeydownListener() {
    window.removeEventListener('keydown', keydownHandler);
}

function disableVirtualKeyboard() {
    document.querySelectorAll('.keyboard-button').forEach(button => {
        button.disabled = true;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
    });
}

function enableKeydownListener() {
    window.addEventListener('keydown', keydownHandler);
}

function enableVirtualKeyboard() {
    document.querySelectorAll('.keyboard-button').forEach(button => {
        button.disabled = false;
    });
}

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (const c of cookies) {
        const cookie = c.trim();
        if (cookie.startsWith(name + '=')) {
            return decodeURIComponent(cookie.substring(name.length + 1));
        }
    }
    return null;
}

function setCookie(name, value) {
    document.cookie = `${name}=${value}; expires=${tomorrow.toUTCString()}; path=/`;
}

function updateFinishTodayCookie(cookieName, newValue) {
    const exists = document.cookie.split(';').some(c =>
        c.trim().startsWith(`${cookieName}=`));
    if (exists) {
        setCookie(cookieName, newValue);
    }
}

function openPokedex() {
    window.location.href = './pokedex.html';
}

function openStats() {
    stats.style.display = 'flex';
    results.style.display = 'none';
    RESULTS_OVERLAY.style.display = 'none';
    STATS_OVERLAY.style.display = 'flex';
    disableKeydownListener();
    disableVirtualKeyboard();
}

function closeStats() {
    if (!isGameFinished()) {
        enableKeydownListener();
        enableVirtualKeyboard();
    }
    stats.style.display = 'none';
    STATS_OVERLAY.style.display = 'none';
}

function openHelp() {
    HELP.style.display = 'flex';
    HELP_OVERLAY.style.display = 'flex';
    disableKeydownListener();
    disableVirtualKeyboard();
}

function closeHelp() {
    if (!isGameFinished()) {
        enableKeydownListener();
        enableVirtualKeyboard();
    }
    HELP.style.display = 'none';
    HELP_OVERLAY.style.display = 'none';
}

function openResults() {
    results.style.display = 'flex';
    RESULTS_OVERLAY.style.display = 'flex';
}

function closeResults() {
    results.style.display = 'none';
    RESULTS_OVERLAY.style.display = 'none';
}

function openPseudo() {
    pseudoForm.style.display = 'flex';
    PSEUDO_INPUT.value = getMotusmaInfoField('pseudo');
    PSEUDO_OVERLAY.style.display = 'flex';
}

function closePseudo() {
    pseudoForm.style.display = 'none';
    PSEUDO_OVERLAY.style.display = 'none';
}

function newPseudo(event) {
    event.preventDefault();
    const newPseudo = PSEUDO_INPUT.value;
    if (newPseudo.trim() !== '') {
        setMotusmaInfoField('pseudo', newPseudo);
        pseudo.textContent = getMotusmaInfoField('pseudo');
        pseudoForm.style.display = 'none';
        PSEUDO_OVERLAY.style.display = 'none';
    }
}

function isGameFinished() {
    const cookie = getCookie(STORAGE_KEYS.FINISH_TODAY);
    if (!cookie) return false;
    try {
        return atob(cookie) === 'true';
    } catch (e) {
        return false;
    }
}

function toggleTheme() {
    const isDark = getMotusmaInfoField('theme') !== 'dark';

    document.documentElement.classList.toggle('dark', isDark);
    setMotusmaInfoField('theme', isDark ? 'dark' : 'light');
    imgTheme.src = isDark ? 'assets/images/moon.svg' : 'assets/images/sun.svg';

    document.querySelectorAll('.keyboard-button').forEach(button => {
        button.style.backgroundColor = '';
        button.style.color = '';
    });
    refreshFullKeyboard();
}

function emptyTriesJSON() {
    return JSON.stringify(Array.from({ length: MAX_ATTEMPTS }, () => []));
}

function isEmptyTries(cookieValue) {
    try {
        const tries = JSON.parse(decodeURIComponent(cookieValue));
        return Array.isArray(tries) && tries.every(row => Array.isArray(row) && row.length === 0);
    } catch (e) {
        return true;
    }
}

function newGame() {
    setCookie(STORAGE_KEYS.FINISH_TODAY, btoa('false'));
    setCookie(STORAGE_KEYS.TODAY_TRIES, emptyTriesJSON());

    targetPokemon = chooseRandomPokemon();
    setCookie(STORAGE_KEYS.ANSWER, btoa(targetPokemon));

    generateWordGrid(targetPokemon.length);
    setFirstLetter();
}

function existingGame() {
    targetPokemon = atob(getCookie(STORAGE_KEYS.ANSWER));
    generateWordGrid(targetPokemon.length);
    setFirstRow();
}

function getMotusmaInfoField(field) {
    const rawData = localStorage.getItem(STORAGE_KEYS.INFOS);
    if (!rawData) return null;
    try {
        return JSON.parse(rawData)[field] ?? null;
    } catch (e) {
        console.error('Erreur parsing motusma-infos:', e);
        return null;
    }
}

function setMotusmaInfoField(field, value) {
    let infos = {};
    const rawData = localStorage.getItem(STORAGE_KEYS.INFOS);
    try {
        if (rawData) infos = JSON.parse(rawData);
    } catch (e) {
        console.error('Erreur parsing motusma-infos:', e);
    }
    infos[field] = value;
    localStorage.setItem(STORAGE_KEYS.INFOS, JSON.stringify(infos));
}

function initTooltips() {
    TOOLTIPS.forEach(trigger => {
        const TOOLTIP = trigger.nextElementSibling;
        trigger.addEventListener('mouseenter', () => {
            TOOLTIP.querySelector('.tooltip-inner').textContent = trigger.getAttribute('data-tooltip');
            TOOLTIP.setAttribute('aria-hidden', 'false');
            const RECT = trigger.getBoundingClientRect();
            const SCROLL_Y = window.scrollY || window.pageYOffset;
            TOOLTIP.style.top  = `${RECT.bottom + SCROLL_Y + 5}px`;
            TOOLTIP.style.left = `${RECT.left + (RECT.width / 2) - (TOOLTIP.offsetWidth / 2)}px`;
        });
        trigger.addEventListener('mouseleave', () => {
            TOOLTIP.setAttribute('aria-hidden', 'true');
        });
        trigger.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                trigger.click();
            }
        });
    });
}

function initVirtualKeyboard() {
    const keyboard = document.getElementById('virtual-keyboard');
    if (!keyboard) return;

    keyboard.querySelectorAll('.keyboard-button').forEach(button => {
        button.addEventListener('click', () => {
            handleVirtualKey(button.textContent);
            button.blur();
        });
    });

    for (const letter of 'abcdefghijklmnopqrstuvwxyz') {
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

function updateKeyboardButtonColor(letter, maxRow = currentRow) {
    const keyboardButtons = document.querySelectorAll('.keyboard-button');
    let keyboardButton = null;
    keyboardButtons.forEach(button => {
        if (button.textContent.toLowerCase() === letter) keyboardButton = button;
    });
    if (!keyboardButton) return;

    if (keyboardButton.style.backgroundColor === COLORS.PLACED) return;

    let cellColor = null;
    let letterWasGuessed = false;
    for (let row = 0; row < maxRow; row++) {
        const rowCells = document.querySelectorAll(`#row-${row} td`);
        rowCells.forEach(cell => {
            if (cell.textContent.toLowerCase() === letter) {
                letterWasGuessed = true;
                const bg = cell.style.backgroundColor;
                if (bg === COLORS.PLACED) {
                    cellColor = COLORS.PLACED;
                } else if (bg === COLORS.MISPLACED && cellColor !== COLORS.PLACED) {
                    cellColor = COLORS.MISPLACED;
                }
            }
        });
    }

    if (cellColor) {
        keyboardButton.style.backgroundColor = cellColor;
    } else if (letterWasGuessed) {
        keyboardButton.style.backgroundColor = COLORS.ABSENT;
    }
}

function refreshFullKeyboard() {
    let maxRow = 0;
    for (let row = 0; row < MAX_ATTEMPTS; row++) {
        const cells = document.querySelectorAll(`#row-${row} td`);
        const hasContent = Array.from(cells).some(c => c.textContent.trim() !== '');
        if (hasContent) maxRow = row + 1;
    }
    for (const letter of 'abcdefghijklmnopqrstuvwxyz') {
        updateKeyboardButtonColor(letter, maxRow);
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
    if (atob(getCookie(STORAGE_KEYS.FINISH_TODAY)) !== 'true') return;
    await loadPokemonDb();
    disableKeydownListener();
    disableVirtualKeyboard();
    if (getCookie(STORAGE_KEYS.NB_TRIES) === String(LOSS_SCORE)) {
        lose(targetPokemon);
    } else {
        win(targetPokemon);
    }
    results.style.display = '';
}

function updateUserData(isCatch, id, attemptCount) {
    const userData = JSON.parse(localStorage.getItem(STORAGE_KEYS.DATA)) || {};
    const existingPokemon = userData[`pkmn_${id}`];
    const newPokemon = {
        id,
        catch: isCatch,
        date: new Date(),
        tries: attemptCount
    };

    if (existingPokemon && attemptCount >= existingPokemon.tries) return;

    userData[`pkmn_${id}`] = newPokemon;
    localStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(userData));
}

window.addEventListener('keydown', keydownHandler);

Promise.all([loadPokemonDb(), loadMotsValides()]).then(([data]) => {
    if (!data) {
        console.error('Impossible de charger les données.');
        return;
    }

    pokemonData = data;
    pokemonList = data.map(p => normalizeString(p.name.french.toLowerCase()));

    if (!localStorage.getItem(STORAGE_KEYS.INFOS)) {
        const now = new Date();
        const formattedDate = formatFrenchDate(now);
        localStorage.setItem(STORAGE_KEYS.INFOS, JSON.stringify({
            theme: 'light',
            pseudo: 'Anonyme',
            startJourney: formattedDate,
        }));
        openHelp();
    }

    SPAN_FOUND.textContent = getNbFound();
    SPAN_CATCH.textContent = getNbCatch();
    TOTAL_FOUND.textContent = '/' + MAX_POKEMON;
    TOTAL_CATCH.textContent = '/' + MAX_POKEMON;

    pseudo.textContent = getMotusmaInfoField('pseudo');
    journeyStart.textContent = getMotusmaInfoField('startJourney');

    const todayTriesCookie = getCookie(STORAGE_KEYS.TODAY_TRIES);
    if (!todayTriesCookie || isEmptyTries(todayTriesCookie)) {
        newGame();
    } else {
        existingGame();
    }

    if (getMotusmaInfoField('theme') === 'dark') {
        document.documentElement.classList.add('dark');
        imgTheme.src = 'assets/images/moon.svg';
    }

    initVirtualKeyboard();
    initTooltips();
}).catch(error => {
    console.error('Erreur de chargement:', error);
});