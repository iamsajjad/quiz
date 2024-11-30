let timerInterval;
let currentTime = 600; // 10 minutes in seconds
const timerDisplay = document.getElementById('timer-display');
const submitButton = document.getElementById('submit-btn');
let questionsData = []; // To store fetched questions and answers

// Utility function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Utility function to select N random elements from an array
function selectRandomQuestions(array, numQuestions) {
    return array.slice(0, Math.min(numQuestions, array.length));
}

// Start the timer and update the display
function startTimer() {
    timerInterval = setInterval(() => {
        if (currentTime > 0) {
            currentTime--;
            updateTimerDisplay();
        } else {
            clearInterval(timerInterval);
            autoSubmit();
        }
    }, 1000);
}

// Update the timer display
function updateTimerDisplay() {
    const minutes = Math.floor(currentTime / 60);
    const seconds = currentTime % 60;
    timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
}

// Automatically submit the quiz
function autoSubmit() {
    alert('Time is up! Submitting your answers.');
    submitQuiz();
}

// Fetch questions and populate quiz dynamically
function fetchQuestions(questionsFile) {
    fetch(questionsFile)
        .then(response => response.json())
        .then(questions => {
            const shuffledQuestions = shuffleArray(questions); // Shuffle questions
            questionsData = selectRandomQuestions(shuffledQuestions, 40); // Select 40 random questions
            populateQuestions(questionsData);
            populateSidebar(questionsData);
            startTimer(); // Start the timer when questions are loaded
        })
        .catch(error => console.error('Error fetching questions:', error));
}

// Populate questions in the quiz area
function populateQuestions(questions) {
    const questionArea = document.getElementById('question-area');

    questions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.id = `question-${index}`;
        questionDiv.innerHTML = `
            <h2>${question.question}</h2>
            <ul>
                ${question.options.map((option, i) => `
                    <li>
                        <label>
                            <input type="radio" name="question-${index}" value="${option}">
                            ${option}
                        </label>
                    </li>
                `).join('')}
            </ul>
        `;
        questionDiv.style.display = index === 0 ? 'block' : 'none'; // Show the first question
        questionArea.appendChild(questionDiv);
    });

    document.querySelectorAll('input[type="radio"]').forEach(input => {
        input.addEventListener('change', updateSidebarStatus);
    });
}

// Populate sidebar with question links
function populateSidebar(questions) {
    const questionList = document.getElementById('question-list');
    
    questions.forEach((question, index) => {
        const listItem = document.createElement('li');
        listItem.id = `sidebar-question-${index}`;
        const link = document.createElement('a');
        link.href = `#question-${index}`;
        link.textContent = `Question ${index + 1}`;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToQuestion(index);
        });
        listItem.appendChild(link);
        questionList.appendChild(listItem);
    });

    highlightCurrentQuestion(0); // Highlight the first question initially
}

// Handle quiz navigation and submission
function setupNavigation() {
    const backBtn = document.getElementById('back-btn');
    const nextBtn = document.getElementById('next-btn');

    backBtn.addEventListener('click', () => {
        navigateQuestions(-1);
    });
    nextBtn.addEventListener('click', () => {
        navigateQuestions(1);
    });
    submitButton.addEventListener('click', submitQuiz);
}

// Navigate between questions
function navigateQuestions(direction) {
    const questions = document.querySelectorAll('#question-area > div');
    let current = Array.from(questions).findIndex(q => q.style.display === 'block');

    questions[current].style.display = 'none';
    current = Math.max(0, Math.min(questions.length - 1, current + direction));
    questions[current].style.display = 'block';

    highlightCurrentQuestion(current);
}

// Navigate directly to a question
function navigateToQuestion(index) {
    const questions = document.querySelectorAll('#question-area > div');
    questions.forEach((q, i) => {
        q.style.display = i === index ? 'block' : 'none';
    });
    highlightCurrentQuestion(index);
}

// Highlight the current question in the sidebar
function highlightCurrentQuestion(index) {
    document.querySelectorAll('#question-list li').forEach((item, i) => {
        item.classList.toggle('current', i === index);
    });
}

// Update the sidebar status for answered questions
function updateSidebarStatus() {
    const inputs = document.querySelectorAll('input[type="radio"]:checked');
    inputs.forEach(input => {
        const questionIndex = input.name.split('-')[1];
        const listItem = document.getElementById(`sidebar-question-${questionIndex}`);
        listItem.classList.add('answered');
    });
}

// Submit quiz and show results
function submitQuiz() {
    clearInterval(timerInterval); // Stop the timer
    const answers = {};
    let score = 0;

    questionsData.forEach((question, index) => {
        const selected = document.querySelector(`input[name="question-${index}"]:checked`);
        const userAnswer = selected ? selected.value : null;
        answers[`question-${index}`] = userAnswer;

        if (userAnswer === question.correct) {
            score++;
        }
    });

    displayResults(score, questionsData.length);
}

// Display the results
function displayResults(score, totalQuestions) {
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = `
        <div id="results">
            <h2>Quiz Results</h2>
            <p>Your Score: <span class="score">${score}</span> / <span class="total">${totalQuestions}</span></p>
            <p>Percentage: <span class="percentage">${(score / totalQuestions * 100).toFixed(2)}%</span></p>
        </div>
    `;
}

// Initialize the quiz on page load
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
});
