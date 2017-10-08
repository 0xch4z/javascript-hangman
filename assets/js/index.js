/**
 * Set up key event callback
 */
document.onkeydown = function(event) {
    const { key } = event;
    console.log(key);
    if (!game.isActive && key === ' ') {
        // start the game
        console.log('starting...');
        game.start();
    } else if (game.isActive && /^[a-z]$/.test(key)) {
        // make a guess
        game.guess(key);
    } else if (game.isActive && key === '0') {
        // restart the game
        console.log('resetting');
        game.restart();
    } else if (game.isActive && key === 'Escape') {
        // end the game
        console.log('ending...');
        game.end();
    }
}


const game = {
    guesses: [],
    lives: 6,
    isActive: false,
    wins: 0,
    losses: 0,
    word: '',
    wordBank: [
        'array',
        'object',
        'modulo',
        'boolean',
        'float',
        'integer',
        'number',
        'function',
        'class',
        'index',
        'callback',
        'iterator',
        'constructor',
        'undefined',
        'null',
        'string',
        'prototype',
        'generator',
    ],
    elements: {
        message: document.getElementById('message'),
        lives: document.getElementById('lives'),
        wins: document.getElementById('wins'),
        losses: document.getElementById('losses'),
        word: document.getElementById('word'),
        guesses: document.getElementById('guesses'),
        result: document.getElementById('result'),        
        game: document.querySelectorAll('.game'),
    }
};


/**
 * Starts the game
 */
game.start = function() {
    this.isActive = true;
    // setup ui
    this.elements.message.innerHTML = 'press any key to guess a letter';
    this.elements.result.style.visibility = 'hidden';      
    this.elements.game.forEach(function (node) {
        node.style.visibility = 'visible';
    });
    // reset state
    this.reset();        
    this.setRandomWord();
    hangman.reset();        
    console.log(this.word);
}


/**
 * Ends the game
 * 
 * @param {boolean} userWon 
 */
game.end = function(userWon) {
    // update wins/losses
    if (userWon) {
        this.wins++;
        this.elements.result.innerText = 'You won!';
    } else {
        this.fillWord();
        this.losses++;
        this.elements.result.innerText = 'You lost!';
    }
    // update stats
    this.elements.wins.innerText = this.wins;
    this.elements.losses.innerText = this.losses;
    this.elements.result.style.visibility = 'visible';
    // deinit game
    this.isActive = false; 
    this.elements.message.innerHTML = 'press <span class="hw-button">spacebar</span> to continue';
    hangman.showAllParts();
}


/**
 * Restarts the game
 */
game.restart = function() {
    this.end();
    this.start();
}


/**
 * Resets the game state
 */
game.reset = function() {
    this.guesses = [];
    this.lives = 6;
    this.word = '';
    this.elements.word.innerHTML = '';
    this.elements.guesses.innerHTML = '';
}


/**
 * Sets random word and formats letters
 * to the page.
 */
game.setRandomWord = function() {
    // generate random word
    this.word = this.wordBank[Math.floor(Math.random() * this.wordBank.length)];
    console.log('new word:', this.word);
    for (let i in this.word) {
        // push empty letter nodes
        const el = document.createElement('span');
        el.innerText = '_';
        console.log(el);            
        el.className = 'empty letter';
        this.elements.word.appendChild(el);
    }
}


/**
 * Attempts to guess a letter
 * 
 * @param {string} letter 
 */
game.guess = function(letter) {
    const { guesses, word } = this;
    const chars = word.split('');

    if (guesses.includes(letter)) {
        return alert('you\'ve already guessed this!');

    } else if (chars.includes(letter)) {
        // fill in the letter
        this.fillLetter(letter);
        // get remaining empty spans
        const remaining = document.querySelectorAll('.empty').length;
        // end game if no more empties
        return remaining ? this.pushGuess(letter, true) : this.end(true); 

    } else if (this.lives < 2) {
        // player lost
        return this.end();
    } else {
        // player guessed incorrectly
        hangman.showNextPart();
        this.lives--;
        this.pushGuess(letter, false);
    }        
}


/**
 * Fills letter in on page
 * 
 * @param {string} letter 
 */
game.fillLetter = function(letter) {
    // get all occurances of letter
    const indexes = [];
    const chars = this.word.split('');
    let i = 0;
    for (const l of chars) {
        if (l === letter) indexes.push(i); 
        i++;
    }
    // fill in all occurances
    for (const j of indexes) {
        // remove empty class and fill in
        const node = this.elements.word.children[j];
        node.classList.remove('empty');
        node.innerText = letter;
    }
}


/**
 * Fills entire word in on the page
 * 
 */
game.fillWord = function() {
    const letters = this.word.split('');
    for (const letter of letters) {
        this.fillLetter(letter);
    }
}


/**
 * Pushes to guesses and adds to page
 * 
 * @param {string} letter
 * @param {boolean} isCorrect
 */
game.pushGuess = function(letter, isCorrect) {
    // update state
    this.guesses.push(letter);
    // create guess element
    const guess = document.createElement('span');
    guess.className = 'guess';
    guess.classList.add(isCorrect ? 'correct' : 'incorrect');
    guess.innerText = letter;
    // append to guesses
    this.elements.guesses.appendChild(guess);
}


const hangman = {
    currIndex: 0,
    parts: {
        head: document.getElementById('head'),
        torso: document.getElementById('torso'),
        leftArm: document.getElementById('left-arm'),
        rightArm: document.getElementById('right-arm'),
        leftLeg: document.getElementById('left-leg'),
        rightLeg: document.getElementById('right-leg'),
        leftEye: document.getElementById('left-eye'),
        rightEye: document.getElementById('right-eye'),
        frown: document.getElementById('frown'),
    }
}

/**
* Shows next part of the hangman
*/
hangman.showNextPart = function() {
    if (this.currIndex >= 5) {
        this.parts.rightLeg.style.opacity = 1;
        this.parts.rightEye.style.opacity = 1;
        this.parts.leftEye.style.opacity = 1;
        this.parts.frown.style.opacity = 1;
        this.currIndex += 3;
    } else {
        const part = Object.values(this.parts)[this.currIndex];
        part.style.opacity = 1;
        this.currIndex++;
    }
},

/**
 * Shows all parts of the hangman
 */
hangman.showAllParts = function() {
    const parts = Object.values(this.parts);
    // iterate through parts and make transparent
    for (const part of parts) {
        part.style.opacity = 1;
    }
},

/**
 * Resets the hangman state
 */
hangman.reset = function() {
    const parts = Object.values(this.parts);
    // iterate through parts and make transparent
    for (const part of parts) {
        part.style.opacity = 0;
    }
    this.currIndex = 0;
}

