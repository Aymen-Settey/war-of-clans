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
const winner = document.getElementById("winner");

// Initialize game
function initGame() {
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
  gameState.currentPhase = "unitPlacement";
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

  // Start with placement phase
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
  const p1ActiveUnits = gameState.player1.units.filter(
    (unit) => unit.status === "active"
  ).length;
  const p2ActiveUnits = gameState.player2.units.filter(
    (unit) => unit.status === "active"
  ).length;

  player1Units.textContent = `Units: ${p1ActiveUnits}`;
  player2Units.textContent = `Units: ${p2ActiveUnits}`;
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

  console.log("Event listeners set up");
}

// Handle clicks on the game board
function handleBoardClick(event) {
  const cell = event.target.closest(".cell");
  if (!cell) return;

  const x = parseInt(cell.dataset.x);
  const y = parseInt(cell.dataset.y);

  if (gameState.currentPhase === "unitPlacement") {
    handleUnitPlacement(x, y);
  } else if (gameState.currentPhase === "movement") {
    handleMovementPhase(x, y);
  } else if (gameState.currentPhase === "action") {
    handleActionPhase(x, y);
  }
}

// Handle unit placement phase
function startPlacementPhase() {
  turnIndicator.innerHTML = `<h3>Placement Phase: Player ${gameState.currentTurn}</h3>`;

  // Get the player's units that need to be placed
  const currentPlayerUnits =
    gameState.currentTurn === 1
      ? gameState.player1.units
      : gameState.player2.units;

  // Count unplaced units
  const unplacedUnits = currentPlayerUnits.filter(
    (unit) => unit.position === null
  ).length;

  if (unplacedUnits === 0) {
    // All units placed, move to next player or start game
    if (gameState.currentTurn === 1) {
      gameState.currentTurn = 2;
      startPlacementPhase();
    } else {
      // Both players have placed all units, start the game proper
      startGameRound();
    }
    return;
  }

  // Show placement instructions
  const placementInfo = document.createElement("div");
  placementInfo.innerHTML = `
        <p>Player ${gameState.currentTurn}, place your units!</p>
        <p>Remaining units to place: ${unplacedUnits}</p>
        <p>Click on a cell in your zone to place a unit.</p>
    `;
  turnIndicator.appendChild(placementInfo);
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
  console.log("---DEBUG: startGameRound() called---");

  gameState.currentPhase = "rollForTurn";

  // Clear the turn indicator content first
  turnIndicator.innerHTML = `<h3>New Round - Roll for Turn Order</h3>`;

  // Create a new button element and add it to the DOM
  const newRollBtn = document.createElement("button");
  newRollBtn.id = "rollDiceBtn";
  newRollBtn.textContent = "Roll Dice";
  newRollBtn.style.display = "block";
  newRollBtn.style.margin = "10px auto";

  // Add the button to the turn indicator
  turnIndicator.appendChild(newRollBtn);
  turnIndicator.appendChild(diceResult);

  // Add a fresh event listener to the new button
  document
    .getElementById("rollDiceBtn")
    .addEventListener("click", rollDiceForTurn);

  // Disable other buttons during this phase
  endMovementBtn.disabled = true;
  endActionBtn.disabled = true;
  attackBtn.disabled = true;
  defendBtn.disabled = true;
  specialBtn.disabled = true;
}

// Roll dice to determine turn order
function rollDiceForTurn() {
  console.log("---DEBUG: rollDiceForTurn() called---");

  if (gameState.currentPhase !== "rollForTurn") {
    console.log("Not in roll phase");
    return;
  }

  const p1Roll = Math.floor(Math.random() * 6) + 1;
  const p2Roll = Math.floor(Math.random() * 6) + 1;

  // Animate dice roll
  diceResult.classList.add("rolling");

  // Disable the button during animation
  document.getElementById("rollDiceBtn").disabled = true;

  setTimeout(() => {
    diceResult.classList.remove("rolling");
    diceResult.textContent = `Player 1 rolled: ${p1Roll}, Player 2 rolled: ${p2Roll}`;

    if (p1Roll > p2Roll) {
      gameState.currentTurn = 1;
      setTimeout(() => startMovementPhase(), 1500);
    } else if (p2Roll > p1Roll) {
      gameState.currentTurn = 2;
      setTimeout(() => startMovementPhase(), 1500);
    } else {
      // Tie, roll again
      diceResult.textContent += " (Tie! Roll again)";
      document.getElementById("rollDiceBtn").disabled = false;
    }
  }, 1000);
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
}

// Initialize the game when the page loads
window.addEventListener("DOMContentLoaded", initGame);
