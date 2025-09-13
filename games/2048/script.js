// Game 2048 - Advanced Implementation
class Game2048 {
    constructor() {
        this.board = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('2048-best-score')) || 0;
        this.moves = 0;
        this.gameWon = false;
        this.gameOver = false;
        this.paused = false;
        this.animations = new Map();
        
        this.initializeGame();
        this.setupEventListeners();
        this.updateDisplay();
    }

    initializeGame() {
        // Initialize empty board
        this.board = Array(4).fill().map(() => Array(4).fill(0));
        
        // Add two initial tiles
        this.addRandomTile();
        this.addRandomTile();
        
        // Render the board
        this.renderBoard();
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.gameOver || this.paused) return;
            
            const keyActions = {
                'ArrowUp': () => this.move('up'),
                'ArrowDown': () => this.move('down'),
                'ArrowLeft': () => this.move('left'),
                'ArrowRight': () => this.move('right'),
                'w': () => this.move('up'),
                's': () => this.move('down'),
                'a': () => this.move('left'),
                'd': () => this.move('right'),
                ' ': () => this.togglePause() // Spacebar to pause
            };
            
            if (keyActions[e.key]) {
                e.preventDefault();
                keyActions[e.key]();
            }
        });

        // Touch controls for mobile
        let startX, startY;
        const gameBoard = document.getElementById('game-board');
        
        gameBoard.addEventListener('touchstart', (e) => {
            if (this.gameOver || this.paused) return;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        gameBoard.addEventListener('touchend', (e) => {
            if (this.gameOver || this.paused || !startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;
            const minSwipeDistance = 50;
            
            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Horizontal swipe
                if (Math.abs(diffX) > minSwipeDistance) {
                    if (diffX > 0) {
                        this.move('left');
                    } else {
                        this.move('right');
                    }
                }
            } else {
                // Vertical swipe
                if (Math.abs(diffY) > minSwipeDistance) {
                    if (diffY > 0) {
                        this.move('up');
                    } else {
                        this.move('down');
                    }
                }
            }
            
            startX = startY = null;
        });

        // Prevent scrolling on touch devices
        document.addEventListener('touchmove', (e) => {
            if (e.target.closest('#game-board')) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    addRandomTile() {
        const emptyCells = [];
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (this.board[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            // 90% chance for 2, 10% chance for 4
            this.board[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    move(direction) {
        const oldBoard = this.board.map(row => [...row]);
        let moved = false;
        
        switch (direction) {
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
        }
        
        if (moved) {
            this.moves++;
            this.addRandomTile();
            this.updateDisplay();
            
            // Use animated rendering for smooth transitions
            this.renderBoardWithAnimation(oldBoard, this.board);
            
            // Check for win condition
            if (!this.gameWon && this.hasWon()) {
                this.gameWon = true;
                setTimeout(() => {
                    this.showGameOverModal(true);
                }, 500); // Wait for animations to complete
            }
            // Check for game over
            else if (this.isGameOver()) {
                this.gameOver = true;
                setTimeout(() => {
                    this.showGameOverModal(false);
                }, 500); // Wait for animations to complete
            }
        }
    }

    moveLeft() {
        let moved = false;
        for (let row = 0; row < 4; row++) {
            const oldRow = [...this.board[row]];
            this.board[row] = this.slideArray(this.board[row]);
            if (JSON.stringify(oldRow) !== JSON.stringify(this.board[row])) {
                moved = true;
            }
        }
        return moved;
    }

    moveRight() {
        let moved = false;
        for (let row = 0; row < 4; row++) {
            const oldRow = [...this.board[row]];
            this.board[row] = this.slideArray(this.board[row].reverse()).reverse();
            if (JSON.stringify(oldRow) !== JSON.stringify(this.board[row])) {
                moved = true;
            }
        }
        return moved;
    }

    moveUp() {
        let moved = false;
        for (let col = 0; col < 4; col++) {
            const oldCol = [this.board[0][col], this.board[1][col], this.board[2][col], this.board[3][col]];
            const newCol = this.slideArray(oldCol);
            for (let row = 0; row < 4; row++) {
                if (this.board[row][col] !== newCol[row]) {
                    moved = true;
                }
                this.board[row][col] = newCol[row];
            }
        }
        return moved;
    }

    moveDown() {
        let moved = false;
        for (let col = 0; col < 4; col++) {
            const oldCol = [this.board[0][col], this.board[1][col], this.board[2][col], this.board[3][col]];
            const newCol = this.slideArray(oldCol.reverse()).reverse();
            for (let row = 0; row < 4; row++) {
                if (this.board[row][col] !== newCol[row]) {
                    moved = true;
                }
                this.board[row][col] = newCol[row];
            }
        }
        return moved;
    }

    slideArray(arr) {
        // Remove zeros
        let filtered = arr.filter(val => val !== 0);
        
        // Merge adjacent equal values
        for (let i = 0; i < filtered.length - 1; i++) {
            if (filtered[i] === filtered[i + 1]) {
                filtered[i] *= 2;
                this.score += filtered[i];
                filtered.splice(i + 1, 1);
            }
        }
        
        // Pad with zeros
        while (filtered.length < 4) {
            filtered.push(0);
        }
        
        return filtered;
    }

    hasWon() {
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (this.board[row][col] === 2048) {
                    return true;
                }
            }
        }
        return false;
    }

    isGameOver() {
        // Check if there are empty cells
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (this.board[row][col] === 0) {
                    return false;
                }
            }
        }
        
        // Check if any adjacent cells can be merged
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const current = this.board[row][col];
                if (
                    (row < 3 && this.board[row + 1][col] === current) ||
                    (col < 3 && this.board[row][col + 1] === current)
                ) {
                    return false;
                }
            }
        }
        
        return true;
    }

    renderBoard() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.style.gridRow = row + 1;
                tile.style.gridColumn = col + 1;
                
                const value = this.board[row][col];
                if (value !== 0) {
                    tile.textContent = value;
                    tile.classList.add(`tile-${value}`);
                    tile.classList.add('new');
                    
                    // Add merge animation if this tile was just created
                    setTimeout(() => {
                        tile.classList.remove('new');
                    }, 300);
                }
                
                gameBoard.appendChild(tile);
            }
        }
    }

    renderBoardWithAnimation(oldBoard, newBoard) {
        const gameBoard = document.getElementById('game-board');
        const tiles = gameBoard.querySelectorAll('.tile');
        
        // Create a map of old positions for tracking movement
        const oldPositions = new Map();
        tiles.forEach(tile => {
            const value = parseInt(tile.textContent) || 0;
            if (value > 0) {
                const row = parseInt(tile.dataset.row);
                const col = parseInt(tile.dataset.col);
                const key = `${row}-${col}`;
                oldPositions.set(key, {
                    element: tile,
                    value: value,
                    row: row,
                    col: col
                });
            }
        });
        
        // Clear the board
        gameBoard.innerHTML = '';
        
        // Create new tiles with enhanced animations
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const newValue = newBoard[row][col];
                const oldValue = oldBoard[row][col];
                
                if (newValue !== 0) {
                    const tile = document.createElement('div');
                    tile.className = 'tile';
                    tile.textContent = newValue;
                    tile.classList.add(`tile-${newValue}`);
                    tile.style.gridRow = row + 1;
                    tile.style.gridColumn = col + 1;
                    tile.dataset.row = row;
                    tile.dataset.col = col;
                    
                    // Enhanced animation logic
                    if (oldValue === 0) {
                        // New tile - dramatic entrance animation
                        tile.classList.add('new');
                        tile.style.transform = 'scale(0) rotate(180deg)';
                        tile.style.opacity = '0';
                        
                        setTimeout(() => {
                            tile.style.transition = 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                            tile.style.transform = 'scale(1) rotate(0deg)';
                            tile.style.opacity = '1';
                        }, 50);
                        
                        setTimeout(() => {
                            tile.classList.remove('new');
                        }, 350);
                    } else if (oldValue !== newValue) {
                        // Merged tile - enhanced merge animation
                        tile.classList.add('merged');
                        tile.style.transform = 'scale(1.3)';
                        tile.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                        
                        // Add particle effect for merge
                        this.createMergeEffect(tile);
                        
                        setTimeout(() => {
                            tile.style.transform = 'scale(1)';
                        }, 150);
                        
                        setTimeout(() => {
                            tile.classList.remove('merged');
                        }, 450);
                    } else {
                        // Moved tile - smooth transition
                        tile.style.transition = 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                        tile.classList.add('moving');
                        
                        setTimeout(() => {
                            tile.classList.remove('moving');
                        }, 200);
                    }
                    
                    // Add special effects for high-value tiles
                    if (newValue >= 128) {
                        tile.style.boxShadow = `0 0 ${Math.min(newValue / 20, 30)}px rgba(255, 255, 255, ${Math.min(newValue / 2048, 0.8)})`;
                    }
                    
                    gameBoard.appendChild(tile);
                }
            }
        }
    }

    createMergeEffect(tile) {
        // Create a temporary particle effect for tile merging
        const effect = document.createElement('div');
        effect.style.position = 'absolute';
        effect.style.top = '50%';
        effect.style.left = '50%';
        effect.style.width = '20px';
        effect.style.height = '20px';
        effect.style.background = 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)';
        effect.style.borderRadius = '50%';
        effect.style.transform = 'translate(-50%, -50%) scale(0)';
        effect.style.pointerEvents = 'none';
        effect.style.zIndex = '1000';
        
        tile.appendChild(effect);
        
        // Animate the particle effect
        setTimeout(() => {
            effect.style.transition = 'all 0.4s ease-out';
            effect.style.transform = 'translate(-50%, -50%) scale(3)';
            effect.style.opacity = '0';
        }, 50);
        
        // Remove the effect after animation
        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        }, 450);
    }

    updateDisplay() {
        document.getElementById('score').textContent = this.score.toLocaleString();
        document.getElementById('moves').textContent = this.moves;
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('2048-best-score', this.bestScore.toString());
        }
        
        document.getElementById('best-score').textContent = this.bestScore.toLocaleString();
    }

    showGameOverModal(won) {
        const modal = document.getElementById('game-over-modal');
        const title = document.getElementById('modal-title');
        const message = document.getElementById('modal-message');
        const icon = document.getElementById('modal-icon');
        const finalScore = document.getElementById('final-score');
        const finalMoves = document.getElementById('final-moves');
        
        if (won) {
            title.textContent = 'Gratulacje!';
            message.textContent = 'Udało Ci się osiągnąć 2048!';
            icon.textContent = '🎉';
        } else {
            title.textContent = 'Koniec gry';
            message.textContent = 'Nie ma już możliwych ruchów. Spróbuj ponownie!';
            icon.textContent = '😔';
        }
        
        finalScore.textContent = this.score.toLocaleString();
        finalMoves.textContent = this.moves;
        
        modal.classList.add('show');
    }

    closeModal() {
        const modal = document.getElementById('game-over-modal');
        modal.classList.remove('show');
    }

    resetGame() {
        this.board = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.moves = 0;
        this.gameWon = false;
        this.gameOver = false;
        this.paused = false;
        
        this.addRandomTile();
        this.addRandomTile();
        this.updateDisplay();
        this.renderBoard();
        
        // Update pause button
        const pauseBtn = document.getElementById('pause-btn');
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pauza';
    }

    togglePause() {
        this.paused = !this.paused;
        const pauseBtn = document.getElementById('pause-btn');
        
        if (this.paused) {
            pauseBtn.innerHTML = '<i class="fas fa-play"></i> Wznów';
            pauseBtn.classList.add('paused');
        } else {
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pauza';
            pauseBtn.classList.remove('paused');
        }
    }
}

// Global functions for HTML buttons
let game;

function resetGame() {
    game.resetGame();
}

function togglePause() {
    game.togglePause();
}

function closeModal() {
    game.closeModal();
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    game = new Game2048();
    
    // Add some visual feedback for button interactions
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    // Add keyboard shortcuts info
    const controlInfo = document.querySelector('.control-info p');
    controlInfo.innerHTML = '<i class="fas fa-keyboard"></i> Używaj strzałek, WASD lub gestów dotykowych do poruszania • <i class="fas fa-space"></i> Spacja = pauza';
});

// Add some additional visual effects
document.addEventListener('DOMContentLoaded', () => {
    // Add particle effect on tile merge
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('tile')) {
                        // Add subtle glow effect for high-value tiles
                        const value = parseInt(node.textContent);
                        if (value >= 128) {
                            node.style.boxShadow = `0 0 20px rgba(255, 255, 255, ${Math.min(value / 2048, 0.5)})`;
                        }
                    }
                });
            }
        });
    });
    
    const gameBoard = document.getElementById('game-board');
    if (gameBoard) {
        observer.observe(gameBoard, { childList: true, subtree: true });
    }
});

// Add smooth scrolling for navigation
function scrollToGames() {
    document.getElementById('games').scrollIntoView({ behavior: 'smooth' });
}

function scrollToAbout() {
    document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
}

// Add some performance optimizations
if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
        // Preload some resources or do non-critical initialization
        console.log('Game 2048 loaded successfully!');
    });
} else {
    setTimeout(() => {
        console.log('Game 2048 loaded successfully!');
    }, 100);
}
