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
    const backgroundCanvas = document.getElementById('background-canvas');
    const ctx = backgroundCanvas.getContext('2d');

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

    let stars = [];
    const numStars = 200;
    const starColors = ['#FFFFFF', '#FFD700', '#ADD8E6', '#FF69B4', '#90EE90'];

    const phrase = "Happy Birthday to simsim";
    let collectedLetters = Array(phrase.length).fill(false);

    function resizeCanvas() {
        backgroundCanvas.width = gameArea.clientWidth;
        backgroundCanvas.height = gameArea.clientHeight;
    }

    function initStars() {
        resizeCanvas();
        stars = [];
        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: Math.random() * backgroundCanvas.width,
                y: Math.random() * backgroundCanvas.height,
                size: Math.random() * 2 + 1, // size between 1 and 3
                speed: Math.random() * 2 + 1, // speed between 1 and 3
                color: starColors[Math.floor(Math.random() * starColors.length)]
            });
        }
    }

    function drawStars() {
        ctx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
        stars.forEach(star => {
            ctx.fillStyle = star.color;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function updateStars() {
        stars.forEach(star => {
            star.y += star.speed;
            if (star.y > backgroundCanvas.height) {
                star.y = 0;
                star.x = Math.random() * backgroundCanvas.width;
            }
        });
    }

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

    document.addEventListener('mousemove', (e) => {
        movePlayer(e.clientX);
        // On desktop, we can assume shooting is tied to keyboard spacebar
    });
    document.addEventListener('touchmove', (e) => {
        e.preventDefault(); // prevent screen scrolling
        movePlayer(e.touches[0].clientX);
        isShooting = true;
    });
    document.addEventListener('touchstart', (e) => {
        e.preventDefault();
        movePlayer(e.touches[0].clientX);
        isShooting = true;
    });
    document.addEventListener('touchend', () => {
        isShooting = false;
    });

    document.addEventListener('keydown', (e) => {
        movementKeys[e.key] = true;
        if (e.key === ' ') {
            e.preventDefault();
            isShooting = true;
        }
    });

    document.addEventListener('keyup', (e) => {
        movementKeys[e.key] = false;
        if (e.key === ' ') {
            e.preventDefault();
            isShooting = false;
        }
    });

    function handleKeyboardMovement() {
        if (isGameOver) return;
        const playerRect = player.getBoundingClientRect();
        const gameAreaRect = gameArea.getBoundingClientRect();
        let currentLeft = parseFloat(player.style.left) || (gameAreaRect.width / 2 - playerRect.width / 2);

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
        const spread = 15; // Increased spread for better visuals

        for (let i = 0; i < projectiles; i++) {
            const projectile = document.createElement('div');
            projectile.className = 'projectile';
            projectile.textContent = '⚡';
            const baseLeft = playerRect.left - gameAreaRect.left + playerRect.width / 2 - 10;
            // Calculate offset from the center
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
        enemy.style.left = `${Math.random() * (gameArea.clientWidth - 40)}px`;
        enemy.style.top = '-40px';
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
            // After one round of letters, restart the interval for the next round
            clearInterval(letterInterval);
            for(let i = 0; i < collectedLetters.length; i++){
                if(phrase[i] !== ' ') collectedLetters[i] = false;
            }
            letterInterval = setInterval(createLetter, 10000);
            return;
        }

        const letterIndex = uncollectedIndexes[0];
        const letter = document.createElement('div');
        letter.className = 'dropped-item letter-item';
        letter.textContent = phrase[letterIndex];
        letter.dataset.type = 'letter';
        letter.dataset.index = letterIndex;
        letter.style.left = `${Math.random() * (gameArea.clientWidth - 50)}px`;
        letter.style.top = '-50px';
        gameArea.appendChild(letter);
    }
    
    function createPretzel() {
        if (isGameOver || document.querySelector('[data-type="pretzel"]')) return;
        const pretzel = document.createElement('div');
        pretzel.className = 'dropped-item';
        pretzel.textContent = '🥨';
        pretzel.dataset.type = 'pretzel';
        pretzel.style.left = `${Math.random() * (gameArea.clientWidth - 30)}px`;
        pretzel.style.top = '-40px';
        pretzel.style.fontSize = '2em';
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
                createExplosion(enemy.getBoundingClientRect());
                enemy.remove();
            }
        });

        // Projectile vs Enemy
        document.querySelectorAll('.projectile').forEach(projectile => {
            document.querySelectorAll('.enemy').forEach(enemy => {
                if (!projectile.parentElement || !enemy.parentElement) return; // Already removed
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
        updateUI(); // Update hearts immediately
        if (lives <= 0) {
            gameOver();
            return;
        }
        
        createExplosion(player.getBoundingClientRect());
        isInvincible = true;
        player.classList.add('flicker');
        setTimeout(() => {
            isInvincible = false;
            player.classList.remove('flicker');
        }, 2000);
    }

    function createExplosion(rect) {
        const explosion = document.createElement('div');
        explosion.className = 'explosion';
        explosion.textContent = '💥';
        // Position explosion relative to gameArea
        const gameAreaRect = gameArea.getBoundingClientRect();
        explosion.style.left = `${rect.left - gameAreaRect.left}px`;
        explosion.style.top = `${rect.top - gameAreaRect.top}px`;
        gameArea.appendChild(explosion);
        setTimeout(() => explosion.remove(), 500);
    }

    function dropItem(rect) {
        const chance = Math.random() * 100;
        let item = {};
        let emojiSet;

        if (chance < 1) { // 1%
            emojiSet = ['🍕', '🥯', '🍰', '🎂', '🧁', '🍭', '🍬', '🍩', '🍨', '🍉'];
            item = { type: 'life', emoji: emojiSet[Math.floor(Math.random() * emojiSet.length)] };
        } else if (chance < 25) { // 15%
            emojiSet = ['😊', '😁', '👍', '🤣', '👌', '🤩', '😝', '😹', '😎', '🐣'];
            item = { type: 'points', emoji: emojiSet[Math.floor(Math.random() * emojiSet.length)] };
        } else if (chance < 40) { // 15%
            emojiSet = ['⭐', '🌞', '🌜', '❄️', '⛄', '⚡', '🌧️', '☄️', '🌡️', '⛱️'];
            item = { type: 'slow', emoji: emojiSet[Math.floor(Math.random() * emojiSet.length)] };
        } else if (chance < 50) { // 10%
            emojiSet = ['✨', '🎉', '🪄', '🪅', '🕹️', '🪁', '🎢', '🎈', '🪂'];
            item = { type: 'multiplier', emoji: emojiSet[Math.floor(Math.random() * emojiSet.length)] };
        } else if (chance < 65) { // 15%
            emojiSet = ['🤝', '👋', '👏', '🤲', '💪', '✌️', '🤙', '🤛', '✊', '🙏'];
            item = { type: 'weapon', emoji: emojiSet[Math.floor(Math.random() * emojiSet.length)] };
        } else if (chance < 80) { // 15%
            emojiSet = ['📿', '🕯️', '🪔', '📗', '🕋', '🕌', '🌜', '☪️', '🤲', '🕊️'];
            item = { type: 'shield', emoji: emojiSet[Math.floor(Math.random() * emojiSet.length)] };
        } else { // 20%
            return; // No drop
        }

        const dropped = document.createElement('div');
        dropped.className = 'dropped-item';
        dropped.textContent = item.emoji;
        dropped.dataset.type = item.type;
        const gameAreaRect = gameArea.getBoundingClientRect();
        dropped.style.left = `${rect.left - gameAreaRect.left}px`;
        dropped.style.top = `${rect.top - gameAreaRect.top}px`;
        gameArea.appendChild(dropped);
    }

    // *** FIX: Heavily modified this function for correctness ***
    function applyItemEffect(item) {
        const type = item.dataset.type;

        switch (type) {
            case 'life':
                score += 5 * scoreMultiplier;
                lives++;
                break;
            case 'points':
                score += 15 * scoreMultiplier;
                break;
            case 'slow':
                score += 5 * scoreMultiplier;
                const currentSpeed = enemySpeed;
                enemySpeed = Math.max(1, enemySpeed / 2);
                setTimeout(() => enemySpeed = currentSpeed, 10000);
                break;
            case 'multiplier':
                score += 5 * scoreMultiplier;
                scoreMultiplier = 3;
                setTimeout(() => scoreMultiplier = 1, 10000);
                break;
            case 'weapon':
                score += 5 * scoreMultiplier;
                projectiles = Math.min(20, projectiles + 1);
                break;
            case 'shield':
                score += 5 * scoreMultiplier;
                if(document.getElementById('shield')) return; // Don't stack shields
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
                const allLettersCollected = phrase.split('').every((char, i) => {
                    return char === ' ' || collectedLetters[i];
                });
                if(allLettersCollected) {
                    createPretzel();
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
        updateStars();
        drawStars();
        handleKeyboardMovement();
        moveElements();
        checkCollisions();
        updateUI(); // Moved from loop to only when state changes
        requestAnimationFrame(gameLoop);
    }

    function startGame() {
        initStars();
        window.addEventListener('resize', initStars); // Re-initialize on resize
        updateUI();
        enemyInterval = setInterval(createEnemy, 1000);
        setInterval(() => {
            if (!isGameOver) enemySpeed += 0.2;
        }, 5000);
        letterInterval = setInterval(createLetter, 10000);

        // Auto-fire interval
        setInterval(() => {
            if (isShooting) {
                 shoot();
            }
        }, 300); // Fire rate

        gameLoop();
    }

    function gameOver() {
        isGameOver = true;
        clearInterval(enemyInterval);
        clearInterval(letterInterval);
        finalScoreDisplay.textContent = score;
        gameOverScreen.style.display = 'block';
        gameArea.querySelectorAll('*').forEach(el => el.remove());
    }

    function gameWin() {
        isGameOver = true;
        clearInterval(enemyInterval);
        clearInterval(letterInterval);
        winScoreDisplay.textContent = score;
        gameWinScreen.style.display = 'block';
        gameArea.querySelectorAll('*').forEach(el => el.remove());
    }

    startGame();
});
