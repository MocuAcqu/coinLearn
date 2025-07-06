document.addEventListener('DOMContentLoaded', () => {
    // --- DOM 元素選取 (已更新) ---
    const hintBtn = document.getElementById('hint-btn'); 
    const resultFeedback = document.getElementById('result-feedback'); 
    const hintFeedback = document.getElementById('hint-feedback'); 
    const closeHintBtn = document.getElementById('close-hint-btn');
    const hintContainer = document.getElementById('hint-container');
    const prevHintBtn = document.getElementById('prev-hint-btn');
    const nextHintBtn = document.getElementById('next-hint-btn');
    const hintPageIndicator = document.getElementById('hint-page-indicator');

    const mainMenu = document.getElementById('main-menu');
    const gameScreen = document.getElementById('game-screen');
    const c1m1SetupScreen = document.getElementById('c1m1-setup');
    const c1m2SetupScreen = document.getElementById('c1m2-setup');
    const c3m4SetupScreen = document.getElementById('c3m4-setup');
    const modeButtons = document.querySelectorAll('.mode-button');

    const gameTitle = document.getElementById('game-title');
    const questionArea = document.getElementById('question-area');
    const studentAnswerArea = document.getElementById('student-answer-area'); 
    const studentAnswerDisplay = document.getElementById('student-answer-display'); 
    const workspaceArea = document.getElementById('workspace-area');
    const actionArea = document.getElementById('action-area');
    const status_bar = document.querySelector('.status-bar'); // 選取整個狀態列
    const currentAmountDisplay = document.getElementById('current-amount-display');
    const toggleSumBtn = document.getElementById('toggle-sum-btn');
    const moneyTray = document.getElementById('money-tray');
    const selectionPanel = document.getElementById('selection-panel');
    const selectionPanelTitle = document.getElementById('selection-panel-title');
    const currencySelection = document.getElementById('currency-selection');
    const numpadContainer = document.getElementById('numpad-container'); // 【新增】
    const numpadButtons = document.querySelectorAll('.numpad-btn'); // 【新增】
    const checkAnswerBtn = document.getElementById('check-answer-btn');
    const resetBtn = document.getElementById('reset-btn');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');

    const backFromC1m1SetupBtn = document.getElementById('back-from-c1m1-setup-btn');
    const c1m1QuestionPreview = document.getElementById('c1m1-question-preview');
    const c1m1CurrencySelection = document.getElementById('c1m1-currency-selection');
    const startC1m1ChallengeBtn = document.getElementById('start-c1m1-challenge-btn');

    const backFromC1m2SetupBtn = document.getElementById('back-from-c1m2-setup-btn');
    const c1m2AmountInput = document.getElementById('c1m2-amount-input');
    const c1m2CurrencyChecklist = document.getElementById('c1m2-currency-checklist');
    const startC1m2ChallengeBtn = document.getElementById('start-c1m2-challenge-btn');

    const backFromC3m4SetupBtn = document.getElementById('back-from-mode5-setup-btn');
    const productListContainer = document.getElementById('product-list-container');
    const addProductBtn = document.getElementById('add-product-btn');
    const walletSetupContainer = document.getElementById('wallet-setup-container');
    const startC3m4ChallengeBtn = document.getElementById('start-mode5-challenge-btn');

    const feedbackModal = document.getElementById('feedback-modal');
    const feedbackImage = document.getElementById('feedback-image');
    const feedbackText = document.getElementById('feedback-text');
    const nextQuestionBtn = document.getElementById('next-question-btn');
    const menuModal = document.getElementById('menu-modal');
    const menuImageDisplay = document.getElementById('menu-image-display');

    // --- 音效 ---
    const coinClickSound = new Audio('sounds/click.mp3');
    const correctSound = new Audio('sounds/correct.mp3');

    function playSound(audioElement) {
        audioElement.currentTime = 0;
        audioElement.play();
    }

    // --- 遊戲資料 ---
    const currencies = [
        { name: '1元', value: 1, image: 'images/1_coin.png' },
        { name: '5元', value: 5, image: 'images/5_coin.png' },
        { name: '10元', value: 10, image: 'images/10_coin.png' },
        { name: '50元', value: 50, image: 'images/50_coin.png' },
        { name: '100元', value: 100, image: 'images/100_bill.png' },
        { name: '500元', value: 500, image: 'images/500_bill.png' },
        { name: '1000元', value: 1000, image: 'images/1000_bill.png' },
    ];
    const scenarios = [
        { menuImage: 'images/menu_1.jpg', questions: [{ item: '一個瑞穗鮮乳', price: 45 }, { item: '一個乳香世家', price: 30 }] },
        { menuImage: 'images/menu_2.jpg', questions: [{ item: '一個阿華田', price: 28 }, { item: '一個光泉鮮乳', price: 39 }] }
    ];

    // --- 遊戲狀態變數 ---
    let currentMode = null;
    let targetAmount = 0;
    let currentAmount = 0;
    let studentInputString = '0'; 
    let selectedCoins = [];
    let availableCurrencies = [];
    let currencyInventory = {};
    let teacherSetupCoins = [];
    let hintData = {};
    let hintSteps = [];
    let currentHintIndex = 0;
    let unlockedHintCount = 0;

    // --- 核心功能函式 ---

    function switchScreen(screenId) {
        [mainMenu, gameScreen, c1m1SetupScreen, c1m2SetupScreen, c3m4SetupScreen].forEach(s => s.classList.remove('active'));
        const screenToShow = document.getElementById(screenId);
        if (screenToShow) screenToShow.classList.add('active');
    }

    // UI可見性切換函式
    function toggleUIVisibility(mode) {
        // 先全部隱藏，再根據模式開啟需要的
        workspaceArea.style.display = 'none';
        selectionPanel.style.display = 'none';
        currencySelection.style.display = 'none';
        numpadContainer.classList.remove('visible');
        studentAnswerArea.style.display = 'none';
        actionArea.style.display = 'none';
        hintBtn.style.display = 'none'; // 預設隱藏
        toggleSumBtn.style.display = 'none';

        if (mode === 'c1m1') { // 判斷錢幣
            actionArea.style.display = 'flex';
            selectionPanel.style.display = 'block';
            numpadContainer.classList.add('visible');
            studentAnswerArea.style.display = 'block';
            hintBtn.style.display = 'inline-block';
        } else if (mode === 'c3m1') { // 錢幣配對
            selectionPanel.style.display = 'block';
            currencySelection.style.display = 'flex';
        } else { // 其他湊錢模式
            workspaceArea.style.display = 'flex';
            actionArea.style.display = 'flex';
            selectionPanel.style.display = 'block';
            currencySelection.style.display = 'flex';
            //statusBar.style.display = 'flex';
            toggleSumBtn.style.display = mode === 'c1m2' ? 'inline-block' : 'none';
            console.log(availableCurrencies)
            if (mode === 'c1m2' && availableCurrencies.length === 1) {
                hintBtn.style.display = 'inline-block';
            }
        }
        currentAmountDisplay.classList.remove('hidden');
    }

    function generateHintSteps() {
        hintSteps = []; // 清空舊的提示步驟


        if (currentMode === 'c1m1') {
            // 1. 統計錢幣
            const coinCounts = {};
            teacherSetupCoins.forEach(coin => {
                coinCounts[coin.value] = (coinCounts[coin.value] || 0) + 1;
            });
            const sortedCoins = Object.entries(coinCounts).sort((a, b) => b[0] - a[0]);

            // 2. 建立提示步驟
            // 步驟 1: 提問數量
            let step1HTML = '<ul>';
            sortedCoins.forEach(([value, count]) => {
                step1HTML += `<li>請思考看看，有多少個 <strong>${value} 元</strong> 呢?</li>`;
            });
            step1HTML += '</ul>';
            hintSteps.push(step1HTML);

            // 步驟 2: 公布數量
            let step2HTML = '<ul>';
            sortedCoins.forEach(([value, count]) => {
                step2HTML += `<li><strong>${value} 元</strong> 有 <strong>${count}</strong> 個。</li>`;
            });
            step2HTML += '</ul>';
            hintSteps.push(step2HTML);
            
            // 步驟 3: 提問計算
            let step3HTML = '<ul>';
            sortedCoins.forEach(([value, count]) => {
                step3HTML += `<li>請思考看看，<strong>${value} 元 × ${count} 個</strong>，會等於幾元?</li>`;
            });
            if (sortedCoins.length > 1) {
                step3HTML += '<li>然後把他們全部加起來。</li>';
            }
            step3HTML += '</ul>';
            hintSteps.push(step3HTML);

            // 步驟 4: 公布最終答案 (只有在超過一種錢幣時才有意義)
            if (sortedCoins.length > 1) {
                const subtotals = sortedCoins.map(([value, count]) => value * count);
                const sumString = subtotals.join(' + ');
                let step4HTML = `<ul><li>最後，把所有錢加起來：<br><strong>${sumString}</strong> = <strong>${targetAmount}</strong> 元。</li></ul>`;
                hintSteps.push(step4HTML);
            } else if (sortedCoins.length === 1) {
                const [[value, count]] = sortedCoins;
                const subtotal = value * count;
                let step4HTML = `<ul><li>計算結果：<br><strong>${value} × ${count}</strong> = <strong>${subtotal}</strong> 元。</li></ul>`;
                hintSteps.push(step4HTML);
            }
        } else if(currentMode === 'c1m2' && availableCurrencies.length === 1){
            const coin = availableCurrencies[0];
            const count = targetAmount / coin.value;

            // 只有在能整除時才提供有意義的提示
            if (Number.isInteger(count)) {
                let step1HTML = `<ul><li>請思考看看，<strong>${targetAmount} 元</strong> 等於幾個 <strong>${coin.name}</strong> 呢?</li></ul>`;
                hintSteps.push(step1HTML);
    
                let step2HTML = `<ul><li>答案是 <strong>${count}</strong> 個，因為：<br><strong>${coin.name} × ${count} 個</strong> = <strong>${targetAmount} 元</strong></li></ul>`;
                hintSteps.push(step2HTML);
            }
        }

    }
    
    function showCurrentHint() {
        hintFeedback.innerHTML = hintSteps[currentHintIndex];
        hintPageIndicator.textContent = `${currentHintIndex + 1} / ${unlockedHintCount}`;
        
        // 更新翻頁按鈕的狀態
        prevHintBtn.disabled = (currentHintIndex === 0);
        nextHintBtn.disabled = (currentHintIndex === unlockedHintCount - 1);
    }

    // 處理數字鍵盤輸入
    function handleNumpadInput(key) {
        playSound(coinClickSound);
        if (key === 'clear') {
            studentInputString = '0';
        } else if (key === 'backspace') {
            studentInputString = studentInputString.slice(0, -1) || '0';
        } else {
            if (studentInputString === '0') {
                studentInputString = key;
            } else if (studentInputString.length < 6) {
                studentInputString += key;
            }
        }
        studentAnswerDisplay.textContent = studentInputString;
    }

    // --- 以下為各模式的設定與遊戲函式 ---
    function addCoinToTeacherSetup(currency) { playSound(coinClickSound); teacherSetupCoins.push(currency); renderTeacherSetupPreview(); }
    function removeCoinFromTeacherSetup(index) { playSound(coinClickSound); teacherSetupCoins.splice(index, 1); renderTeacherSetupPreview(); }
    function renderTeacherSetupPreview() {
        c1m1QuestionPreview.innerHTML = '';
        teacherSetupCoins.forEach((coin, index) => {
            const img = document.createElement('img');
            img.src = coin.image;
            img.addEventListener('click', () => removeCoinFromTeacherSetup(index));
            c1m1QuestionPreview.appendChild(img);
        });
    }

    function showMenuModal() { menuModal.classList.add('visible'); }
    function hideMenuModal() { menuModal.classList.remove('visible'); }

    function renderGenericCurrencySelection(container, source, clickHandler) {
        container.innerHTML = '';
        source.forEach(currency => {
            const item = document.createElement('div');
            item.className = 'currency-item-container';
            const img = document.createElement('img');
            img.src = currency.image;
            img.alt = currency.name;
            item.appendChild(img);
            if (currentMode === 'c3m4') {
                const count = currencyInventory[currency.value] || 0;
                const countSpan = document.createElement('span');
                countSpan.className = 'currency-count';
                countSpan.textContent = count;
                item.appendChild(countSpan);
                if (count === 0) item.classList.add('disabled');
            }
            item.addEventListener('click', () => clickHandler(currency));
            container.appendChild(item);
        });
    }

    function handleDirectCheck(clickedCurrency) {
        if (clickedCurrency.value === targetAmount) showFeedback(true);
        else showFeedback(false, clickedCurrency.value);
    }

    function addMoneyToTray(currency) {
        if (currentMode === 'c3m4' && currencyInventory[currency.value] <= 0) return;
        playSound(coinClickSound);
        if (currentMode === 'c3m4') currencyInventory[currency.value]--;
        selectedCoins.push(currency);
        updateCurrentAmount();
        renderMoneyTray();
        if (currentMode === 'c3m4') renderGenericCurrencySelection(currencySelection, currencies, addMoneyToTray);
    }

    function renderMoneyTray() {
        moneyTray.innerHTML = '';
        selectedCoins.forEach((coin, index) => {
            const img = document.createElement('img');
            img.src = coin.image;
            img.alt = coin.name;
            img.addEventListener('click', () => removeMoneyFromTray(index));
            moneyTray.appendChild(img);
        });
    }

    function removeMoneyFromTray(index) {
        playSound(coinClickSound);
        const removedCoin = selectedCoins.splice(index, 1)[0];
        if (currentMode === 'c3m4') currencyInventory[removedCoin.value]++;
        updateCurrentAmount();
        renderMoneyTray();
        if (currentMode === 'c3m4') renderGenericCurrencySelection(currencySelection, currencies, addMoneyToTray);
    }

    function updateCurrentAmount() {
        currentAmount = selectedCoins.reduce((sum, coin) => sum + coin.value, 0);
        currentAmountDisplay.textContent = currentAmount;
    }

    function resetGame() {
        selectedCoins = [];
        currentAmount = 0;
        targetAmount = 0;
        studentInputString = '0';
        if (studentAnswerDisplay) studentAnswerDisplay.textContent = '0';
        availableCurrencies = [];
        currencyInventory = {};
        teacherSetupCoins = [];
        hintData = {};
        updateCurrentAmount();
        renderMoneyTray();
        hideMenuModal();
        hintSteps = [];
        currentHintIndex = 0;
        unlockedHintCount = 0;
    }

        function populateCurrencyChecklist(container, defaultChecked) { 
        container.innerHTML = '';
        currencies.forEach(currency => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'checkbox-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            // 修正 ID，確保每個 checkbox 的 ID 都是唯一的
            checkbox.id = `${container.id}-currency-${currency.value}`;
            checkbox.value = currency.value;
            checkbox.checked = defaultChecked;

            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.textContent = currency.name;
            
            const img = document.createElement('img');
            img.src = currency.image;

            itemDiv.appendChild(checkbox);
            itemDiv.appendChild(label);
            itemDiv.appendChild(img);
            // 【修正】附加到傳入的 container 中
            container.appendChild(itemDiv);
        });
    }

    function addProductRow() { 
        const itemDiv = document.createElement('div');
        itemDiv.className = 'product-item';
        itemDiv.innerHTML = `
            <input type="text" placeholder="商品名稱">
            <label>單價:</label>
            <input type="number" min="1" placeholder="元">
            <label>數量:</label>
            <input type="number" min="1" value="1">
            <button class="btn-remove-product">X</button>
        `;
        itemDiv.querySelector('.btn-remove-product').addEventListener('click', () => itemDiv.remove());
        productListContainer.appendChild(itemDiv);

     }

    function populateWalletSetup() {
       walletSetupContainer.innerHTML = '';
        currencies.forEach(currency => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'wallet-item';
            itemDiv.innerHTML = `
                <img src="${currency.image}" alt="${currency.name}">
                <label for="wallet-${currency.value}">${currency.name}:</label>
                <input type="number" id="wallet-${currency.value}" min="0" value="0" data-value="${currency.value}">
                <span>個</span>
            `;
            walletSetupContainer.appendChild(itemDiv);
        }); 
     }

    function startGame(mode, customSettings = null) {
        currentMode = mode;
        

        if (!customSettings) {
            if (mode === 'c1m1') {
                switchScreen('c1m1-setup');
                renderTeacherSetupPreview();
                renderGenericCurrencySelection(c1m1CurrencySelection, currencies, addCoinToTeacherSetup);
                return;
            }
            if (mode === 'c1m2') {
                switchScreen('c1m2-setup');
                c1m2AmountInput.value = '';
                populateCurrencyChecklist(c1m2CurrencyChecklist, false);
                return;
            }
            if (mode === 'c3m4') {
                switchScreen('c3m4-setup');
                productListContainer.innerHTML = '';
                addProductRow();
                populateWalletSetup();
                return;
            }
        }

        resetGame();
        switchScreen('game-screen');

        document.getElementById('back-to-menu-btn').addEventListener('click', () => {
            if (mode === 'c1m1') {
                switchScreen('c1m1-setup');
            } else if (mode === 'c1m2') {
                switchScreen('c1m2-setup');
            } else if (mode === 'c3m4') {
                switchScreen('c3m4-setup');
            } else {
                switchScreen('main-menu');
            }
        });

        switch (mode) {
            case 'c1m1':
                gameTitle.textContent = '判斷錢幣';
                targetAmount = customSettings.total;
                teacherSetupCoins = [...customSettings.coins];
                selectionPanelTitle.textContent = '請輸入總金額：';
                questionArea.innerHTML = `
                    <p>請問這樣是多少錢？</p>
                    <div class="money-tray-container"></div>
                `;
                const previewContainer = questionArea.querySelector('.money-tray-container');
                customSettings.coins.forEach(coin => {
                    const img = document.createElement('img');
                    img.src = coin.image;
                    previewContainer.appendChild(img);
                });
                generateHintSteps();
                break;
            case 'c1m2':
                gameTitle.textContent = '判斷金額';
                targetAmount = customSettings.amount;
                availableCurrencies = customSettings.allowedCurrencies;
                questionArea.innerHTML = `請給我 <strong>${targetAmount}</strong> 元`;
                selectionPanelTitle.textContent = '請點選錢幣湊出指定金額：';
                renderGenericCurrencySelection(currencySelection, availableCurrencies, addMoneyToTray);
                generateHintSteps();
                break;
            case 'c3m1':
                gameTitle.textContent = '錢幣配對';
                availableCurrencies = [...currencies];
                const randomCurrency = currencies[Math.floor(Math.random() * currencies.length)];
                targetAmount = randomCurrency.value;
                questionArea.innerHTML = `請選擇 <strong>${targetAmount}</strong> 元的錢幣`;
                selectionPanelTitle.textContent = "請點選正確的錢幣：";
                renderGenericCurrencySelection(currencySelection, availableCurrencies, handleDirectCheck);
                break;
            case 'c3m2':
                gameTitle.textContent = '湊出金額';
                availableCurrencies = [...currencies];
                targetAmount = Math.floor(Math.random() * 200) + 1;
                questionArea.innerHTML = `請給我 <strong>${targetAmount}</strong> 元`;
                selectionPanelTitle.textContent = '請點選錢幣湊出金額：';
                renderGenericCurrencySelection(currencySelection, availableCurrencies, addMoneyToTray);
                break;
            case 'c3m3':
                gameTitle.textContent = '情境購物';
                availableCurrencies = [...currencies];
                const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
                const randomQuestion = randomScenario.questions[Math.floor(Math.random() * randomScenario.questions.length)];
                targetAmount = randomQuestion.price;
                questionArea.innerHTML = `<button id="view-menu-btn" class="btn-view-menu">查看圖片</button>今天你想買${randomQuestion.item}，要付多少錢？`;
                menuImageDisplay.src = randomScenario.menuImage;
                showMenuModal();
                document.getElementById('view-menu-btn').addEventListener('click', showMenuModal);
                selectionPanelTitle.textContent = '請點選錢幣付錢：';
                renderGenericCurrencySelection(currencySelection, availableCurrencies, addMoneyToTray);
                break;
            case 'c3m4':
                gameTitle.textContent = '小小商店';
                targetAmount = customSettings.total;
                currencyInventory = customSettings.inventory;
                let shoppingListHTML = '請購買以下商品：<br>';
                customSettings.products.forEach(p => { shoppingListHTML += ` - ${p.name} (單價${p.price}) x ${p.quantity}<br>`; });
                shoppingListHTML += `<strong>總金額：${targetAmount} 元</strong>`;
                questionArea.innerHTML = shoppingListHTML;
                selectionPanelTitle.textContent = '請用錢包裡的錢付帳：';
                renderGenericCurrencySelection(currencySelection, currencies, addMoneyToTray);
                break;
        }
        toggleUIVisibility(mode);

        if (mode === 'c1m1' || mode === 'c1m2' || mode === 'c3m4') {
            backToMenuBtn.innerHTML = '‹ 返回設定';
        } else {
            backToMenuBtn.innerHTML = '🏠 返回主選單';
        }
    }

    // 答案檢查函式
    function checkAnswer() {
        let isCorrect = false;
        let studentAnswer = 0;

        if (currentMode === 'c1m1') {
            studentAnswer = parseInt(studentInputString) || 0;
            isCorrect = (studentAnswer === targetAmount);
        } else {
            studentAnswer = currentAmount;
            isCorrect = (currentAmount === targetAmount);
        }
        
        showFeedback(isCorrect, studentAnswer);
    }

    function showFeedback(isCorrect, paidAmount = 0) {
        resultFeedback.style.display = 'block';
        hintFeedback.style.display = 'none';
        closeHintBtn.style.display = 'none';
        hintContainer.style.display = 'none';

        if (isCorrect) {
            playSound(correctSound);
            feedbackImage.src = 'images/kuromi1.png';
            feedbackText.textContent = '太棒了！完全正確！';
            feedbackText.style.color = 'var(--success-color)';
            if (currentMode === 'c1m2' || currentMode === 'c3m4' || currentMode === 'c1m1') {
                nextQuestionBtn.textContent = '返回設定';
            } else {
                nextQuestionBtn.textContent = '太棒了！下一題';
            }
            nextQuestionBtn.style.display = 'block';
        } else {
            feedbackImage.src = 'images/kuromi2.png';
            let errorMsg;
            if (currentMode === 'c3m1') { // 錢幣配對
                errorMsg = `選錯囉！你點的是 ${paidAmount} 元，但答案是 ${targetAmount} 元。`;
            } else { // 其他所有湊錢/算錢模式
                errorMsg = `喔喔，答案不對喔！正確答案是 ${targetAmount} 元，你的答案是 ${paidAmount} 元。`;
            }
            feedbackText.textContent = errorMsg;
            feedbackText.style.color = 'var(--error-color)';
            nextQuestionBtn.style.display = 'none';
        }
        feedbackModal.classList.add('visible');
    }

    // --- 事件監聽器 ---
     // 提示按鈕的事件監聽器
    hintBtn.addEventListener('click', () => {
        if (hintSteps.length === 0) return; // 如果沒有提示，就什麼都不做

        // 【核心修改】一次性解鎖所有提示
        unlockedHintCount = hintSteps.length;
        
        // 預設顯示第一頁提示
        currentHintIndex = 0;

        // 準備並顯示提示彈窗
        resultFeedback.style.display = 'none';
        hintFeedback.style.display = 'block';
        hintContainer.style.display = 'block';
        nextQuestionBtn.style.display = 'none';
        closeHintBtn.style.display = 'block';
        
        showCurrentHint(); // 顯示提示內容和翻頁狀態
        feedbackModal.classList.add('visible');
    });

    prevHintBtn.addEventListener('click', () => {
        if (currentHintIndex > 0) {
            currentHintIndex--;
            showCurrentHint();
        }
    });

    nextHintBtn.addEventListener('click', () => {
        if (currentHintIndex < unlockedHintCount - 1) {
            currentHintIndex++;
            showCurrentHint();
        }
    });

    // 關閉提示按鈕的事件監聽器
    closeHintBtn.addEventListener('click', () => {
        feedbackModal.classList.remove('visible');
    });

    modeButtons.forEach(button => {
        if (!button.disabled) button.addEventListener('click', () => startGame(button.dataset.mode));
    });

    numpadButtons.forEach(button => {
        button.addEventListener('click', () => handleNumpadInput(button.dataset.key));
    });

    startC1m1ChallengeBtn.addEventListener('click', () => {
        if (teacherSetupCoins.length === 0) return alert('請至少在題目區加入一個錢幣！');
        const total = teacherSetupCoins.reduce((sum, coin) => sum + coin.value, 0);
        startGame('c1m1', { coins: [...teacherSetupCoins], total: total });
    });

    startC1m2ChallengeBtn.addEventListener('click', () => { 
        const amount = parseInt(c1m2AmountInput.value);
        if (isNaN(amount) || amount <= 0) return alert('請輸入有效金額！');
        const checkedBoxes = c1m2CurrencyChecklist.querySelectorAll('input:checked');
        if (checkedBoxes.length === 0) return alert('請至少選擇一種可用錢幣！');
        const allowedValues = Array.from(checkedBoxes).map(cb => parseInt(cb.value));
        const allowedCurrencies = currencies.filter(c => allowedValues.includes(c.value));
        startGame('c1m2', { amount, allowedCurrencies });
    });
    addProductBtn.addEventListener('click', addProductRow);
    startC3m4ChallengeBtn.addEventListener('click', () => { 
        const products = [];
        let total = 0;
        document.querySelectorAll('.product-item').forEach(item => {
            const name = item.querySelector('input[type="text"]').value;
            const price = parseInt(item.querySelector('input[type="number"]').value);
            const quantity = parseInt(item.querySelectorAll('input[type="number"]')[1].value);
            if (name && price > 0 && quantity > 0) {
                products.push({ name, price, quantity });
                total += price * quantity;
            }
        });
        if (products.length === 0) return alert('請至少設定一樣商品！');
        const inventory = {};
        document.querySelectorAll('.wallet-item input').forEach(input => {
            inventory[input.dataset.value] = parseInt(input.value) || 0;
        });
        startGame('c3m4', { products, total, inventory });
    });

    toggleSumBtn.addEventListener('click', () => {
        currentAmountDisplay.classList.toggle('hidden');
        toggleSumBtn.classList.toggle('hidden');
    });

    backToMenuBtn.addEventListener('click', () => {
        // 根據當前模式決定返回到哪裡
        if (currentMode === 'c1m1') {
            switchScreen('c1m1-setup');
            teacherSetupCoins = [];
            renderTeacherSetupPreview();
        } else if (currentMode === 'c1m2') {
            switchScreen('c1m2-setup');
            c1m2AmountInput.value = '';
            populateCurrencyChecklist(c1m2CurrencyChecklist, false);
        } else if (currentMode === 'c3m4') {
            switchScreen('c3m4-setup');
        } else {
            // 對於沒有設定頁面的模式，返回主選單
            switchScreen('main-menu');
        }
    });

    backFromC1m1SetupBtn.addEventListener('click', () => switchScreen('main-menu'));
    backFromC1m2SetupBtn.addEventListener('click', () => switchScreen('main-menu'));
    backFromC3m4SetupBtn.addEventListener('click', () => switchScreen('main-menu'));

    checkAnswerBtn.addEventListener('click', checkAnswer);

    // 重設按鈕的邏輯
    resetBtn.addEventListener('click', () => {
        if (currentMode === 'c1m1') {
            studentInputString = '0';
            studentAnswerDisplay.textContent = '0';
        } else if (currentMode === 'c3m4') {
            selectedCoins.forEach(coin => currencyInventory[coin.value]++);
            selectedCoins = [];
            updateCurrentAmount();
            renderMoneyTray();
            renderGenericCurrencySelection(currencySelection, currencies, addMoneyToTray);
        } else {
            selectedCoins = [];
            updateCurrentAmount();
            renderMoneyTray();
        }
    });

    nextQuestionBtn.addEventListener('click', () => {
        feedbackModal.classList.remove('visible');
        if (currentMode === 'c1m2' || currentMode === 'c1m1') {
             // 返回設定頁前，確保提示彈窗恢復預設狀態
            resultFeedback.style.display = 'block';
            hintFeedback.style.display = 'none';
            closeHintBtn.style.display = 'none';
            hintContainer.style.display = 'none';
        }

        if (currentMode === 'c1m1') {
            switchScreen('c1m1-setup');
            // 在返回設定頁時，清空預覽畫面
            teacherSetupCoins = [];
            renderTeacherSetupPreview();
        } 
        else if (currentMode === 'c1m2') {
            switchScreen('c1m2-setup');
            c1m2AmountInput.value = '';
            populateCurrencyChecklist(c1m2CurrencyChecklist, false);
        } 
        else if (currentMode === 'c3m4') {
            switchScreen('c3m4-setup');
        } 
        else {
            // 其他模式，開始新的一局
            startGame(currentMode);
        }
    });

    feedbackModal.addEventListener('click', (e) => {
        if (e.target === feedbackModal && nextQuestionBtn.style.display === 'none') {
            feedbackModal.classList.remove('visible');
        }
    });
    menuModal.addEventListener('click', (e) => {
        if (e.target === menuModal) hideMenuModal();
    });
});