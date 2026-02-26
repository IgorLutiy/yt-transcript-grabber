console.log("YT Grabber: Попытка поиска заголовка...");

function injectCopyButton() {
    if (document.getElementById('my-transcript-copy-btn')) return;

    // Ищем все элементы, которые могут быть заголовком транскрипта
    const possibleHeaders = document.querySelectorAll('ytd-transcript-renderer #title, .ytd-transcript-header-renderer, #header-text');
    
    let targetHeader = null;

    // Проверяем, какой из них действительно относится к транскрипту
    possibleHeaders.forEach(el => {
        if (el.innerText.includes("Расшифровка видео") || el.innerText.includes("Transcript")) {
            targetHeader = el;
        }
    });

    if (targetHeader) {
        console.log("YT Grabber: Цель найдена! Вставляю кнопку.");
        
        const btn = document.createElement('button');
        btn.id = 'my-transcript-copy-btn';
        btn.innerText = '📋 COPY ALL';
        
        // Стили (сделаем её яркой для теста)
        Object.assign(btn.style, {
            marginLeft: '15px',
            padding: '4px 12px',
            backgroundColor: '#065fd4', // Синий цвет YouTube
            color: 'white',
            border: 'none',
            borderRadius: '2px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            zIndex: '9999'
        });

        btn.onclick = (e) => {
            e.stopPropagation(); // Чтобы клик не закрыл случайно панель
            const segments = document.querySelectorAll('ytd-transcript-segment-renderer .segment-text');
            const text = Array.from(segments).map(s => s.innerText.trim()).join(' ');
            
            if (text) {
                navigator.clipboard.writeText(text).then(() => {
                    btn.innerText = '✅ COPIED!';
                    setTimeout(() => btn.innerText = '📋 COPY ALL', 2000);
                });
            }
        };

        targetHeader.appendChild(btn);
    }
}

// Следим за изменениями страницы
const observer = new MutationObserver(injectCopyButton);
observer.observe(document.body, { childList: true, subtree: true });