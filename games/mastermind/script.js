// Mastermind Game Script

// === INSTRUCTION MODAL FUNCTIONS ===
function showInstructions() {
    const modal = document.getElementById('instructions-modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function hideInstructions() {
    const modal = document.getElementById('instructions-modal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('instructions-modal');
    if (e.target === modal) {
        hideInstructions();
    }
});

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        hideInstructions();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // === Elementy interfejsu ===
    const attemptsContainer = document.getElementById('attempts-container');
    const codeInputs = document.querySelectorAll('.code-digit');
    const checkButton = document.getElementById('check-button');
    const messageArea = document.getElementById('message-area');
    const currentAttemptSpan = document.getElementById('current-attempt');
    const resetButton = document.getElementById('reset-button');

    // === Zmienne gry ===
    let secretCode = [];
    let currentAttempt = 1;
    const maxAttempts = 10;
    const codeLength = 4;

    // === Funkcje główne ===

    function initializeGame() {
        secretCode = generateRandomCode();
        attemptsContainer.innerHTML = '';
        currentAttempt = 1;
        currentAttemptSpan.textContent = currentAttempt;
        messageArea.textContent = 'Wpisz 4 cyfry, aby zacząć.';
        resetButton.style.display = 'none';
        checkButton.style.display = 'block';
        resetCodeInputs();
        console.log('Tajny szyfr:', secretCode.join(''));
    }

    function generateRandomCode() {
        const code = [];
        for (let i = 0; i < codeLength; i++) {
            code.push(Math.floor(Math.random() * 10).toString());
        }
        return code;
    }

    function resetCodeInputs() {
        codeInputs.forEach(input => {
            input.value = '';
            input.disabled = false;
        });
        codeInputs[0].focus();
    }

    function handleCheckAttempt() {
        const guess = Array.from(codeInputs).map(input => input.value);

        if (guess.some(digit => !digit)) {
            messageArea.textContent = 'Proszę wprowadzić wszystkie 4 cyfry!';
            return;
        }

        const feedback = checkGuess(guess);
        displayAttempt(guess, feedback);

        if (feedback.blacks === codeLength) {
            endGame(true); // Zwycięstwo
        } else if (currentAttempt >= maxAttempts) {
            endGame(false); // Porażka
        } else {
            currentAttempt++;
            currentAttemptSpan.textContent = currentAttempt;
            resetCodeInputs();
        }
    }

    function checkGuess(guess) {
        const secretCodeCopy = [...secretCode];
        const guessCopy = [...guess];
        let blacks = 0;
        let whites = 0;

        // Sprawdzanie "czarnych"
        for (let i = 0; i < codeLength; i++) {
            if (guessCopy[i] === secretCodeCopy[i]) {
                blacks++;
                guessCopy[i] = null;
                secretCodeCopy[i] = null;
            }
        }

        // Sprawdzanie "białych"
        for (let i = 0; i < codeLength; i++) {
            if (guessCopy[i] !== null) {
                const secretIndex = secretCodeCopy.indexOf(guessCopy[i]);
                if (secretIndex !== -1) {
                    whites++;
                    secretCodeCopy[secretIndex] = null;
                }
            }
        }

        return { blacks, whites };
    }

    function displayAttempt(guess, feedback) {
        const attemptRow = document.createElement('div');
        attemptRow.classList.add('attempt-row');

        guess.forEach(digit => {
            const digitEl = document.createElement('div');
            digitEl.classList.add('guessed-code-digit');
            digitEl.textContent = digit;
            attemptRow.appendChild(digitEl);
        });

        const feedbackPins = document.createElement('div');
        feedbackPins.classList.add('feedback-pins');
        for (let i = 0; i < feedback.blacks; i++) {
            const pin = document.createElement('div');
            pin.classList.add('pin', 'black-pin');
            feedbackPins.appendChild(pin);
        }
        for (let i = 0; i < feedback.whites; i++) {
            const pin = document.createElement('div');
            pin.classList.add('pin', 'white-pin');
            feedbackPins.appendChild(pin);
        }

        attemptRow.appendChild(feedbackPins);
        attemptsContainer.appendChild(attemptRow);
    }

    function endGame(isWin) {
        if (isWin) {
            messageArea.textContent = 'Gratulacje! Złamałeś szyfr!';
            messageArea.style.color = '#58a6ff';
        } else {
            messageArea.textContent = `Porażka! Prawidłowy szyfr to: ${secretCode.join('')}`;
            messageArea.style.color = '#ff4a4a';
        }

        checkButton.style.display = 'none';
        resetButton.style.display = 'block';
        codeInputs.forEach(input => input.disabled = true);
    }

    // === Nasłuchiwanie zdarzeń ===

    checkButton.addEventListener('click', handleCheckAttempt);
    resetButton.addEventListener('click', initializeGame);

    // Automatyczne przechodzenie do następnego pola
    codeInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (e.target.value.length === 1 && index < codeInputs.length - 1) {
                codeInputs[index + 1].focus();
            }
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
                codeInputs[index - 1].focus();
            }
        });
    });

    // === Uruchomienie gry przy ładowaniu strony ===
    initializeGame();
});
