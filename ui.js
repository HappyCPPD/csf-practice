const screens = {
    loading: document.getElementById('loading-screen'),
    setup: document.getElementById('setup-screen'),
    quiz: document.getElementById('quiz-screen'),
    results: document.getElementById('results-screen')
};

const setupElements = {
    chapterSelection: document.getElementById('chapter-selection'),
    questionCountInfo: document.getElementById('question-count-info'),
    questionCountInput: document.getElementById('question-count-input'),
    startBtn: document.getElementById('start-quiz-btn'),
    errorMsg: document.getElementById('setup-error')
};

const quizElements = {
    headerCounter: document.getElementById('question-counter'),
    headerChapter: document.getElementById('quiz-chapter'),
    questionText: document.getElementById('question-text'),
    answerOptions: document.getElementById('answer-options'),
    feedbackMsg: document.getElementById('feedback-message'),
    submitBtn: document.getElementById('submit-answer-btn')
};

const resultsElements = {
    finalScore: document.getElementById('final-score'),
    scoreCorrect: document.getElementById('score-correct'),
    scoreTotal: document.getElementById('score-total'),
    wrongAnswersList: document.getElementById('wrong-answers-list'),
    restartBtn: document.getElementById('restart-quiz-btn')
};

export function showScreen(screenName) {
    for (let key in screens) {
        screens[key].classList.remove('active');
    }
    screens[screenName].classList.add('active');
}

export function populateChapterList(chapters) {
    setupElements.chapterSelection.innerHTML = '';
    chapters.forEach(chapter => {
        setupElements.chapterSelection.innerHTML += `
            <label>
                <input type="checkbox" class="chapter-check" value="${chapter}" checked>
                ${chapter}
            </label>
        `;
    });
}

export function updateAvailableQuestions(count, max) {
    setupElements.questionCountInfo.innerHTML = `Available questions: <strong>${count}</strong>`;
    setupElements.questionCountInput.max = count;
    if (parseInt(setupElements.questionCountInput.value) > count || max === 0) {
        setupElements.questionCountInput.value = Math.min(5, count);
    }
    if (count === 0) {
        setupElements.questionCountInput.value = 0;
    }
}

export function getSetupSelections() {
    const selectedChapters = Array.from(document.querySelectorAll('.chapter-check:checked')).map(cb => cb.value);
    const numToAsk = parseInt(setupElements.questionCountInput.value);
    return { selectedChapters, numToAsk };
}

export function showSetupError(message) {
    setupElements.errorMsg.textContent = message;
}

export function displayQuestion(question, current, total) {
    quizElements.headerCounter.textContent = `Question ${current} / ${total}`;
    quizElements.headerChapter.textContent = question.chapter;
    quizElements.questionText.textContent = question.question;
    quizElements.answerOptions.innerHTML = '';

    if (question.type === 'mc') {
        const shuffledOptions = shuffleArray([...question.options]);
        shuffledOptions.forEach(option => {
            const optionEl = document.createElement('label');
            optionEl.className = 'option';
            optionEl.innerHTML = `
                <input type="radio" name="answer" value="${option}">
                <span>${option}</span>
            `;
            optionEl.addEventListener('click', () => {
                document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
                optionEl.classList.add('selected');
            });
            quizElements.answerOptions.appendChild(optionEl);
        });
    } else if (question.type === 'sa') {
        quizElements.answerOptions.innerHTML = `
            <input type="text" id="sa-answer" placeholder="Type your answer...">
        `;
    }
}

export function getUserAnswer() {
    const questionType = document.getElementById('sa-answer') ? 'sa' : 'mc';
    if (questionType === 'mc') {
        const selected = document.querySelector('.option.selected input');
        return selected ? selected.value : null;
    } else {
        const answer = document.getElementById('sa-answer').value;
        return answer.trim() !== '' ? answer.trim() : null;
    }
}

export function showFeedback(isCorrect, correctAnswer) {
    quizElements.feedbackMsg.textContent = isCorrect ? 'Correct!' : `Incorrect. The correct answer was: ${correctAnswer}`;
    quizElements.feedbackMsg.className = isCorrect ? 'correct' : 'incorrect';
}

export function lockQuestion(isCorrect, question) {
    if (question.type === 'mc') {
        document.querySelectorAll('.option').forEach(opt => {
            const optValue = opt.querySelector('input').value;
            opt.style.pointerEvents = 'none';
            if (optValue.toLowerCase() === question.answer.toLowerCase()) {
                opt.classList.add('correct');
            } else if (opt.classList.contains('selected')) {
                opt.classList.add('incorrect');
            }
        });
    } else {
        const inputEl = document.getElementById('sa-answer');
        inputEl.disabled = true;
        if (!isCorrect) {
            inputEl.style.borderColor = '#e74c3c';
            inputEl.style.backgroundColor = '#fdedec';
        } else {
            inputEl.style.borderColor = '#2ecc71';
            inputEl.style.backgroundColor = '#e8f9f0';
        }
    }
    quizElements.submitBtn.textContent = 'Next Question';
}

export function resetQuizUI(total) {
    quizElements.answerOptions.innerHTML = '';
    quizElements.feedbackMsg.textContent = '';
    quizElements.submitBtn.textContent = 'Submit';
}

export function showResults(score, total, wrongAnswers) {
    const percentage = (total > 0) ? (score / total) * 100 : 0;
    resultsElements.finalScore.textContent = `${percentage.toFixed(1)}%`;
    resultsElements.scoreCorrect.textContent = score;
    resultsElements.scoreTotal.textContent = total;

    if (wrongAnswers.length === 0) {
        resultsElements.wrongAnswersList.innerHTML = '<p>Perfect score! No mistakes to review. 🎉</p>';
    } else {
        resultsElements.wrongAnswersList.innerHTML = '';
        wrongAnswers.forEach(item => {
            resultsElements.wrongAnswersList.innerHTML += `
                <div class="wrong-answer-item">
                    <p><strong>Question:</strong> ${item.question.question}</p>
                    <p><strong>Your Answer:</strong> <span style="color: #e74c3c;">${item.userAnswer}</span></p>
                    <p><strong>Correct Answer:</strong> <span style="color: #2ecc71;">${item.question.answer}</span></p>
                </div>
            `;
        });
    }
    showScreen('results');
}

export function addChapterChangeListener(handler) {
    setupElements.chapterSelection.addEventListener('change', handler);
}

export function addStartListener(handler) {
    setupElements.startBtn.addEventListener('click', handler);
}

export function addSubmitListener(handler) {
    quizElements.submitBtn.addEventListener('click', handler);
}

export function addRestartListener(handler) {
    resultsElements.restartBtn.addEventListener('click', handler);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}