var mainState = 
{
    preload: function()
	{ 
		game.load.spritesheet('bird', 'assets/Umbreon.png', 450, 300); // Load the bird sprite
		game.load.image('rock1', 'assets/rock1.png', 199, 205);
		//game.load.image('bird', 'assets/bird.png');
		game.load.image('background1', 'assets/background1.png');
		game.load.image('background2', 'assets/background2.png');
		game.load.image('pipe', 'assets/pipe.png');
		//game.load.image('pipe', 'assets/fairygon.png');
		game.load.audio('jump', 'assets/jump.wav'); 
	    // 450 by 300 and 6 frames
	},
	
	create: function() 
	{ 
	
		this.jumpSound = game.add.audio('jump');
		
		// Change the background color of the game to blue
        game.stage.backgroundColor = '#71c5cf';
		//game.stage.backgroundColor = '#CD6D3F';
		
		// Added new background1
		this.bg = game.add.sprite(0.0, 0.0, 'background1');
		this.bg.width = 640;   // width 640
		this.bg.height = 490;  // height 460
		//this.bg.setOrigin(0,0);
		
		// Added new background2
		this.bg2 = game.add.tileSprite(0, 100, 640 ,490,  'background2');
		
		//this.bg2.width = 640;   // width 640
		//this.bg2.height = 490;  // height 460
		
		
		
		
		// Set the physics system
		game.physics.startSystem(Phaser.Physics.ARCADE);
		
		 // Display the bird at the position x= 50 and y= 50
		this.bird = game.add.sprite(9, 80, 'bird');
		this.bird.scale.setTo(0.2,0.2);
		this.bird.animations.add('run')       //[0,1,2,3,4,5], 6, true);
		this.bird.animations.play('run',6, true);
		this.bird.alive = true;
		
		// rock1
		this.rock1 = game.add.sprite(-20, 80, 'rock1');
		this.rock1.scale.setTo(1,1);
		//this.rock1.animations.add('noMove')       //[0,1,2,3,4,5], 6, true);
		//this.rock1.animations.play('noMove',10, true);
		//this.rock1.alive = false
		
		console.log("in create()");
		// Add physics to the bird
		// Needed for: movements, gravity, collisions, etc.
		game.physics.arcade.enable(this.bird);
		
		 // Add gravity to the bird to make it fall
		//this.bird.body.gravity.y = 1000;  
		// bird doesn't fall until user first taps 
		// Add gravity to the bird to make it fall
		this.bird.body.gravity.y = 20;
		
		// Call the 'jump' function when the spacekey is hit
		var spaceKey = game.input.keyboard.addKey(
                    Phaser.Keyboard.SPACEBAR);
		spaceKey.onDown.add(this.jump, this);
		
		game.input.onTap.add(this.jump, this);
		
		// Move the anchor to the left and downward
        this.bird.anchor.setTo(-0.2, 0.5); 
		
		// Create an empty group
		this.pipes = game.add.group(); 
		
		this.timer = game.time.events.loop(1500, this.addRowOfPipes, this); 
		
		this.score = -2;
		this.labelScore = game.add.text(20, 20, "0", 
		{ font: "50px Arial", fill: "#ffffff" });
		
	},
	
	 update: function() 
	{
		//console.log("in update()");
		
		if (this.bird.angle < 20)
		    this.bird.angle += 1; 
	
		 //If the bird is out of the screen (too high or too low)
		//Call the 'restartGame' function
			 
		if (this.bird.y < 0 || this.bird.y > 490)
			this.hitPipe();
		
		game.physics.arcade.overlap(
		this.bird, this.pipes, this.hitPipe, null, this);
		
		this.bg2.tilePosition.x -= 1;
		
		this.rock1.x -=1;
	},
		

	
	jump: function() // Make the bird jump 
	{
			if (this.bird.alive == false)
				return; 
			if (this.bird.firstClicked != true) {
				// bird keeps flying along until user first taps
				this.bird.firstClicked = true;
				// activate gravity
				 // Add gravity to the bird to make it fall
				this.bird.body.gravity.y = 1000;
			}
			
			this.bird.angle = -20;
			
			// Create an animation on the bird
			var animation = game.add.tween(this.bird);
			
			// Change the angle of the bird to -20° in 100 milliseconds
			animation.to({angle: -20}, 100);
			
			// And start the animation
			animation.start(); 
			
			// Add a vertical velocity to the bird
			this.bird.body.velocity.y = -350;
			
			this.jumpSound.play(); 
	},
	
	restartGame: function() // Restart the game
	{
		// Start the 'main' state, which restarts the game
		game.state.start('main');
		
	},
		
	hitPipe: function() 
	{
		// If the bird has already hit a pipe, do nothing
		// It means the bird is already falling off the screen
		if (this.bird.alive == false)
			return;

		// Set the alive property of the bird to false
		this.bird.alive = false;

		// Prevent new pipes from appearing
		game.time.events.remove(this.timer);

		// Go through all the pipes, and stop their movement
		this.pipes.forEach(function(p)
		{
			p.body.velocity.x = 0;
		}, 	this);
		
		// restartGame
		this.restartGame(); 
	},

	addOnePipe: function(x, y) 
		{
			// Create a pipe at the position x and y
			var pipe = game.add.sprite(x, y, 'pipe');

			// Add the pipe to our previously created group
			this.pipes.add(pipe);

			// Enable physics on the pipe 
			game.physics.arcade.enable(pipe);

			// Add velocity to the pipe to make it move left
			pipe.body.velocity.x = -200; 

			// Automatically kill the pipe when it's no longer visible 
			pipe.checkWorldBounds = true;
			pipe.outOfBoundsKill = true;
		},
		
	addRowOfPipes: function() 
		{
			// Randomly pick a number between 1 and 4
			// This will be the hole position
			var hole = Math.floor(Math.random() * 4) + 1;

			// Add the 6 pipes 
			// With one big hole at position 'hole' and 'hole + 1'
			for (var i = 0; i < 8; i++)
				if (i != hole && i != hole + 1 && i  != hole + 2 ) 
					this.addOnePipe(640, i * 60 + 10);  
			this.score += 1;
			if ( this.score > 0)
			{
				this.labelScore.text = this.score;
			}
					
		},
			
};
 
	// Initialize Phaser, and create a 640px by 490px game
	var game = new Phaser.Game(640, 490);
	
	// Add the 'mainState' and call it 'main'
	game.state.add('main', mainState); 
	
	// Start the state to actually start the game
	game.state.start('main');