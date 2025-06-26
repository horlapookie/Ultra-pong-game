// Ultra Pong Master - The Most Advanced Ping Pong Game Ever Created

class UltraPongMaster {
    constructor() {
        this.initializeGame();
        this.setupEventListeners();
        this.startLoadingSequence();
    }

    // Game State Management
    initializeGame() {
        // Game Constants - Table Tennis Layout
        this.CANVAS_W = 800;
        this.CANVAS_H = 500;
        this.PADDLE_W = 15; // Vertical paddle width (thin side)
        this.PADDLE_H = 80; // Vertical paddle height
        this.BALL_SIZE = 12;
        this.BASE_BALL_SPEED = 8; // Much faster ball
        this.BASE_AI_SPEED = 6;
        this.POINTS_TO_WIN = 11; // Standard table tennis scoring
        this.MAX_LEVEL = 30;
        this.NET_HEIGHT = 4;
        this.TABLE_WIDTH = this.CANVAS_W - 40; // Table boundaries
        this.TABLE_HEIGHT = this.CANVAS_H - 40;
        this.TABLE_X = 20;
        this.TABLE_Y = 20;

        // Game State
        this.currentScreen = 'loading';
        this.gameState = 'menu';
        this.currentLevel = 1;
        this.playerScore = 0;
        this.aiScore = 0;
        this.gameStartTime = 0;
        this.levelStartTime = 0;
        this.gameTime = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.twoPlayerMode = false;

        // User System
        this.userData = {
            username: '',
            level: 1,
            totalCoins: 500,
            totalGems: 10,
            totalWins: 0,
            totalStars: 0,
            winStreak: 0,
            currentStreak: 0,
            levelsCompleted: 0,
            achievements: [],
            unlockedLevels: 1,
            ownedItems: {
                paddles: ['classic'],
                balls: ['classic'],
                powerups: [],
                themes: ['classic']
            },
            equippedItems: {
                paddle: 'classic',
                ball: 'classic',
                theme: 'classic'
            },
            settings: {
                soundVolume: 70,
                musicVolume: 50,
                hapticFeedback: true,
                visualEffects: true,
                darkMode: true
            }
        };

        // Game Objects
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.powerUps = [];
        this.ballTrail = [];
        this.activePowerUps = [];

        // Ball and Paddle Properties
        this.ballX = 0;
        this.ballY = 0;
        this.ballVelX = 0;
        this.ballVelY = 0;
        this.ballGlow = 0;
        this.bottomPaddleX = 0;
        this.topPaddleX = 0;
        this.leftPressed = false;
        this.rightPressed = false;

        // Store Data
        this.storeItems = this.initializeStoreItems();
        this.achievements = this.initializeAchievements();

        // Load saved data
        this.loadUserData();
    }

    // Store Items Configuration
    initializeStoreItems() {
        return {
            paddles: [
                { id: 'classic', name: 'Classic Paddle', icon: '🏓', price: 0, description: 'The original paddle', owned: true },
                { id: 'fire', name: 'Fire Paddle', icon: '🔥', price: 100, description: 'Adds fire trail effect', owned: false },
                { id: 'ice', name: 'Ice Paddle', icon: '❄️', price: 150, description: 'Slows down the ball', owned: false },
                { id: 'lightning', name: 'Lightning Paddle', icon: '⚡', price: 200, description: 'Faster ball returns', owned: false },
                { id: 'rainbow', name: 'Rainbow Paddle', icon: '🌈', price: 300, description: 'Multicolor effects', owned: false },
                { id: 'diamond', name: 'Diamond Paddle', icon: '💎', price: 500, description: 'Premium paddle with special effects', owned: false }
            ],
            balls: [
                { id: 'classic', name: 'Classic Ball', icon: '⚪', price: 0, description: 'Standard white ball', owned: true },
                { id: 'soccer', name: 'Soccer Ball', icon: '⚽', price: 80, description: 'Curved ball movement', owned: false },
                { id: 'basketball', name: 'Basketball', icon: '🏀', price: 120, description: 'Bouncy ball physics', owned: false },
                { id: 'tennis', name: 'Tennis Ball', icon: '🎾', price: 100, description: 'Faster speed', owned: false },
                { id: 'disco', name: 'Disco Ball', icon: '🪩', price: 250, description: 'Colorful light effects', owned: false },
                { id: 'bomb', name: 'Bomb Ball', icon: '💣', price: 400, description: 'Explosive effects on hit', owned: false }
            ],
            powerups: [
                { id: 'speed', name: 'Speed Boost', icon: '💨', price: 50, description: 'Temporary speed increase', owned: false },
                { id: 'size', name: 'Big Paddle', icon: '📏', price: 75, description: 'Larger paddle size', owned: false },
                { id: 'multiball', name: 'Multi Ball', icon: '⚪⚪', price: 100, description: 'Two balls at once', owned: false },
                { id: 'shield', name: 'Shield', icon: '🛡️', price: 125, description: 'Protective barrier', owned: false },
                { id: 'magnet', name: 'Ball Magnet', icon: '🧲', price: 150, description: 'Attracts ball to paddle', owned: false },
                { id: 'freeze', name: 'Time Freeze', icon: '⏰', price: 200, description: 'Slows down time', owned: false }
            ],
            themes: [
                { id: 'classic', name: 'Classic Theme', icon: '🏓', price: 0, description: 'Original blue and red', owned: true },
                { id: 'neon', name: 'Neon Glow', icon: '✨', price: 150, description: 'Bright neon colors', owned: false },
                { id: 'space', name: 'Space Theme', icon: '🌌', price: 200, description: 'Cosmic background', owned: false },
                { id: 'retro', name: 'Retro Arcade', icon: '👾', price: 180, description: '8-bit style graphics', owned: false },
                { id: 'nature', name: 'Nature Theme', icon: '🌿', price: 220, description: 'Forest environment', owned: false },
                { id: 'cyberpunk', name: 'Cyberpunk', icon: '🤖', price: 350, description: 'Futuristic neon city', owned: false }
            ]
        };
    }

    // Achievements System
    initializeAchievements() {
        return [
            { id: 'first_win', name: 'First Victory', icon: '🏆', description: 'Win your first level', unlocked: false, reward: 50 },
            { id: 'level_5', name: 'Level 5 Master', icon: '⭐', description: 'Complete level 5', unlocked: false, reward: 100 },
            { id: 'level_10', name: 'Level 10 Champion', icon: '👑', description: 'Complete level 10', unlocked: false, reward: 200 },
            { id: 'speed_demon', name: 'Speed Demon', icon: '💨', description: 'Win a level in under 30 seconds', unlocked: false, reward: 150 },
            { id: 'combo_master', name: 'Combo Master', icon: '🔥', description: 'Achieve a 10-hit combo', unlocked: false, reward: 100 },
            { id: 'perfect_game', name: 'Perfect Game', icon: '💯', description: 'Win 5-0 without missing', unlocked: false, reward: 250 },
            { id: 'coin_collector', name: 'Coin Collector', icon: '💰', description: 'Collect 1000 coins', unlocked: false, reward: 100 },
            { id: 'shopping_spree', name: 'Shopping Spree', icon: '🛒', description: 'Buy 5 store items', unlocked: false, reward: 200 },
            { id: 'level_20', name: 'Legend Status', icon: '🏅', description: 'Complete level 20', unlocked: false, reward: 500 },
            { id: 'pong_master', name: 'Pong Master', icon: '👑', description: 'Complete all 30 levels', unlocked: false, reward: 1000 }
        ];
    }

    // Loading Sequence
    startLoadingSequence() {
        const loadingProgress = document.getElementById('loadingProgress');
        const loadingText = document.getElementById('loadingText');

        const loadingSteps = [
            { progress: 20, text: 'Loading game engine...' },
            { progress: 40, text: 'Initializing physics...' },
            { progress: 60, text: 'Loading store items...' },
            { progress: 80, text: 'Setting up achievements...' },
            { progress: 100, text: 'Ready to play!' }
        ];

        let currentStep = 0;
        const interval = setInterval(() => {
            if (currentStep < loadingSteps.length) {
                const step = loadingSteps[currentStep];
                loadingProgress.style.width = step.progress + '%';
                loadingText.textContent = step.text;
                currentStep++;
            } else {
                clearInterval(interval);
                setTimeout(() => this.showWelcomeScreen(), 500);
            }
        }, 600);
    }

    // Screen Management
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        document.getElementById(screenId).classList.remove('hidden');
        this.currentScreen = screenId;

        if (screenId === 'gameScreen') {
            this.initializeCanvas();
            this.startGame();
        }
    }

    showWelcomeScreen() {
        this.showScreen('welcomeScreen');
    }

    showHomeScreen() {
        this.showScreen('homeScreen');
        this.updateHomeScreenUI();
    }

    // Canvas Initialization
    initializeCanvas() {
        this.canvas = document.getElementById('pongCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Set responsive canvas size
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        const scale = Math.min(rect.width / this.CANVAS_W, rect.height / this.CANVAS_H);

        this.canvas.style.width = (this.CANVAS_W * scale) + 'px';
        this.canvas.style.height = (this.CANVAS_H * scale) + 'px';

        // Setup touch controls for mobile
        this.setupTouchPaddleControl();

        this.resetGame();
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Welcome Screen
        document.getElementById('loginBtn').addEventListener('click', () => this.handleLogin());
        document.getElementById('usernameInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLogin();
        });

        // Navigation
        document.getElementById('backToHome').addEventListener('click', () => this.showHomeScreen());
        document.getElementById('backToHomeFromStore').addEventListener('click', () => this.showHomeScreen());
        document.getElementById('backToHomeFromAchievements').addEventListener('click', () => this.showHomeScreen());

        // Home Screen Buttons
        document.getElementById('playBtn').addEventListener('click', () => this.showScreen('gameScreen'));
        document.getElementById('levelsBtn').addEventListener('click', () => this.showLevelScreen());
        document.getElementById('storeBtn').addEventListener('click', () => this.showStoreScreen());
        document.getElementById('achievementsBtn').addEventListener('click', () => this.showAchievementsScreen());
        document.getElementById('settingsBtn').addEventListener('click', () => this.showSettingsModal());

        // Game Controls
        document.getElementById('pauseGame').addEventListener('click', () => this.pauseGame());
        document.getElementById('quitGame').addEventListener('click', () => this.quitGame());

        // Mobile Controls
        this.setupMobileControls();

        // Store Tabs
        document.querySelectorAll('.store-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchStoreTab(e.target.dataset.tab));
        });

        // Settings Modal
        document.getElementById('closeSettings').addEventListener('click', () => this.hideSettingsModal());
        document.getElementById('resetProgress').addEventListener('click', () => this.resetProgress());

        // Results Screen
        document.getElementById('nextLevelBtn').addEventListener('click', () => this.nextLevel());
        document.getElementById('replayLevelBtn').addEventListener('click', () => this.replayLevel());
        document.getElementById('retryLevelBtn').addEventListener('click', () => this.replayLevel());
        document.getElementById('homeFromResults').addEventListener('click', () => this.showHomeScreen());
        document.getElementById('homeFromDefeat').addEventListener('click', () => this.showHomeScreen());

        // Keyboard Controls
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Mouse Controls
        if (this.canvas) {
            this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        }

        // Add event listener for two-player mode toggle
        document.getElementById('twoPlayerToggle').addEventListener('change', () => {
            this.twoPlayerMode = document.getElementById('twoPlayerToggle').checked;
        });
    }

    // Mobile Controls
    setupMobileControls() {
        const pauseBtn = document.getElementById('pauseBtn');
        const powerUpBtn = document.getElementById('powerUpBtn');

        // Touch controls for paddle dragging
        this.setupTouchPaddleControl();

        pauseBtn.addEventListener('click', () => this.pauseGame());
        powerUpBtn.addEventListener('click', () => this.activatePowerUp());
    }

    // Touch-based paddle control
    setupTouchPaddleControl() {
        // Touch events for canvas
        if (this.canvas) {
            this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
            this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
            this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        }

        // Add touch listeners when canvas is created
        this.touchStarted = false;
        this.touchStartY = 0;
        this.paddleOffset = 0;
    }

    handleTouchStart(e) {
        if (this.gameState !== 'playing') return;
        e.preventDefault();

        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const touchY = touch.clientY - rect.top;
        const scale = this.canvas.height / rect.height;
        const actualTouchY = touchY * scale;

        // Check if touch is near the bottom paddle
        const paddleWidth = this.getPaddleSize();
        const paddleCenterX = this.bottomPaddleX + paddleWidth / 2;

        if (Math.abs(actualTouchY - paddleCenterX) < paddleWidth / 2 + 30) {
            this.touchStarted = true;
            this.touchStartY = actualTouchY;
            this.paddleOffset = actualTouchY - paddleCenterX;
            this.hapticFeedback(20);
        }
    }

    handleTouchMove(e) {
        if (this.gameState !== 'playing' || !this.touchStarted) return;
        e.preventDefault();

        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const touchY = touch.clientY - rect.top;
        const scale = this.canvas.height / rect.height;
        const actualTouchY = touchY * scale;

        // Move paddle to follow touch
        const paddleWidth = this.getPaddleSize();
        this.bottomPaddleX = actualTouchY - this.paddleOffset - paddleWidth / 2;
        this.clampPaddle();
    }

    handleTouchEnd(e) {
        if (this.gameState !== 'playing') return;
        e.preventDefault();

        this.touchStarted = false;
        this.touchStartY = 0;
        this.paddleOffset = 0;
    }

    // User System
    handleLogin() {
        const username = document.getElementById('usernameInput').value.trim();
        if (username) {
            this.userData.username = username;
            this.saveUserData();
            this.showHomeScreen();
            this.playSound(1200, 0.3);
        } else {
            this.showNotification('Please enter a username!', 'warning');
        }
    }

    // Quick login function for demo users
    quickLogin(username) {
        this.userData.username = username;
        this.saveUserData();
        this.showHomeScreen();
        this.playSound(1200, 0.3);
    }

    // Update UI
    updateHomeScreenUI() {
        document.getElementById('currentUsername').textContent = this.userData.username;
        document.getElementById('userLevel').textContent = this.userData.level;
        document.getElementById('totalCoins').textContent = this.userData.totalCoins;
        document.getElementById('totalGems').textContent = this.userData.totalGems;
        document.getElementById('currentLevel').textContent = this.currentLevel;
        document.getElementById('totalWins').textContent = this.userData.totalWins;
        document.getElementById('totalStars').textContent = this.userData.totalStars;
        document.getElementById('winStreak').textContent = this.userData.currentStreak;
    }

    // Level Selection Screen
    showLevelScreen() {
        this.showScreen('levelScreen');
        this.generateLevelButtons();
    }

    generateLevelButtons() {
        const container = document.getElementById('levelsContainer');
        container.innerHTML = '';

        for (let i = 1; i <= this.MAX_LEVEL; i++) {
            const levelItem = document.createElement('div');
            levelItem.className = 'level-item';

            if (i <= this.userData.unlockedLevels) {
                if (i < this.userData.unlockedLevels) {
                    levelItem.classList.add('completed');
                }
                levelItem.addEventListener('click', () => this.selectLevel(i));
            } else {
                levelItem.classList.add('locked');
            }

            const difficulty = this.getLevelDifficulty(i);
            const stars = this.getLevelStars(i);

            levelItem.innerHTML = `
                <div class="level-number">${i}</div>
                <div class="level-stars">${stars}</div>
                <div class="level-difficulty">${difficulty}</div>
            `;

            container.appendChild(levelItem);
        }

        document.getElementById('levelsCompleted').textContent = this.userData.levelsCompleted;
    }

    getLevelDifficulty(level) {
        if (level <= 5) return 'Easy';
        if (level <= 15) return 'Medium';
        if (level <= 25) return 'Hard';
        return 'Expert';
    }

    getLevelStars(level) {
        if (level < this.userData.unlockedLevels) {
            return '⭐⭐⭐'; // Full stars for completed levels
        }
        return '☆☆☆'; // Empty stars for uncompleted levels
    }

    selectLevel(level) {
        this.currentLevel = level;
        this.showScreen('gameScreen');
        this.playSound(1000, 0.2);
    }

    // Store System
    showStoreScreen() {
        this.showScreen('storeScreen');
        this.updateStoreUI();
        this.generateStoreItems('paddles');
    }

    updateStoreUI() {
        document.getElementById('storeCoins').textContent = this.userData.totalCoins;
        document.getElementById('storeGems').textContent = this.userData.totalGems;
    }

    switchStoreTab(tab) {
        document.querySelectorAll('.store-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.store-section').forEach(s => s.classList.remove('active'));

        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        document.getElementById(`${tab}Store`).classList.add('active');

        this.generateStoreItems(tab);
    }

    generateStoreItems(category) {
        const container = document.getElementById(`${category}Store`).querySelector('.store-items');
        container.innerHTML = '';

        this.storeItems[category].forEach(item => {
            const isOwned = this.userData.ownedItems[category].includes(item.id);
            const isEquipped = this.userData.equippedItems[category.slice(0, -1)] === item.id;

            const storeItem = document.createElement('div');
            storeItem.className = 'store-item';
            if (isOwned) storeItem.classList.add('owned');
            if (isEquipped) storeItem.classList.add('equipped');

            const buttonText = isEquipped ? 'EQUIPPED' : isOwned ? 'EQUIP' : 'BUY';
            const buttonAction = isEquipped ? '' : isOwned ? `onclick="game.equipItem('${category}', '${item.id}')"` : `onclick="game.buyItem('${category}', '${item.id}')"`;

            storeItem.innerHTML = `
                <span class="item-icon">${item.icon}</span>
                <div class="item-name">${item.name}</div>
                <div class="item-description">${item.description}</div>
                <div class="item-price">${item.price === 0 ? 'FREE' : item.price + '💰'}</div>
                <button class="item-button" ${buttonAction}>${buttonText}</button>
            `;

            container.appendChild(storeItem);
        });
    }

    buyItem(category, itemId) {
        const item = this.storeItems[category].find(i => i.id === itemId);
        if (this.userData.totalCoins >= item.price) {
            this.userData.totalCoins -= item.price;
            this.userData.ownedItems[category].push(itemId);
            this.saveUserData();
            this.updateStoreUI();
            this.generateStoreItems(category);
            this.playSound(1500, 0.3);
            this.showNotification(`Purchased ${item.name}!`, 'success');

            // Check shopping achievement
            this.checkShoppingAchievement();
        } else {
            this.showNotification('Not enough coins!', 'error');
            this.playSound(300, 0.5);
        }
    }

    equipItem(category, itemId) {
        const categoryKey = category.slice(0, -1); // Remove 's' from the end
        this.userData.equippedItems[categoryKey] = itemId;
        this.saveUserData();
        this.generateStoreItems(category);
        this.playSound(1000, 0.2);
        this.showNotification('Item equipped!', 'success');
    }

    // Achievements System
    showAchievementsScreen() {
        this.showScreen('achievementsScreen');
        this.generateAchievements();
    }

    generateAchievements() {
        const container = document.getElementById('achievementsContainer');
        container.innerHTML = '';

        this.achievements.forEach(achievement => {
            const isUnlocked = this.userData.achievements.includes(achievement.id);

            const achItem = document.createElement('div');
            achItem.className = `achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`;

            achItem.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-description">${achievement.description}</div>
                    <div class="achievement-reward">Reward: ${achievement.reward} coins</div>
                </div>
                <div class="achievement-status">${isUnlocked ? '✓' : '🔒'}</div>
            `;

            container.appendChild(achItem);
        });

        document.getElementById('achievementsUnlocked').textContent = this.userData.achievements.length;
    }

    // Game Logic
    startGame() {
        this.gameState = 'playing';
        this.gameStartTime = Date.now();
        this.levelStartTime = Date.now();
        this.playerScore = 0;
        this.aiScore = 0;
        this.combo = 0;
        this.resetBall();
        this.gameLoop();
        this.startGameTimer();
        this.playSound(1200, 0.3);
    }

    resetGame() {
        this.bottomPaddleX = this.CANVAS_W / 2 - this.PADDLE_W / 2;
        this.topPaddleX = this.CANVAS_W / 2 - this.PADDLE_W / 2;
        this.resetBall();
        this.particles = [];
        this.ballTrail = [];
        this.activePowerUps = [];
    }

    resetBall() {
        this.ballX = this.CANVAS_W / 2 - this.BALL_SIZE / 2;
        this.ballY = this.CANVAS_H / 2 - this.BALL_SIZE / 2;
        this.ballVelX = this.getBallSpeed() * (Math.random() > 0.5 ? 1 : -1);
        this.ballVelY = this.getBallSpeed() * (Math.random() * 2 - 1);
        this.ballTrail = [];
    }

    getBallSpeed() {
        return this.BASE_BALL_SPEED + (this.currentLevel * 0.3);
    }

    getAISpeed() {
        return this.BASE_AI_SPEED + (this.currentLevel * 0.2);
    }

    getPaddleSize() {
        return Math.max(60, this.PADDLE_W - (this.currentLevel * 2));
    }

    // Game Loop
    gameLoop() {
        if (this.gameState === 'playing') {
            this.update();
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
        }
    }

    update() {
        if (this.gameState !== 'playing') return;

        // Paddle position is now controlled by touch or mouse
        this.clampPaddle();

        // Ball movement
        this.ballX += this.ballVelX;
        this.ballY += this.ballVelY;

        // Wall collisions
        if (this.ballX <= 0 || this.ballX + this.BALL_SIZE >= this.CANVAS_W) {
            this.ballVelX = -this.ballVelX;
            this.ballX = this.ballX <= 0 ? 0 : this.CANVAS_W - this.BALL_SIZE;
            this.playSound(800, 0.1);
            this.createParticles(this.ballX <= 0 ? 0 : this.CANVAS_W, this.ballY + this.BALL_SIZE / 2, '#00ff88');
        }

        if (this.ballY <= 0 || this.ballY + this.BALL_SIZE >= this.CANVAS_H) {
            this.ballVelY = -this.ballVelY;
            this.ballY = this.ballY <= 0 ? 0 : this.CANVAS_H - this.BALL_SIZE;
            this.playSound(800, 0.1);
            this.createParticles(this.ballX + this.BALL_SIZE / 2, this.ballY <= 0 ? 0 : this.CANVAS_H, '#00ff88');
        }

        // Paddle collisions
        this.checkPaddleCollisions();

        // Scoring
        this.checkScoring();

        // AI movement
        if (!this.twoPlayerMode) {
            this.updateAI();
        }

        // Update particles
        this.updateParticles();

        // Update power-ups
        this.updatePowerUps();
    }

    checkPaddleCollisions() {
        const paddleWidth = this.getPaddleSize();

        // Bottom paddle collision
        if (this.collide(this.bottomPaddleX, this.CANVAS_H - this.PADDLE_H)) {
            this.ballVelY = -Math.abs(this.ballVelY);
            this.ballVelX = this.calculateBallAngle(this.bottomPaddleX, paddleWidth);
            this.playSound(600, 0.15);
            this.createParticles(this.bottomPaddleX + paddleWidth / 2, this.CANVAS_H - this.PADDLE_H, '#00ff88');
            this.increaseCombo();
        }

        // Top paddle collision (AI or Player 2)
        if (this.collide(this.topPaddleX, 0)) {
            this.ballVelY = Math.abs(this.ballVelY);
            this.ballVelX = this.calculateBallAngle(this.topPaddleX, paddleWidth);
            this.playSound(400, 0.15);
            this.createParticles(this.topPaddleX + paddleWidth / 2, 0, '#ff4757');
        }
    }

    collide(paddleX, paddleY) {
        const paddleWidth = this.getPaddleSize();
        const distance = Math.sqrt(
            Math.pow((this.ballX + this.BALL_SIZE / 2) - (paddleX + paddleWidth / 2), 2) +
            Math.pow((this.ballY + this.BALL_SIZE / 2) - paddleY, 2)
        );
        return distance < (paddleWidth / 2 + this.BALL_SIZE / 2);
    }

    calculateBallAngle(paddleX, paddleWidth) {
        const collidePoint = (this.ballX + this.BALL_SIZE / 2) - (paddleX + paddleWidth / 2);
        const normalizedPoint = collidePoint / (paddleWidth / 2);
        return this.getBallSpeed() * normalizedPoint;
    }

    checkScoring() {
        if (this.ballY < 0) {
            this.aiScore++;
            this.combo = 0;
            this.playSound(200, 0.5, 'sawtooth');

            if (this.aiScore >= this.POINTS_TO_WIN) {
                this.gameState = 'defeat';
                this.showDefeatScreen();
            } else {
                this.resetBall();
            }
        } else if (this.ballY + this.BALL_SIZE > this.CANVAS_H) {
            this.playerScore++;
            this.playSound(1000, 0.3, 'square');

            if (this.playerScore >= this.POINTS_TO_WIN) {
                this.gameState = 'victory';
                this.showVictoryScreen();
            } else {
                this.resetBall();
            }
        }

        // Update UI
        document.getElementById('playerScore').textContent = this.playerScore;
        document.getElementById('aiScore').textContent = this.aiScore;
    }

    updateAI() {
        const paddleWidth = this.getPaddleSize();
        let targetX = this.ballX - (paddleWidth / 2) + (this.BALL_SIZE / 2);
        const aiSpeed = this.getAISpeed();

        // Add some randomness for difficulty
        if (Math.random() < 0.03 + (this.currentLevel * 0.001)) {
            targetX += (Math.random() - 0.5) * (60 - this.currentLevel);
        }

        if (this.topPaddleX + paddleWidth / 2 < targetX) {
            this.topPaddleX += aiSpeed;
        } else if (this.topPaddleX + paddleWidth / 2 > targetX) {
            this.topPaddleX -= aiSpeed;
        }

        // Clamp AI paddle
        if (this.topPaddleX < 0) this.topPaddleX = 0;
        if (this.topPaddleX > this.CANVAS_W - paddleWidth) {
            this.topPaddleX = this.CANVAS_W - paddleWidth;
        }
    }

    clampPaddle() {
        const paddleWidth = this.getPaddleSize();
        if (this.bottomPaddleX < 0) this.bottomPaddleX = 0;
        if (this.bottomPaddleX > this.CANVAS_W - paddleWidth) {
            this.bottomPaddleX = this.CANVAS_W - paddleWidth;
        }
    }

    // Drawing Functions
    draw() {
        this.drawBackground();
        this.drawNet();
        this.drawParticles();
        this.drawPaddles();
        this.drawBall();
        this.drawUI();
        this.drawPowerUps();
    }

    drawBackground() {
        const theme = this.userData.equippedItems.theme;

        if (theme === 'space') {
            this.drawSpaceBackground();
        } else if (theme === 'neon') {
            this.drawNeonBackground();
        } else {
            this.drawClassicBackground();
        }
    }

    drawClassicBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, this.CANVAS_W, 0);
        gradient.addColorStop(0, '#0f0f23');
        gradient.addColorStop(0.5, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.CANVAS_W, this.CANVAS_H);

        // Center line
        this.ctx.strokeStyle = '#444';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([15, 10]);
        this.ctx.lineDashOffset = Date.now() * 0.02;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.CANVAS_H / 2);
        this.ctx.lineTo(this.CANVAS_W, this.CANVAS_H / 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    drawSpaceBackground() {
        this.ctx.fillStyle = '#000011';
        this.ctx.fillRect(0, 0, this.CANVAS_W, this.CANVAS_H);

        // Draw stars
        for (let i = 0; i < 50; i++) {
            const x = (i * 137) % this.CANVAS_W;
            const y = (i * 73) % this.CANVAS_H;
            const brightness = Math.sin(Date.now() * 0.001 + i) * 0.5 + 0.5;

            this.ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
            this.ctx.fillRect(x, y, 2, 2);
        }
    }

    drawNeonBackground() {
        this.ctx.fillStyle = '#001122';
        this.ctx.fillRect(0, 0, this.CANVAS_W, this.CANVAS_H);

        // Neon grid
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.3;

        for (let x = 0; x < this.CANVAS_W; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.CANVAS_H);
            this.ctx.stroke();
        }

        for (let y = 0; y < this.CANVAS_H; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.CANVAS_W, y);
            this.ctx.stroke();
        }

        this.ctx.globalAlpha = 1;
    }

    drawNet() {
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, this.CANVAS_H / 2 - this.NET_HEIGHT / 2, this.CANVAS_W, this.NET_HEIGHT);
    }

    drawPaddles() {
        const paddleWidth = this.getPaddleSize();
        const paddleType = this.userData.equippedItems.paddle;

        // Bottom paddle
        this.ctx.save();
        this.ctx.shadowBlur = 25;
        this.ctx.shadowColor = this.getPaddleColor(paddleType);
        this.ctx.fillStyle = this.getPaddleColor(paddleType);
        this.ctx.beginPath();
        this.ctx.rect(this.bottomPaddleX, this.CANVAS_H - this.PADDLE_H, paddleWidth, this.PADDLE_H);
        this.ctx.fill();
        this.ctx.restore();

        // Top paddle (AI)
        this.ctx.save();
        this.ctx.shadowBlur = 25;
        this.ctx.shadowColor = '#ff4757';
        this.ctx.fillStyle = '#ff4757';
        this.ctx.beginPath();
        this.ctx.rect(this.topPaddleX, 0, paddleWidth, this.PADDLE_H);
        this.ctx.fill();
        this.ctx.restore();
    }

    getPaddleColor(type) {
        const colors = {
            classic: '#00ff88',
            fire: '#ff4444',
            ice: '#44ccff',
            lightning: '#ffff44',
            rainbow: '#ff00ff',
            diamond: '#ffffff'
        };
        return colors[type] || colors.classic;
    }

    drawBall() {
        const ballType = this.userData.equippedItems.ball;

        // Ball trail
        this.ballTrail.push({x: this.ballX + this.BALL_SIZE / 2, y: this.ballY + this.BALL_SIZE / 2});
        if (this.ballTrail.length > 15) this.ballTrail.shift();

        for (let i = 0; i < this.ballTrail.length; i++) {
            this.ctx.save();
            this.ctx.globalAlpha = (i / this.ballTrail.length) * 0.7;
            this.ctx.fillStyle = this.getBallColor(ballType);
            this.ctx.beginPath();
            this.ctx.arc(this.ballTrail[i].x, this.ballTrail[i].y, (this.BALL_SIZE / 2) * (i / this.ballTrail.length), 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }

        // Main ball
        this.ballGlow = Math.sin(Date.now() * 0.008) * 15 + 25;
        this.ctx.save();
        this.ctx.shadowBlur = this.ballGlow;
        this.ctx.shadowColor = this.getBallColor(ballType);
        this.ctx.fillStyle = this.getBallColor(ballType);
        this.ctx.beginPath();
        this.ctx.arc(this.ballX + this.BALL_SIZE / 2, this.ballY + this.BALL_SIZE / 2, this.BALL_SIZE / 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }

    getBallColor(type) {
        const colors = {
            classic: '#ffffff',
            soccer: '#ff00ff',
            basketball: '#ff8800',
            tennis: '#88ff00',
            disco: '#ff0088',
            bomb: '#ff4444'
        };
        return colors[type] || colors.classic;
    }

    drawUI() {
        // Level display
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#fff';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#fff';
        this.ctx.fillText(`LEVEL ${this.currentLevel}`, this.CANVAS_W / 2, 40);

        // Score
        this.ctx.font = 'bold 32px Arial';
        this.ctx.fillText(`${this.playerScore} - ${this.aiScore}`, this.CANVAS_W / 2, 80);

        // Combo counter
        if (this.combo > 1) {
            this.ctx.font = 'bold 20px Arial';
            this.ctx.fillStyle = '#ffd700';
            this.ctx.fillText(`COMBO x${this.combo}`, this.CANVAS_W / 2, 120);
        }

        this.ctx.shadowBlur = 0;
    }

    // Particle System
    createParticles(x, y, color = '#fff', count = 8) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.update();
            return particle.life > 0;
        });
    }

    drawParticles() {
        this.particles.forEach(particle => particle.draw(this.ctx));
    }

    // Combo System
    increaseCombo() {
        this.combo++;
        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }

        if (this.combo >= 10) {
            this.unlockAchievement('combo_master');
        }

        // Show combo counter
        const comboCounter = document.getElementById('comboCounter');
        document.getElementById('comboValue').textContent = this.combo;
        comboCounter.classList.remove('hidden');

        setTimeout(() => {
            comboCounter.classList.add('hidden');
        }, 1000);
    }

    // Power-ups System
    activatePowerUp() {
        // Implementation for power-up activation
        this.playSound(1500, 0.2);
    }

    updatePowerUps() {
        // Update active power-ups
        this.activePowerUps = this.activePowerUps.filter(powerUp => {
            powerUp.duration--;
            return powerUp.duration > 0;
        });
    }

    drawPowerUps() {
        // Draw power-up indicators
        const indicators = document.getElementById('powerUpIndicators');
        indicators.innerHTML = '';

        this.activePowerUps.forEach(powerUp => {
            const indicator = document.createElement('div');
            indicator.className = 'power-up-indicator';
            indicator.textContent = `${powerUp.name} ${Math.ceil(powerUp.duration / 60)}s`;
            indicators.appendChild(indicator);
        });
    }

    // Game Timer
    startGameTimer() {
        this.gameTimer = setInterval(() => {
            if (this.gameState === 'playing') {
                this.gameTime = Math.floor((Date.now() - this.levelStartTime) / 1000);
                const minutes = Math.floor(this.gameTime / 60);
                const seconds = this.gameTime % 60;
                document.getElementById('gameTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }

    // Game Controls
    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.playSound(800, 0.1);
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.playSound(1000, 0.1);
            this.gameLoop();
        }
    }

    quitGame() {
        this.gameState = 'menu';
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        this.showHomeScreen();
    }

    // Victory/Defeat Screens
    showVictoryScreen() {
        const timeBonus = Math.max(0, 60 - this.gameTime) * 10;
        const baseReward = this.currentLevel * 20;
        const totalReward = baseReward + timeBonus;

        this.userData.totalCoins += totalReward;
        this.userData.totalWins++;
        this.userData.currentStreak++;
        this.userData.totalStars += 3; // Full stars for winning

        if (this.currentLevel === this.userData.unlockedLevels) {
            this.userData.unlockedLevels++;
            this.userData.levelsCompleted++;
        }

        // Check achievements
        this.checkVictoryAchievements();

        this.saveUserData();
        this.showScreen('resultsScreen');

        document.getElementById('victoryResults').classList.remove('hidden');
        document.getElementById('defeatResults').classList.add('hidden');

        document.getElementById('resultTime').textContent = `${Math.floor(this.gameTime / 60)}:${(this.gameTime % 60).toString().padStart(2, '0')}`;
        document.getElementById('resultScore').textContent = this.playerScore;
        document.getElementById('resultCoins').textContent = `+${totalReward}`;
        document.getElementById('resultStars').textContent = '⭐⭐⭐';

        this.playSound(1500, 1, 'sine');

        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
    }

    showDefeatScreen() {
        this.userData.currentStreak = 0;
        this.saveUserData();

        this.showScreen('resultsScreen');
        document.getElementById('defeatResults').classList.remove('hidden');
        document.getElementById('victoryResults').classList.add('hidden');

        this.playSound(200, 1, 'sawtooth');

        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
    }

    nextLevel() {
        if (this.currentLevel < this.MAX_LEVEL) {
            this.currentLevel++;
            this.showScreen('gameScreen');
        } else {
            this.unlockAchievement('pong_master');
            this.showHomeScreen();
        }
    }

    replayLevel() {
        this.showScreen('gameScreen');
    }

    // Achievement System
    checkVictoryAchievements() {
        // First win
        if (this.userData.totalWins === 1) {
            this.unlockAchievement('first_win');
        }

        // Level milestones
        if (this.currentLevel === 5) {
            this.unlockAchievement('level_5');
        } else if (this.currentLevel === 10) {
            this.unlockAchievement('level_10');
        } else if (this.currentLevel === 20) {
            this.unlockAchievement('level_20');
        }

        // Speed achievement
        if (this.gameTime <= 30) {
            this.unlockAchievement('speed_demon');
        }

        // Perfect game
        if (this.aiScore === 0) {
            this.unlockAchievement('perfect_game');
        }

        // Coin collector
        if (this.userData.totalCoins >= 1000) {
            this.unlockAchievement('coin_collector');
        }
    }

    checkShoppingAchievement() {
        const totalOwned = Object.values(this.userData.ownedItems).reduce((total, items) => total + items.length, 0);
        if (totalOwned >= 5) {
            this.unlockAchievement('shopping_spree');
        }
    }

    unlockAchievement(achievementId) {
        if (!this.userData.achievements.includes(achievementId)) {
            this.userData.achievements.push(achievementId);
            const achievement = this.achievements.find(a => a.id === achievementId);
            if (achievement) {
                this.userData.totalCoins += achievement.reward;
                this.showNotification(`🏆 Achievement Unlocked: ${achievement.name}`, 'success');
                this.playSound(1800, 0.5);
            }
        }
    }

    // Input Handlers
    handleKeyDown(e) {
        if (e.key === 'ArrowLeft') this.leftPressed = true;
        if (e.key === 'ArrowRight') this.rightPressed = true;
        if (e.key === ' ') {
            e.preventDefault();
            this.pauseGame();
        }
        if (e.key === 'Escape') {
            this.quitGame();
        }
    }

    handleKeyUp(e) {
        if (e.key === 'ArrowLeft') this.leftPressed = false;
        if (e.key === 'ArrowRight') this.rightPressed = false;
    }

    handleMouseMove(e) {
        if (this.gameState !== 'playing') return;
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const scale = this.canvas.width / rect.width;
        this.bottomPaddleX = (mouseX * scale) - this.getPaddleSize() / 2;
        this.clampPaddle();
    }

    // Settings
    showSettingsModal() {
        document.getElementById('settingsModal').classList.remove('hidden');
    }

    hideSettingsModal() {
        document.getElementById('settingsModal').classList.add('hidden');
    }

    resetProgress() {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
            localStorage.removeItem('ultraPongMasterData');
            location.reload();
        }
    }

    // Utility Functions
    playSound(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.userData.settings.soundVolume) return;

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = type;

            const adjustedVolume = (volume * this.userData.settings.soundVolume) / 100;
            gainNode.gain.setValueAtTime(adjustedVolume, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (e) {
            console.log('Audio not available');
        }
    }

    hapticFeedback(strength = 30) {
        if (this.userData.settings.hapticFeedback && navigator.vibrate) {
            navigator.vibrate(strength);
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #00ff88, #ffd700);
            color: #000;
            padding: 15px 25px;
            border-radius: 15px;
            font-weight: bold;
            z-index: 10000;
            animation: slideInRight 0.5s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease-in';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    }

    // Data Persistence
    saveUserData() {
        localStorage.setItem('ultraPongMasterData', JSON.stringify(this.userData));
    }

    loadUserData() {
        const saved = localStorage.getItem('ultraPongMasterData');
        if (saved) {
            const loadedData = JSON.parse(saved);
            this.userData = { ...this.userData, ...loadedData };

            // Update store items owned status
            Object.keys(this.storeItems).forEach(category => {
                this.storeItems[category].forEach(item => {
                    item.owned = this.userData.ownedItems[category].includes(item.id);
                });
            });
        }
    }
}

// Particle Class
class Particle {
    constructor(x, y, color = '#fff', size = 3) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 12;
        this.vy = (Math.random() - 0.5) * 12;
        this.life = 1.0;
        this.decay = Math.random() * 0.02 + 0.01;
        this.color = color;
        this.size = size;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.vx *= 0.98;
        this.vy *= 0.98;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Initialize the game when the page loads
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new UltraPongMaster();
});

// Make quickLogin available globally for the HTML buttons
window.quickLogin = (username) => {
    if (game) {
        game.quickLogin(username);
    }
};