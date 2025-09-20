document.addEventListener('DOMContentLoaded', () => {
    // --- Data ---
    // ▼▼▼ 選択肢のリストを2種類に分けました ▼▼▼
    const pokemonTypes = ["ノーマル", "ほのお", "みず", "でんき", "くさ", "こおり", "かくとう", "どく", "じめん", "ひこう", "エスパー", "むし", "いわ", "ゴースト", "ドラゴン", "あく", "はがね", "フェアリー"];
    const typesForNoEffectQuiz = [...pokemonTypes, "なし"]; // 「こうかなし」クイズ用の選択肢
    
    const questions_super_effective = [
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

    const questions_no_effect = [
        { attackType: "ノーマル", correctAnswers: ["ゴースト"] },
        { attackType: "ほのお", correctAnswers: ["なし"] },
        { attackType: "みず", correctAnswers: ["なし"] },
        { attackType: "でんき", correctAnswers: ["なし"] },
        { attackType: "くさ", correctAnswers: ["なし"] },
        { attackType: "こおり", correctAnswers: ["なし"] },
        { attackType: "かくとう", correctAnswers: ["なし"] },
        { attackType: "どく", correctAnswers: ["なし"] },
        { attackType: "じめん", correctAnswers: ["でんき"] },
        { attackType: "ひこう", correctAnswers: ["じめん"] },
        { attackType: "エスパー", correctAnswers: ["なし"] },
        { attackType: "むし", correctAnswers: ["なし"] },
        { attackType: "いわ", correctAnswers: ["なし"] },
        { attackType: "ゴースト", correctAnswers: ["ノーマル", "かくとう"] },
        { attackType: "ドラゴン", correctAnswers: ["なし"] },
        { attackType: "あく", correctAnswers: ["エスパー"] },
        { attackType: "はがね", correctAnswers: ["どく"] },
        { attackType: "フェアリー", correctAnswers: ["ドラゴン"] },
    ];


    // --- Element Selectors ---
    const startScreen = document.getElementById('start-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const resultScreen = document.getElementById('result-screen');
    const mypageScreen = document.getElementById('mypage-screen');
    
    const startBtnSuperEffective = document.getElementById('start-btn-super-effective');
    const startBtnNoEffect = document.getElementById('start-btn-no-effect');
    const restartBtn = document.getElementById('restart-btn');
    const mypageBtn = document.getElementById('mypage-btn');
    const backToStartBtn = document.getElementById('back-to-start-btn');
    const submitAnswerBtn = document.getElementById('submit-answer-btn');
    const nextQuestionBtn = document.getElementById('next-question-btn'); 

    const questionCounterEl = document.getElementById('question-counter');
    const questionTextEl = document.getElementById('question-text');
    const quizTimerEl = document.getElementById('quiz-timer');
    const optionsContainer = document.getElementById('options-container');
    const feedback = document.getElementById('feedback');
    
    const correctCountEl = document.getElementById('correct-count');
    const totalCountEl = document.getElementById('total-count');
    const accuracyEl = document.getElementById('accuracy');
    const totalTimeEl = document.getElementById('total-time');
    
    const saveScoreBtn = document.getElementById('save-score-btn');
    const rankingTableBodySE = document.querySelector('#ranking-table-se tbody');
    const rankingTableBodyNE = document.querySelector('#ranking-table-ne tbody');
    const clearRankingsBtnSE = document.getElementById('clear-rankings-btn-se');
    const clearRankingsBtnNE = document.getElementById('clear-rankings-btn-ne');
    
    const statsTableBody = document.querySelector('#stats-table tbody');
    const clearStatsBtn = document.getElementById('clear-stats-btn');
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    // --- State Variables ---
    let currentQuizMode = '';
    let currentQuestions = [];
    let currentQuestionIndex = 0;
    let correctAnswersCount = 0;
    let selectedAnswers = [];
    let totalElapsedTime = 0;
    let questionStartTime;
    let timerAnimationId = null;

    const RANKING_KEY_SE = `quizRankings_super-effective`;
    const RANKING_KEY_NE = `quizRankings_no-effect`;
    const STATS_KEY = `quizStats_all_modes`;

    // --- Functions ---
    function updateTimer() {
        const currentTotalTime = totalElapsedTime + (Date.now() - questionStartTime);
        quizTimerEl.textContent = `タイム: ${(currentTotalTime / 1000).toFixed(2)} 秒`;
        timerAnimationId = requestAnimationFrame(updateTimer);
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function startQuiz(mode) {
        currentQuizMode = mode;
        const questionsSource = (mode === 'super-effective') ? questions_super_effective : questions_no_effect;
        
        startScreen.classList.add('hidden');
        quizScreen.classList.remove('hidden');

        currentQuestions = shuffleArray([...questionsSource]);
        currentQuestionIndex = 0;
        correctAnswersCount = 0;
        totalElapsedTime = 0;
        quizTimerEl.textContent = 'タイム: 0.00 秒';
        
        displayQuestion();
    }

    function displayQuestion() {
        feedback.textContent = '';
        feedback.className = '';
        optionsContainer.innerHTML = '';
        selectedAnswers = [];
        submitAnswerBtn.disabled = false;
        submitAnswerBtn.classList.remove('hidden');
        nextQuestionBtn.classList.add('hidden');

        questionCounterEl.textContent = `Q.${currentQuestionIndex + 1} / ${currentQuestions.length}`;
        const question = currentQuestions[currentQuestionIndex];
        const questionWording = currentQuizMode === 'super-effective' ? '「こうかばつぐん」' : '「こうかがない」タイプ(攻撃)';
        questionTextEl.textContent = `${question.attackType}タイプに${questionWording}なのは？`;

        // ▼▼▼ モードに応じて表示する選択肢を切り替える ▼▼▼
        const optionsToShow = (currentQuizMode === 'super-effective') ? pokemonTypes : typesForNoEffectQuiz;

        optionsToShow.forEach(type => {
            const button = document.createElement('button');
            button.textContent = type;
            button.dataset.type = type;
            button.addEventListener('click', () => toggleAnswerSelection(button));
            optionsContainer.appendChild(button);
        });

        questionStartTime = Date.now();
        if (timerAnimationId) cancelAnimationFrame(timerAnimationId);
        timerAnimationId = requestAnimationFrame(updateTimer);
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
        cancelAnimationFrame(timerAnimationId);
        timerAnimationId = null;
        const elapsedTime = Date.now() - questionStartTime;
        totalElapsedTime += elapsedTime;
        quizTimerEl.textContent = `タイム: ${(totalElapsedTime / 1000).toFixed(2)} 秒`;

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
            if (correctAnswers.includes(type)) btn.classList.add('correct-answer');
            if (userAnswers.includes(type) && !correctAnswers.includes(type)) btn.classList.add('wrong-choice');
        });
        
        currentQuestionIndex++;
        
        submitAnswerBtn.classList.add('hidden');
        nextQuestionBtn.classList.remove('hidden');
        nextQuestionBtn.textContent = (currentQuestionIndex < currentQuestions.length) ? '次の問題へ' : '結果を見る';
    }
    
    function goToNextQuestionOrResults() {
        if (currentQuestionIndex < currentQuestions.length) {
            displayQuestion();
        } else {
            showResults();
        }
    }

    function showResults() {
        if (timerAnimationId) {
            cancelAnimationFrame(timerAnimationId);
            timerAnimationId = null;
        }

        quizScreen.classList.add('hidden');
        resultScreen.classList.remove('hidden');

        const totalTime = totalElapsedTime / 1000;
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
        const newRecord = { score, accuracy, time: totalTime, date: dateString, timestamp };

        const rankingKey = (currentQuizMode === 'super-effective') ? RANKING_KEY_SE : RANKING_KEY_NE;
        let rankings = JSON.parse(localStorage.getItem(rankingKey)) || [];
        rankings.push(newRecord);
        rankings.sort((a, b) => b.score - a.score);
        rankings = rankings.slice(0, 10);

        localStorage.setItem(rankingKey, JSON.stringify(rankings));
        sessionStorage.setItem('latestScoreTimestamp', newRecord.timestamp);
        
        showStartScreen();
    }

    function renderRankingTable(key, tableBody, clearBtn) {
        const rankings = JSON.parse(localStorage.getItem(key)) || [];
        const latestTimestamp = sessionStorage.getItem('latestScoreTimestamp');
        tableBody.innerHTML = '';
        
        if (rankings.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5">まだ記録がありません。</td></tr>';
            clearBtn.classList.add('hidden');
            return;
        }

        clearBtn.classList.remove('hidden');
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
            tableBody.appendChild(row);
        });
    }

    function getStats() {
        const stats = JSON.parse(localStorage.getItem(STATS_KEY));
        if (!stats) {
            const initialStats = {};
            const allQuestionTypes = [...new Set([...questions_super_effective, ...questions_no_effect].map(q => q.attackType))];
            allQuestionTypes.forEach(type => {
                initialStats[type] = { correct: 0, total: 0 };
            });
            return initialStats;
        }
        return stats;
    }

    function updateStats(questionTitle, isCorrect) {
        const stats = getStats();
        if (!stats[questionTitle]) {
            stats[questionTitle] = { correct: 0, total: 0 };
        }
        stats[questionTitle].total++;
        if (isCorrect) stats[questionTitle].correct++;
        localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    }

    function renderStatsTable() {
        const stats = getStats();
        statsTableBody.innerHTML = '';

        Object.keys(stats).sort().forEach(questionTitle => {
            const questionStats = stats[questionTitle];
            const rate = questionStats.total > 0
                ? ((questionStats.correct / questionStats.total) * 100).toFixed(1) : '-';

            const row = document.createElement('tr');
            row.innerHTML = `<td>${questionTitle}</td><td>${rate}% (${questionStats.correct}/${questionStats.total})</td>`;
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
        renderRankingTable(RANKING_KEY_SE, rankingTableBodySE, clearRankingsBtnSE);
        renderRankingTable(RANKING_KEY_NE, rankingTableBodyNE, clearRankingsBtnNE);
    }

    // --- Dark Mode ---
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
    });
    if (localStorage.getItem('darkMode') === 'enabled') document.body.classList.add('dark-mode');

    // --- Initial Setup ---
    showStartScreen();

    startBtnSuperEffective.addEventListener('click', () => startQuiz('super-effective'));
    startBtnNoEffect.addEventListener('click', () => startQuiz('no-effect'));
    restartBtn.addEventListener('click', () => location.reload());
    submitAnswerBtn.addEventListener('click', submitAnswer);
    mypageBtn.addEventListener('click', showMyPage);
    saveScoreBtn.addEventListener('click', saveScore);
    backToStartBtn.addEventListener('click', showStartScreen);
    nextQuestionBtn.addEventListener('click', goToNextQuestionOrResults);

    clearRankingsBtnSE.addEventListener('click', () => {
        if (confirm('本当に「こうかばつぐん」のランキングをリセットしますか？')) {
            localStorage.removeItem(RANKING_KEY_SE);
            renderRankingTable(RANKING_KEY_SE, rankingTableBodySE, clearRankingsBtnSE);
        }
    });
    clearRankingsBtnNE.addEventListener('click', () => {
        if (confirm('本当に「こうかなし」のランキングをリセットしますか？')) {
            localStorage.removeItem(RANKING_KEY_NE);
            renderRankingTable(RANKING_KEY_NE, rankingTableBodyNE, clearRankingsBtnNE);
        }
    });
    clearStatsBtn.addEventListener('click', () => {
        if (confirm('本当にすべての正答率データをリセットしますか？')) {
            localStorage.removeItem(STATS_KEY);
            renderStatsTable();
        }
    });
});