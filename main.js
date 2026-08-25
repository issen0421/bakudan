// --- 状態管理 ---
let currentStep = 1;
let bombActive = false;
let timeLeft = 600; // 10分 = 600秒
let timerInterval;

// 信号機シミュレーション用変数
let lightPhase = 0; // 0:青, 1:黄(暗闇), 2:赤
let lightTimer;

// パスワード設定（※テスト用）
const passwords = {
    1: "ライト",
    2: "ブザー",
    3: "モニター"
};

// --- 初期化 ---
window.onload = () => {
    showModal("ボスからの通信", "よし、金庫前に着いたか。この金庫を開けるために、今からお前たちにはハッキング装置を組み立ててもらう。<br><br>手順は箱の中に入れた。まずは封筒①を開けろ。困ったらメテオのメールを見ろ。");
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
    list.prepend(mailDiv);
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

// --- パスワード判定 ---
function checkPass(step) {
    const input = document.getElementById(`pass${step}`).value;
    const msg = document.getElementById(`msg${step}`);
    
    if(input === passwords[step]) {
        msg.innerText = "ダウンロード完了。";
        msg.style.color = "#2ea043";
        
        if(step === 1) {
            document.getElementById('step2-box').classList.remove('hidden');
        } else if (step === 2) {
            document.getElementById('step3-box').classList.remove('hidden');
        } else if (step === 3) {
            triggerTrap(); // ボスの罠発動
        }
    } else {
        msg.innerText = "エラー：パスワードが違います。";
        msg.style.color = "#ff7b72";
    }
}

// --- 罠（タイマー）起動 ---
function triggerTrap() {
    bombActive = true;
    document.getElementById('timer').classList.remove('hidden');
    
    showModal("【警告】ボスからの通信", "悪いな、実はお前が作っていたのは爆弾だ。<br><br>金庫室から一歩でも出れば即ドカンだ。逃げ場はないぞ。爆弾と一緒に吹き飛べ！", true);
    
    // タイマー開始
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
        alert("答えが違います");
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
            light.style.boxShadow = "0 0 20px #1f6feb";
            setTimeout(() => { lightPhase = 1; cycleLight(); }, 3000);
        } else if(lightPhase === 1) {
            // 黄色=壊れていて光らない (1秒)
            light.style.background = "#333";
            light.style.boxShadow = "inset 0 0 10px #000";
            setTimeout(() => { lightPhase = 2; cycleLight(); }, 1000);
        } else if(lightPhase === 2) {
            // 赤 (3秒)
            light.style.background = "#ff7b72";
            light.style.boxShadow = "0 0 20px #ff7b72";
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
}

// --- モーダル制御 ---
function showModal(title, text, isTrap = false) {
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-text').innerHTML = text;
    
    document.getElementById('modal-btn').onclick = () => {
        closeModal();
        if(!isTrap && currentStep === 1) {
            addMail("【作戦開始】ボスからの指示まとめ", "1. 封筒①を開けろ<br>2. ライトを配線しろ<br>3. ファイルのパスワードを解け");
        }
        if(isTrap) {
            setTimeout(() => {
                addMail("【緊急】これ見てくれ！！（メテオより）", "おい！大丈夫か！俺の腕の時計でもカウントダウンが始まった！<br><br>そういえば前ボスの部屋掃除した時に怪しいURLを拾ったんだ！<br><br><a href='#' onclick='document.getElementById(\"tab-c123-stop\").classList.remove(\"hidden\"); switchTab(\"c123-stop\"); closeMail();'>C-123停止ソフトを起動する</a>");
            }, 2000);
        }
    };
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}
