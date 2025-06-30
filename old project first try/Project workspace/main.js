class Character {
  constructor(name, health, attackPower, defense) {
    this.name = name;
    this.health = health;
    this.maxHealth = health;
    this.attackPower = attackPower;
    this.defense = defense;
  }

  attack(target) {
    const damage = Math.max(this.attackPower - target.defense, 1); // Ensure at least 1 damage
    target.takeDamage(damage);
    return damage;
  }

  takeDamage(amount) {
    this.health -= amount;
    return this.health <= 0;
  }

  heal(amount) {
    this.health = Math.min(this.health + amount, this.maxHealth);
  }
}

// Player class extends Character
class Player extends Character {
  constructor(name, characterClass) {
    super(name, characterClass.health, characterClass.attackPower, characterClass.defense);
    this.class = characterClass.name;
    this.skill = characterClass.skill;
    this.level = 1;
    this.inventory = new Inventory();
    this.image = characterClass.image;
    this.gold = 200;
  }

  levelUp() {
    this.level++;
    this.maxHealth += 10;
    this.health = this.maxHealth;
    this.attackPower += 2;
    this.defense += 1;
    return `${this.name} leveled up to level ${this.level}!`;
  }

  useSkill(target) {
    const damage = Math.max(Math.floor(this.attackPower * 1.5) - target.defense, 1); // Ensure at least 1 damage
    target.takeDamage(damage);
    return `${this.name} used ${this.skill} for ${damage} damage!`;
  }
}

// Enemy class extends Character
class Enemy extends Character {
  constructor(data) {
    super(data.name, data.health, data.attackPower, data.defense);
    this.image = data.image;
  }
}

// Inventory class using composition
class Inventory {
  constructor() {
    this.weapons = [];
    this.armor = [];
  }

  addWeapon(weapon) {
    this.weapons.push(weapon);
  }

  addArmor(armor) {
    this.armor.push(armor);
  }

  getBestWeapon() {
    return this.weapons.length ? 
      this.weapons.reduce((best, current) => current.power > best.power ? current : best, this.weapons[0]) : 
      null;
  }

  getBestArmor() {
    return this.armor.length ? 
      this.armor.reduce((best, current) => current.defense > best.defense ? current : best, this.armor[0]) : 
      null;
  }

  listItems() {
    const weaponsList = this.weapons.map(w => w.name).join(", ");
    const armorList = this.armor.map(a => a.name).join(", ");
    return `Weapons: ${weaponsList || "None"} | Armor: ${armorList || "None"}`;
  }
}

// Weapon class
class Weapon {
  constructor(data) {
    this.name = data.name;
    this.power = data.power;
    this.cost = data.cost;
    this.image = data.image;
    this.description = data.description;
  }
}

// Armor class
class Armor {
  constructor(data) {
    this.name = data.name;
    this.defense = data.defense;
    this.cost = data.cost;
    this.image = data.image;
    this.description = data.description;
  }
}

// Game controller
class Game {
  constructor() {
    this.player = null;
    this.currentLocation = null;
    this.currentEnemy = null;
    this.gameData = null;
    this.gameActive = true;
    this.canvas = document.getElementById("game-canvas");
    this.ctx = this.canvas.getContext("2d");
    
    this.loadGameData();
    this.setupEventListeners();
  }

  async loadGameData() {
    try {
      const response = await fetch('data.json');
      this.gameData = await response.json();
      this.startGame();
    } catch (error) {
      console.error("Error loading game data:", error);
    }
  }

  setupEventListeners() {
    document.getElementById("save-game").addEventListener("click", () => this.saveGame());
    document.getElementById("load-game").addEventListener("click", () => this.loadGame());
    document.getElementById("end-game").addEventListener("click", () => this.endGame());
  }

  startGame() {
  this.gameActive = true;
  this.showStory("Choose your class for your adventure:");
  this.clearButtons();
  
  // Create a container for class selection
  const classSelectionContainer = document.createElement("div");
  classSelectionContainer.className = "class-selection";
  document.getElementById("action-buttons").appendChild(classSelectionContainer);
  
  // Add each subclass with image and button
  this.gameData.subclasses.forEach(cls => {
    // Create a container for each class
    const classContainer = document.createElement("div");
    classContainer.className = "class-option";
    
    // Create and add the image
    const classImage = document.createElement("img");
    classImage.src = cls.image;
    classImage.alt = cls.name;
    classImage.className = "class-image";
    classImage.onerror = () => {
      classImage.src = "ImagesUsed/Map.webp"; // Fallback image
    };
    classContainer.appendChild(classImage);
    
    // Create and add the button
    const classButton = document.createElement("button");
    classButton.textContent = cls.name;
    classButton.onclick = () => this.selectClass(cls);
    classContainer.appendChild(classButton);
    
    // Add the class container to the selection container
    classSelectionContainer.appendChild(classContainer);
  });
  
  this.updateImage("ImagesUsed/World.webp");
}

  selectClass(characterClass) {
    const name = prompt("Enter your hero's name:") || "Adventurer";
    this.player = new Player(name, characterClass);
    this.showStats();
    this.updateHealthBar();
    this.chooseLocation();
  }

  chooseLocation() {
    this.showStory("Where would you like to go next?");
    this.clearButtons();
    this.gameData.locations.forEach(loc => {
      this.createButton(loc.name, () => this.enterLocation(loc));
    });
    this.createButton("Shop", () => this.enterShop());
  }

  enterLocation(location) {
    this.currentLocation = location;
    this.updateImage(location.image);
    this.showStory(location.storyText);
    this.clearButtons();
    
    if (location.enemyTypes && location.enemyTypes.length > 0) {
      this.createButton("Explore (Battle)", () => this.startBattle());
    }
    this.createButton("Rest (+20 HP)", () => {
      this.player.heal(20);
      this.updateHealthBar();
      this.showStats();
      this.showStory(`You rest and recover some strength. (Health: ${this.player.health}/${this.player.maxHealth})`);
      setTimeout(() => this.enterLocation(location), 1500);
    });
    this.createButton("Go Back", () => this.chooseLocation());
  }

  startBattle() {
    const enemyType = this.currentLocation.enemyTypes[Math.floor(Math.random() * this.currentLocation.enemyTypes.length)];
    const enemyData = this.gameData.enemies.find(e => e.name === enemyType);
    this.currentEnemy = new Enemy(enemyData);
    
    this.updateImage(this.currentEnemy.image);
    this.showStory(`A ${this.currentEnemy.name} appears! Prepare for battle!`);
    this.showBattleOptions();
  }

  showBattleOptions() {
    this.clearButtons();
    
    // Get best equipment bonuses
    const bestWeapon = this.player.inventory.getBestWeapon();
    const bestArmor = this.player.inventory.getBestArmor();
    const weaponBonus = bestWeapon ? bestWeapon.power : 0;
    const armorBonus = bestArmor ? bestArmor.defense : 0;
    
    // Temporary apply bonuses
    const baseAttack = this.player.attackPower;
    const baseDefense = this.player.defense;
    this.player.attackPower += weaponBonus;
    this.player.defense += armorBonus;
    
    this.createButton("Attack", () => this.processBattleTurn("attack", baseAttack, baseDefense, weaponBonus, armorBonus));
    this.createButton("Use Skill", () => this.processBattleTurn("skill", baseAttack, baseDefense, weaponBonus, armorBonus));
    this.createButton("Run Away", () => {
      // Remove temporary bonuses
      this.player.attackPower = baseAttack;
      this.player.defense = baseDefense;
      
      this.showStory("You were able to escape from the battle!");
      setTimeout(() => this.enterLocation(this.currentLocation), 1500);
    });
  }

  processBattleTurn(action, baseAttack, baseDefense, weaponBonus, armorBonus) {
    let battleText = "";
    
    // Player's turn
    if (action === "attack") {
      const damage = this.player.attack(this.currentEnemy);
      battleText = `You attacked the ${this.currentEnemy.name} for ${damage} damage!\n`;
    } else {
      battleText = this.player.useSkill(this.currentEnemy) + "\n";
    }
    
    // Check if enemy defeated
    if (this.currentEnemy.health <= 0) {
      // Remove temporary bonuses
      this.player.attackPower = baseAttack;
      this.player.defense = baseDefense;
      
      const goldEarned = Math.floor(Math.random() * 50) + 10;
      this.player.gold += goldEarned;
      
      battleText += `You defeated the ${this.currentEnemy.name}!\n`;
      battleText += this.player.levelUp() + "\n";
      battleText += `You found ${goldEarned} gold!`;
      
      this.showStory(battleText);
      this.updateHealthBar();
      this.showStats();
      
      this.clearButtons();
      this.createButton("Continue", () => this.enterLocation(this.currentLocation));
      return;
    }
    
    // Enemy's turn
    const enemyDamage = this.currentEnemy.attack(this.player);
    battleText += `The ${this.currentEnemy.name} attacks you for ${enemyDamage} damage!`;
    
    this.showStory(battleText);
    this.updateHealthBar();
    this.showStats();
    
    // Check if player is defeated
    if (this.player.health <= 0) {
      // Remove temporary bonuses
      this.player.attackPower = baseAttack;
      this.player.defense = baseDefense;
      
      this.showStory("You have been defeated! Game over.");
      this.gameActive = false;
      
      this.clearButtons();
      this.createButton("Start New Game", () => this.startGame());
      return;
    }
    
    // Continue battle
    this.showBattleOptions();
  }

  enterShop() {
    this.updateImage("ImagesUsed/Shop.webp");
    this.showStory(`Welcome to the shop! You have ${this.player.gold} gold.`);
    
    this.clearButtons();
    this.createButton("Buy Weapons", () => this.showShopItems("weapons"));
    this.createButton("Buy Armor", () => this.showShopItems("armor"));
    this.createButton("Leave Shop", () => this.chooseLocation());
  }

  showShopItems(type) {
    this.clearButtons();
    const items = type === "weapons" ? this.gameData.weapons : this.gameData.armor;
    
    this.showStory(`${type.charAt(0).toUpperCase() + type.slice(1)} for sale:`);
    
    items.forEach(item => {
      if (item.cost <= this.player.gold) {
        this.createButton(`${item.name} (${item.cost} gold)`, () => this.buyItem(item, type));
      }
    });
    
    this.createButton("Back to Shop", () => this.enterShop());
  }

  buyItem(item, type) {
    if (this.player.gold >= item.cost) {
      this.player.gold -= item.cost;
      
      if (type === "weapons") {
        this.player.inventory.addWeapon(new Weapon(item));
        this.showStory(`You purchased ${item.name} for ${item.cost} gold!`);
      } else {
        this.player.inventory.addArmor(new Armor(item));
        this.showStory(`You purchased ${item.name} for ${item.cost} gold!`);
      }
      
      this.showStats();
      
      this.clearButtons();
      this.createButton("Continue Shopping", () => this.enterShop());
      this.createButton("Return to Map", () => this.chooseLocation());
    } else {
      this.showStory("You don't have enough gold for this item!");
      setTimeout(() => this.showShopItems(type), 1500);
    }
  }

  saveGame() {
    const gameState = {
      player: this.player,
      currentLocation: this.currentLocation,
      gameActive: this.gameActive
    };
    
    localStorage.setItem("rpgGameSave", JSON.stringify(gameState));
    alert("Game saved successfully!");
  }

  loadGame() {
    const savedData = localStorage.getItem("rpgGameSave");
    
    if (savedData) {
      const gameState = JSON.parse(savedData);
      
      // Reconstruct objects with their methods
      const player = new Player("", {});
      Object.assign(player, gameState.player);
      
      // Reconstruct inventory
      const inventory = new Inventory();
      player.inventory.weapons.forEach(w => inventory.addWeapon(new Weapon(w)));
      player.inventory.armor.forEach(a => inventory.addArmor(new Armor(a)));
      player.inventory = inventory;
      
      this.player = player;
      this.currentLocation = gameState.currentLocation;
      this.gameActive = gameState.gameActive;
      
      this.showStats();
      this.updateHealthBar();
      
      if (this.currentLocation) {
        this.enterLocation(this.currentLocation);
      } else {
        this.chooseLocation();
      }
      
      alert(`Game loaded for ${this.player.name}, level ${this.player.level}`);
    } else {
      alert("No saved game found!");
      this.startGame();
    }
  }

  endGame() {
    this.gameActive = false;
    this.showStory("Your adventure has ended. See you on the next one!");
    this.clearButtons();
    this.createButton("Start New Game", () => this.startGame());
  }

  updateHealthBar() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    if (this.player) {
      const healthRatio = this.player.health / this.player.maxHealth;
      
      // Background
      this.ctx.fillStyle = "#333";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Health bar
      this.ctx.fillStyle = healthRatio > 0.5 ? "#4CAF50" : healthRatio > 0.25 ? "#FFC107" : "#F44336";
      this.ctx.fillRect(0, 0, this.canvas.width * healthRatio, this.canvas.height);
      
      // Health text
      this.ctx.fillStyle = "#fff";
      this.ctx.font = "14px MedievalSharp";
      this.ctx.textAlign = "center";
      this.ctx.fillText(`${this.player.health}/${this.player.maxHealth} HP`, this.canvas.width / 2, this.canvas.height / 2 + 5);
    }
  }

  showStats() {
    if (!this.player) return;
    
    const bestWeapon = this.player.inventory.getBestWeapon();
    const bestArmor = this.player.inventory.getBestArmor();
    
    const statsElement = document.getElementById("stats-panel");
    statsElement.innerHTML = `
      <h3>${this.player.name} the ${this.player.class}</h3>
      <p>Level: ${this.player.level} | Gold: ${this.player.gold}</p>
      <p>Attack: ${this.player.attackPower} ${bestWeapon ? `(+${bestWeapon.power} from ${bestWeapon.name})` : ''}</p>
      <p>Defense: ${this.player.defense} ${bestArmor ? `(+${bestArmor.defense} from ${bestArmor.name})` : ''}</p>
      <p>Special Skill: ${this.player.skill}</p>
      <hr>
      <div class="inventory">
        <h4>Inventory</h4>
        <p>${this.player.inventory.listItems()}</p>
      </div>
    `;
  }

  showStory(text) {
    document.getElementById("story-panel").innerText = text;
  }

  updateImage(src) {
    const img = document.getElementById("location-image");
    img.onerror = () => {
      img.src = "ImagesUsed/World.webp";
    };
    img.src = src;
  }

  createButton(text, onClick) {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.onclick = onClick;
    document.getElementById("action-buttons").appendChild(btn);
  }

  clearButtons() {
    document.getElementById("action-buttons").innerHTML = "";
  }
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new Game();
});