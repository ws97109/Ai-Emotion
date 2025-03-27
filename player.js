class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 50;
        this.speed = 5;
        this.message = "";
        this.messageTimer = 0;
    }

    update(keys, canvasWidth, canvasHeight) {
        // 處理玩家移動
        if (keys["ArrowUp"] || keys["w"]) this.y -= this.speed;
        if (keys["ArrowDown"] || keys["s"]) this.y += this.speed;
        if (keys["ArrowLeft"] || keys["a"]) this.x -= this.speed;
        if (keys["ArrowRight"] || keys["d"]) this.x += this.speed;
        
        // 確保玩家不會超出畫布邊界
        this.x = Math.max(0, Math.min(this.x, canvasWidth - this.size));
        this.y = Math.max(0, Math.min(this.y, canvasHeight - this.size));
        
        // 更新訊息計時器，延長顯示時間
        if (this.messageTimer > 0) {
            this.messageTimer--;
            if (this.messageTimer === 0) {
                this.message = "";
            }
        }
    }
    
    sendMessage(message) {
        this.message = message;
        this.messageTimer = 600; // 增加到約10秒（假設60幀/秒）
    }

    draw(ctx, playerImg) {
        // 繪製玩家
        if (playerImg && playerImg.complete) {
            ctx.drawImage(playerImg, this.x, this.y, this.size, this.size);
        } else {
            // 備用繪製方式
            ctx.fillStyle = "red";
            ctx.fillRect(this.x, this.y, this.size, this.size);
        }
        
        // 繪製玩家訊息，改進顯示效果
        if (this.message) {
            // 測量文字寬度以適應對話框
            ctx.font = "14px Arial";
            const textWidth = ctx.measureText(this.message).width;
            const bubbleWidth = Math.min(Math.max(textWidth + 20, 80), 200);
            const bubbleHeight = 30;
            
            // 繪製對話框
            const bubbleX = this.x + (this.size / 2) - (bubbleWidth / 2);
            const bubbleY = this.y - 40;
            
            // 對話框背景
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;
            
            // 圓角矩形
            ctx.beginPath();
            ctx.moveTo(bubbleX + 10, bubbleY);
            ctx.lineTo(bubbleX + bubbleWidth - 10, bubbleY);
            ctx.quadraticCurveTo(bubbleX + bubbleWidth, bubbleY, bubbleX + bubbleWidth, bubbleY + 10);
            ctx.lineTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight - 10);
            ctx.quadraticCurveTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight, bubbleX + bubbleWidth - 10, bubbleY + bubbleHeight);
            ctx.lineTo(bubbleX + 10, bubbleY + bubbleHeight);
            ctx.quadraticCurveTo(bubbleX, bubbleY + bubbleHeight, bubbleX, bubbleY + bubbleHeight - 10);
            ctx.lineTo(bubbleX, bubbleY + 10);
            ctx.quadraticCurveTo(bubbleX, bubbleY, bubbleX + 10, bubbleY);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // 小三角形指向角色
            ctx.beginPath();
            ctx.moveTo(this.x + (this.size / 2), this.y - 5);
            ctx.lineTo(this.x + (this.size / 2) - 10, bubbleY + bubbleHeight);
            ctx.lineTo(this.x + (this.size / 2) + 10, bubbleY + bubbleHeight);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // 繪製文字
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            ctx.fillText(this.message, bubbleX + (bubbleWidth / 2), bubbleY + 20);
            ctx.textAlign = "start"; // 恢復預設對齊
        }
    }
    
    // 檢測與NPC的碰撞
    isCollidingWith(npc) {
        return (
            this.x < npc.x + npc.size &&
            this.x + this.size > npc.x &&
            this.y < npc.y + npc.size &&
            this.y + this.size > npc.y
        );
    }
}

export { Player };