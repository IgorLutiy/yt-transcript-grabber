document.getElementById('copyBtn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const status = document.getElementById('status');
    status.innerText = "⏳ Ищу транскрипт...";

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: grabTextFromPage
    }, (results) => {
        if (results && results[0].result) {
            status.innerText = "✅ Текст скопирован!";
        } else {
            status.innerText = "❌ Не удалось найти транскрипт.";
        }
    });
});

// Эта функция выполняется на вкладке YouTube
async function grabTextFromPage() {
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    // 1. Проверяем, открыт ли уже транскрипт
    let segments = document.querySelectorAll('ytd-transcript-segment-renderer .segment-text');

    if (segments.length === 0) {
        // 2. Раскрываем описание ("Ещё")
        const expandBtn = document.querySelector('tp-yt-paper-button#expand, #expand, .ytd-video-secondary-info-renderer #expand');
        if (expandBtn) {
            expandBtn.click();
            await sleep(400); // Ждем анимацию раскрытия
        }

        // 3. Ищем кнопку "Показать текст видео"
        // Пробуем найти по селектору, который YouTube использует для этой кнопки
        let transcriptBtn = document.querySelector('button[aria-label="Показать текст видео"], button[aria-label="Show transcript"]') || 
                            Array.from(document.querySelectorAll('ytd-button-renderer')).find(el => 
                                el.innerText.includes("Показать текст") || el.innerText.includes("Show transcript")
                            );

        if (transcriptBtn) {
            transcriptBtn.click();
            
            // 4. Ждем появления сегментов текста (цикл до 5 секунд)
            for (let i = 0; i < 20; i++) {
                await sleep(250);
                segments = document.querySelectorAll('yt-formatted-string.segment-text');
                if (segments.length > 0) break;
            }
        }
    }

    // 5. Копируем, если нашли
    if (segments.length > 0) {
        const fullText = Array.from(segments).map(s => s.innerText.trim()).join(' ');
        
        // В Chrome расширениях копирование в буфер из content script делается так:
        const textArea = document.createElement("textarea");
        textArea.value = fullText;
        document.body.appendChild(textArea);
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
    }

    return false;

}
