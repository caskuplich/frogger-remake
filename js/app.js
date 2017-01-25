// Base class for the game entities.
var Entity = function(width, height, sprite) {
  this.width = width;
  this.height = height;
  this.sprite = sprite;
  this.reset();
};

// Abstract imgX method that returns the X sprite image position.
Entity.prototype.imgX = function() {
  throw new ReferenceError('Method imgX() must be implemented!');
};

// Abstract imgY method that returns the Y sprite image position.
Entity.prototype.imgY = function() {
  throw new ReferenceError('Method imgY() must be implemented!');
};

// Abstract reset method to create/reset entity position and other
// entity specific properties.
Entity.prototype.reset = function() {
  throw new ReferenceError('Method reset() must be implemented!');
};

// Renders the entity on the canvas.
Entity.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.imgX(), this.imgY());
};

// Enemies our player must avoid.
var Enemy = function() {
  Entity.call(this, 101, 73, 'images/enemy-bug.png');
};

// Enemy inherits from Entity.
Enemy.prototype = Object.create(Entity.prototype);
Enemy.prototype.constructor = Enemy;

// Enemy must implement imgX method.
// It returns enemy's X position for sprite image drawing.
Enemy.prototype.imgX = function() {
  return this.x;
};

// Enemy must implement imgY method.
// It returns enemy's Y position for sprite image drawing.
Enemy.prototype.imgY = function() {
  return this.y - 70;
};

// Enemy must implement reset method.
// It creates/resets the enemy's position and speed.
Enemy.prototype.reset = function() {
  this.x = -101;

  // random lane [0,2] * lane height + pixels from canvas top
  this.y = Math.floor(Math.random() * 3) * 83 + 134;

  // random speed [100, 299]
  this.speed = Math.floor(Math.random() * 300) + 100;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
  // You should multiply any movement by the dt parameter
  // which will ensure the game runs at the same speed for
  // all computers.
  this.x += this.speed * dt;

  // When the enemy goes off the canvas,
  // it resets its position and speed.
  if (this.x > ctx.canvas.width) {
    this.reset();
  }
};

// Our player.
var Player = function() {
  Entity.call(this, 71, 73, 'images/char-boy.png');
};

// Player inherits from Entity.
Player.prototype = Object.create(Entity.prototype);
Player.prototype.constructor = Player;

// Player must implement imgX method.
// It returns enemy's X position for sprite image drawing.
Player.prototype.imgX = function() {
  return this.x - 15;
};

// Player must implement imgY method.
// It returns enemy's Y position for sprite image drawing.
Player.prototype.imgY = function() {
  return this.y - 70;
};

// Player must implement reset method.
// It creates/resets the player's position.
Player.prototype.reset = function() {
  this.x = 217;
  this.y = 466;
  this.winner = false;
};

// Update the player's position to keep the player inside
// the game level boundaries.
Player.prototype.update = function(enemies) {
  // check game level boundaries
  if (this.x < 15) {
    this.x = 15;
  } else if (this.x > 419) {
    this.x = 419;
  } else if (this.y > 466) {
    this.y = 466;
  }
};

// Handle the keyboard input to change the player's position.
Player.prototype.handleInput = function(key) {
  switch (key) {
    case 'left':
      this.x += -101;
      break;
    case 'up':
      this.y += -83;
      break;
    case 'right':
      this.x += 101;
      break;
    case 'down':
      this.y += 83;
      break;
  }
};

// Checks if the player collides with other entity.
Player.prototype.collidesWith = function(other) {
  return this.x < other.x + other.width && this.x + this.width > other.x &&
    this.y < other.y + other.height && this.height + this.y > other.y;
};

// Checks if the player collides with some enemy.
Player.prototype.collidesWithAnEnemy = function(enemies) {
  return enemies.some(function(enemy) {
    return this.collidesWith(enemy);
  }, this);
};

// The game itself. It controls the states of the game.
var Game = function() {
  this.enemies = [new Enemy(), new Enemy(), new Enemy()];
  this.player = new Player();
  this.ended = false;
};

// Resets the game.
Game.prototype.reset = function() {
  this.enemies.forEach(function(enemy) {
    enemy.reset();
  });
  this.player.reset();
  this.ended = false;
};

// Update the entities' properties and positions.
Game.prototype.updateEntities = function(deltaTime) {
  this.enemies.forEach(function(enemy) {
    enemy.update(deltaTime);
  });
  this.player.update(this.enemies);

  // Check collisions
  if (this.player.collidesWithAnEnemy(this.enemies)) {
    this.reset();
  }
};

// Render entities of the game.
Game.prototype.renderEntities = function() {
  if (this.player.y < 134) { // player wins
    this.ended = true;
    this.showWinnerScreen();
  } else {
    this.enemies.forEach(function(enemy) {
      enemy.render();
    });

    this.player.render();
  }
};

// Shows a message to the winner player.
Game.prototype.showWinnerScreen = function() {
  ctx.save(); // save canvas context

  // draw the blue screen
  ctx.fillStyle = '#5068d3';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // write the message
  ctx.fillStyle = 'white';
  ctx.font = '40px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('You Win!', ctx.canvas.width / 2, ctx.canvas.height / 2);
  ctx.font = '20px sans-serif';
  ctx.fillText('Press ENTER to play again', ctx.canvas.width / 2, ctx.canvas.height / 2 + 40);

  ctx.restore(); // restore canvas context
};

// Handles the keyboard input.
Game.prototype.handleInput = function(key) {
  if (this.ended) {
    if (key === 'enter')
      this.reset();
  } else {
    this.player.handleInput(key);
  }
};

// Instantiate the game object. The engine starts the game loop using this
// instance.
var game = new Game();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keydown', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        13: 'enter'
    };

    game.handleInput(allowedKeys[e.keyCode]);
});
