// furniture.js - 家具類及互動系統

class Furniture {
    constructor(name, x, y, width, height, type, imgSrc = null) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type; // 家具類型: 'bed', 'table', 'sofa', 'bookshelf', 'cabinet', 'tv', 'plant'等
        this.isInteracting = false;
        this.interactionMessage = "";
        this.messageTimer = 0;
        
        // 家具图片
        this.img = null;
        if (imgSrc) {
            this.img = new Image();
            this.img.src = imgSrc;
        }
        
        // 互動的情緒影響
        this.emotionEffects = this.getEmotionEffects();
        
        // 互動冷卻時間
        this.interactionCooldown = 0;
    }
    
    // 根據家具類型設置情緒影響
    getEmotionEffects() {
        const effects = {};
        
        switch(this.type) {
            case 'bed':
                effects.平靜 = 0.3;
                effects.高興 = 0.1;
                effects.悲傷 = -0.2;
                break;
            case 'sofa':
                effects.平靜 = 0.2;
                effects.高興 = 0.2;
                effects.疑惑 = -0.1;
                break;
            case 'tv':
                effects.高興 = 0.3;
                effects.平靜 = -0.1;
                effects.悲傷 = -0.2;
                break;
            case 'bookshelf':
                effects.平靜 = 0.2;
                effects.疑惑 = -0.3;
                effects.驚訝 = 0.1;
                break;
            case 'plant':
                effects.平靜 = 0.3;
                effects.悲傷 = -0.2;
                break;
            case 'table':
                effects.平靜 = 0.1;
                effects.高興 = 0.1;
                break;
            case 'kitchen':
                effects.高興 = 0.3;
                effects.平靜 = 0.1;
                effects.悲傷 = -0.2;
                break;
            case 'music':
                effects.高興 = 0.4;
                effects.悲傷 = -0.3;
                effects.平靜 = 0.2;
                break;
            case 'photo':
                effects.高興 = 0.2;
                effects.悲傷 = 0.2; // 照片可能引起懷舊也會有些悲傷
                effects.驚訝 = 0.1;
                break;
            default:
                effects.平靜 = 0.1;
        }
        
        return effects;
    }
    
    // 檢查是否碰撞
    isCollidingWith(entity) {
        return (
            this.x < entity.x + entity.size &&
            this.x + this.width > entity.x &&
            this.y < entity.y + entity.size &&
            this.y + this.height > entity.y
        );
    }
    
    // 玩家互動
    interact(player) {
        if (this.interactionCooldown > 0) {
            return null;
        }
        
        let message = "";
        
        switch(this.type) {
            case 'bed':
                message = "舒適的床，躺下去就不想起來了";
                break;
            case 'sofa':
                message = "柔軟的沙發，坐著看電視最舒服了";
                break;
            case 'tv':
                message = "打開電視，正在播放一個有趣的節目";
                break;
            case 'bookshelf':
                message = "書架上有許多書籍，知識的寶庫";
                break;
            case 'plant':
                message = "綠色植物讓人心情愉悅";
                break;
            case 'table':
                message = "桌子上收拾得很整齊";
                break;
            case 'kitchen':
                message = "廚房充滿了美食的香味";
                break;
            case 'music':
                message = "播放了一首輕快的曲子";
                break;
            case 'photo':
                message = "照片中記錄著美好的回憶";
                break;
            default:
                message = `這是一個${this.name}`;
        }
        
        this.interactionMessage = message;
        this.messageTimer = 300; // 5秒顯示
        this.interactionCooldown = 180; // 3秒冷卻
        
        return {
            message: message,
            type: this.type,
            effects: this.emotionEffects
        };
    }
    
    // NPC互動處理
    npcInteract(npc) {
        if (this.interactionCooldown > 0) {
            return null;
        }
        
        // 根據NPC的性格調整互動效果
        let personalityMultiplier = 1.0;
        
        if (npc.name === "媽媽") {
            // 媽媽對不同家具有不同的反應倾向
            switch(this.type) {
                case 'kitchen':
                    personalityMultiplier = 1.5; // 媽媽特別喜歡廚房
                    break;
                case 'plant':
                    personalityMultiplier = 1.3; // 媽媽喜歡植物
                    break;
                case 'bed':
                    personalityMultiplier = 0.8; // 媽媽不太會去休息
                    break;
            }
        }
        
        // 計算實際情緒影響
        const actualEffects = {};
        for (const emotion in this.emotionEffects) {
            actualEffects[emotion] = this.emotionEffects[emotion] * personalityMultiplier;
        }
        
        // 設置互動訊息和冷卻時間
        this.interactionCooldown = 600; // NPC 互動冷卻時間較長
        
        return {
            type: this.type,
            effects: actualEffects
        };
    }
    
    update() {
        // 更新訊息顯示時間
        if (this.messageTimer > 0) {
            this.messageTimer--;
            if (this.messageTimer === 0) {
                this.interactionMessage = "";
            }
        }
        
        // 更新冷卻時間
        if (this.interactionCooldown > 0) {
            this.interactionCooldown--;
        }
    }
    
    draw(ctx) {
        // 檢查是否有圖片
        if (this.img && this.img.complete) {
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        } else {
            // 備用顯示 - 根據家具類型顯示不同顏色
            let color = "#8B4513"; // 默認棕色
            
            switch(this.type) {
                case 'bed':
                    color = "#6A5ACD"; // 藍紫色
                    break;
                case 'sofa':
                    color = "#20B2AA"; // 淺綠色
                    break;
                case 'tv':
                    color = "#2F4F4F"; // 深灰色
                    break;
                case 'bookshelf':
                    color = "#8B4513"; // 棕色
                    break;
                case 'plant':
                    color = "#228B22"; // 森林綠
                    break;
                case 'table':
                    color = "#DEB887"; // 褐色
                    break;
                case 'kitchen':
                    color = "#CD5C5C"; // 紅色
                    break;
                case 'music':
                    color = "#9370DB"; // 紫色
                    break;
                case 'photo':
                    color = "#FFD700"; // 金色
                    break;
            }
            
            // 繪製家具
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // 繪製家具名稱
            ctx.fillStyle = "white";
            ctx.font = "12px Arial";
            ctx.fillText(this.name, this.x + 5, this.y + 15);
        }
        
        // 繪製互動訊息
        if (this.interactionMessage) {
            // 測量文字寬度以適應對話框
            ctx.font = "14px Arial";
            const textWidth = ctx.measureText(this.interactionMessage).width;
            const bubbleWidth = Math.min(Math.max(textWidth + 20, 80), 200);
            const bubbleHeight = 30;
            
            // 繪製對話框
            const bubbleX = this.x + (this.width / 2) - (bubbleWidth / 2);
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
            
            // 小三角形指向家具
            ctx.beginPath();
            ctx.moveTo(this.x + (this.width / 2), this.y);
            ctx.lineTo(this.x + (this.width / 2) - 10, bubbleY + bubbleHeight);
            ctx.lineTo(this.x + (this.width / 2) + 10, bubbleY + bubbleHeight);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // 繪製文字
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            ctx.fillText(this.interactionMessage, bubbleX + (bubbleWidth / 2), bubbleY + 20);
            ctx.textAlign = "start"; // 恢復預設對齊
        }
    }
}

export { Furniture };