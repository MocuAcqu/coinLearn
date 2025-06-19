// 等待 HTML 文件完全載入後再執行
document.addEventListener('DOMContentLoaded', () => {

    // --- DOM 元素選取 ---
    const mainMenu = document.getElementById('main-menu');
    const gameScreen = document.getElementById('game-screen');
    const modeButtons = document.querySelectorAll('.mode-button');
    const mode4SetupScreen = document.getElementById('mode4-setup');
    const mode5SetupScreen = document.getElementById('mode5-setup');

    const gameTitle = document.getElementById('game-title');
    const questionArea = document.getElementById('question-area');

    const workspaceArea = document.getElementById('workspace-area');
    const actionArea = document.getElementById('action-area');

    const currentAmountDisplay = document.getElementById('current-amount-display');
    const moneyTray = document.getElementById('money-tray');
    const currencySelection = document.getElementById('currency-selection');
    
    const checkAnswerBtn = document.getElementById('check-answer-btn');
    const resetBtn = document.getElementById('reset-btn');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    
    const backFromSetupBtn = document.getElementById('back-from-setup-btn');
    const amountInput = document.getElementById('amount-input');
    const currencyChecklistContainer = document.getElementById('currency-checklist-container');
    const startChallengeBtn = document.getElementById('start-challenge-btn');

    const backFromMode5SetupBtn = document.getElementById('back-from-mode5-setup-btn');
    const productListContainer = document.getElementById('product-list-container');
    const addProductBtn = document.getElementById('add-product-btn');
    const walletSetupContainer = document.getElementById('wallet-setup-container');
    const startMode5ChallengeBtn = document.getElementById('start-mode5-challenge-btn');

    const feedbackModal = document.getElementById('feedback-modal');
    const feedbackImage = document.getElementById('feedback-image');
    const feedbackText = document.getElementById('feedback-text');
    const nextQuestionBtn = document.getElementById('next-question-btn');

    const menuModal = document.getElementById('menu-modal');
    const menuImageDisplay = document.getElementById('menu-image-display');

    // 建立 Audio 物件，這樣瀏覽器可以預先載入，播放時才不會延遲
    const coinClickSound = new Audio('sounds/click.mp3');
    const correctSound = new Audio('sounds/correct.mp3');
    //const wrongSound = new Audio('sounds/wrong.mp3');

    // 這個函式可以處理快速連續點擊時，音效能重新播放的問題
    function playSound(audioElement) {
        audioElement.currentTime = 0; // 將音效播放時間重置到開頭
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

    // --- 遊戲狀態變數 ---
    let currentMode = null;
    let targetAmount = 0;
    let currentAmount = 0;
    let selectedCoins = [];
    let availableCurrencies = [];
    let currencyInventory = {};

    // 模式三的情境資料庫
    const scenarios = [
        {
            menuImage: 'images/menu_1.jpg', // 您的咖啡廳菜單圖片
            questions: [
                { item: '一個瑞穗鮮乳', price: 45 },
                { item: '一個乳香世家', price: 30 },
            ]
        },
        {
            menuImage: 'images/menu_2.jpg', // 您的文具店價目表圖片
            questions: [
                { item: '一個阿華田', price: 28 },
                { item: '一個光泉鮮乳', price: 39 },
            ]
        }
        // 可以在這裡加入更多情境物件
    ];

    // --- 核心功能函式 ---

    // 畫面切換函式
    function switchScreen(screen) {
        [mainMenu, gameScreen, mode4SetupScreen, mode5SetupScreen].forEach(screen => screen.classList.remove('active'));
        const screenToShow = document.getElementById(screen);
        if(screenToShow) {
            screenToShow.classList.add('active');
        }
    }

    function toggleUIVisibility(mode) {
        if (mode === 'mode1') {
            // 模式一：隱藏工作區和操作按鈕
            workspaceArea.style.display = 'none';
            actionArea.style.display = 'none';
        } else {
            // 其他模式：顯示它們
            workspaceArea.style.display = 'flex';
            actionArea.style.display = 'flex';
        }
    }

    // 顯示和隱藏菜單彈窗的函式
    function showMenuModal() {
        menuModal.classList.add('visible');
    }
    function hideMenuModal() {
        menuModal.classList.remove('visible');
    }

    // 渲染可選擇的錢幣
    function renderCurrencySelection() {
        currencySelection.innerHTML = '';
        const source = currentMode === 'mode5' ? Object.values(currencies) : availableCurrencies;
        
        source.forEach(currency => {
            const container = document.createElement('div');
            container.className = 'currency-item-container';

            const img = document.createElement('img');
            img.src = currency.image;
            img.alt = currency.name;
            img.dataset.value = currency.value;

            if (currentMode === 'mode1') {
                img.addEventListener('click', () => handleMode1Click(currency));
            } else if (currentMode === 'mode5') {
                container.addEventListener('click', () => addMoneyToTray(currency));
            } else {
                img.addEventListener('click', () => addMoneyToTray(currency));
            }
            container.appendChild(img);

            if (currentMode === 'mode5') {
                const count = currencyInventory[currency.value] || 0;
                const countSpan = document.createElement('span');
                countSpan.className = 'currency-count';
                countSpan.textContent = count;
                container.appendChild(countSpan);

                if (count === 0) {
                    container.classList.add('disabled');
                }
            }
            currencySelection.appendChild(container);
        });
    }
    
    // 判斷點擊的錢幣面額是否等於目標金額
    function handleMode1Click(clickedCurrency) {
        if (clickedCurrency.value === targetAmount) {
            showFeedback(true);
        } else {
            // 傳入點擊錯誤的金額，以便在回饋訊息中顯示
            showFeedback(false, clickedCurrency.value);
        }
    }

    // 將錢幣加入盤子
    function addMoneyToTray(currency) {
        playSound(coinClickSound);
        
        if (currentMode === 'mode5') {
            if (currencyInventory[currency.value] > 0) {
                currencyInventory[currency.value]--;
            } else {
                return; // 沒錢了，不能再加
            }
        }
        selectedCoins.push(currency);
        updateCurrentAmount();
        renderMoneyTray();
        if (currentMode === 'mode5') renderCurrencySelection();
    }

    // 渲染盤子裡的錢幣
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

    // 從盤子移除錢幣
    function removeMoneyFromTray(index) {
        playSound(coinClickSound);
        const removedCoin = selectedCoins.splice(index, 1)[0];
        if (currentMode === 'mode5') {
            currencyInventory[removedCoin.value]++;
        }
        updateCurrentAmount();
        renderMoneyTray();
        if (currentMode === 'mode5') renderCurrencySelection();
    }

    // 更新目前總金額
    function updateCurrentAmount() {
        currentAmount = selectedCoins.reduce((sum, coin) => sum + coin.value, 0);
        currentAmountDisplay.textContent = currentAmount;
    }

    // 重設遊戲狀態
    function resetGame() {
        selectedCoins = [];
        currentAmount = 0;
        targetAmount = 0;
        availableCurrencies = [];
        currencyInventory = {};
        updateCurrentAmount();
        renderMoneyTray();
        hideMenuModal();
    }

    // 產生模式四設定頁面的錢幣核取方塊
    function populateCurrencyChecklist() {
        currencyChecklistContainer.innerHTML = '';
        currencies.forEach(currency => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'checkbox-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `currency-${currency.value}`;
            checkbox.value = currency.value;
            checkbox.checked = true; // 預設全部選取

            const label = document.createElement('label');
            label.htmlFor = `currency-${currency.value}`;
            label.textContent = currency.name;
            
            const img = document.createElement('img');
            img.src = currency.image;

            itemDiv.appendChild(checkbox);
            itemDiv.appendChild(label);
            itemDiv.appendChild(img);
            currencyChecklistContainer.appendChild(itemDiv);
        });
    }

    // 模式五：新增商品輸入欄
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
    
    // 模式五：產生錢包設定介面
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

    // 啟動遊戲
    function startGame(mode, customSettings = null) {
        currentMode = mode;
        resetGame();

        if (mode === 'mode4' && !customSettings) {
            gameTitle.textContent = '老師出題';
            populateCurrencyChecklist();
            switchScreen('mode4-setup');
            return; 
        }

        if (mode === 'mode5' && !customSettings) {
            gameTitle.textContent = '小小商店';
            productListContainer.innerHTML = '';
            addProductRow();
            populateWalletSetup();
            switchScreen('mode5-setup');
            return;
        }
        
        switchScreen('game-screen');
        toggleUIVisibility(mode);

        // 根據不同模式設定遊戲
        switch (mode) {
            case 'mode1':
                // TODO: 模式一「錢幣配對」的邏輯
                gameTitle.textContent = '錢幣配對';
                availableCurrencies = [...currencies];
                const randomCurrency = currencies[Math.floor(Math.random()* currencies.length)];
                targetAmount = randomCurrency.value;
                questionArea.innerHTML = `請選擇 <strong>${targetAmount}</strong> 元的錢幣`;
                break;
            case 'mode2':
                gameTitle.textContent = '湊出金額';
                availableCurrencies = [...currencies];
                targetAmount = Math.floor(Math.random() * 1200) + 1; // 產生 1-200 的隨機金額
                questionArea.innerHTML = `請給我 <strong>${targetAmount}</strong> 元`;
                break;
            case 'mode3':
                // TODO: 模式三「情境購物」的邏輯
                gameTitle.textContent = '情境購物';
                availableCurrencies = [...currencies];
                // 1. 隨機選一個情境
                const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
                // 2. 從該情境中隨機選一個問題
                const randomQuestion = randomScenario.questions[Math.floor(Math.random() * randomScenario.questions.length)];

                // 3. 設定目標金額和題目
                targetAmount = randomQuestion.price;
                questionArea.innerHTML = `<button id="view-menu-btn" class="btn-view-menu">查看圖片</button>今天你想買${randomQuestion.item}，要付多少錢？`;
                
                // 4. 設定菜單圖片並顯示
                menuImageDisplay.src = randomScenario.menuImage;
                showMenuModal();

                // 5. 替剛剛新增的按鈕加上事件監聽
                document.getElementById('view-menu-btn').addEventListener('click', showMenuModal);
                break;
            case 'mode4':
                // TODO: 模式四「老師出題」的邏輯
                gameTitle.textContent = '老師出題';
                targetAmount = customSettings.amount;
                availableCurrencies = customSettings.allowedCurrencies;
                questionArea.innerHTML = `請湊出老師指定的 <strong>${targetAmount}</strong> 元`;
                break;
            case 'mode5':
                // TODO: 模式五「小小商店」的邏輯
                gameTitle.textContent = '小小商店';
                targetAmount = customSettings.total;
                currencyInventory = customSettings.inventory;
                //let shoppingListHTML = '請購買以下商品：<br>';
                let shoppingListHTML = '';
                customSettings.products.forEach(p => {
                    shoppingListHTML += ` - ${p.name} (單價${p.price}) x ${p.quantity}<br>`;
                });
                //shoppingListHTML += `<strong>總金額：${targetAmount} 元</strong>`;
                questionArea.innerHTML = shoppingListHTML;
                 break;
        }
        renderCurrencySelection();
    }

    // 檢查答案
    function checkAnswer() {
        if (currentAmount === targetAmount) {
            showFeedback(true);
        } else {
            showFeedback(false, currentAmount);
        }
    }

    // 顯示回饋視窗
    function showFeedback(isCorrect, paidAmount = 0) {
        if (isCorrect) {
            playSound(correctSound);
            feedbackImage.src = 'images/kuromi1.png'; 
            feedbackText.textContent = '太棒了！完全正確！';
            feedbackText.style.color = 'var(--success-color)';
            if (currentMode === 'mode4' || currentMode === 'mode5') {
                nextQuestionBtn.textContent = '返回設定';
            } else {
                nextQuestionBtn.textContent = '太棒了！下一題';
            }
            nextQuestionBtn.style.display = 'block';
        } else {
            feedbackImage.src = 'images/kuromi2.png'; // 請替換成您的圖片路徑
            let errorMsg;
            if (currentMode === 'mode1') {
                errorMsg = `選錯囉！你點的是 ${paidAmount} 元，但答案是 ${targetAmount} 元。`;
            } else {
                errorMsg = `喔喔，金額不對喔！是 ${targetAmount} 元，你付了 ${paidAmount} 元。`;
            }
            feedbackText.textContent = errorMsg;
            feedbackText.style.color = 'var(--error-color)';
            nextQuestionBtn.style.display = 'none';
        }
        feedbackModal.classList.add('visible');
    }
    
    // --- 事件監聽器 ---

    // 監聽模式選擇按鈕
    modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const mode = button.dataset.mode;
            startGame(mode);
        });
    });

    // 模式四設定頁面的按鈕事件
    startChallengeBtn.addEventListener('click', () => {
        const amount = parseInt(amountInput.value);
        if (isNaN(amount) || amount <= 0) {
            alert('請輸入一個大於 0 的有效金額！');
            return;
        }

        const checkedBoxes = currencyChecklistContainer.querySelectorAll('input[type="checkbox"]:checked');
        if (checkedBoxes.length === 0) {
            alert('請至少選擇一種可用的錢幣！');
            return;
        }

        const allowedValues = Array.from(checkedBoxes).map(cb => parseInt(cb.value));
        const allowedCurrencies = currencies.filter(c => allowedValues.includes(c.value));
        
        // 將設定傳給 startGame 函式
        startGame('mode4', { amount: amount, allowedCurrencies: allowedCurrencies });
    });

    addProductBtn.addEventListener('click', addProductRow);
    startMode5ChallengeBtn.addEventListener('click', () => {
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

        startGame('mode5', { products, total, inventory });
    });

    // 返回主選單
    backToMenuBtn.addEventListener('click', () => {
        switchScreen('main-menu');
    });
    
    backFromSetupBtn.addEventListener('click', () => switchScreen('main-menu'));
    backFromMode5SetupBtn.addEventListener('click', () => switchScreen('main-menu'));
    // 檢查答案按鈕
    checkAnswerBtn.addEventListener('click', checkAnswer);
    
    // 清除重來按鈕
    resetBtn.addEventListener('click', () => {
        if (currentMode === 'mode5') {
            // 在模式五，重設只清空盤子，不清空庫存
            selectedCoins.forEach(coin => currencyInventory[coin.value]++);
            selectedCoins = [];
            updateCurrentAmount();
            renderMoneyTray();
            renderCurrencySelection();
        } else {
            // 其他模式的重設行為
            selectedCoins = [];
            updateCurrentAmount();
            renderMoneyTray();
        }
    });

    // 下一題按鈕 (在彈出視窗中)
    nextQuestionBtn.addEventListener('click', () => {
        feedbackModal.classList.remove('visible');
        if (currentMode === 'mode4') {
            // 模式四答對後，返回設定頁面
            switchScreen('mode4-setup');
        } else if(currentMode === 'mode5'){
            switchScreen('mode5-setup');
        } else{
            // 其他模式，開始新的一局
            startGame(currentMode);
        }
    });
    
    feedbackModal.addEventListener('click', (e) => {
        if (e.target === feedbackModal && nextQuestionBtn.style.display === 'none') {
            feedbackModal.classList.remove('visible');
        }
    });

    // 點擊菜單彈窗背景可關閉
    menuModal.addEventListener('click', (e) => {
        // 確保是點擊背景，而不是圖片本身
        if (e.target === menuModal) {
            hideMenuModal();
        }
    });
});