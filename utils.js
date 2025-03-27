/**
 * 生成隨機整數
 * @param {number} min 最小值（包含）
 * @param {number} max 最大值（包含）
 * @returns {number} 隨機整數
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 計算兩點之間的距離
 * @param {number} x1 第一點的X座標
 * @param {number} y1 第一點的Y座標
 * @param {number} x2 第二點的X座標
 * @param {number} y2 第二點的Y座標
 * @returns {number} 兩點之間的距離
 */
function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 檢查兩個矩形是否碰撞
 * @param {Object} rect1 第一個矩形 {x, y, width, height}
 * @param {Object} rect2 第二個矩形 {x, y, width, height}
 * @returns {boolean} 是否碰撞
 */
function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

/**
 * 將文字包裝成多行
 * @param {CanvasRenderingContext2D} ctx Canvas上下文
 * @param {string} text 要包裝的文字
 * @param {number} maxWidth 最大寬度
 * @returns {string[]} 包裝後的文字行
 */
function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + ' ' + word).width;
        
        if (width < maxWidth) {
            currentLine += ' ' + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    
    lines.push(currentLine);
    return lines;
}

export { randomInt, distance, checkCollision, wrapText };