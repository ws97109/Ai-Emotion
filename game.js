import { Player } from "./player.js";
import { NPC } from "./npc.js";
import { randomInt } from "./utils.js";

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.width = canvas.width;
        this.height = canvas.height;
        
        // 載入圖片
        this.playerImg = new Image();
        this.playerImg.src = "施.png";
        
        this.backgroundImg = new Image();
        this.backgroundImg.src = "地板.jpeg";
        
        // 初始化遊戲元素
        this.player = new Player(100, 100);
        this.npcs = [];
        
        // 創建一個NPC (只保留媽媽)
        this.npcs.push(new NPC("媽媽", randomInt(100, this.width - 150), randomInt(100, this.height - 150), this.width, this.height));
        
        // 控制
        this.keys = {};
        this.setupEventListeners();
        
        // 玩家輸入
        this.playerInput = "";
        this.showInputBox = false;
        this.interactingNPC = null;
        
        // 新增：聊天記錄
        this.chatHistory = [];
        this.maxChatHistory = 10; // 保存的最大對話記錄數量
        
        // 建立聊天記錄UI
        this.createChatHistoryUI();
    }
    
    // 新增：建立聊天記錄UI
    createChatHistoryUI() {
        // 創建聊天記錄面板
        this.chatHistoryPanel = document.createElement("div");
        this.chatHistoryPanel.className = "chat-history-panel";
        this.chatHistoryPanel.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            width: 250px;
            height: 300px;
            background-color: rgba(0, 0, 0, 0.7);
            border: 2px solid white;
            border-radius: 5px;
            color: white;
            overflow-y: auto;
            padding: 10px;
            font-family: Arial, sans-serif;
            font-size: 14px;
        `;
        
        // 創建標題
        const title = document.createElement("div");
        title.textContent = "聊天記錄";
        title.style.cssText = `
            font-weight: bold;
            text-align: center;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid gray;
        `;
        this.chatHistoryPanel.appendChild(title);
        
        // 創建聊天記錄容器
        this.chatHistoryContainer = document.createElement("div");
        this.chatHistoryPanel.appendChild(this.chatHistoryContainer);
        
        // 添加到文檔
        document.body.appendChild(this.chatHistoryPanel);
    }
    
    // 新增：添加聊天記錄
    addChatHistory(speaker, message) {
        // 創建新的聊天記錄
        this.chatHistory.push({ speaker, message, time: new Date() });
        
        // 如果超過最大記錄數量，則移除最舊的
        if (this.chatHistory.length > this.maxChatHistory) {
            this.chatHistory.shift();
        }
        
        // 更新UI
        this.updateChatHistoryUI();
    }
    
    // 新增：更新聊天記錄UI
    updateChatHistoryUI() {
        // 清空容器
        this.chatHistoryContainer.innerHTML = "";
        
        // 添加每條聊天記錄
        this.chatHistory.forEach(chat => {
            const chatElement = document.createElement("div");
            chatElement.style.cssText = `
                margin-bottom: 8px;
                word-wrap: break-word;
            `;
            
            // 根據發言者設置不同顏色
            let speakerColor = "white";
            if (chat.speaker === "玩家") {
                speakerColor = "#AAFFAA";
            } else if (chat.speaker === "媽媽") {
                speakerColor = "#FF69B4";
            }
            
            chatElement.innerHTML = `<span style="color: ${speakerColor};">${chat.speaker}:</span> ${chat.message}`;
            this.chatHistoryContainer.appendChild(chatElement);
        });
        
        // 滾動到最底部
        this.chatHistoryPanel.scrollTop = this.chatHistoryPanel.scrollHeight;
    }
    
    setupEventListeners() {
        // 鍵盤控制
        window.addEventListener("keydown", (e) => {
            this.keys[e.key] = true;
            
            // 按下空格鍵時，檢查是否可以與NPC互動
            if (e.key === " " && !this.showInputBox) {
                this.checkNPCInteraction();
            }
            
            // ESC鍵取消輸入
            if (e.key === "Escape" && this.showInputBox) {
                this.cancelInput();
            }
            
            // 輸入框處理
            if (this.showInputBox) {
                if (e.key === "Enter") {
                    this.submitInput();
                } else if (e.key === "Backspace") {
                    this.playerInput = this.playerInput.slice(0, -1);
                }
                // 其他按鍵不做特殊處理，改用compositionend處理
            }
        });
        
        window.addEventListener("keyup", (e) => {
            this.keys[e.key] = false;
        });
    
        // 新增：處理中文輸入
        // 創建一個隱藏的input元素來處理中文輸入
        const hiddenInput = document.createElement("input");
        hiddenInput.style.position = "absolute";
        hiddenInput.style.opacity = "0";
        hiddenInput.style.pointerEvents = "none";
        document.body.appendChild(hiddenInput);
    
        // 顯示輸入框時聚焦隱藏輸入框
        this.showHiddenInput = () => {
            hiddenInput.value = this.playerInput;
            hiddenInput.focus();
        };
    
        // 監聽輸入事件
        hiddenInput.addEventListener("input", (e) => {
            if (this.showInputBox) {
                this.playerInput = e.target.value;
            }
        });
    
        // 調整視窗大小
        window.addEventListener("resize", () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            
            // 更新NPC的邊界
            this.npcs.forEach(npc => {
                npc.canvasWidth = this.width;
                npc.canvasHeight = this.height;
            });
        });
    }
    
    checkNPCInteraction() {
        for (const npc of this.npcs) {
            // 檢查NPC是否已經在互動中
            if (npc.isInteractingWithPlayer || npc.isInteractingWithNPC) {
                continue; // 跳過已經在互動的NPC
            }
            
            if (this.player.isCollidingWith(npc)) {
                this.interactingNPC = npc;
                // 立即設置NPC為互動狀態，這樣就會停止移動
                npc.isInteractingWithPlayer = true;
                this.showInputBox = true;
                this.playerInput = "";
                this.showHiddenInput(); // 顯示並聚焦隱藏輸入框
                return;
            }
        }
        
        // 如果沒有NPC可以互動，顯示提示訊息
        this.player.sendMessage("附近沒有人可以對話");
    }
    
    cancelInput() {
        this.showInputBox = false;
        
        // 確保在取消輸入時也清除NPC的互動狀態
        if (this.interactingNPC) {
            this.interactingNPC.isInteractingWithPlayer = false;
            this.interactingNPC = null;
        }
        
        this.playerInput = "";
    }
    
    async submitInput() {
        if (this.interactingNPC && this.playerInput.trim()) {
            const message = this.playerInput.trim();
            
            // 先隱藏輸入框，避免重複輸入
            this.showInputBox = false;
            
            // 顯示玩家說的話
            this.player.sendMessage(message);
            
            // 新增：添加玩家對話到聊天記錄
            this.addChatHistory("玩家", message);
            
            // 發送訊息給NPC (保存NPC的引用)
            const npc = this.interactingNPC;
            
            // 暫時重置interactingNPC，以便可以發送新訊息
            this.interactingNPC = null;
            
            // 等待NPC回應
            const response = await npc.interact(message);
            
            // 新增：添加NPC回應到聊天記錄
            if (response) {
                this.addChatHistory(npc.name, response);
            }
            
            // 重置玩家輸入
            this.playerInput = "";
        } else {
            this.cancelInput();
        }
    }
    
    update() {
        // 如果正在輸入，玩家不移動
        if (!this.showInputBox) {
            this.player.update(this.keys, this.width, this.height);
        }
        
        // 更新所有NPC，傳入完整NPC列表以便互動
        this.npcs.forEach(npc => npc.update(this.npcs));
    }
    
    draw() {
        // 清除畫面
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // 繪製背景
        if (this.backgroundImg.complete) {
            for (let x = 0; x < this.width; x += this.backgroundImg.width) {
                for (let y = 0; y < this.height; y += this.backgroundImg.height) {
                    this.ctx.drawImage(this.backgroundImg, x, y, this.backgroundImg.width, this.backgroundImg.height);
                }
            }
        }
        
        // 繪製玩家
        this.player.draw(this.ctx, this.playerImg);
        
        // 繪製所有NPC
        this.npcs.forEach(npc => npc.draw(this.ctx));
        
        // 繪製輸入框
        if (this.showInputBox) {
            this.drawInputBox();
        }
    }
    
    drawInputBox() {
        const boxWidth = 300;
        const boxHeight = 40;
        const boxX = (this.width - boxWidth) / 2;
        const boxY = this.height - 100;
        
        // 繪製輸入框背景
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        this.ctx.strokeStyle = "white";
        this.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
        
        // 繪製輸入文字
        this.ctx.fillStyle = "white";
        this.ctx.font = "16px Arial";
        this.ctx.fillText(this.playerInput, boxX + 10, boxY + 25);
        
        // 繪製輸入提示
        this.ctx.fillStyle = "yellow";
        this.ctx.fillText(`對 ${this.interactingNPC?.name || "NPC"} 說：`, boxX, boxY - 10);
        
        // 繪製閃爍的游標
        if (Math.floor(Date.now() / 500) % 2 === 0) {
            const textWidth = this.ctx.measureText(this.playerInput).width;
            this.ctx.fillRect(boxX + 10 + textWidth, boxY + 10, 2, 20);
        }
    }
    
    start() {
        this.gameLoop();
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

export { Game };