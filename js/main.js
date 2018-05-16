var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,

    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },

    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var stars;
var bombs;
var gameOver = false;
var platforms;
var cursors;
var score = 0;
var scoreText;
var helpText;


var game = new Phaser.Game(config);

function preload() {
    this.load.image('background', '../assets/images/background.png');

    this.load.image('ground', '../assets/images//platform.png');
    this.load.image('star', '/assets/images/star.png');
    this.load.image('bomb', '/assets/images/bomb.png');
    this.load.spritesheet('dude', '/assets/images/dude.png', {
        frameWidth: 32,
        frameHeight: 48
    });
    this.load.audio('ambience', ['/assets/audio/bros.mp3']);
    this.load.audio('boom', ['/assets/audio/bomb.mp3']);
}

var music;

function create() {

    this.sound.play('ambience'); // Play music


    // music.loop = true; // This is what you are lookig for
    // music.play();


    this.add.image(400, 300, 'background');

    platforms = this.physics.add.staticGroup();

    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(690, 220, 'ground');

    player = this.physics.add.sprite(200, 450, 'dude'); // Load player
    // player = this.physics.add.sprite(80, 430, 'dude');
    player.setBounce(0.5); // Set phisic for the player -Jump effect
    player.setCollideWorldBounds(true);

    this.anims.create({
        key: 'left',
        // setting images (wich frame to use)
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });
    //  This will create a new object called "cursors", inside it will contain 4 objects: up, down, left and right.
    //  These are all Phaser.Key objects, so anything you can do with a Key object you can do with these.
    cursors = this.input.keyboard.createCursorKeys();

    //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function(child) {

        //  Give each star a slightly different bounce
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8)); // Jumping effect

    });

    bombs = this.physics.add.group();


    scoreText = this.add.text(26, 22, 'score: 0', { fontSize: '32px', fill: '#172278' }); // Add Score text
    helpText = this.add.text(26, 64, 'Controll: \nLeft, Right, UP', { fontSize: '22px', fill: '#FFFFFF' }); // Add Score text

    this.physics.add.collider(player, platforms); // Put player on platform
    this.physics.add.collider(stars, platforms); // Put stars on platform
    this.physics.add.collider(bombs, platforms); // Put bombs on platform

    this.physics.add.overlap(player, stars, collectStar, null, this);
    this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update() {

    if (gameOver) {
        return;
    }

    if (cursors.left.isDown) {
        player.setVelocityX(-160);

        player.anims.play('left', true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);

        player.anims.play('right', true);
    } else {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }
}

function collectStar(player, star) {
    star.disableBody(true, true);

    //  Add and update the score
    score += 10;
    scoreText.setText('Score: ' + score);


    if (stars.countActive(true) === 0) {
        //  A new batch of stars to collect
        stars.children.iterate(function(child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;

    }
}

function hitBomb(player, bomb) {

    this.sound.play('boom'); // Play music
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;
}