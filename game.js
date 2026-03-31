/**
 * HIKAKIN Shooting: Final Crisis 2026
 * 特徴: 学校ボスラッシュ、卵の孵化、開示請求、真エンド
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let gameState = 'BATTLE'; 
let frameCount = 0;
let score = 0;

// --- 1. 画像アセット ---
const images = {
    player: new Image(),
    masuo: new Image(),
    seikin: new Image(),
    dekakin: new Image(assets/assets:boss_dekakin.png),
    egg: new Image(),     // 謎の卵
    shin: new Image(),    // 真・ヒカキン
    kano: new Image(assets/assets:boss_kano.png),
};

// パス設定（assetsフォルダ内のファイル名と一致させてください）
images.player.src  = 'assets/player.png';
images.masuo.src   = 'assets/boss_masuo.png';
images.seikin.src  = 'assets/boss_seikin.png';
images.dekakin.src = 'assets/assets:boss_dekakin.png';
images.egg.src     = 'assets/mystery_egg.png';
images.shin.src    = 'assets/boss_shin.png';
images.kano.src    = 'assets/assets:boss_kano.png';

// --- 2. オブジェクト管理 ---
let player = { x: 215, y: 550, w: 50, h: 50, hp: 100, speed: 5 };
let playerBullets = [];
let enemyBullets = [];

// ボスデータ（卵を経て真・ヒカキンへ）
const bossData = [
    { type: 'masuo',   name: "復讐のマスオ", hp: 3000, maxHp: 3000 },
    { type: 'seikin',  name: "覚醒のセイキン", hp: 5000, maxHp: 5000 },
    { type: 'dekakin', name: "暴走のデカキン", hp: 8000, maxHp: 8000 },
    { type: 'egg',     name: "謎の卵", hp: 1500, maxHp: 1500 }, // 攻撃すると割れる
    { type: 'shin',    name: "真・ヒカキン", hp: 15000, maxHp: 15000 },
    { type: 'kano',    name: "狩野英孝", hp: 99999, maxHp: 99999, isUnderstanding: false }
];
let currentBossIdx = 0;
let activeBoss = { ...bossData[0], x: 190, y: 80, w: 100, h: 100, state: 'NORMAL' };

// --- 3. メインループ ---
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'BATTLE') {
        updatePlayer();
        updateBullets();
        updateBossLogic();
        checkCollisions();
        draw();
    } else if (gameState === 'EVENT') {
        draw(); 
    }

    frameCount++;
    requestAnimationFrame(gameLoop);
}

// --- 4. ボスごとの行動ロジック ---
function updateBossLogic() {
    if (!activeBoss) return;

    switch (activeBoss.type) {
        case 'masuo':
            if (activeBoss.hp < 1000) activeBoss.state = 'SLASH_B';
            if (frameCount % 60 === 0) spawnBullet(activeBoss.x+50, activeBoss.y+50, "時空割");
            break;

        case 'egg':
            // 卵は攻撃しないが、HPが減るほど激しく震える
            let shake = (1 - activeBoss.hp / activeBoss.maxHp) * 10;
            activeBoss.x = 190 + Math.random() * shake - shake/2;
            break;

        case 'shin':
            // 真・ヒカキン：登録者弾幕（全方位）
            if (frameCount % 20 === 0) {
                for(let i=0; i<12; i++) spawnBullet(activeBoss.x+50, activeBoss.y+50, "登録者", i);
            }
            break;

        case 'kano':
            if (!activeBoss.isUnderstanding) {
                activeBoss.x += Math.sin(frameCount * 0.1) * 10; // 回避運動
            }
            break;
    }

    // 撃破（または孵化）判定
    if (activeBoss.hp <= 0) {
        handleBossDefeat();
    }
}

// --- 5. 演出と交代 ---
function handleBossDefeat() {
    if (activeBoss.type === 'egg') {
        // 卵が割れる時の特別演出（画面フラッシュなど）
        startHatchEffect(); 
    }
    
    currentBossIdx++;
    if (currentBossIdx < bossData.length) {
        let next = bossData[currentBossIdx];
        activeBoss = { ...next, x: 190, y: 80, w: 100, h: 100, state: 'NORMAL' };
        
        // 狩野英孝が登場したら自動的に「開示請求」イベントへ
        if (activeBoss.type === 'kano') performKaijiSeikyuEffect();
    } else {
        gameState = 'ENDING';
    }
}

function startHatchEffect() {
    gameState = 'EVENT';
    // 画面を白く光らせて、真・ヒカキンを降臨させる
    setTimeout(() => {
        gameState = 'BATTLE';
        console.log("真・ヒカキンが孵化した！");
    }, 2000);
}

// --- 6. 当たり判定 ---
function checkCollisions() {
    playerBullets.forEach((b, bi) => {
        if (hitTest(b, activeBoss)) {
            // 狩野英孝が無敵状態の時
            if (activeBoss.type === 'kano' && !activeBoss.isUnderstanding) {
                // ダメージを与えない
            } else {
                activeBoss.hp -= 25;
                score += 10;
            }
            playerBullets.splice(bi, 1);
        }
    });
}

function hitTest(b, boss) {
    return b.x > boss.x && b.x < boss.x + boss.w && b.y > boss.y && b.y < boss.y + boss.h;
}

// --- 7. 描画処理 ---
function draw() {
    // プレイヤー描画
    ctx.drawImage(images.player, player.x, player.y, player.w, player.h);

    // ボス描画
    let bImg = images[activeBoss.type];
    
    // 卵の脈動演出
    if (activeBoss.type === 'egg') {
        let pulse = Math.sin(frameCount * 0.1) * 5;
        ctx.drawImage(bImg, activeBoss.x - pulse/2, activeBoss.y - pulse/2, activeBoss.w + pulse, activeBoss.h + pulse);
    } else {
        if (activeBoss.state === 'SLASH_B') ctx.filter = 'invert(1)'; // 時空割演出
        ctx.drawImage(bImg, activeBoss.x, activeBoss.y, activeBoss.w, activeBoss.h);
        ctx.filter = 'none';
    }

    // 弾の描画
    enemyBullets.forEach(b => {
        ctx.fillStyle = "yellow";
        ctx.fillText(b.type, b.x, b.y);
    });
    
    playerBullets.forEach(b => {
        ctx.fillStyle = "cyan";
        ctx.fillRect(b.x, b.y, 4, 10);
    });

    // HPゲージ
    ctx.fillStyle = "white";
    ctx.fillText(activeBoss.name, 10, 20);
    ctx.fillStyle = "red";
    ctx.fillRect(10, 30, (activeBoss.hp / activeBoss.maxHp) * 460, 8);
}

// 弾の発射
function spawnBullet(x, y, type, idx = 0) {
    let vx = 0, vy = 3;
    if (type === "登録者") {
        vx = Math.cos(idx) * 4;
        vy = Math.sin(idx) * 4;
    }
    enemyBullets.push({ x, y, vx, vy, type });
}

// 更新ループ開始
gameLoop();
