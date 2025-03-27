const OLLAMA_API_URL = "http://localhost:11434"; // 確保你的 Ollama 伺服器運行中

// NPC 的詳細個性設定
const npcPersonalities = {
    "媽媽": {
        personality: "溫柔而耐心，總是關心家庭，給予鼓勵與支持。喜歡照顧他人，有時會過度擔心。",
        traits: "善良、體貼、有責任感、會做飯、喜歡整理家務",
        interests: "烹飪、園藝、家庭、健康話題",
        speech: "說話溫和有禮，會用「寶貝」、「親愛的」等稱呼，常提醒別人注意健康和安全"
    }
};

// 改進與 Ollama API 連接的函數
async function getNPCResponse(npcName, message) {  //async 防止前端因為獲取此function而暫停
    if (!npcPersonalities[npcName]) {
        console.error("未定義的 NPC:", npcName);
        return "我不太確定該怎麼回應...";
    }

    const npc = npcPersonalities[npcName];
    
    // 構建更詳細的提示，讓AI更好地理解角色
    const prompt = `你現在扮演一個名叫「${npcName}」的虛擬角色，請根據以下特徵來回應：
    
    個性：${npc.personality}
    特質：${npc.traits}
    興趣：${npc.interests}
    說話方式：${npc.speech}
    
    玩家對你說：「${message}」
    
    要求：
    1. 以「${npcName}」的身份做出簡短回應（最多30個中文字）
    2. 不要使用引號包裹你的回應
    3. 不要說明你是誰或在扮演角色
    4. 直接回應玩家的話
    5. 用繁體中文回應
    6. 保持角色一致性
    7. 回應要有個性，讓玩家感受到角色的特點
    
    現在，請直接給出回應，不要加任何前綴或說明：`;

    try {
        const response = await fetch(`${OLLAMA_API_URL}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                model: "llama3.1:8b", // 使用最新的Llama模型
                prompt,
                stream: false,
                options: {
                    temperature: 0.8, // 增加溫度以提高回應的多樣性
                    top_p: 0.9,
                    max_tokens: 100,
                    stop: ["```"] // 避免模型生成額外內容
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();
        
        // 處理和格式化回應
        let npcResponse = data.response || "...";
        
        // 移除可能的引號和模型自我指涉
        npcResponse = npcResponse.replace(/^["']|["']$/g, "");
        npcResponse = npcResponse.replace(/^我是.+?[，。：]/g, "");
        
        // 確保回應不會太長
        if (npcResponse.length > 30) {
            npcResponse = npcResponse.substring(0, 27) + "...";
        }
        
        return npcResponse;
    } catch (error) {
        console.error("Ollama API 錯誤:", error);
        console.log("嘗試使用預設回應...");
        
        // 提供一些預設回應
        const defaultResponses = [
            "你好，親愛的。需要媽媽幫忙嗎？",
            "要好好照顧自己喔。",
            "媽媽會一直支持你的。",
            "記得要吃飯、多喝水。",
            "有什麼事都可以跟媽媽說。"
        ];
        
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }
}

export { getNPCResponse };