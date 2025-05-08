// Game state
const gameState = {
  currentPhase: "setup", // setup, movement, action, gameOver
  currentTurn: 1, // 1 or 2 for player
  selectedCell: null,
  selectedUnit: null,
  player1: {
    clan: null,
    units: [],
  },
  player2: {
    clan: null,
    units: [],
  },
  board: [],
  moveExecuted: false,
  actionExecuted: false,
};

// Unit types with their properties
const unitTypes = {
  warrior: {
    name: "Warrior",
    health: 100,
    attack: 20,
    defense: 15,
    range: 1,
    moveRange: 1,
    symbol: "W",
  },
  archer: {
    name: "Archer",
    health: 70,
    attack: 15,
    defense: 10,
    range: 3,
    moveRange: 1,
    symbol: "A",
  },
  mage: {
    name: "Mage",
    health: 60,
    attack: 25,
    defense: 5,
    range: 2,
    moveRange: 1,
    symbol: "M",
  },
};

// Clan compositions
const clanTypes = {
  mountain: {
    name: "Mountain Clan",
    warriors: 3,
    archers: 2,
    mages: 1,
    advantage: "Enhanced Defense",
    defenseBonus: 5,
  },
  plains: {
    name: "Plains Clan",
    warriors: 2,
    archers: 3,
    mages: 1,
    advantage: "Precise Ranged Attacks",
    rangedBonus: 3,
  },
  sage: {
    name: "Sage Clan",
    warriors: 1,
    archers: 2,
    mages: 3,
    advantage: "Powerful Spells",
    magicBonus: 5,
  },
};

// DOM elements
const gameSetup = document.getElementById("gameSetup");
const gameBoardContainer = document.getElementById("gameBoardContainer");
const gameBoard = document.getElementById("gameBoard");
const gameOver = document.getElementById("gameOver");
const turnIndicator = document.getElementById("turnIndicator");
const diceResult = document.getElementById("diceResult");
const selectedUnitInfo = document.getElementById("selectedUnitInfo");
const player1Clan = document.getElementById("player1Clan");
const player2Clan = document.getElementById("player2Clan");
const player1Units = document.getElementById("player1Units");
const player2Units = document.getElementById("player2Units");
const movementPhase = document.getElementById("movementPhase");
const actionPhase = document.getElementById("actionPhase");
const attackBtn = document.getElementById("attackBtn");
const defendBtn = document.getElementById("defendBtn");
const specialBtn = document.getElementById("specialBtn");
const rollDiceBtn = document.getElementById("rollDiceBtn");
const endMovementBtn = document.getElementById("endMovementBtn");
const endActionBtn = document.getElementById("endActionBtn");
const newGameBtn = document.getElementById("newGameBtn");
const saveGameBtn = document.getElementById("saveGameBtn");
const loadGameBtn = document.getElementById("loadGameBtn");
const winner = document.getElementById("winner");

// Save game state to local storage
function saveGameState() {
  console.log("Attempting to save game state...");
  try {
    const gameData = {
      currentPhase: gameState.currentPhase,
      currentTurn: gameState.currentTurn,
      selectedCell: gameState.selectedCell,
      selectedUnit: gameState.selectedUnit,
      player1: {
        clan: gameState.player1.clan,
        units: gameState.player1.units,
      },
      player2: {
        clan: gameState.player2.clan,
        units: gameState.player2.units,
      },
      board: gameState.board,
      moveExecuted: gameState.moveExecuted,
      actionExecuted: gameState.actionExecuted,
    };

    console.log("Game data to save:", gameData);
    localStorage.setItem("warOfClansGame", JSON.stringify(gameData));
    console.log("Game saved successfully to localStorage");
    alert("Game saved successfully!");
  } catch (error) {
    console.error("Error saving game:", error);
    alert("Failed to save game. Please try again.");
  }
}

// Load game state from local storage
function loadGameState() {
  console.log("Attempting to load game state...");
  try {
    const savedGame = localStorage.getItem("warOfClansGame");
    console.log("Retrieved from localStorage:", savedGame);

    if (!savedGame) {
      console.log("No saved game found in localStorage");
      alert("No saved game found!");
      return false;
    }

    const gameData = JSON.parse(savedGame);
    console.log("Parsed game data:", gameData);

    // --- MIGRATION/COMPATIBILITY FIXES ---
    // Migrate old phase names
    if (gameData.currentPhase === "unitPlacement") {
      gameData.currentPhase = "placement";
    }
    // If phase is missing or invalid, default to setup
    const validPhases = [
      "setup",
      "placement",
      "rollForTurn",
      "movement",
      "action",
      "gameOver",
    ];
    if (
      !gameData.currentPhase ||
      !validPhases.includes(gameData.currentPhase)
    ) {
      gameData.currentPhase = "setup";
    }
    // Ensure all required properties exist
    if (!gameData.player1) gameData.player1 = { clan: null, units: [] };
    if (!gameData.player2) gameData.player2 = { clan: null, units: [] };
    if (!gameData.board) gameData.board = [];
    if (typeof gameData.currentTurn !== "number") gameData.currentTurn = 1;
    if (!Array.isArray(gameData.player1.units)) gameData.player1.units = [];
    if (!Array.isArray(gameData.player2.units)) gameData.player2.units = [];

    // Restore game state
    Object.assign(gameState, gameData);
    console.log("Game state restored:", gameState);

    // Update UI
    updateGameInfo();
    renderBoard();

    // Show appropriate screen based on game phase
    if (gameState.currentPhase === "gameOver") {
      gameOver.style.display = "block";
      gameBoardContainer.style.display = "none";
      gameSetup.style.display = "none";
    } else if (gameState.currentPhase === "setup") {
      gameSetup.style.display = "block";
      gameBoardContainer.style.display = "none";
      gameOver.style.display = "none";
    } else {
      gameSetup.style.display = "none";
      gameBoardContainer.style.display = "block";
      gameOver.style.display = "none";
    }

    // Update clan displays
    if (gameState.player1.clan) {
      player1Clan.textContent = `Clan: ${
        clanTypes[gameState.player1.clan].name
      }`;
    }
    if (gameState.player2.clan) {
      player2Clan.textContent = `Clan: ${
        clanTypes[gameState.player2.clan].name
      }`;
    }

    // Update unit counts
    updateUnitCounts();

    // Set up event listeners
    setupEventListeners();

    console.log("Game loaded successfully");
    alert("Game loaded successfully!");
    return true;
  } catch (error) {
    console.error("Error loading game:", error);
    alert("Failed to load game. The save file may be corrupted.");
    return false;
  }
}

// Initialize game
function initGame() {
  console.log("Initializing game...");

  // Check for saved game and prompt user
  const savedGame = localStorage.getItem("warOfClansGame");
  if (savedGame) {
    const loadSaved = confirm(
      "A saved game was found. Would you like to load it? (Press Cancel to start a new game)"
    );
    if (loadSaved) {
      loadGameState();
      return;
    } else {
      // User chose to start a new game: clear localStorage and reset state
      localStorage.removeItem("warOfClansGame");
      startNewGame();
      return;
    }
  }

  console.log("Starting new game");
  startNewGame();
}

// Start a completely new game
function startNewGame() {
  // Clear any existing saved game
  localStorage.removeItem("warOfClansGame");
  console.log("Cleared saved game from localStorage");

  // Reset game state
  gameState.currentPhase = "setup";
  gameState.currentTurn = 1;
  gameState.selectedCell = null;
  gameState.selectedUnit = null;
  gameState.player1.units = [];
  gameState.player2.units = [];
  gameState.moveExecuted = false;
  gameState.actionExecuted = false;

  // Create the game board (10x10 grid)
  gameState.board = [];
  for (let i = 0; i < 10; i++) {
    gameState.board[i] = [];
    for (let j = 0; j < 10; j++) {
      gameState.board[i][j] = {
        x: i,
        y: j,
        units: [],
        zone: i < 3 ? "player1" : i > 6 ? "player2" : "neutral",
      };
    }
  }

  // Show setup screen
  gameSetup.style.display = "block";
  gameBoardContainer.style.display = "none";
  gameOver.style.display = "none";

  // Add event listeners to clan selection buttons
  document.querySelectorAll(".select-btn").forEach((button) => {
    button.addEventListener("click", selectClan);
  });

  // Update save/load button states
  updateSaveLoadButtons();
}

// Function to select clan
function selectClan(event) {
  const clan = event.target.getAttribute("data-clan");

  if (!gameState.player1.clan) {
    gameState.player1.clan = clan;
    player1Clan.textContent = `Clan: ${clanTypes[clan].name}`;
    alert(`Player 1 has chosen the ${clanTypes[clan].name}!`);

    // Remove the selected clan button
    document.querySelectorAll(".select-btn").forEach((btn) => {
      if (btn.getAttribute("data-clan") === clan) {
        btn.disabled = true;
        btn.textContent = "Selected by Player 1";
      }
    });
  } else if (!gameState.player2.clan) {
    gameState.player2.clan = clan;
    player2Clan.textContent = `Clan: ${clanTypes[clan].name}`;
    alert(`Player 2 has chosen the ${clanTypes[clan].name}!`);

    // Both players have chosen their clans, start the game
    startGame();
  }
}

// Start the game after clan selection
function startGame() {
  // Set phase to placement
  gameState.currentPhase = "placement";
  gameSetup.style.display = "none";
  gameBoardContainer.style.display = "block";

  // Create units for each player based on their clan
  createUnits();

  // Render the game board
  renderBoard();

  // Update UI
  updateGameInfo();

  // Set up event listeners
  setupEventListeners();

  // Start placement phase for Player 1
  gameState.currentTurn = 1;
  startPlacementPhase();
}

// Create units for each player based on their clan choice
function createUnits() {
  // Player 1 units
  const p1Clan = clanTypes[gameState.player1.clan];

  for (let i = 0; i < p1Clan.warriors; i++) {
    gameState.player1.units.push({
      id: `p1-warrior-${i}`,
      type: "warrior",
      ...unitTypes.warrior,
      health: unitTypes.warrior.health,
      player: 1,
      position: null,
      status: "active",
    });
  }

  for (let i = 0; i < p1Clan.archers; i++) {
    gameState.player1.units.push({
      id: `p1-archer-${i}`,
      type: "archer",
      ...unitTypes.archer,
      health: unitTypes.archer.health,
      player: 1,
      position: null,
      status: "active",
    });
  }

  for (let i = 0; i < p1Clan.mages; i++) {
    gameState.player1.units.push({
      id: `p1-mage-${i}`,
      type: "mage",
      ...unitTypes.mage,
      health: unitTypes.mage.health,
      player: 1,
      position: null,
      status: "active",
    });
  }

  // Player 2 units
  const p2Clan = clanTypes[gameState.player2.clan];

  for (let i = 0; i < p2Clan.warriors; i++) {
    gameState.player2.units.push({
      id: `p2-warrior-${i}`,
      type: "warrior",
      ...unitTypes.warrior,
      health: unitTypes.warrior.health,
      player: 2,
      position: null,
      status: "active",
    });
  }

  for (let i = 0; i < p2Clan.archers; i++) {
    gameState.player2.units.push({
      id: `p2-archer-${i}`,
      type: "archer",
      ...unitTypes.archer,
      health: unitTypes.archer.health,
      player: 2,
      position: null,
      status: "active",
    });
  }

  for (let i = 0; i < p2Clan.mages; i++) {
    gameState.player2.units.push({
      id: `p2-mage-${i}`,
      type: "mage",
      ...unitTypes.mage,
      health: unitTypes.mage.health,
      player: 2,
      position: null,
      status: "active",
    });
  }

  // Update unit counts
  updateUnitCounts();
}

// Update unit counts display
function updateUnitCounts() {
  // Count Player 1's active units by type
  const p1Warriors = gameState.player1.units.filter(
    (unit) => unit.type === "warrior" && unit.status === "active"
  ).length;
  const p1Archers = gameState.player1.units.filter(
    (unit) => unit.type === "archer" && unit.status === "active"
  ).length;
  const p1Mages = gameState.player1.units.filter(
    (unit) => unit.type === "mage" && unit.status === "active"
  ).length;

  // Count Player 2's active units by type
  const p2Warriors = gameState.player2.units.filter(
    (unit) => unit.type === "warrior" && unit.status === "active"
  ).length;
  const p2Archers = gameState.player2.units.filter(
    (unit) => unit.type === "archer" && unit.status === "active"
  ).length;
  const p2Mages = gameState.player2.units.filter(
    (unit) => unit.type === "mage" && unit.status === "active"
  ).length;

  // Update Player 1's unit display (sidebar counters)
  const p1WarriorsElem = document.getElementById("p1Warriors");
  const p1ArchersElem = document.getElementById("p1Archers");
  const p1MagesElem = document.getElementById("p1Mages");
  if (p1WarriorsElem) p1WarriorsElem.textContent = p1Warriors;
  if (p1ArchersElem) p1ArchersElem.textContent = p1Archers;
  if (p1MagesElem) p1MagesElem.textContent = p1Mages;

  // Update Player 2's unit display (sidebar counters)
  const p2WarriorsElem = document.getElementById("p2Warriors");
  const p2ArchersElem = document.getElementById("p2Archers");
  const p2MagesElem = document.getElementById("p2Mages");
  if (p2WarriorsElem) p2WarriorsElem.textContent = p2Warriors;
  if (p2ArchersElem) p2ArchersElem.textContent = p2Archers;
  if (p2MagesElem) p2MagesElem.textContent = p2Mages;

  // Optionally, keep the old summary for other UI parts
  player1Units.textContent = `Units: ${p1Warriors + p1Archers + p1Mages}`;
  player2Units.textContent = `Units: ${p2Warriors + p2Archers + p2Mages}`;
}

// Render the game board
function renderBoard() {
  gameBoard.innerHTML = "";

  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.x = x;
      cell.dataset.y = y;

      // Add zone class
      if (y < 3) {
        cell.classList.add("player1-zone");
      } else if (y > 6) {
        cell.classList.add("player2-zone");
      }

      // Check if there are units in this cell
      const cellData = gameState.board[x][y];
      if (cellData.units.length > 0) {
        cellData.units.forEach((unitId) => {
          const unit = findUnitById(unitId);
          if (unit) {
            const unitElement = document.createElement("div");
            unitElement.className = `unit unit-${unit.type} unit-player${unit.player}`;
            unitElement.textContent = unit.symbol;
            unitElement.dataset.unitId = unit.id;

            // Add health indicator
            const healthBar = document.createElement("div");
            healthBar.className = "health-bar";
            healthBar.style.width = "100%";
            healthBar.style.height = "3px";
            healthBar.style.backgroundColor = "green";
            healthBar.style.position = "absolute";
            healthBar.style.bottom = "0";
            healthBar.style.left = "0";

            const healthPercent =
              (unit.health / unitTypes[unit.type].health) * 100;
            healthBar.style.width = `${healthPercent}%`;

            // Change color based on health
            if (healthPercent < 30) {
              healthBar.style.backgroundColor = "red";
            } else if (healthPercent < 60) {
              healthBar.style.backgroundColor = "orange";
            }

            unitElement.appendChild(healthBar);
            cell.appendChild(unitElement);
          }
        });
      }

      // Add the cell to the board
      gameBoard.appendChild(cell);
    }
  }

  // Highlight selected cell if any
  if (gameState.selectedCell) {
    const cell = document.querySelector(
      `.cell[data-x="${gameState.selectedCell.x}"][data-y="${gameState.selectedCell.y}"]`
    );
    if (cell) {
      cell.classList.add("selected");
    }
  }
}

// Find a unit by ID
function findUnitById(id) {
  const p1Unit = gameState.player1.units.find((unit) => unit.id === id);
  if (p1Unit) return p1Unit;

  const p2Unit = gameState.player2.units.find((unit) => unit.id === id);
  if (p2Unit) return p2Unit;

  return null;
}

// Set up event listeners
function setupEventListeners() {
  console.log("Setting up event listeners...");
  // Board click event
  gameBoard.addEventListener("click", handleBoardClick);

  // Button events
  document
    .getElementById("rollDiceBtn")
    .addEventListener("click", rollDiceForTurn);
  endMovementBtn.addEventListener("click", endMovementPhase);
  endActionBtn.addEventListener("click", endActionPhase);
  attackBtn.addEventListener("click", performAttack);
  defendBtn.addEventListener("click", performDefend);
  specialBtn.addEventListener("click", performSpecialAbility);
  newGameBtn.addEventListener("click", initGame);

  // Save/Load buttons
  const saveBtn = document.getElementById("saveGameBtn");
  const loadBtn = document.getElementById("loadGameBtn");

  if (saveBtn) {
    console.log("Adding save button listener");
    saveBtn.addEventListener("click", saveGameState);
  } else {
    console.error("Save button not found!");
  }

  if (loadBtn) {
    console.log("Adding load button listener");
    loadBtn.addEventListener("click", loadGameState);
  } else {
    console.error("Load button not found!");
  }

  console.log("Event listeners set up");
}

// Handle clicks on the game board
function handleBoardClick(event) {
  const cell = event.target.closest(".cell");
  if (!cell) return;

  const x = parseInt(cell.dataset.x);
  const y = parseInt(cell.dataset.y);

  if (gameState.currentPhase === "placement") {
    handleUnitPlacement(x, y);
  } else if (gameState.currentPhase === "movement") {
    handleMovementPhase(x, y);
  } else if (gameState.currentPhase === "action") {
    handleActionPhase(x, y);
  }
}

// Handle unit placement phase
function startPlacementPhase() {
  gameState.currentPhase = "placement";

  // Hide dice button and dice result during placement
  const diceBtn = document.getElementById("rollDiceBtn");
  if (diceBtn) diceBtn.style.display = "none";
  if (diceResult) diceResult.style.display = "none";

  // Show placement instructions in the turn indicator
  turnIndicator.style.display = "block";
  const currentPlayerUnits =
    gameState.currentTurn === 1
      ? gameState.player1.units
      : gameState.player2.units;
  const unplacedUnits = currentPlayerUnits.filter(
    (unit) => unit.position === null
  ).length;

  turnIndicator.innerHTML = `
    <div class="placement-info">
      <p>Player ${gameState.currentTurn}: Place your units!</p>
      <p>Remaining units to place: <strong>${unplacedUnits}</strong></p>
      <p>Click on a cell in your zone to place a unit.</p>
    </div>
  `;

  if (unplacedUnits === 0) {
    // All units placed, move to next player or start game
    if (gameState.currentTurn === 1) {
      gameState.currentTurn = 2;
      startPlacementPhase();
    } else {
      // Both players have placed all units, start the game proper
      setTimeout(() => {
        startGameRound();
      }, 600); // Small delay for smooth transition
    }
    return;
  }
}

// Handle unit placement
function handleUnitPlacement(x, y) {
  const cell = gameState.board[x][y];

  // Check if this is the player's zone
  const isPlayerZone =
    (gameState.currentTurn === 1 && y < 3) ||
    (gameState.currentTurn === 2 && y > 6);

  if (!isPlayerZone) {
    alert("You can only place units in your zone!");
    return;
  }

  // Get the first unplaced unit
  const currentPlayerUnits =
    gameState.currentTurn === 1
      ? gameState.player1.units
      : gameState.player2.units;

  const unplacedUnit = currentPlayerUnits.find(
    (unit) => unit.position === null
  );

  if (unplacedUnit) {
    // Place the unit
    unplacedUnit.position = { x, y };
    cell.units.push(unplacedUnit.id);

    // Render the board to show the placed unit
    renderBoard();

    // Check if all units are placed
    startPlacementPhase();
  }
}

// Start the game round - rolling dice to determine who goes first
function startGameRound() {
  gameState.currentPhase = "rollForTurn";

  // Show turn indicator
  turnIndicator.style.display = "block";
  turnIndicator.innerHTML = `<h3>New Round - Roll for Turn Order</h3>`;

  // Ensure dice button exists and is visible inside turnIndicator
  let diceBtn = document.getElementById("rollDiceBtn");
  if (!diceBtn) {
    diceBtn = document.createElement("button");
    diceBtn.id = "rollDiceBtn";
    diceBtn.className = "dice-btn";
    diceBtn.innerHTML = '<span class="dice-icon">🎲</span> Roll Dice';
    diceBtn.addEventListener("click", rollDiceForTurn);
    turnIndicator.appendChild(diceBtn);
  } else {
    // Move the button into the turnIndicator if not already there
    if (diceBtn.parentElement !== turnIndicator) {
      turnIndicator.appendChild(diceBtn);
    }
    diceBtn.removeEventListener("click", rollDiceForTurn); // Prevent duplicate listeners
    diceBtn.addEventListener("click", rollDiceForTurn);
  }
  diceBtn.style.display = "inline-flex";
  diceBtn.disabled = false;

  // Ensure dice result exists and is visible
  let diceResultDiv = document.getElementById("diceResult");
  if (!diceResultDiv) {
    diceResultDiv = document.createElement("div");
    diceResultDiv.id = "diceResult";
    diceResultDiv.className = "dice-result";
    turnIndicator.appendChild(diceResultDiv);
  } else {
    // Move the result into the turnIndicator if not already there
    if (diceResultDiv.parentElement !== turnIndicator) {
      turnIndicator.appendChild(diceResultDiv);
    }
  }
  diceResultDiv.style.display = "block";
  diceResultDiv.innerHTML = "";
}

// Roll dice to determine turn order
function rollDiceForTurn() {
  console.log("---DEBUG: rollDiceForTurn() called---");

  if (gameState.currentPhase !== "rollForTurn") {
    console.log("Not in roll phase");
    return;
  }

  // Always get the current dice result element
  const diceResultDiv = document.getElementById("diceResult");
  if (!diceResultDiv) return;

  // Show loader/spinner and let the browser render it
  diceResultDiv.classList.remove("rolling");
  diceResultDiv.innerHTML = `<div class='dice-loader'><span class='dice-spinner'></span> Rolling dice...</div>`;
  document.getElementById("rollDiceBtn").disabled = true;

  // Let the browser render the loader before starting the real timer
  setTimeout(() => {
    // Now start the real 1 second timer for the dice roll
    setTimeout(() => {
      const p1Roll = Math.floor(Math.random() * 6) + 1;
      const p2Roll = Math.floor(Math.random() * 6) + 1;

      // Build creative dice result HTML
      let winnerMsg = "";
      let winnerClass = "";
      if (p1Roll > p2Roll) {
        winnerMsg = `<span class='dice-winner'>Player 1 goes first!</span>`;
        winnerClass = "p1-wins";
        gameState.currentTurn = 1;
        setTimeout(() => startMovementPhase(), 1800);
      } else if (p2Roll > p1Roll) {
        winnerMsg = `<span class='dice-winner'>Player 2 goes first!</span>`;
        winnerClass = "p2-wins";
        gameState.currentTurn = 2;
        setTimeout(() => startMovementPhase(), 1800);
      } else {
        winnerMsg = `<span class='dice-tie'>It's a tie! Roll again.</span>`;
        winnerClass = "tie";
        document.getElementById("rollDiceBtn").disabled = false;
      }

      diceResultDiv.innerHTML = `
        <div class='dice-result-modern ${winnerClass}'>
          <div class='dice-row'>
            <div class='dice-player'>
              <div class='dice-label'>Player 1</div>
              <div class='dice-face'>🎲 <span class='dice-num'>${p1Roll}</span></div>
            </div>
            <div class='dice-player'>
              <div class='dice-label'>Player 2</div>
              <div class='dice-face'>🎲 <span class='dice-num'>${p2Roll}</span></div>
            </div>
          </div>
          <div class='dice-turn-msg'>${winnerMsg}</div>
        </div>
      `;
    }, 1000);
  }, 50); // Let the loader render first
}

// Start the movement phase
function startMovementPhase() {
  gameState.currentPhase = "movement";
  gameState.selectedCell = null;
  gameState.selectedUnit = null;
  gameState.moveExecuted = false;

  turnIndicator.innerHTML = `<h3>Turn: Player ${gameState.currentTurn}</h3>`;
  diceResult.textContent = "";

  movementPhase.classList.add("active-phase");
  actionPhase.classList.remove("active-phase");

  rollDiceBtn.disabled = true;
  endMovementBtn.disabled = false;
  endActionBtn.disabled = true;
  attackBtn.disabled = true;
  defendBtn.disabled = true;
  specialBtn.disabled = true;

  // Clear any selections
  resetSelections();
  renderBoard();

  // Update UI
  updateGameInfo();
}

// Handle movement phase clicks
function handleMovementPhase(x, y) {
  const cell = gameState.board[x][y];

  // If already moved, ignore further movement attempts
  if (gameState.moveExecuted) {
    alert("You have already moved a unit this turn. End the movement phase.");
    return;
  }

  // If no unit is selected, try to select one
  if (!gameState.selectedUnit) {
    if (cell.units.length === 0) return;

    // Find a unit in the cell that belongs to the current player
    const unitId = cell.units.find((id) => {
      const unit = findUnitById(id);
      return unit && unit.player === gameState.currentTurn;
    });

    if (unitId) {
      const unit = findUnitById(unitId);
      gameState.selectedUnit = unit;
      gameState.selectedCell = { x, y };

      // Show valid moves
      highlightValidMoves(unit, x, y);

      // Update selected unit info
      updateSelectedUnitInfo(unit);
    }
  } else {
    // A unit is already selected, check if the target cell is a valid move
    if (!isCellValidMove(x, y)) {
      alert("Invalid move! Select a valid cell or choose another unit.");
      return;
    }

    // Move the unit
    const sourceCell =
      gameState.board[gameState.selectedCell.x][gameState.selectedCell.y];
    const targetCell = gameState.board[x][y];

    // Remove unit from source cell
    sourceCell.units = sourceCell.units.filter(
      (id) => id !== gameState.selectedUnit.id
    );

    // Add unit to target cell
    targetCell.units.push(gameState.selectedUnit.id);

    // Update unit position
    gameState.selectedUnit.position = { x, y };

    // Mark move as executed
    gameState.moveExecuted = true;

    // Clear selections
    resetSelections();

    // Render board
    renderBoard();

    // Enable end movement button
    endMovementBtn.disabled = false;
  }
}

// Highlight valid move cells
function highlightValidMoves(unit, x, y) {
  // Clear previous highlights
  document.querySelectorAll(".cell").forEach((cell) => {
    cell.classList.remove("valid-move");
  });

  // Highlight cells within move range
  const moveRange = unit.moveRange;

  for (
    let i = Math.max(0, x - moveRange);
    i <= Math.min(9, x + moveRange);
    i++
  ) {
    for (
      let j = Math.max(0, y - moveRange);
      j <= Math.min(9, y + moveRange);
      j++
    ) {
      // Skip the current cell
      if (i === x && j === y) continue;

      // Check if cell is within move range (Manhattan distance)
      const distance = Math.abs(x - i) + Math.abs(y - j);
      if (distance <= moveRange) {
        // Check if cell is empty or has only friendly units
        const cell = gameState.board[i][j];
        let canMove = true;

        // Check if there are enemy units in the cell
        cell.units.forEach((unitId) => {
          const cellUnit = findUnitById(unitId);
          if (cellUnit && cellUnit.player !== unit.player) {
            canMove = false;
          }
        });

        if (canMove) {
          const cellElement = document.querySelector(
            `.cell[data-x="${i}"][data-y="${j}"]`
          );
          if (cellElement) {
            cellElement.classList.add("valid-move");
          }
        }
      }
    }
  }
}

// Check if a cell is a valid move for the selected unit
function isCellValidMove(x, y) {
  const cellElement = document.querySelector(
    `.cell[data-x="${x}"][data-y="${y}"]`
  );
  return cellElement && cellElement.classList.contains("valid-move");
}

// Update selected unit info display
function updateSelectedUnitInfo(unit) {
  if (!unit) {
    selectedUnitInfo.textContent = "No unit selected";
    return;
  }

  selectedUnitInfo.innerHTML = `
        <p><strong>${unit.name}</strong> (Player ${unit.player})</p>
        <p>Health: ${unit.health}/${unitTypes[unit.type].health}</p>
        <p>Attack: ${unit.attack}, Defense: ${unit.defense}</p>
        <p>Range: ${unit.range}, Move Range: ${unit.moveRange}</p>
    `;
}

// Reset selection highlights and state
function resetSelections() {
  document.querySelectorAll(".cell").forEach((cell) => {
    cell.classList.remove("selected", "valid-move", "valid-attack");
  });

  gameState.selectedCell = null;
  gameState.selectedUnit = null;

  updateSelectedUnitInfo(null);
}

// End movement phase
function endMovementPhase() {
  startActionPhase();
}

// Start action phase
function startActionPhase() {
  gameState.currentPhase = "action";
  gameState.selectedCell = null;
  gameState.selectedUnit = null;
  gameState.actionExecuted = false;

  movementPhase.classList.remove("active-phase");
  actionPhase.classList.add("active-phase");

  rollDiceBtn.disabled = true;
  endMovementBtn.disabled = true;
  endActionBtn.disabled = false;
  attackBtn.disabled = true;
  defendBtn.disabled = true;
  specialBtn.disabled = true;

  // Clear any selections
  resetSelections();
  renderBoard();
}

// Handle action phase clicks
function handleActionPhase(x, y) {
  const cell = gameState.board[x][y];

  // If already performed an action, ignore further attempts
  if (gameState.actionExecuted) {
    alert(
      "You have already performed an action this turn. End the action phase."
    );
    return;
  }

  // If no unit is selected, try to select one
  if (!gameState.selectedUnit) {
    if (cell.units.length === 0) return;

    // Find a unit in the cell that belongs to the current player
    const unitId = cell.units.find((id) => {
      const unit = findUnitById(id);
      return unit && unit.player === gameState.currentTurn;
    });

    if (unitId) {
      const unit = findUnitById(unitId);
      gameState.selectedUnit = unit;
      gameState.selectedCell = { x, y };

      // Show valid attack targets
      highlightValidAttackTargets(unit, x, y);

      // Update selected unit info
      updateSelectedUnitInfo(unit);

      // Enable action buttons
      attackBtn.disabled = false;
      defendBtn.disabled = false;
      specialBtn.disabled = false;
    }
  } else {
    // A unit is already selected, check if targeting for attack
    if (gameState.selectedUnit && gameState.actionType === "attack") {
      if (!isCellValidAttack(x, y)) {
        alert("Invalid attack target! Select a valid target.");
        return;
      }

      // Perform attack on selected target
      attackTarget(x, y);
    }
  }
}

// Highlight valid attack targets
function highlightValidAttackTargets(unit, x, y) {
  // Clear previous highlights
  document.querySelectorAll(".cell").forEach((cell) => {
    cell.classList.remove("valid-attack");
  });

  // Highlight cells within attack range
  const attackRange = unit.range;

  for (
    let i = Math.max(0, x - attackRange);
    i <= Math.min(9, x + attackRange);
    i++
  ) {
    for (
      let j = Math.max(0, y - attackRange);
      j <= Math.min(9, y + attackRange);
      j++
    ) {
      // Skip the current cell
      if (i === x && j === y) continue;

      // Check if cell is within attack range (Manhattan distance for simplicity)
      const distance = Math.abs(x - i) + Math.abs(y - j);
      if (distance <= attackRange) {
        // Check if cell has enemy units
        const cell = gameState.board[i][j];
        let hasEnemy = false;

        cell.units.forEach((unitId) => {
          const cellUnit = findUnitById(unitId);
          if (cellUnit && cellUnit.player !== unit.player) {
            hasEnemy = true;
          }
        });

        if (hasEnemy) {
          const cellElement = document.querySelector(
            `.cell[data-x="${i}"][data-y="${j}"]`
          );
          if (cellElement) {
            cellElement.classList.add("valid-attack");
          }
        }
      }
    }
  }
}

// Check if a cell is a valid attack target
function isCellValidAttack(x, y) {
  const cellElement = document.querySelector(
    `.cell[data-x="${x}"][data-y="${y}"]`
  );
  return cellElement && cellElement.classList.contains("valid-attack");
}

// Prepare for attack
function performAttack() {
  if (!gameState.selectedUnit) return;

  gameState.actionType = "attack";
  alert("Select a target to attack");
}

// Execute defend action
function performDefend() {
  if (!gameState.selectedUnit || gameState.actionExecuted) return;

  // Apply defense buff
  gameState.selectedUnit.defendBuff = true;

  // Mark action as executed
  gameState.actionExecuted = true;

  // Show defense message
  alert(`${gameState.selectedUnit.name} is now defending!`);

  // Reset selections
  resetSelections();

  // Update UI
  renderBoard();

  // Disable action buttons
  attackBtn.disabled = true;
  defendBtn.disabled = true;
  specialBtn.disabled = true;
}

// Execute special ability
function performSpecialAbility() {
  if (!gameState.selectedUnit || gameState.actionExecuted) return;

  // Implement special abilities based on unit type
  const unit = gameState.selectedUnit;

  if (unit.type === "warrior") {
    // Warrior special: Battle Cry (boost attack)
    unit.attackBuff = true;
    alert("Warrior uses Battle Cry! Attack increased for this turn.");
  } else if (unit.type === "archer") {
    // Archer special: Precise Shot (guaranteed hit)
    gameState.actionType = "preciseShot";
    alert("Archer readies a Precise Shot! Select a target (guaranteed hit).");
    return; // Don't mark action as executed yet
  } else if (unit.type === "mage") {
    // Mage special: Area effect spell
    gameState.actionType = "areaMagic";
    alert(
      "Mage prepares a magical storm! Select a target cell for area effect damage."
    );
    return; // Don't mark action as executed yet
  }

  // Mark action as executed for non-targeting abilities
  gameState.actionExecuted = true;

  // Reset selections
  resetSelections();

  // Update UI
  renderBoard();

  // Disable action buttons
  attackBtn.disabled = true;
  defendBtn.disabled = true;
  specialBtn.disabled = true;
}

// Execute attack on target
function attackTarget(x, y) {
  const attackingUnit = gameState.selectedUnit;
  const targetCell = gameState.board[x][y];

  // Get enemy units in the target cell
  const enemyUnitIds = targetCell.units.filter((unitId) => {
    const unit = findUnitById(unitId);
    return unit && unit.player !== attackingUnit.player;
  });

  if (enemyUnitIds.length === 0) {
    alert("No enemy units found at target location!");
    return;
  }

  // Choose the first enemy unit as target
  const targetUnitId = enemyUnitIds[0];
  const targetUnit = findUnitById(targetUnitId);

  // Roll for attack success
  const attackRoll = Math.floor(Math.random() * 6) + 1;
  const isHit = attackRoll >= 3 || gameState.actionType === "preciseShot";

  if (isHit) {
    // Calculate damage
    let damage = attackingUnit.attack;

    // Apply buffs
    if (attackingUnit.attackBuff) {
      damage += 5;
      attackingUnit.attackBuff = false; // Remove buff after use
    }

    // Apply clan bonuses
    if (
      attackingUnit.player === 1 &&
      gameState.player1.clan === "plains" &&
      attackingUnit.type === "archer"
    ) {
      damage += clanTypes.plains.rangedBonus;
    } else if (
      attackingUnit.player === 2 &&
      gameState.player2.clan === "plains" &&
      attackingUnit.type === "archer"
    ) {
      damage += clanTypes.plains.rangedBonus;
    }

    if (
      attackingUnit.player === 1 &&
      gameState.player1.clan === "sage" &&
      attackingUnit.type === "mage"
    ) {
      damage += clanTypes.sage.magicBonus;
    } else if (
      attackingUnit.player === 2 &&
      gameState.player2.clan === "sage" &&
      attackingUnit.type === "mage"
    ) {
      damage += clanTypes.sage.magicBonus;
    }

    // Calculate defense
    let defense = targetUnit.defense;

    // Apply defense buff if defending
    if (targetUnit.defendBuff) {
      defense += 5;
      targetUnit.defendBuff = false; // Remove buff after use
    }

    // Apply clan defense bonus
    if (targetUnit.player === 1 && gameState.player1.clan === "mountain") {
      defense += clanTypes.mountain.defenseBonus;
    } else if (
      targetUnit.player === 2 &&
      gameState.player2.clan === "mountain"
    ) {
      defense += clanTypes.mountain.defenseBonus;
    }

    // Calculate final damage
    const finalDamage = Math.max(1, damage - defense);

    // Apply damage
    targetUnit.health -= finalDamage;

    // Check if unit is defeated
    if (targetUnit.health <= 0) {
      targetUnit.health = 0;
      targetUnit.status = "defeated";

      // Remove the unit from the board
      targetCell.units = targetCell.units.filter((id) => id !== targetUnitId);

      alert(
        `${attackingUnit.name} hit ${targetUnit.name} for ${finalDamage} damage and defeated it!`
      );
    } else {
      alert(
        `${attackingUnit.name} hit ${targetUnit.name} for ${finalDamage} damage!`
      );
    }

    // Check for game over
    checkGameOver();

    // Update unit counts
    updateUnitCounts();
  } else {
    alert(`${attackingUnit.name}'s attack missed!`);
  }

  // Mark action as executed
  gameState.actionExecuted = true;

  // Reset action type
  gameState.actionType = null;

  // Reset selections
  resetSelections();

  // Update UI
  renderBoard();

  // Disable action buttons
  attackBtn.disabled = true;
  defendBtn.disabled = true;
  specialBtn.disabled = true;
}

// Check if the game is over
function checkGameOver() {
  const p1ActiveUnits = gameState.player1.units.filter(
    (unit) => unit.status === "active"
  ).length;
  const p2ActiveUnits = gameState.player2.units.filter(
    (unit) => unit.status === "active"
  ).length;

  if (p1ActiveUnits === 0) {
    // Player 2 wins
    endGame(2);
    return true;
  } else if (p2ActiveUnits === 0) {
    // Player 1 wins
    endGame(1);
    return true;
  }

  return false;
}

// End the game
function endGame(winningPlayer) {
  gameState.currentPhase = "gameOver";

  // Show game over screen
  gameOver.style.display = "block";
  gameBoardContainer.style.display = "none";

  // Set winner message
  winner.textContent = `Player ${winningPlayer} Wins!`;
}

// End action phase
function endActionPhase() {
  // Disable the end action button and other action buttons immediately
  endActionBtn.disabled = true;
  attackBtn.disabled = true;
  defendBtn.disabled = true;
  specialBtn.disabled = true;

  // Reset any buffs that last only one turn
  resetTurnBuffs();

  // Check for game over before changing turns
  if (checkGameOver()) return;

  // Switch to the other player
  gameState.currentTurn = gameState.currentTurn === 1 ? 2 : 1;

  // Start a new round
  startGameRound();
}

// Reset buffs that only last for one turn
function resetTurnBuffs() {
  // Reset for player 1 units
  gameState.player1.units.forEach((unit) => {
    unit.attackBuff = false;
    unit.defendBuff = false;
  });

  // Reset for player 2 units
  gameState.player2.units.forEach((unit) => {
    unit.attackBuff = false;
    unit.defendBuff = false;
  });
}

// Update game info display
function updateGameInfo() {
  // Update turn indicator
  turnIndicator.querySelector(
    "h3"
  ).textContent = `Turn: Player ${gameState.currentTurn}`;

  // Update phase indicators
  if (gameState.currentPhase === "movement") {
    movementPhase.classList.add("active-phase");
    actionPhase.classList.remove("active-phase");
  } else if (gameState.currentPhase === "action") {
    movementPhase.classList.remove("active-phase");
    actionPhase.classList.add("active-phase");
  } else {
    movementPhase.classList.remove("active-phase");
    actionPhase.classList.remove("active-phase");
  }

  // Update player-status indicator
  const p1Status = document.querySelector("#player1Info .player-status");
  const p2Status = document.querySelector("#player2Info .player-status");
  if (p1Status)
    p1Status.classList.toggle("active", gameState.currentTurn === 1);
  if (p2Status)
    p2Status.classList.toggle("active", gameState.currentTurn === 2);

  // Update save/load button states
  updateSaveLoadButtons();
}

// Update save/load button states
function updateSaveLoadButtons() {
  const saveBtn = document.getElementById("saveGameBtn");
  const loadBtn = document.getElementById("loadGameBtn");

  if (saveBtn) {
    // Always enable save button except during setup
    saveBtn.disabled = gameState.currentPhase === "setup";
  }

  if (loadBtn) {
    // Enable load button if there's a saved game
    const hasSavedGame = localStorage.getItem("warOfClansGame") !== null;
    loadBtn.disabled = !hasSavedGame;
  }
}

// Initialize the game when the page loads
window.addEventListener("DOMContentLoaded", initGame);
