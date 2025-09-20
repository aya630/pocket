document.addEventListener('DOMContentLoaded', () => {
    // --- Data ---
    const types = ["ノーマル", "ほのお", "みず", "でんき", "くさ", "こおり", "かくとう", "どく", "じめん", "ひこう", "エスパー", "むし", "いわ", "ゴースト", "ドラゴン", "あく", "はがね", "フェアリー"];
    
    const questions = [
        { attackType: "くさ", correctAnswers: ["ほのお", "こおり", "どく", "ひこう", "むし"] },
        { attackType: "ほのお", correctAnswers: ["みず", "じめん", "いわ"] },
        { attackType: "みず", correctAnswers: ["でんき", "くさ"] },
        { attackType: "ノーマル", correctAnswers: ["かくとう"] },
        { attackType: "でんき", correctAnswers: ["じめん"] },
        { attackType: "こおり", correctAnswers: ["ほのお", "かくとう", "いわ", "はがね"] },
        { attackType: "かくとう", correctAnswers: ["ひこう", "エスパー", "フェアリー"] },
        { attackType: "どく", correctAnswers: ["じめん", "エスパー"] },
        { attackType: "じめん", correctAnswers: ["みず", "くさ", "こおり"] },
        { attackType: "ひこう", correctAnswers: ["でんき", "こおり", "いわ"] },
        { attackType: "エスパー", correctAnswers: ["むし", "ゴースト", "あく"] },
        { attackType: "むし", correctAnswers: ["ほのお", "ひこう", "いわ"] },
        { attackType: "いわ", correctAnswers: ["みず", "くさ", "かくとう", "じめん", "はがね"] },
        { attackType: "ゴースト", correctAnswers: ["ゴースト", "あく"] },
        { attackType: "ドラゴン", correctAnswers: ["こおり", "ドラゴン", "フェアリー"] },
        { attackType: "あく", correctAnswers: ["かくとう", "むし", "フェアリー"] },
        { attackType: "はがね", correctAnswers: ["ほのお", "かくとう", "じめん"] },
        { attackType: "フェアリー", correctAnswers: ["どく", "はがね"] },
    ];

    // --- Element Selectors ---
    const startScreen = document.getElementById('start-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const resultScreen = document.getElementById('result-screen');
    const mypageScreen = document.getElementById('mypage-screen');
    const rankingDisplay = document.getElementById('ranking-display');

    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const mypageBtn = document.getElementById('mypage-btn');
    const backToStartBtn = document.getElementById('back-to-start-btn');
    const submitAnswerBtn = document.getElementById('submit-answer-btn');

    const questionCounterEl = document.getElementById('question-counter');
    const questionTextEl = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const feedback = document.getElementById('feedback');
    
    const correctCountEl = document.getElementById('correct-count');
    const totalCountEl = document.getElementById('total-count');
    const accuracyEl = document.getElementById('accuracy');
    const totalTimeEl = document.getElementById('total-time');
    
    const saveScoreBtn = document.getElementById('save-score-btn');
    const rankingTableBody = document.querySelector('#ranking-display #ranking-table tbody');
    const clearRankingsBtn = document.getElementById('clear-rankings-btn');
    const totalQuestionCountEl = document.getElementById('total-question-count');
    
    const statsTableBody = document.querySelector('#stats-table tbody');
    const clearStatsBtn = document.getElementById('clear-stats-btn');

    const darkModeToggle = document.getElementById('dark-mode-toggle');

    // --- State Variables ---
    let currentQuestions = [];
    let currentQuestionIndex = 0;
    let correctAnswersCount = 0;
    let quizStartTime;
    let selectedAnswers = [];

    const QUIZ_ID = document.body.id || 'default-quiz';
    const RANKING_STORAGE_KEY = `quizRankings_${QUIZ_ID}`;
    const STATS_STORAGE_KEY = `quizStats_${QUIZ_ID}`;

    // --- Functions ---
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function startQuiz() {
        startScreen.classList.add('hidden');
        quizScreen.classList.remove('hidden');

        currentQuestions = shuffleArray([...questions]);
        currentQuestionIndex = 0;
        correctAnswersCount = 0;
        quizStartTime = Date.now();
        
        displayQuestion();
    }

    function displayQuestion() {
        feedback.textContent = '';
        feedback.className = '';
        optionsContainer.innerHTML = '';
        selectedAnswers = [];
        submitAnswerBtn.disabled = false;

        questionCounterEl.textContent = `Q.${currentQuestionIndex + 1} / ${currentQuestions.length}`;
        const question = currentQuestions[currentQuestionIndex];
        questionTextEl.textContent = `${question.attackType}タイプに「こうかばつぐん」なのは？`;

        types.forEach(type => {
            const button = document.createElement('button');
            button.textContent = type;
            button.dataset.type = type;
            button.addEventListener('click', () => toggleAnswerSelection(button));
            optionsContainer.appendChild(button);
        });
    }

    function toggleAnswerSelection(button) {
        const type = button.dataset.type;
        button.classList.toggle('selected');

        if (selectedAnswers.includes(type)) {
            selectedAnswers = selectedAnswers.filter(t => t !== type);
        } else {
            selectedAnswers.push(type);
        }
    }

    function submitAnswer() {
        submitAnswerBtn.disabled = true;
        const question = currentQuestions[currentQuestionIndex];
        const correctAnswers = question.correctAnswers.slice().sort();
        const userAnswers = selectedAnswers.slice().sort();

        const isCorrect = correctAnswers.length === userAnswers.length && 
                          correctAnswers.every((value, index) => value === userAnswers[index]);
        
        updateStats(question.attackType, isCorrect);
        
        if (isCorrect) {
            correctAnswersCount++;
            feedback.textContent = '正解！';
            feedback.className = 'correct';
        } else {
            feedback.textContent = `不正解... 正解は: ${correctAnswers.join(', ')}`;
            feedback.className = 'incorrect';
        }

        const allButtons = optionsContainer.querySelectorAll('button');
        allButtons.forEach(btn => {
            btn.disabled = true;
            const type = btn.dataset.type;
            if (correctAnswers.includes(type)) {
                btn.classList.add('correct-answer');
            }
            if (userAnswers.includes(type) && !correctAnswers.includes(type)) {
                btn.classList.add('wrong-choice');
            }
        });
        
        currentQuestionIndex++;

        if (currentQuestionIndex < currentQuestions.length) {
            setTimeout(displayQuestion, 2500);
        } else {
            setTimeout(showResults, 2500);
        }
    }

    function showResults() {
        quizScreen.classList.add('hidden');
        resultScreen.classList.remove('hidden');

        const quizEndTime = Date.now();
        const totalTime = (quizEndTime - quizStartTime) / 1000;
        const accuracy = (correctAnswersCount / currentQuestions.length) * 100;

        correctCountEl.textContent = correctAnswersCount;
        totalCountEl.textContent = currentQuestions.length;
        accuracyEl.textContent = accuracy.toFixed(1);
        totalTimeEl.textContent = totalTime.toFixed(2);
    }

    function saveScore() {
        const totalTime = parseFloat(totalTimeEl.textContent);
        const accuracy = parseFloat(accuracyEl.textContent);
        const now = new Date();
        const timestamp = now.getTime();

        const timeBonus = Math.max(0, (180 - totalTime) * 10);
        const score = (correctAnswersCount * 500) + Math.round(timeBonus);

        const dateString = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const newRecord = {
            score: score,
            accuracy: accuracy,
            time: totalTime,
            date: dateString,
            timestamp: timestamp,
        };

        let rankings = JSON.parse(localStorage.getItem(RANKING_STORAGE_KEY)) || [];
        rankings.push(newRecord);
        rankings.sort((a, b) => b.score - a.score);
        rankings = rankings.slice(0, 10);

        localStorage.setItem(RANKING_STORAGE_KEY, JSON.stringify(rankings));
        sessionStorage.setItem('latestScoreTimestamp', newRecord.timestamp);
        
        showStartScreen();
    }

    function renderRankingTable() {
        const rankings = JSON.parse(localStorage.getItem(RANKING_STORAGE_KEY)) || [];
        const latestTimestamp = sessionStorage.getItem('latestScoreTimestamp');
        rankingTableBody.innerHTML = '';
        
        if (rankings.length === 0) {
            rankingTableBody.innerHTML = '<tr><td colspan="5">まだ記録がありません。</td></tr>';
            clearRankingsBtn.classList.add('hidden');
            return;
        }

        clearRankingsBtn.classList.remove('hidden');
        rankings.forEach((record, index) => {
            const row = document.createElement('tr');
            if (record.timestamp && record.timestamp == latestTimestamp) {
                row.classList.add('latest-score');
            }
            row.innerHTML = `
                <td>${index + 1}位</td>
                <td>${record.date}</td>
                <td>${record.score}</td>
                <td>${record.accuracy.toFixed(1)}%</td>
                <td>${record.time.toFixed(2)}秒</td>
            `;
            rankingTableBody.appendChild(row);
        });
    }

    function getStats() {
        const stats = JSON.parse(localStorage.getItem(STATS_STORAGE_KEY));
        if (!stats) {
            const initialStats = {};
            questions.forEach(q => {
                initialStats[q.attackType] = { correct: 0, total: 0 };
            });
            return initialStats;
        }
        return stats;
    }

    function updateStats(questionTitle, isCorrect) {
        const stats = getStats();
        if (stats[questionTitle]) {
            stats[questionTitle].total++;
            if (isCorrect) {
                stats[questionTitle].correct++;
            }
        }
        localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    }

    function renderStatsTable() {
        const stats = getStats();
        statsTableBody.innerHTML = '';

        questions.forEach(q => {
            const questionTitle = q.attackType;
            const questionStats = stats[questionTitle];

            const rate = questionStats.total > 0
                ? ((questionStats.correct / questionStats.total) * 100).toFixed(1)
                : '-';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${questionTitle}</td>
                <td>${rate}% (${questionStats.correct}/${questionStats.total})</td>
            `;
            statsTableBody.appendChild(row);
        });
    }
    
    function showMyPage() {
        startScreen.classList.add('hidden');
        mypageScreen.classList.remove('hidden');
        renderStatsTable();
    }
    
    function showStartScreen() {
        mypageScreen.classList.add('hidden');
        resultScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
        renderRankingTable();
    }

    // --- Dark Mode ---
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
    });

    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
    }

    // --- Initial Setup ---
    totalQuestionCountEl.textContent = questions.length;
    renderRankingTable();

    startBtn.addEventListener('click', startQuiz);
    restartBtn.addEventListener('click', () => location.reload());
    submitAnswerBtn.addEventListener('click', submitAnswer);
    mypageBtn.addEventListener('click', showMyPage);
    saveScoreBtn.addEventListener('click', saveScore);
    backToStartBtn.addEventListener('click', showStartScreen);

    clearRankingsBtn.addEventListener('click', () => {
        if (confirm('本当にランキングをリセットしますか？')) {
            localStorage.removeItem(RANKING_STORAGE_KEY);
            renderRankingTable();
        }
    });

    clearStatsBtn.addEventListener('click', () => {
        if (confirm('本当にすべての正答率データをリセットしますか？')) {
            localStorage.removeItem(STATS_STORAGE_KEY);
            renderStatsTable();
        }
    });
});