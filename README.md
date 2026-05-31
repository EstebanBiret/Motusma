# 🧠 Motusma

Motusma est un jeu de réflexion inspiré du jeu télévisé **Motus**, où le but est de deviner un mot mystère... mais sur le thème de **Pokémon** !  
Retrouve chaque jour un nouveau Pokémon de la première génération à deviner en 5 essais maximum.

## 🔗 Lien vers le jeu

👉 [Jouer à Motusma](https://motusma.biret-toscano.fr)

---

## 🕹️ Règles du jeu

- Tu dois deviner un **nom de Pokémon (Génération 1)**.
- Tu as **5 tentatives**.
- À chaque essai, la couleur des lettres t’indique :
  - 🟥 **Rouge** : la lettre est bien placée.
  - 🟨 **Jaune** : la lettre est présente mais mal placée.
  - ⬜️ **Blanc** : la lettre n’est pas dans le mot.
- Le jeu se joue uniquement avec les lettres, **sans accents** ni majuscules/minuscules.

---

## 📱 Fonctionnalités

- ✅ Clavier virtuel
- 🌙 Thème clair/sombre
- 🎵 Musique d’ambiance
- 📊 Statistiques de jeu détaillées
- 🗃️ Résultats journaliers consultables
- 🔎 Pokédex avec Pokémon vus et attrapés
- 💾 Sauvegarde de la progression via `localStorage` et `cookies`

---

## 🧩 Technologies

- HTML / CSS / JavaScript
- Stockage via `localStorage` et `cookies`
- [PokéAPI](https://pokeapi.co) pour les détails enrichis du Pokédex

---

## 📂 Architecture du projet

```
.
├── index.html             # Page principale du jeu
├── pokedex.html           # Liste des Pokémon
├── detail.html            # Fiche détaillée d'un Pokémon
├── styles.css             # Styles (avec variables CSS + thème sombre)
├── assets/
│   ├── fonts/             # Police Pokémon
│   ├── images/            # Icônes et visuels de l'interface
│   ├── sounds/            # Musique d'ambiance
│   └── sprites/           # Sprites des 151 Pokémon (par id)
├── data/
│   ├── bd.json            # Base de données des Pokémon (noms, types, stats)
│   └── motsValides.json   # Dictionnaire des mots français acceptés
└── scripts/
    ├── utils.js           # Constantes et helpers partagés
    ├── script.js          # Logique principale du jeu
    ├── pokemon.js         # Page liste du Pokédex
    ├── pokemon-detail.js  # Page détail d'un Pokémon
    ├── chart.js           # Graphique des statistiques
    └── countdown.js       # Compte à rebours du prochain Pokémon
```

Le Pokémon du jour est déterminé par un hash de la date, ce qui garantit
que tous les joueurs ont le même Pokémon le même jour. La progression
(Pokémon vus/attrapés, statistiques) est sauvegardée localement dans le
navigateur. `bd.json` sert de source unique pour les noms et types ;
PokéAPI n'est utilisé que sur la page détail pour la description et les
mesures (taille/poids).