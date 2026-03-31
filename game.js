const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = { x: 240, y: 550, hp: 100 };
let activeBoss = null;
let gameState = 'TITLE';

function gameLoop() {
    ctx.clearRect(0, 0, 480, 640);
    
    if (gameState === 'BATTLE') {
        // ボスの更新
        BossPatterns.updateMasuo(activeBoss, 16);
        // 当たり判定
        checkCollisions();
        // 描画
        drawPlayer();
        drawBoss();
        drawBullets();
    }
    
    requestAnimationFrame(gameLoop);
}

// ゲーム開始
gameLoop();