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

const toggleButton = document.getElementById('hide-checkbox');
const main = document.getElementById("main");
const results = document.getElementById("results");
const infos = document.getElementById("infos");
const textBox = document.getElementById("text-box");
const content = document.getElementById("page-content");
const pokeball = document.getElementById("pokeball");
const pseudo = document.getElementById("pseudo");
const debutAventure = document.getElementById("debut-aventure");
const music = document.getElementById("music");
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
textBox.style.visibility = "hidden";
textBox.style.bottom = "-" + textBox.clientHeight + "px";

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
        if(localStorage.getItem("theme") === "dark") {
            music.src = 'images/no-music-white.svg';
        }
        else {
            music.src = 'images/no-music.svg';
        }
    } else {
        if(!musicHasStarted) {
            musicHasStarted = true;
            bg_music.play()
        }
        bg_music.volume = 1;
        if(localStorage.getItem("theme") === "dark") {
            music.src = 'images/music-white.svg';
        }
        else {
            music.src = 'images/music.svg';
        }
    }
    isMusicPlaying = !isMusicPlaying;
}

function showTextBox() {
    //playSound("wrong", "mp3");
    textBox.style.visibility = "visible";
    textBox.style.bottom = "20px";

    setTimeout(function () {
        textBox.style.bottom = "-" + textBox.clientHeight + "px";
        textBox.style.visibility = "hidden";
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
            //playSound('back', 'mp3');
            currentPosition--;
            index--;
        }
    }

    const cell = currentRowCells[index];

    if (key && /^[a-zA-Z]$/.test(key)) {
        cell.textContent = key.toUpperCase();        
        currentPosition++;
        //playSound('letter', 'wav');
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

    let index = (((dayOfMonth * 4 + month * 7 + year * 13) % 151) + 1 ) * Math.sin(dayOfMonth) * Math.cos(month) * Math.tan(year) * 1000 % 151;
    index = Math.abs(index); 
    index = Math.round(index);
    return pokemonList[index];
}

function checkGuess() {
    const currentRowCells = document.querySelectorAll(`#row-${currentRow} td`);
    let allLettersCorrect = true;
    let guessedWord = '';
    
    if(atob(getCookie("finish_today")) == "true") {
        return;
    }

    for (const cell of currentRowCells) {
        guessedWord += cell.textContent.toLowerCase();
    }

    if (guessedWord === '' || (!isValidFrenchWord(guessedWord) && !isValidPokemonName(guessedWord) || currentRowCells[targetPokemon.length -1].textContent == '')) {
        showTextBox();
        return;
    }

    //playSound('guess', 'mp3');

    //on met à jour les essais
    let todayTriesCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith("today_tries="));
    const todayTries = JSON.parse(decodeURIComponent(todayTriesCookie.split('=')[1]));
    const currentRowArray = todayTries[currentRow];
    for (let i = 0; i < guessedWord.length; i++) {
        currentRowArray.push(guessedWord[i]);
    }
    document.cookie = `today_tries=${JSON.stringify(todayTries)}; expires=${tomorrow.toUTCString()}; path=/`;

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

    //VICTOIRE
    if (allLettersCorrect && currentRowCells.length === targetPokemon.length) {

        document.cookie = `${"nb_tries="}${nb_tries}; expires=${tomorrow.toUTCString()}; path=/`;
        win(targetPokemon);

        updateFinishTodayCookie("finish_today", btoa("true"));

        let pkmn_found = parseInt(localStorage.getItem("found"), 10) || 0;
        pkmn_found++;
        localStorage.setItem("found", pkmn_found);

        let pkmn_catch = parseInt(localStorage.getItem("catch"), 10) || 0;
        pkmn_catch++;
        localStorage.setItem("catch", pkmn_catch);


        //fetch data to refresh pokedex (nan nan)
        fetch(`https://pokeapi.co/api/v2/pokemon?limit=${MAX_POKEMON}`)
        .then((response) => response.json())
        .then((data) => {
            allPokemons = data.results;
            displayPokemons(allPokemons);
        });
        disableKeydownListener();

        updateUserData(true, getPokemonIdByName(targetPokemon), nb_tries);

        return;
    }

    //DÉFAITE
    if(currentRow + 1 >= 5) {
        
        document.cookie = `${"nb_tries="}${6}; expires=${tomorrow.toUTCString()}; path=/`;
        lose(targetPokemon);

        updateFinishTodayCookie("finish_today", btoa("true"));

        let pkmn_found = parseInt(localStorage.getItem("found"), 10) || 0;
        pkmn_found++;
        localStorage.setItem("found", pkmn_found);

        //fetch data to refresh pokedex (nan nan)
        fetch(`https://pokeapi.co/api/v2/pokemon?limit=${MAX_POKEMON}`)
        .then((response) => response.json())
        .then((data) => {
            allPokemons = data.results;
            displayPokemons(allPokemons);
        });
        disableKeydownListener();

        updateUserData(false, getPokemonIdByName(targetPokemon), 6);

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
    const todayTriesCookie = getCookie("today_tries");
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
    if (key === 'Backspace') {
        if (numberOfLetters > 0) {
            numberOfLetters--;
            updateGridWithGuess(true, key);
        }
    } else if (/^[a-zA-Z]$/.test(key) && numberOfLetters < targetPokemon.length) {
        numberOfLetters++;
        updateGridWithGuess(false, key);
    }
}

function share() {
    const copyText = "J'ai trouvé le Pokémon du jour en " + getCookie("nb_tries") + " essais sur " + window.location.href + ' ! \n' ;
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
    document.getElementById("results-text").textContent = "Tu as trouvé " + majFirstLetter(atob(getCookie("pokemon_du_jour"))) + " en " + getCookie("nb_tries") + " essai.s.";
    openResults();
    results_pokemon.src = `https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/other/dream-world/${pkmn_id}.svg`;
}

function lose(pokemonName) {
    pkmn_id = getPokemonIdByName(pokemonName);
    playSound('lose', 'mp3');
    pokeball.classList.remove('disabled');
    document.getElementById("results-titre").textContent = "Nom d'une pipe en bois !";
    document.getElementById("results-text").textContent = "Le pokémon du jour était  " + majFirstLetter(atob(getCookie("pokemon_du_jour"))) + ".";
    openResults();
    results_pokemon.src = `https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/other/dream-world/${pkmn_id}.svg`;
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

// Fonction pour réactiver l'écouteur d'événements
function enableKeydownListener() {
    window.addEventListener('keydown', keydownHandler);
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
    disableKeydownListener();
    main.style.display="flex";
    content.style.display="none";
    results.style.display="none";
    document.getElementById("results_overlay").style.display="none";
}

function closePokedex() {
    main.style.display="none";
    content.style.display="";
    if (document.cookie.split(';').some(cookie => cookie.trim().startsWith('finish_today=')) && document.cookie.split(';').find(cookie => cookie.trim().startsWith('finish_today=')).split('=')[1] !== btoa('true')) {
        enableKeydownListener();
    }
}

function openStats() {
    stats.style.display="flex";
    results.style.display="none";
    document.getElementById("results_overlay").style.display="none";
    document.getElementById("stats_overlay").style.display="flex";
    disableKeydownListener();
}

function closeStats() {
    enableKeydownListener();
    stats.style.display='none';
    document.getElementById("stats_overlay").style.display="none";
}

function openInfos() {
    infos.style.display="flex";
    document.getElementById("infos_overlay").style.display="flex";
    disableKeydownListener();
}

function closeInfos() {
    enableKeydownListener();
    infos.style.display='none';
    document.getElementById("infos_overlay").style.display="none";
}

function openResults() {
    results.style.display = "flex";
    document.getElementById("results_overlay").style.display="flex";
}

function closeResults() {
    results.style.display = "none";
    // stats.style.display="none";
    document.getElementById("results_overlay").style.display="none";
}

function openPseudo() {
    formPseudo.style.display="flex";
    document.getElementById('pseudo-input').value = localStorage.getItem('pseudo');
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
        localStorage.setItem('pseudo', newPseudo);
        pseudo.textContent = localStorage.getItem('pseudo');
        formPseudo.style.display="none";
        document.getElementById("pseudo_overlay").style.display="none";
    }
}

toggleButton.addEventListener('change', function() {
    const htmlElement = document.querySelector('html');

    const tds = document.querySelectorAll('td');

    tds.forEach(td => {
        if (localStorage.getItem("theme") === "dark") {
            td.style.color = 'black';
            td.style.boxShadow ='inset 0 0 0 3px black';

        } else {
            td.style.color = 'white'; 
            td.style.boxShadow = 'inset 0 0 0 3px white';
        }
    });


    if (this.checked) {        
        localStorage.setItem("theme", "dark")
        htmlElement.style.backgroundImage = "url('images/night.png')";
        toggleButton.textContent = 'Toggle Original Background Image';
        if(isMusicPlaying) {
            music.src = 'images/music-white.svg';
        }
        else {
            music.src = 'images/no-music-white.svg';
        }

    } else {
        localStorage.setItem("theme", "light")
        htmlElement.style.backgroundImage = "url('images/day.png')";
        toggleButton.textContent = 'Toggle Modified Background Image';
        if(isMusicPlaying) {
            music.src = 'images/music.svg';
        }
        else {
            music.src = 'images/no-music.svg';
        }
    }
});

function newGame() {
    document.cookie = `${"finish_today="}${btoa("false")}; expires=${tomorrow.toUTCString()}; path=/`;
    document.cookie = `${"today_tries="}${"[[], [], [], [], []]"}; expires=${tomorrow.toUTCString()}; path=/`;

    targetPokemon = chooseRandomPokemon();
    document.cookie = `${"pokemon_du_jour="}${btoa(targetPokemon)}; expires=${tomorrow}; path=/`;

    generateWordGrid(targetPokemon.length);
    setFirstLetter();
}

//si l'on a déjà joué aujourd'hui (en cours, gagné ou perdu)
function existingGame() {
    targetPokemon = atob(getCookie("pokemon_du_jour"));
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
        spanFound.textContent = localStorage.getItem("found") + "/151";
        spanCatch.textContent = localStorage.getItem("catch") + "/151";

        const todayTriesCookie = getCookie("today_tries");
        if(!localStorage.getItem("metaphysique")) {
            openInfos();
            localStorage.setItem("metaphysique", "nan nan");
        }

        if (!todayTriesCookie || todayTriesCookie === "[[], [], [], [], []]") {
            newGame();
        } else {
            existingGame();
        }

        if(localStorage.getItem("theme") === "dark") {
            const tds = document.querySelectorAll('td');
            tds.forEach(td => {
                td.style.color = 'white'; 
                td.style.boxShadow = 'inset 0 0 0 3px white';
            });
        }

    } else {
        console.error('Impossible de charger les données.');
    }
});

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

if (localStorage.getItem("theme") === "dark") {
    document.querySelector('html').style.backgroundImage = "url('images/night.png')";
    toggleButton.checked = true;
    music.src = 'images/no-music-white.svg';   
}

if (!localStorage.getItem('debut_aventure')) {
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()} ${moisEnFrancais[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    localStorage.setItem('debut_aventure', formattedDate);
}

if (!localStorage.getItem('pseudo') || localStorage.getItem('pseudo') === '') {
    localStorage.setItem('pseudo', 'Anonyme');
}

if(!localStorage.getItem("found")) {
    localStorage.setItem("found", 0);
}

if(!localStorage.getItem("catch")) {
    localStorage.setItem("catch", 0);
}

async function displayResultsComeBack() {
    if (atob(getCookie("finish_today")) == "true"){
        await loadPokemonData();
        if(getCookie("nb_tries") == "6") {
            lose(targetPokemon);
        }
        else {
            win(targetPokemon);
        }
        pokeball.classList.remove('disabled');
        pokemonID = getPokemonIdByName(atob(getCookie("pokemon_du_jour")));
        results_pokemon.src = `https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/other/dream-world/${pokemonID}.svg`;
        results.style.display="";
    }
}

pseudo.textContent = localStorage.getItem('pseudo');
debutAventure.textContent = localStorage.getItem('debut_aventure');

function updateUserData(isCatch, id, nbTries) {
    let userData = JSON.parse(localStorage.getItem('user_data'));

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
            localStorage.setItem('user_data', JSON.stringify(userData));
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
        localStorage.setItem('user_data', JSON.stringify(userData));
    } 
}

window.addEventListener('keydown', keydownHandler);


