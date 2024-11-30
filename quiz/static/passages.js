let selectedPassages = []; // Store the two randomly selected passages
let timerInterval; // Timer reference
let currentTime = 300; // 5 minutes in seconds

// Utility function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Start the timer
function startTimer() {
    const timerDisplay = document.getElementById("timer-display");
    timerInterval = setInterval(() => {
        if (currentTime > 0) {
            currentTime--;
            updateTimerDisplay(timerDisplay);
        } else {
            clearInterval(timerInterval);
            alert("Time is up! Submitting your answers.");
            calculateResults(); // Auto-submit when time runs out
        }
    }, 1000);
}

// Update timer display
function updateTimerDisplay(timerDisplay) {
    const minutes = Math.floor(currentTime / 60);
    const seconds = currentTime % 60;
    timerDisplay.textContent = `Time Remaining: ${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
}

// Fetch the JSON file and populate the quiz
function fetchPassages(filePath) {
    fetch(filePath)
        .then(response => response.json())
        .then(passages => {
            console.log("Fetched passages:", passages); // Debugging
            if (!Array.isArray(passages) || passages.length === 0) {
                throw new Error("Passages data is invalid or empty.");
            }

            // Shuffle the passages and select two randomly
            selectedPassages = shuffleArray(passages).slice(0, 2);

            populateSidebar(selectedPassages);
            displayPassage(selectedPassages[0], 0); // Display the first passage by default
            startTimer(); // Start the timer
        })
        .catch(error => {
            console.error("Error fetching passages:", error);
            document.getElementById("passage-area").innerHTML = `
                <p>Failed to load passages. Please check the JSON file or network connection.</p>
            `;
        });
}

// Populate the sidebar with passage titles
function populateSidebar(passages) {
    const passageList = document.getElementById("passage-list");
    passageList.innerHTML = ""; // Clear any existing content

    passages.forEach((passage, index) => {
        const listItem = document.createElement("li");
        const link = document.createElement("a");
        link.href = `#passage-${index}`;
        link.textContent = passage.title;
        link.addEventListener("click", (e) => {
            e.preventDefault();
            displayPassage(passage, index);
        });
        listItem.appendChild(link);
        passageList.appendChild(listItem);
    });

    // Add event listener for the submit button
    const submitButton = document.getElementById("submit-btn");
    submitButton.addEventListener("click", calculateResults);
}

// Display the selected passage and its questions
function displayPassage(passage, index) {
    const passageArea = document.getElementById("passage-area");

    if (!passage || !passage.questions || passage.questions.length === 0) {
        passageArea.innerHTML = `<p>Passage or questions not available.</p>`;
        return;
    }

    passageArea.innerHTML = `
        <div id="passage-${index}">
            <h2>${passage.title}</h2>
            <p>${passage.passage}</p>
            <h3>Questions</h3>
            <ul>
                ${passage.questions.map((question, qIndex) => `
                    <li>
                        <p>${question.question}</p>
                        <ul>
                            ${question.options.map(option => `
                                <li>
                                    <label>
                                        <input type="radio" name="question-${index}-${qIndex}" value="${option}">
                                        ${option}
                                    </label>
                                </li>
                            `).join("")}
                        </ul>
                    </li>
                `).join("")}
            </ul>
        </div>
    `;
}

// Calculate and display the results in the sidebar
function calculateResults() {
    clearInterval(timerInterval); // Stop the timer
    let totalQuestions = 0;
    let correctAnswers = 0;

    selectedPassages.forEach((passage, passageIndex) => {
        passage.questions.forEach((question, questionIndex) => {
            totalQuestions++;
            const selectedOption = document.querySelector(`input[name="question-${passageIndex}-${questionIndex}"]:checked`);
            if (selectedOption && selectedOption.value === question.correct) {
                correctAnswers++;
            }
        });
    });

    // Display results in the sidebar
    const passageList = document.getElementById("passage-list");
    passageList.innerHTML = `
        <h3 class="result-title">Results</h3>
        <p class="result-text">Total Questions: <span class="result-value">${totalQuestions}</span></p>
        <p class="result-text">Correct Answers: <span class="result-value">${correctAnswers}</span></p>
        <p class="result-text">Score: <span class="result-value">${(correctAnswers / totalQuestions * 100).toFixed(2)}%</span></p>
    `;
}
