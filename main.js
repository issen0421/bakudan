// --- 状態管理 ---
let currentStep = 0;
let bombActive = false;
let timeLeft = 600; // 10分 = 600秒
let timerInterval;

// 信号機シミュレーション用変数
let lightPhase = 0; // 0:青, 1:黄(暗闇), 2:赤

// パスワード設定
const passwords = {
    1: "FLASH", // ファイル① ライト
    2: "ECHO",  // ファイル② ブザー
    3: "TIMER"  // ファイル③ モニター
};

// --- 初期化 ---
window.onload = () => {
    showModal(
        "ボスからの通信", 
        "よし、金庫前に着いたか。この金庫を開けるために、今からお前たちにはハッキング装置を組み立ててもらう。<br><br>装置の作り方は箱の中だ。まずは封筒①を開けてくれ。もし困ったことがあれば、見張り役のメテオにメールを送るんだ。作戦開始だ！"
    );
};

// --- タブ切り替え ---
function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector(`button[onclick="switchTab('${tabId}')"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// --- メーラー機能 ---
function addMail(title, text) {
    const list = document.getElementById('mail-list');
    const mailDiv = document.createElement('div');
    mailDiv.innerHTML = `<button style="width:100%; margin-bottom:10px; text-align:left; background:#21262d; border:1px solid #30363d;" onclick="openMail('${title}', '${text}')">✉️ ${title}</button>`;
    list.prepend(mailDiv); // 最新のメールを一番上に追加
}

function openMail(title, text) {
    document.getElementById('mail-list').classList.add('hidden');
    document.getElementById('mail-body').classList.remove('hidden');
    document.getElementById('mail-title').innerText = title;
    document.getElementById('mail-text').innerHTML = text;
}

function closeMail() {
    document.getElementById('mail-list').classList.remove('hidden');
    document.getElementById('mail-body').classList.add('hidden');
}

// --- システム進行ロジック ---
function connectDevice() {
    // 擬似的な接続処理
    const btn = document.querySelector('#connect-screen button');
    btn.innerText = "接続中...";
    btn.style.background = "#555";
    
    setTimeout(() => {
        document.getElementById('connect-screen').classList.add('hidden');
        advanceStep('wiring-1'); // 手順1の配線図へ移行
    }, 1500);
}

// セクション（ステップ）の切り替え処理
function advanceStep(stepId) {
    // 現在表示されている step-box をすべて隠す
    document.querySelectorAll('#c123-make .step-box').forEach(box => box.classList.add('hidden'));
    // 指定された step-box を表示
    document.getElementById(stepId).classList.remove('hidden');
}

// パスワード判定
function checkPass(stepNum) {
    const input = document.getElementById(`input-pass-${stepNum}`).value.toUpperCase(); // 小文字入力も許容
    const msg = document.getElementById(`msg-${stepNum}`);
    
    if(input === passwords[stepNum]) {
        msg.innerText = "認証成功。ダウンロード完了。";
        msg.style.color = "#2ea043";
        
        setTimeout(() => {
            if(stepNum === 1) {
                advanceStep('wiring-2');
            } else if (stepNum === 2) {
                advanceStep('wiring-3');
            } else if (stepNum === 3) {
                triggerTrap(); // ボスの罠発動
            }
        }, 1500);
    } else {
        msg.innerText = "エラー：パスワードが一致しません。";
        msg.style.color = "#ff7b72";
    }
}

// --- 罠（タイマー）起動 ---
function triggerTrap() {
    bombActive = true;
    document.getElementById('timer').classList.remove('hidden');
    
    showModal(
        "【警告】ボスからの通信", 
        "悪いな。お前が作っていたのはハッキング装置ではなく、金庫の扉を吹き飛ばす爆弾だ。<br><br>金庫室から一歩でも出ようとすれば、センサーが反応して即ドカンだ。逃げ場はないぞ。爆弾と一緒に吹き飛べ！", 
        true
    );
    
    // 10分のカウントダウン開始
    timerInterval = setInterval(() => {
        timeLeft--;
        const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const s = (timeLeft % 60).toString().padStart(2, '0');
        document.getElementById('timer').innerText = `${m}:${s}`;
        
        if(timeLeft <= 0) gameOver();
    }, 1000);
}

// --- 停止ソフト（謎解き） ---
function unlockStopStep2() {
    const ans = document.getElementById('stop-pass').value;
    if(ans === "解除") { // テスト用正解
        document.getElementById('stop-step1').classList.add('hidden');
        document.getElementById('stop-step2').classList.remove('hidden');
        startLightSimulation();
    } else {
        alert("エラー：答えが違います");
    }
}

// --- 信号機シミュレーション（青長 -> 無点灯短 -> 赤長） ---
function startLightSimulation() {
    const light = document.getElementById('sim-light');
    
    function cycleLight() {
        if(!bombActive) return;
        
        if(lightPhase === 0) {
            // 青 (3秒)
            light.style.background = "#1f6feb";
            light.style.boxShadow = "0 0 25px #1f6feb";
            setTimeout(() => { lightPhase = 1; cycleLight(); }, 3000);
        } else if(lightPhase === 1) {
            // 黄色=壊れていて光らない (1秒)
            light.style.background = "#111";
            light.style.boxShadow = "inset 0 0 10px #000";
            setTimeout(() => { lightPhase = 2; cycleLight(); }, 1000);
        } else if(lightPhase === 2) {
            // 赤 (3秒)
            light.style.background = "#ff7b72";
            light.style.boxShadow = "0 0 25px #ff7b72";
            setTimeout(() => { lightPhase = 0; cycleLight(); }, 3000);
        }
    }
    cycleLight();
}

// --- コード切断判定 ---
function cutCode() {
    if(lightPhase === 1) {
        // 見えない黄色（暗闇）のタイミングで切った -> 成功
        bombActive = false;
        clearInterval(timerInterval);
        document.getElementById('timer').innerText = "STOP";
        gameClear();
    } else {
        // 青か赤で切った -> 爆発
        bombActive = false;
        clearInterval(timerInterval);
        gameOver();
    }
}

// --- エンディング制御 ---
function gameOver() {
    const modal = document.getElementById('article-modal');
    modal.classList.remove('hidden');
    document.getElementById('article-title').innerText = "【号外】〇〇銀行で謎の爆発";
    document.getElementById('article-text').innerHTML = "昨日、〇〇銀行で大規模な爆発が起き、金庫の中身が盗まれる事件が発生した。<br><br>現場からは爆発に巻き込まれたと見られる2人の遺体が発見されており、警察は強盗団の仲間割れの線も視野に入れて捜査を進めている...";
    document.getElementById('retry-btn').classList.remove('hidden');
}

function gameClear() {
    const modal = document.getElementById('article-modal');
    modal.classList.remove('hidden');
    document.getElementById('article-title').innerText = "【号外】銀行強盗のボス、逮捕";
    document.getElementById('article-text').innerHTML = "昨日、〇〇銀行を狙った強盗事件で、主犯格とみられる男がアジトで逮捕された。<br><br>警察への匿名の通報が決め手となった。なお、実行犯とみられる人物の行方は現在も分かっていない...";
    document.getElementById('extra-btn').classList.remove('hidden');
}

// --- モーダル制御 ---
function showModal(title, text, isTrap = false) {
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-text').innerHTML = text;
    
    // 「了解」ボタンを押したときの挙動
    document.getElementById('modal-btn').onclick = () => {
        closeModal();
        
        // 初回オープニング時
        if(!isTrap && currentStep === 0) {
            currentStep = 1;
            addMail("【作戦開始】ボスからの指示", "1. サイトでデバイスを接続しろ<br>2. 封筒①を開けろ<br>3. ライトを配線し、パスワードを解け");
        }
        
        // 罠発動時
        if(isTrap) {
            setTimeout(() => {
                addMail(
                    "【緊急】これ見てくれ！！（メテオより）", 
                    "おい！大丈夫か！俺の腕の時計でもカウントダウンが始まった！これ外せないぞ！<br><br>そういえば前ボスの部屋掃除した時に怪しいURLを拾ったんだ！<br><br><a href='#' onclick='document.getElementById(\"tab-c123-stop\").classList.remove(\"hidden\"); switchTab(\"c123-stop\"); closeMail();'>▶ C-123停止ソフトを起動する</a>"
                );
            }, 2000);
        }
    };
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}
