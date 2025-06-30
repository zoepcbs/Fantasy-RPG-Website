# Fantasy-RPG-Website
Revision of project assignment from INFOTC 2830
SP2025, Prof. Scott Murrell

____________________________________

Project description:

Assignment: JavaScript Role-Playing Web Game
Total Points: 150




Objective:
Build a browser-based RPG (Role-Playing Game) using JavaScript, HTML, and CSS. The game will be text-driven and web-interactive, displaying storylines, choices, and battles directly on the page using buttons, images, canvas, and descriptive text. You must demonstrate mastery of OOP, DOM manipulation, event handling, data storage, and file interaction with JSON.


Game Concept:
Players will pick a character class (Warrior, Mage, Thief, Archer), then explore a fantasy world, battling enemies (Goblin, Troll, Evil Soldier, Soldier, Dragon), visiting locations, and collecting or trading items and weapons. The game must show descriptive narrative text on the screen, display relevant images, and update dynamically with every interaction.


Functional Requirements

🔹 Core Gameplay Mechanics (30 pts)

●	 Create a base Character class with properties like:
  -	 name, health, attackPower, defense, level

●	Create subclasses:
- Player with class types (Warrior, Mage, Thief, Archer)
-	Enemy with enemy types (Goblin, Troll, Dragon, etc.)

●	Add methods:

 - attack(), takeDamage(), heal(), levelUp(), skill()
 - Use inner functions where appropriate


🔹Game Interface (20 pts)

●	Use DOM manipulation to show:
 - Story progression and choices
 -	Battle outcomes and text feedback
 -	Character stats and inventory on screen

●	Use HTML buttons for user actions, not prompt() or console.log()

●	Show a main panel or section where the adventure narrative is displayed

●	Update dynamically as the player explores, fights, or interacts


🔹 Inventory System & Items (20 pts)

●	Use a composition-based Inventory class

●	Create Weapon and Armor classes with stats

●	Allow trading, earning, or buying items through gameplay choices


🔹 Canvas Integration (20 pts)

●	Use the <canvas> element to draw at least one visual:

  -	Health bars, battle effects, basic map, or item icons

●	Must be updated as gameplay progresses


🔹 Game State Storage (20 pts)

●	Save and load player state using:
 - JSON.stringify() and localStorage

●	Include buttons for Save Game and Load Game


🔹 Use of JSON File (30 pts)

●	Create a data.json file:
  - Must include starting data for player classes, items, or enemies

●	Load this file with fetch() and use it in-game


🔹 Visuals and Story Elements (10 pts)

●	Use images for characters, enemies, or locations

●	Text descriptions must appear as part of the game interface

●	Provide 3–5 different locations for the player to visit

●	Offer meaningful choices that affect gameplay




🔹Interface Requirements

●	index.html: Webpage layout with images, story panel, buttons, and canvas

●	style.css: Clean and readable layout; fantasy or medieval theme encouraged

●	main.js: All game logic

●	data.json: Data used to initialize enemies, player classes, items, etc.


