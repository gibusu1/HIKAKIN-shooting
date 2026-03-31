// 共通の演出管理クラス
const Effects = {
    shake: (power) => { /* 画面を揺らす */ },
    flash: () => { /* 画面を白く光らせる */ },
    showKaiji: () => {
        // 前に作った開示請求のDOM操作
        document.getElementById('kaiji-cutin').style.display = 'block';
    }
};