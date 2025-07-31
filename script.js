document.addEventListener('DOMContentLoaded', () => {
    const gameArea = document.getElementById('game-area');
    const player = document.getElementById('player');
    const scoreDisplay = document.getElementById('score');
    const livesDisplay = document.getElementById('lives');
    const phraseContainer = document.getElementById('phrase-container');
    const multiplierIndicator = document.getElementById('multiplier-indicator');
    const gameOverScreen = document.getElementById('game-over');
    const finalScoreDisplay = document.getElementById('final-score');
    const gameWinScreen = document.getElementById('game-win');
    const winScoreDisplay = document.getElementById('win-score');

    let score = 0;
    let lives = 5;
    let gameInterval;
    let enemyInterval;
    let letterInterval;
    let isGameOver = false;
    let enemySpeed = 2;
    let projectiles = 1;
    let isInvincible = false;
    let scoreMultiplier = 1;
    let isShooting = false;
    let movementKeys = {};

    const phrase = "Happy Birthday to simsim";
    let collectedLetters = Array(phrase.length).fill(false);

    function updateUI() {
        scoreDisplay.textContent = score;
        let hearts = '';
        for (let i = 0; i < lives; i++) {
            hearts += '♥️';
        }
        livesDisplay.innerHTML = hearts;

        let displayedPhrase = '';
        for (let i = 0; i < phrase.length; i++) {
            if (phrase[i] === ' ') {
                displayedPhrase += ' ';
            } else if (collectedLetters[i]) {
                displayedPhrase += phrase[i];
            } else {
                displayedPhrase += '_';
            }
        }
        phraseContainer.textContent = displayedPhrase;

        multiplierIndicator.textContent = scoreMultiplier > 1 ? ` (x${scoreMultiplier})` : '';
    }

    function movePlayer(x) {
        const gameAreaRect = gameArea.getBoundingClientRect();
        const playerRect = player.getBoundingClientRect();
        let newLeft = x - gameAreaRect.left - playerRect.width / 2;
        newLeft = Math.max(0, newLeft);
        newLeft = Math.min(gameAreaRect.width - playerRect.width, newLeft);
        player.style.left = `${newLeft}px`;
    }

    document.addEventListener('mousemove', (e) => movePlayer(e.clientX));
    document.addEventListener('touchmove', (e) => {
        movePlayer(e.touches[0].clientX);
        isShooting = true;
    });
    document.addEventListener('touchstart', (e) => {
        movePlayer(e.touches[0].clientX);
        isShooting = true;
    });
    document.addEventListener('touchend', () => isShooting = false);

    document.addEventListener('keydown', (e) => {
        movementKeys[e.key] = true;
        if (e.key === ' ') {
            isShooting = true;
        }
    });

    document.addEventListener('keyup', (e) => {
        movementKeys[e.key] = false;
        if (e.key === ' ') {
            isShooting = false;
        }
    });

    function handleKeyboardMovement() {
        const playerRect = player.getBoundingClientRect();
        const gameAreaRect = gameArea.getBoundingClientRect();
        let currentLeft = parseFloat(player.style.left) || (gameAreaRect.width / 2);

        if (movementKeys['ArrowLeft'] && currentLeft > 0) {
            currentLeft -= 10;
        }
        if (movementKeys['ArrowRight'] && currentLeft < gameAreaRect.width - playerRect.width) {
            currentLeft += 10;
        }
        player.style.left = `${currentLeft}px`;
    }

    function shoot() {
        if (!isShooting || isGameOver) return;

        const playerRect = player.getBoundingClientRect();
        const gameAreaRect = gameArea.getBoundingClientRect();
        const spread = 5;

        for (let i = 0; i < projectiles; i++) {
            const projectile = document.createElement('div');
            projectile.className = 'projectile';
            projectile.textContent = '⚡';
            const baseLeft = playerRect.left - gameAreaRect.left + playerRect.width / 2 - 5;
            const offset = (i - (projectiles - 1) / 2) * spread;
            projectile.style.left = `${baseLeft + offset}px`;
            projectile.style.top = `${playerRect.top - gameAreaRect.top}px`;
            gameArea.appendChild(projectile);
        }
    }

    function moveElements() {
        // Move projectiles
        document.querySelectorAll('.projectile').forEach(projectile => {
            let top = parseFloat(projectile.style.top);
            if (top < 0) {
                projectile.remove();
            } else {
                projectile.style.top = `${top - 10}px`;
            }
        });

        // Move enemies
        document.querySelectorAll('.enemy').forEach(enemy => {
            let top = parseFloat(enemy.style.top);
            if (top > gameArea.clientHeight) {
                enemy.remove();
            } else {
                enemy.style.top = `${top + enemySpeed}px`;
            }
        });
        
        // Move dropped items
        document.querySelectorAll('.dropped-item').forEach(item => {
            let top = parseFloat(item.style.top);
            if (top > gameArea.clientHeight) {
                item.remove();
            } else {
                item.style.top = `${top + 2}px`;
            }
        });
    }

    function createEnemy() {
        if (isGameOver) return;

        const enemy = document.createElement('div');
        enemy.className = 'enemy';
        enemy.textContent = '🎁';
        enemy.style.left = `${Math.random() * (gameArea.clientWidth - 30)}px`;
        enemy.style.top = '-30px';
        gameArea.appendChild(enemy);
    }

    function createLetter() {
        if (isGameOver) return;

        const uncollectedIndexes = [];
        for (let i = 0; i < phrase.length; i++) {
            if (phrase[i] !== ' ' && !collectedLetters[i]) {
                uncollectedIndexes.push(i);
            }
        }

        if (uncollectedIndexes.length === 0) {
            if (!document.querySelector('.pretzel')) {
                 createPretzel();
            }
            return;
        }

        const letterIndex = uncollectedIndexes[0];
        const letter = document.createElement('div');
        letter.className = 'dropped-item letter';
        letter.textContent = phrase[letterIndex];
        letter.dataset.index = letterIndex;
        letter.style.left = `${Math.random() * (gameArea.clientWidth - 20)}px`;
        letter.style.top = '-30px';
        gameArea.appendChild(letter);
    }
    
    function createPretzel() {
        if (isGameOver) return;
        const pretzel = document.createElement('div');
        pretzel.className = 'dropped-item pretzel';
        pretzel.textContent = '🥨';
        pretzel.style.left = `${Math.random() * (gameArea.clientWidth - 20)}px`;
        pretzel.style.top = '-30px';
        gameArea.appendChild(pretzel);
    }

    function checkCollisions() {
        if (isGameOver) return;
        const playerRect = player.getBoundingClientRect();

        // Player vs Enemy
        document.querySelectorAll('.enemy').forEach(enemy => {
            if (isColliding(playerRect, enemy.getBoundingClientRect())) {
                if (!isInvincible) {
                    playerHit();
                }
                enemy.remove();
            }
        });

        // Projectile vs Enemy
        document.querySelectorAll('.projectile').forEach(projectile => {
            document.querySelectorAll('.enemy').forEach(enemy => {
                if (isColliding(projectile.getBoundingClientRect(), enemy.getBoundingClientRect())) {
                    projectile.remove();
                    enemy.remove();
                    score += 5 * scoreMultiplier;
                    createExplosion(enemy.getBoundingClientRect());
                    dropItem(enemy.getBoundingClientRect());
                    updateUI();
                }
            });
        });

        // Player vs Dropped Item
        document.querySelectorAll('.dropped-item').forEach(item => {
            if (isColliding(playerRect, item.getBoundingClientRect())) {
                applyItemEffect(item);
                item.remove();
            }
        });
    }

    function isColliding(rect1, rect2) {
        return !(rect1.right < rect2.left ||
                   rect1.left > rect2.right ||
                   rect1.bottom < rect2.top ||
                   rect1.top > rect2.bottom);
    }

    function playerHit() {
        lives--;
        createExplosion(player.getBoundingClientRect());
        if (lives <= 0) {
            gameOver();
        } else {
            isInvincible = true;
            player.classList.add('flicker');
            setTimeout(() => {
                isInvincible = false;
                player.classList.remove('flicker');
            }, 2000);
        }
        updateUI();
    }

    function createExplosion(rect) {
        const explosion = document.createElement('div');
        explosion.className = 'explosion';
        explosion.textContent = '💥';
        explosion.style.left = `${rect.left + rect.width / 2 - 30}px`;
        explosion.style.top = `${rect.top + rect.height / 2 - 30}px`;
        gameArea.appendChild(explosion);
        setTimeout(() => explosion.remove(), 500);
    }

    function dropItem(rect) {
        const chance = Math.random();
        let item;
        let emojiSet;

        if (chance < 0.10) { // +5 points, +1 life
            emojiSet = ['🍕', '🥯', '🍰', '🎂', '🧁', '🍭', '🍬', '🍩', '🍨', '🍉'];
            item = { type: 'life', emoji: emojiSet[Math.floor(Math.random() * emojiSet.length)] };
        } else if (chance < 0.25) { // +15 points
            emojiSet = ['😊', '😁', '👍', '🤣', '👌', '🤩', '😝', '😹', '😎', '🐣'];
            item = { type: 'points', emoji: emojiSet[Math.floor(Math.random() * emojiSet.length)] };
        } else if (chance < 0.40) { // +5 points, slow enemies
            emojiSet = ['⭐', '🌞', '🌜', '❄️', '⛄', '⚡', '🌧️', '☄️', '🌡️', '⛱️'];
            item = { type: 'slow', emoji: emojiSet[Math.floor(Math.random() * emojiSet.length)] };
        } else if (chance < 0.50) { // +5 points, x3 score
            emojiSet = ['✨', '🎉', '🪄', '🪅', '🕹️', '🪅', '🪁', '🎢', '🎈', '🪂'];
            item = { type: 'multiplier', emoji: emojiSet[Math.floor(Math.random() * emojiSet.length)] };
        } else if (chance < 0.65) { // +5 points, more projectiles
            emojiSet = ['🤝', '👋', '👏', '🤲', '💪', '✌️', '🤙', '🤛', '✊', '🙏'];
            item = { type: 'weapon', emoji: emojiSet[Math.floor(Math.random() * emojiSet.length)] };
        } else if (chance < 0.80) { // +5 points, shield
            emojiSet = ['📿', '🕯️', '🪔', '📗', '🕋', '🕌', '🌜', '☪️', '🤲', '🕊️'];
            item = { type: 'shield', emoji: emojiSet[Math.floor(Math.random() * emojiSet.length)] };
        } else {
            return; // No drop
        }

        const dropped = document.createElement('div');
        dropped.className = 'dropped-item';
        dropped.textContent = item.emoji;
        dropped.dataset.type = item.type;
        dropped.style.left = `${rect.left}px`;
        dropped.style.top = `${rect.top}px`;
        gameArea.appendChild(dropped);
    }

    function applyItemEffect(item) {
        const type = item.dataset.type;
        score += 5 * scoreMultiplier;

        switch (type) {
            case 'life':
                lives++;
                break;
            case 'points':
                score += 10 * scoreMultiplier; // Total +15
                break;
            case 'slow':
                const currentSpeed = enemySpeed;
                enemySpeed = Math.max(1, enemySpeed / 2);
                setTimeout(() => enemySpeed = currentSpeed, 10000);
                break;
            case 'multiplier':
                scoreMultiplier = 3;
                setTimeout(() => scoreMultiplier = 1, 10000);
                break;
            case 'weapon':
                projectiles = Math.min(20, projectiles + 1);
                break;
            case 'shield':
                isInvincible = true;
                const shieldDiv = document.createElement('div');
                shieldDiv.id = 'shield';
                player.appendChild(shieldDiv);
                setTimeout(() => {
                    isInvincible = false;
                    document.getElementById('shield')?.remove();
                }, 10000);
                break;
            case 'letter':
                const index = parseInt(item.dataset.index);
                if (!collectedLetters[index]) {
                    collectedLetters[index] = true;
                    score += 20 * scoreMultiplier;
                }
                break;
            case 'pretzel':
                score += 100 * scoreMultiplier;
                gameWin();
                break;
        }
        updateUI();
    }
    
    function gameLoop() {
        if (isGameOver) return;
        handleKeyboardMovement();
        shoot();
        moveElements();
        checkCollisions();
        updateUI();
        requestAnimationFrame(gameLoop);
    }

    function startGame() {
        updateUI();
        enemyInterval = setInterval(createEnemy, 1000);
        setInterval(() => {
            if (!isGameOver) enemySpeed += 0.2;
        }, 5000);
        letterInterval = setInterval(createLetter, 30000);
        gameLoop();
    }

    function gameOver() {
        isGameOver = true;
        clearInterval(enemyInterval);
        clearInterval(letterInterval);
        finalScoreDisplay.textContent = score;
        gameOverScreen.style.display = 'block';
    }

    function gameWin() {
        isGameOver = true;
        clearInterval(enemyInterval);
        clearInterval(letterInterval);
        winScoreDisplay.textContent = score;
        gameWinScreen.style.display = 'block';
    }

    startGame();
});