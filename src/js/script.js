/* ------------------------------------
Images pour la génération de la carte
------------------------------------ */
let terrainImages = {
  grass: "src/img/gazon.jpg",
  water: "src/img/eau.jpg",
  mountain: "src/img/montagne.jpg",
  house: "src/img/maison.jpg",
  sand: "src/img/sable.jpg",
  forest: "src/img/foret.jpg",
};

/* ------------------------------------
Variables pour la génération de la carte
------------------------------------ */
let generateButton = document.getElementById("generate-map");
let mapContainer = document.getElementById("map-canvas");
let numberOfRows = 20;
let numberOfColumns = 20;

/* ------------------------------------
Function pour générer le tableau vide de la carte
------------------------------------ */
function generateEmptyMap() {
  let rows = numberOfRows;
  let cols = numberOfColumns;
  let map = document.createElement("table");
  for (let i = 0; i < rows; i++) {
    let row = document.createElement("tr");
    for (let j = 0; j < cols; j++) {
      let cell = document.createElement("td");
      cell.className = "map-cell";
      row.appendChild(cell);
    }
    map.appendChild(row);
  }
  mapContainer.innerHTML = "";
  mapContainer.appendChild(map);
}

/* ------------------------------------
Function pour générer la carte concrète avec les images
------------------------------------ */
function generateMap() {
  generateEmptyMap();
  startMatrix();
  let probabilities = getProbabilities();
  calculateAndAddImageFirstRow(probabilities);
  calculateAndAddImageFirstColumn(probabilities);
  calculateAndAddImageRest(probabilities);
}

/* ------------------------------------
Function pour remplir la première cellule avec une image aléatoire
------------------------------------ */
function startMatrix() {
  let map = mapContainer.querySelector("table");
  let firstCell = map.querySelector("tr td");
  setCellTerrain(firstCell, getRandomTerrainType());
}

/* ------------------------------------
Prendre toutes les probablités du tableau HTML
------------------------------------ */
function getProbabilities() {
  let probabilities = {};
  let inputs = document.querySelectorAll("#info input[type='number']");

  inputs.forEach((input) => {
    let [from, to] = input.id.split("-to-");

    if (!probabilities[from]) {
      probabilities[from] = {};
    }

    probabilities[from][to] = Number(input.value);
  });

  return probabilities;
}

/* ------------------------------------
Calculer et ajouter l'image si sur la première ligne seulement
------------------------------------ */
function calculateAndAddImageFirstRow(probabilities) {
  let map = mapContainer.querySelector("table");
  let cells = map.querySelectorAll("tr")[0].querySelectorAll("td");

  for (let columnIndex = 1; columnIndex < cells.length; columnIndex++) {
    let leftTerrain = cells[columnIndex - 1].dataset.terrain;
    let terrain = chooseTerrain(probabilities[leftTerrain]);
    setCellTerrain(cells[columnIndex], terrain);
  }
}

/* ------------------------------------
Calculer et ajouter l'image si sur la première colonne seulement
------------------------------------ */
function calculateAndAddImageFirstColumn(probabilities) {
  let map = mapContainer.querySelector("table");
  let rows = map.querySelectorAll("tr");

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
    let cells = rows[rowIndex].querySelectorAll("td");
    let aboveTerrain = rows[rowIndex - 1].querySelectorAll("td")[0].dataset.terrain;
    let terrain = chooseTerrain(probabilities[aboveTerrain]);
    setCellTerrain(cells[0], terrain);
  }
}

/* ------------------------------------
Calculer et ajouter l'image reste du tableau
------------------------------------ */
function calculateAndAddImageRest(probabilities) {
  let map = mapContainer.querySelector("table");
  let rows = map.querySelectorAll("tr");

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
    let cells = rows[rowIndex].querySelectorAll("td");

    for (let columnIndex = 1; columnIndex < cells.length; columnIndex++) {
      let aboveTerrain = rows[rowIndex - 1].querySelectorAll("td")[columnIndex].dataset.terrain;
      let leftTerrain = cells[columnIndex - 1].dataset.terrain;
      let aboveProbabilities = probabilities[aboveTerrain];
      let leftProbabilities = probabilities[leftTerrain];
      let combinedProbabilities = {};

      Object.keys(terrainImages).forEach((terrainType) => {
        combinedProbabilities[terrainType] = (aboveProbabilities[terrainType] + leftProbabilities[terrainType]) / 2;
      });

      setCellTerrain(cells[columnIndex], chooseTerrain(combinedProbabilities));
    }
  }
}

/* ------------------------------------
Choisir le type de terrain en fonction des probabilités
------------------------------------ */
function chooseTerrain(probabilities) {
  let randomNumber = Math.random();
  let cumulativeProbability = 0;

  for (let terrainType of Object.keys(terrainImages)) {
    cumulativeProbability += probabilities[terrainType] || 0;

    if (randomNumber < cumulativeProbability) {
      return terrainType;
    }
  }

  return Object.keys(terrainImages).at(-1);
}

/* ------------------------------------
Setter le type de terrain et l'image dans la cellule
------------------------------------ */
function setCellTerrain(cell, terrainType) {
  let image = document.createElement("img");
  image.src = terrainImages[terrainType];
  image.alt = terrainType;
  cell.dataset.terrain = terrainType;
  cell.appendChild(image);
}

/* ------------------------------------
Sélectionner une image aléatoire
------------------------------------ */
function getRandomTerrainType() {
  let terrainTypes = Object.keys(terrainImages);
  let randomIndex = Math.floor(Math.random() * terrainTypes.length);
  return terrainTypes[randomIndex];
}

/* ------------------------------------
Écouteur d'événement pour générer la carte
------------------------------------ */
generateButton.addEventListener("click", generateMap);
