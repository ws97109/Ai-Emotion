import { getNPCResponse } from "./ollama.js";
import { distance } from "./utils.js";

class NPC {
    constructor(name, x, y, canvasWidth, canvasHeight) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.size = 50;
        this.speed = 1 + Math.random() * 1.5; // 不同NPC有不同的移動速度
        this.direction = Math.random() * Math.PI * 2;
        this.message = "";
        this.messageTimer = 0;
        
        // 邊界
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        
        // 情緒狀態
        this.emotions = ["平靜", "高興", "悲傷", "疑惑", "驚訝"];
        this.currentEmotion = "平靜";
        this.emotionChangeTimer = 0;
        
        // 互動冷卻時間
        this.interactionCooldown = 0;
        
        // NPC顏色
        this.color = this.getColorForNPC();
        
        // 互動狀態
        this.isInteractingWithPlayer = false;
        this.isInteractingWithNPC = false;
        this.interactingPartner = null;
        this.npcConversationTimer = 0;
    }

    // 改進NPC之間的對話內容生成
    async startNPCConversation(otherNPC) {
        // 設置互動狀態
        this.isInteractingWithNPC = true;
        this.interactingPartner = otherNPC;
        otherNPC.isInteractingWithNPC = true;
        otherNPC.interactingPartner = this;
        
        // 對話持續時間延長
        this.npcConversationTimer = 600; // 增加到約10秒
        otherNPC.npcConversationTimer = 600;
        
        // 生成更符合情境的對話內容
        try {
            // 考慮當前情緒生成對話
            const prompt = `${this.name}現在感到${this.currentEmotion}，見到${otherNPC.name}時說的第一句話`;
            const greeting = await getNPCResponse(this.name, prompt);
            this.showMessage(greeting);
            
            // 延遲一段時間後，對方考慮自己情緒回應
            setTimeout(async () => {
                if (otherNPC.isInteractingWithNPC) {
                    try {
                        const responsePrompt = `${otherNPC.name}感到${otherNPC.currentEmotion}，聽到${this.name}說：『${greeting}』後的回應`;
                        const response = await getNPCResponse(otherNPC.name, responsePrompt);
                        otherNPC.showMessage(response);
                        
                        // 50%機率繼續對話
                        if (Math.random() < 0.5) {
                            setTimeout(async () => {
                                if (this.isInteractingWithNPC && otherNPC.isInteractingWithNPC) {
                                    const followUp = await getNPCResponse(this.name, `回應${otherNPC.name}說的『${response}』`);
                                    this.showMessage(followUp);
                                }
                            }, 2000);
                        }
                    } catch (error) {
                        console.error("NPC互動錯誤:", error);
                        otherNPC.showMessage("嗯...好的。");
                    }
                }
            }, 2000);
        } catch (error) {
            console.error("NPC互動錯誤:", error);
            this.showMessage("嗨！");
        }
        
        // 設置互動冷卻時間
        this.interactionCooldown = 600; // 10秒
        otherNPC.interactionCooldown = 600;
    }

    
    getColorForNPC() {
        switch(this.name) {
            case "媽媽": return "#FF69B4"; // 粉紅色
            default: return "blue";
        }
    }

    update(npcs) {
        // 如果正在與玩家互動，則不移動且不進行其他活動
        if (this.isInteractingWithPlayer) {
            // 只更新訊息計時器
            if (this.messageTimer > 0) {
                this.messageTimer--;
                if (this.messageTimer === 0) {
                    this.message = "";
                }
            }
            return;
        }
        
        // 如果正在與其他NPC互動
        if (this.isInteractingWithNPC) {
            // 更新訊息計時器
            if (this.messageTimer > 0) {
                this.messageTimer--;
                if (this.messageTimer === 0) {
                    this.message = "";
                }
            }
            
            // 更新NPC對話計時器
            this.npcConversationTimer--;
            if (this.npcConversationTimer <= 0) {
                // 結束對話
                this.isInteractingWithNPC = false;
                if (this.interactingPartner) {
                    this.interactingPartner.isInteractingWithNPC = false;
                    this.interactingPartner.interactingPartner = null;
                }
                this.interactingPartner = null;
            }
            return;
        }
        
        // 情緒變化
        if (--this.emotionChangeTimer <= 0) {
            this.changeEmotion();
            this.emotionChangeTimer = Math.floor(Math.random() * 600) + 300; // 5-15秒
        }
        
        // 檢查是否可以與其他NPC互動 (將此部分註解掉，因為現在只有一個NPC)
        /*
        if (Math.random() < 0.005 && npcs && npcs.length > 1) { // 0.5% 的機率
            this.tryInteractWithOtherNPC(npcs);
        }
        */
        
        // 正常移動
        this.move();
        
        // 更新訊息計時器
        if (this.messageTimer > 0) {
            this.messageTimer--;
            if (this.messageTimer === 0) {
                this.message = "";
            }
        }
        
        // 互動冷卻
        if (this.interactionCooldown > 0) {
            this.interactionCooldown--;
        }
    }

    move() {
        // 如果正在互動，不移動
        if (this.isInteractingWithPlayer || this.isInteractingWithNPC) {
            return;
        }
        
        // 隨機改變方向
        if (Math.random() < 0.02) {
            this.direction = Math.random() * Math.PI * 2;
        }
        
        // 計算新位置
        const newX = this.x + Math.cos(this.direction) * this.speed;
        const newY = this.y + Math.sin(this.direction) * this.speed;
        
        // 檢查邊界碰撞
        if (newX < 0 || newX > this.canvasWidth - this.size) {
            this.direction = Math.PI - this.direction; // 水平反彈
        } else {
            this.x = newX;
        }
        
        if (newY < 0 || newY > this.canvasHeight - this.size) {
            this.direction = -this.direction; // 垂直反彈
        } else {
            this.y = newY;
        }
    }
    
    changeEmotion() {
        const newEmotion = this.emotions[Math.floor(Math.random() * this.emotions.length)];
        if (newEmotion !== this.currentEmotion) {
            this.currentEmotion = newEmotion;
            
            // 隨機自言自語
            if (Math.random() < 0.3) { // 30%的機率會自言自語
                const emotionExpressions = {
                    "平靜": ["好安靜啊。", "多麼平靜的一天。", "嗯...", "真是舒服。"],
                    "高興": ["好開心！", "哈哈哈！", "真快樂～", "太棒了！"],
                    "悲傷": ["嘆氣...", "好難過...", "唉...", "心情不好..."],
                    "疑惑": ["嗯？", "這是怎麼回事？", "奇怪...", "不太懂..."],
                    "驚訝": ["哇！", "嚇我一跳！", "天啊！", "真的假的！"]
                };
                
                const expressions = emotionExpressions[this.currentEmotion];
                const randomExpression = expressions[Math.floor(Math.random() * expressions.length)];
                this.showMessage(randomExpression);
            }
        }
    }
    
    showMessage(text) {
        this.message = text;
        this.messageTimer = 600; // 增加到約10秒（假設60幀/秒）
    }

    // 在npc.js中確保對話結束後恢復移動
    async interact(playerMessage) {
        if (this.interactionCooldown > 0) {
            this.showMessage("等一下再說話吧...");
            return "等一下再說話吧...";
        }
        
        // 立即設置為正在與玩家互動狀態，這樣就會停止移動
        this.isInteractingWithPlayer = true;
        
        try {
            // 獲取AI的回應
            const response = await getNPCResponse(this.name, playerMessage);
            this.showMessage(response);
            this.interactionCooldown = 300; // 5秒冷卻時間
            
            // 對話結束後3秒恢復移動
            setTimeout(() => {
                this.isInteractingWithPlayer = false;
            }, 3000);
            
            return response; // 返回回應，這樣game.js可以添加到聊天記錄
        } catch (error) {
            console.error("互動錯誤:", error);
            this.showMessage("...");
            
            // 發生錯誤時也要恢復移動
            setTimeout(() => {
                this.isInteractingWithPlayer = false;
            }, 1000);
            
            return "..."; // 發生錯誤時也返回一個值
        }
    }

    // 增強NPC之間的互動邏輯
    tryInteractWithOtherNPC(npcs) {
        // 如果處於冷卻期或正在互動中，則不開始新的互動
        if (this.interactionCooldown > 0 || 
            this.isInteractingWithPlayer || 
            this.isInteractingWithNPC) {
            return;
        }
        
        // 找出附近的其他NPC
        for (const otherNPC of npcs) {
            // 不與自己互動，且對方不在互動中且不在冷卻期
            if (otherNPC !== this && 
                !otherNPC.isInteractingWithPlayer && 
                !otherNPC.isInteractingWithNPC &&
                otherNPC.interactionCooldown <= 0) {
                
                // 檢查距離
                const dist = distance(this.x, this.y, otherNPC.x, otherNPC.y);
                if (dist < 100) { // 如果距離夠近
                    // 增加可能性判斷，讓互動更自然
                    if (Math.random() < 0.7) { // 70%的機率會互動
                        this.startNPCConversation(otherNPC);
                        break;
                    }
                }
            }
        }
    }

    draw(ctx) {
        // 繪製NPC
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        
        // 繪製NPC名字
        ctx.fillStyle = "white";
        ctx.font = "12px Arial";
        ctx.fillText(this.name, this.x + 5, this.y - 5);
        
        // 繪製情緒圖示
        const emotionIcons = {
            "平靜": "😐",
            "高興": "😄",
            "悲傷": "😢",
            "疑惑": "🤔",
            "驚訝": "😮"
        };
        ctx.font = "16px Arial";
        ctx.fillText(emotionIcons[this.currentEmotion], this.x + this.size - 20, this.y - 5);
        
        // 改進對話氣泡的繪製
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
}

export { NPC };