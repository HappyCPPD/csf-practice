import { loadAllQuizzes } from './dataLoader.js';
import * as ui from './ui.js';

let QUESTION_BANK = [];
let allChapters = [];
let quizPool = [];
let questionsToAsk = [];
let currentQuestionIndex = 0;
let score = 0;
let wrongAnswers = [];
let isAnswerSubmitted = false;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const data = await loadAllQuizzes();
        if (data.allQuestions.length === 0) {
            document.getElementById('loading-screen').innerHTML = '<h1>Error: Could not load quiz data. Check console.</h1>';
            return;
        }
        QUESTION_BANK = data.allQuestions;
        allChapters = data.allChapters;
        init();
    } catch (error) {
        console.error("Failed to initialize quiz:", error);
        document.getElementById('loading-screen').innerHTML = '<h1>Error: Failed to initialize quiz.</h1>';
    }
});

function init() {
    ui.populateChapterList(allChapters);
    updateAvailableQuestions();
    
    ui.addChapterChangeListener(updateAvailableQuestions);
    ui.addStartListener(startQuiz);
    ui.addSubmitListener(handleSubmit);
    ui.addRestartListener(() => location.reload());
    
    ui.showScreen('setup');
}

function updateAvailableQuestions() {
    const { selectedChapters } = ui.getSetupSelections();
    const availableQuestions = QUESTION_BANK.filter(q => selectedChapters.includes(q.chapter)).length;
    ui.updateAvailableQuestions(availableQuestions, QUESTION_BANK.length);
}

function startQuiz() {
    const { selectedChapters, numToAsk } = ui.getSetupSelections();

    if (selectedChapters.length === 0) {
        ui.showSetupError('Please select at least one chapter.');
        return;
    }

    quizPool = QUESTION_BANK.filter(q => selectedChapters.includes(q.chapter));

    if (isNaN(numToAsk) || numToAsk <= 0 || numToAsk > quizPool.length) {
        ui.showSetupError(`Please enter a valid number between 1 and ${quizPool.length}.`);
        return;
    }
    
    questionsToAsk = shuffleArray(quizPool).slice(0, numToAsk);
    
    currentQuestionIndex = 0;
    score = 0;
    wrongAnswers = [];
    isAnswerSubmitted = false;
    ui.showSetupError('');
    
    ui.showScreen('quiz');
    displayCurrentQuestion();
}

function displayCurrentQuestion() {
    isAnswerSubmitted = false;
    const question = questionsToAsk[currentQuestionIndex];
    ui.resetQuizUI();
    ui.displayQuestion(question, currentQuestionIndex + 1, questionsToAsk.length);
}

function handleSubmit() {
    if (isAnswerSubmitted) {
        nextQuestion();
        return;
    }
    
    const userAnswer = ui.getUserAnswer();
    if (userAnswer === null) {
        ui.showFeedback(false, "Please select or type an answer.");
        return;
    }
    
    isAnswerSubmitted = true;
    const question = questionsToAsk[currentQuestionIndex];
    const isCorrect = userAnswer.toLowerCase() === question.answer.toLowerCase();

    if (isCorrect) {
        score++;
    } else {
        wrongAnswers.push({ question: question, userAnswer: userAnswer });
    }

    ui.showFeedback(isCorrect, question.answer);
    ui.lockQuestion(isCorrect, question);
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questionsToAsk.length) {
        displayCurrentQuestion();
    } else {
        ui.showResults(score, questionsToAsk.length, wrongAnswers);
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}