const fs = require('fs');
const path = require('path');

// ===== CONFIGURATION =====
const SLIDES_DIR = __dirname;
const OUTPUT_FILE = path.join(SLIDES_DIR, 'EduContentCMS_Slides.html');

const chapters = [
    { name: "Chapter 1. 프로젝트 개요", slides: ["chapter01/01.html", "chapter01/02.html", "chapter01/03.html", "chapter01/04.html", "chapter01/05.html"] },
    { name: "Chapter 2", slides: ["chapter02/06.html", "chapter02/07.html", "chapter02/08.html", "chapter02/09.html", "chapter02/10.html"] },
    { name: "Chapter 3", slides: ["chapter03/11.html", "chapter03/12.html", "chapter03/13.html", "chapter03/14.html", "chapter03/15.html", "chapter03/16.html"] },
    { name: "Chapter 4", slides: ["chapter04/17.html", "chapter04/18.html", "chapter04/19.html", "chapter04/20.html", "chapter04/21.html", "chapter04/22.html", "chapter04/23.html"] },
    { name: "Chapter 5", slides: ["chapter05/24.html", "chapter05/25.html", "chapter05/26.html", "chapter05/27.html", "chapter05/28.html", "chapter05/29.html", "chapter05/30.html", "chapter05/31.html"] },
    { name: "Chapter 6", slides: ["chapter06/32.html", "chapter06/33.html", "chapter06/34.html", "chapter06/35.html", "chapter06/36.html", "chapter06/37.html", "chapter06/38.html", "chapter06/39.html", "chapter06/40.html", "chapter06/41.html"] },
    { name: "Chapter 7", slides: ["chapter07/42.html", "chapter07/43.html", "chapter07/44.html", "chapter07/45.html", "chapter07/46.html", "chapter07/47.html", "chapter07/48.html"] },
    { name: "Chapter 8", slides: ["chapter08/49.html", "chapter08/50.html", "chapter08/51.html", "chapter08/52.html", "chapter08/53.html", "chapter08/54.html", "chapter08/55.html", "chapter08/56.html", "chapter08/57.html"] },
    { name: "Chapter 9", slides: ["chapter09/58.html", "chapter09/59.html", "chapter09/60.html", "chapter09/61.html", "chapter09/62.html", "chapter09/63.html", "chapter09/64.html", "chapter09/65.html", "chapter09/66.html", "chapter09/67.html"] },
    { name: "Chapter 10", slides: ["chapter10/68.html", "chapter10/69.html", "chapter10/70.html", "chapter10/71.html", "chapter10/72.html", "chapter10/73.html", "chapter10/74.html", "chapter10/75.html"] },
    { name: "Chapter 11", slides: ["chapter11/76.html", "chapter11/77.html", "chapter11/78.html", "chapter11/79.html", "chapter11/80.html", "chapter11/81.html", "chapter11/82.html"] },
];

// ===== READ ALL SLIDES =====
console.log('📖 Reading 82 slide files...');

const slideContents = [];
let totalBytes = 0;

for (const ch of chapters) {
    for (const slideFile of ch.slides) {
        const filePath = path.join(SLIDES_DIR, slideFile);
        const content = fs.readFileSync(filePath, 'utf-8');
        slideContents.push(content);
        totalBytes += Buffer.byteLength(content, 'utf-8');
        const num = slideFile.match(/(\d+)\.html/)[1];
        process.stdout.write(`  ✓ Slide ${num}\r`);
    }
}
console.log(`\n✅ Read ${slideContents.length} slides (${(totalBytes / 1024).toFixed(0)} KB)`);

// ===== INJECT OVERFLOW OVERRIDE INTO EACH SLIDE =====
function injectOverflowFix(html) {
    // Inject a style tag right before </head> that overrides overflow:hidden and fixed heights
    const overrideCSS = `<style>body{overflow:visible!important;height:auto!important;min-height:720px}
.slide-container{height:auto!important;min-height:720px}</style>`;
    return html.replace('</head>', overrideCSS + '</head>');
}

// ===== BUILD SLIDE DATA JS ARRAY =====
console.log('🔧 Building embedded slide data...');

const slideSrcdocs = slideContents.map(html => {
    const fixed = injectOverflowFix(html);
    return fixed; // JSON.stringify will handle the escaping for the JS string
});

// Build the JS data as a JSON array of srcdoc strings
const slideDataEntries = slideSrcdocs.map(s => JSON.stringify(s));

// Build chapters JS data
const chaptersJS = JSON.stringify(chapters.map(ch => ({
    name: ch.name,
    count: ch.slides.length
})));

// ===== GENERATE THE HTML =====
console.log('🏗️  Generating EduContentCMS_Slides.html...');

const outputHTML = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>EduContent CMS — Slide Viewer</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
            --bg-primary: #0f1117;
            --bg-secondary: #1a1d27;
            --bg-tertiary: #242836;
            --accent: #6366f1;
            --accent-light: #818cf8;
            --accent-glow: rgba(99, 102, 241, 0.3);
            --text-primary: #e2e8f0;
            --text-secondary: #94a3b8;
            --text-muted: #64748b;
            --border: #2d3348;
            --sidebar-width: 300px;
        }
        html, body {
            width: 100%; height: 100%;
            overflow: hidden;
            background: var(--bg-primary);
            font-family: 'Inter', 'Noto Sans KR', sans-serif;
            color: var(--text-primary);
        }
        .app { display: flex; width: 100%; height: 100%; }

        /* SIDEBAR */
        .sidebar {
            width: var(--sidebar-width); min-width: var(--sidebar-width);
            height: 100%; background: var(--bg-secondary);
            border-right: 1px solid var(--border);
            display: flex; flex-direction: column;
            transition: margin-left 0.35s cubic-bezier(.4,0,.2,1);
            z-index: 100;
        }
        .sidebar.collapsed { margin-left: calc(-1 * var(--sidebar-width)); }
        .sidebar-header { padding: 20px 20px 16px; border-bottom: 1px solid var(--border); }
        .sidebar-header h1 {
            font-size: 1.1rem; font-weight: 700;
            background: linear-gradient(135deg, var(--accent-light), #a78bfa);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            margin-bottom: 4px;
        }
        .sidebar-header p { font-size: 0.75rem; color: var(--text-muted); }
        .sidebar-chapters {
            flex: 1; overflow-y: auto; padding: 12px 0;
        }
        .sidebar-chapters::-webkit-scrollbar { width: 4px; }
        .sidebar-chapters::-webkit-scrollbar-track { background: transparent; }
        .sidebar-chapters::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
        .chapter-group { margin-bottom: 4px; }
        .chapter-title {
            display: flex; align-items: center; gap: 8px;
            padding: 8px 20px; font-size: 0.75rem; font-weight: 600;
            color: var(--text-muted); text-transform: uppercase;
            letter-spacing: 0.05em; cursor: pointer; user-select: none;
            transition: color 0.2s;
        }
        .chapter-title:hover { color: var(--text-secondary); }
        .chapter-title i { font-size: 0.6rem; transition: transform 0.2s; }
        .chapter-title.expanded i { transform: rotate(90deg); }
        .chapter-slides { display: none; }
        .chapter-slides.show { display: block; }
        .slide-item {
            display: flex; align-items: center; gap: 10px;
            padding: 7px 20px 7px 32px; font-size: 0.8rem;
            color: var(--text-secondary); cursor: pointer;
            transition: all 0.15s; border-left: 3px solid transparent;
        }
        .slide-item:hover { background: var(--bg-tertiary); color: var(--text-primary); }
        .slide-item.active {
            background: rgba(99, 102, 241, 0.1);
            color: var(--accent-light); border-left-color: var(--accent);
        }
        .slide-item .slide-num {
            font-size: 0.7rem; color: var(--text-muted);
            min-width: 24px; text-align: right; font-weight: 500;
        }
        .slide-item.active .slide-num { color: var(--accent-light); }

        /* MAIN */
        .main { flex: 1; display: flex; flex-direction: column; min-width: 0; position: relative; }
        .topbar {
            display: flex; align-items: center; justify-content: space-between;
            padding: 10px 20px; background: var(--bg-secondary);
            border-bottom: 1px solid var(--border); min-height: 50px; z-index: 50;
        }
        .topbar-left, .topbar-center, .topbar-right { display: flex; align-items: center; gap: 8px; }
        .topbar-left { gap: 12px; }
        .btn {
            display: inline-flex; align-items: center; justify-content: center; gap: 6px;
            padding: 6px 12px; border: 1px solid var(--border); background: var(--bg-tertiary);
            color: var(--text-secondary); border-radius: 8px; font-size: 0.8rem;
            cursor: pointer; transition: all 0.15s; font-family: inherit;
        }
        .btn:hover { background: var(--border); color: var(--text-primary); }
        .btn-icon { padding: 6px 8px; }
        .slide-counter { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); min-width: 80px; text-align: center; }
        .slide-counter span { color: var(--text-muted); font-weight: 400; }
        .progress-bar { width: 100%; height: 3px; background: var(--bg-tertiary); }
        .progress-fill {
            height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent-light));
            transition: width 0.3s ease; border-radius: 0 2px 2px 0;
        }
        .slide-viewport {
            flex: 1; display: flex; align-items: center; justify-content: center;
            overflow: auto; padding: 24px;
            background:
                radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.03) 0%, transparent 50%),
                radial-gradient(circle at 80% 50%, rgba(168, 85, 247, 0.03) 0%, transparent 50%),
                var(--bg-primary);
        }
        .slide-frame-wrapper {
            position: relative;
            box-shadow: 0 0 0 1px rgba(255,255,255,0.05), 0 20px 60px -10px rgba(0,0,0,0.5), 0 0 40px var(--accent-glow);
            border-radius: 8px; overflow: hidden;
            transition: transform 0.3s ease, opacity 0.3s ease;
            transform-origin: center center;
        }
        .slide-frame-wrapper.fade-out { opacity: 0; transform: scale(0.98); }
        .slide-frame {
            display: block; border: none; background: #fff;
            transform-origin: top left;
        }
        .touch-zone {
            position: absolute; top: 0; bottom: 0; width: 15%; z-index: 5;
            cursor: pointer; display: flex; align-items: center; justify-content: center;
            opacity: 0; transition: opacity 0.2s;
        }
        .touch-zone:hover { opacity: 1; }
        .touch-zone-left { left: 0; }
        .touch-zone-right { right: 0; }
        .touch-zone i { font-size: 2rem; color: rgba(255,255,255,0.6); text-shadow: 0 2px 8px rgba(0,0,0,0.5); }
        .loading-overlay {
            position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
            background: var(--bg-primary); z-index: 10; transition: opacity 0.3s;
        }
        .loading-overlay.hidden { opacity: 0; pointer-events: none; }
        .spinner { width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* KEYBOARD HINTS */
        .keyboard-hints { position: fixed; bottom: 20px; right: 20px; z-index: 200; }
        .hint-toggle {
            width: 36px; height: 36px; border-radius: 50%; background: var(--bg-tertiary);
            border: 1px solid var(--border); color: var(--text-muted); cursor: pointer;
            display: flex; align-items: center; justify-content: center; font-size: 0.85rem;
            transition: all 0.2s;
        }
        .hint-toggle:hover { color: var(--text-primary); background: var(--border); }
        .hint-panel {
            display: none; position: absolute; bottom: 46px; right: 0;
            background: var(--bg-secondary); border: 1px solid var(--border);
            border-radius: 12px; padding: 16px 20px; min-width: 220px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.4);
        }
        .hint-panel.show { display: block; }
        .hint-panel h3 { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
        .hint-row { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; font-size: 0.8rem; color: var(--text-secondary); }
        kbd { display: inline-block; padding: 2px 7px; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 4px; font-size: 0.7rem; font-family: 'Inter', monospace; color: var(--text-primary); }

        /* FULLSCREEN */
        .app.fullscreen .sidebar, .app.fullscreen .topbar, .app.fullscreen .progress-bar, .app.fullscreen .keyboard-hints { display: none !important; }
        .app.fullscreen .slide-viewport { padding: 0; background: #000; }
        .app.fullscreen .slide-frame-wrapper { border-radius: 0; box-shadow: none; }
    </style>
</head>
<body>
    <div class="app" id="app">
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <h1><i class="fas fa-layer-group"></i> EduContent CMS</h1>
                <p>교육 콘텐츠 관리 시스템 — 82 Slides</p>
            </div>
            <div class="sidebar-chapters" id="chapterList"></div>
        </aside>
        <div class="main">
            <div class="topbar">
                <div class="topbar-left">
                    <button class="btn btn-icon" id="toggleSidebar" title="목차 토글 (T)"><i class="fas fa-bars"></i></button>
                    <button class="btn btn-icon" id="btnFirst" title="첫 슬라이드 (Home)"><i class="fas fa-step-backward"></i></button>
                    <button class="btn btn-icon" id="btnPrev" title="이전 (←)"><i class="fas fa-chevron-left"></i></button>
                </div>
                <div class="topbar-center">
                    <div class="slide-counter" id="slideCounter">1 <span>/ 82</span></div>
                </div>
                <div class="topbar-right">
                    <button class="btn btn-icon" id="btnNext" title="다음 (→)"><i class="fas fa-chevron-right"></i></button>
                    <button class="btn btn-icon" id="btnLast" title="마지막 슬라이드 (End)"><i class="fas fa-step-forward"></i></button>
                    <button class="btn btn-icon" id="btnFullscreen" title="전체 화면 (F)"><i class="fas fa-expand"></i></button>
                </div>
            </div>
            <div class="progress-bar"><div class="progress-fill" id="progressFill" style="width:1.22%"></div></div>
            <div class="slide-viewport" id="viewport">
                <div class="loading-overlay" id="loadingOverlay"><div class="spinner"></div></div>
                <div class="touch-zone touch-zone-left" id="touchLeft"><i class="fas fa-chevron-left"></i></div>
                <div class="touch-zone touch-zone-right" id="touchRight"><i class="fas fa-chevron-right"></i></div>
                <div class="slide-frame-wrapper" id="frameWrapper">
                    <iframe class="slide-frame" id="slideFrame"></iframe>
                </div>
            </div>
        </div>
    </div>
    <div class="keyboard-hints">
        <button class="hint-toggle" id="hintToggle" title="키보드 단축키"><i class="far fa-keyboard"></i></button>
        <div class="hint-panel" id="hintPanel">
            <h3>키보드 단축키</h3>
            <div class="hint-row"><span>다음 슬라이드</span> <span><kbd>→</kbd> <kbd>Space</kbd></span></div>
            <div class="hint-row"><span>이전 슬라이드</span> <span><kbd>←</kbd></span></div>
            <div class="hint-row"><span>첫 슬라이드</span> <kbd>Home</kbd></div>
            <div class="hint-row"><span>마지막 슬라이드</span> <kbd>End</kbd></div>
            <div class="hint-row"><span>전체 화면</span> <kbd>F</kbd></div>
            <div class="hint-row"><span>목차 토글</span> <kbd>T</kbd></div>
            <div class="hint-row"><span>나가기</span> <kbd>Esc</kbd></div>
        </div>
    </div>
<script>
// ===== EMBEDDED SLIDE DATA =====
const SLIDE_DATA = [
${slideDataEntries.join(',\n')}
];
const CHAPTERS = ${chaptersJS};
const TOTAL = SLIDE_DATA.length;

// ===== STATE =====
let currentIndex = 0;
let isTransitioning = false;
let isFullscreen = false;
const SLIDE_BASE_WIDTH = 1280;

// ===== DOM =====
const $ = id => document.getElementById(id);
const app = $('app');
const sidebar = $('sidebar');
const chapterList = $('chapterList');
const slideFrame = $('slideFrame');
const frameWrapper = $('frameWrapper');
const viewport = $('viewport');
const slideCounter = $('slideCounter');
const progressFill = $('progressFill');
const loadingOverlay = $('loadingOverlay');
const hintPanel = $('hintPanel');

// ===== BUILD SIDEBAR =====
let globalIdx = 0;
CHAPTERS.forEach((ch, ci) => {
    const group = document.createElement('div');
    group.className = 'chapter-group';
    const title = document.createElement('div');
    title.className = 'chapter-title';
    title.innerHTML = '<i class="fas fa-caret-right"></i> ' + ch.name + ' <span style="margin-left:auto;font-size:0.65rem;color:var(--text-muted)">' + ch.count + '</span>';
    const slidesDiv = document.createElement('div');
    slidesDiv.className = 'chapter-slides';
    slidesDiv.id = 'ch-slides-' + ci;
    title.addEventListener('click', () => { title.classList.toggle('expanded'); slidesDiv.classList.toggle('show'); });
    for (let si = 0; si < ch.count; si++) {
        const idx = globalIdx;
        const num = String(idx + 1).padStart(2, '0');
        const item = document.createElement('div');
        item.className = 'slide-item';
        item.dataset.index = idx;
        item.innerHTML = '<span class="slide-num">' + num + '</span> Slide ' + num;
        item.addEventListener('click', () => goTo(idx));
        slidesDiv.appendChild(item);
        globalIdx++;
    }
    group.appendChild(title);
    group.appendChild(slidesDiv);
    chapterList.appendChild(group);
});
document.querySelector('.chapter-title').classList.add('expanded');
document.querySelector('.chapter-slides').classList.add('show');

// ===== SLIDE LOADING =====
function loadSlide(index) {
    if (isTransitioning || index < 0 || index >= TOTAL) return;
    isTransitioning = true;
    frameWrapper.classList.add('fade-out');
    loadingOverlay.classList.remove('hidden');
    setTimeout(() => {
        slideFrame.onload = () => {
            try {
                const iframeDoc = slideFrame.contentDocument || slideFrame.contentWindow.document;
                requestAnimationFrame(() => { requestAnimationFrame(() => {
                    const body = iframeDoc.body;
                    const docEl = iframeDoc.documentElement;
                    const contentWidth = SLIDE_BASE_WIDTH;
                    const contentHeight = Math.max(body.scrollHeight, body.offsetHeight, docEl.scrollHeight, docEl.offsetHeight, 720);
                    slideFrame.style.width = contentWidth + 'px';
                    slideFrame.style.height = contentHeight + 'px';
                    fitSlideToViewport(contentWidth, contentHeight);
                    loadingOverlay.classList.add('hidden');
                    frameWrapper.classList.remove('fade-out');
                    isTransitioning = false;
                }); });
            } catch (e) {
                slideFrame.style.width = '1280px';
                slideFrame.style.height = '720px';
                fitSlideToViewport(1280, 720);
                loadingOverlay.classList.add('hidden');
                frameWrapper.classList.remove('fade-out');
                isTransitioning = false;
            }
        };
        slideFrame.srcdoc = SLIDE_DATA[index];
        currentIndex = index;
        updateUI();
    }, 150);
}

function fitSlideToViewport(contentWidth, contentHeight) {
    const vw = viewport.clientWidth - 48;
    const vh = viewport.clientHeight - 48;
    const scaleX = vw / contentWidth;
    const scaleY = vh / contentHeight;
    const scale = Math.min(scaleX, scaleY, 1);
    slideFrame.style.transform = 'scale(' + scale + ')';
    slideFrame.style.transformOrigin = 'top left';
    frameWrapper.style.width = (contentWidth * scale) + 'px';
    frameWrapper.style.height = (contentHeight * scale) + 'px';
}

function updateUI() {
    slideCounter.innerHTML = (currentIndex + 1) + ' <span>/ ' + TOTAL + '</span>';
    progressFill.style.width = ((currentIndex + 1) / TOTAL * 100) + '%';
    document.querySelectorAll('.slide-item').forEach(item => {
        item.classList.toggle('active', parseInt(item.dataset.index) === currentIndex);
    });
    let slideCount = 0;
    CHAPTERS.forEach((ch, ci) => {
        const startIdx = slideCount;
        const endIdx = slideCount + ch.count - 1;
        const slidesDiv = document.getElementById('ch-slides-' + ci);
        const titleDiv = slidesDiv.previousElementSibling;
        if (currentIndex >= startIdx && currentIndex <= endIdx) {
            titleDiv.classList.add('expanded');
            slidesDiv.classList.add('show');
            const activeItem = slidesDiv.querySelector('.slide-item.active');
            if (activeItem) activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
        slideCount += ch.count;
    });
}

// ===== NAVIGATION =====
function goTo(index) { if (index >= 0 && index < TOTAL && index !== currentIndex) loadSlide(index); }
function next() { goTo(currentIndex + 1); }
function prev() { goTo(currentIndex - 1); }
function first() { goTo(0); }
function last() { goTo(TOTAL - 1); }

function toggleFullscreen() {
    isFullscreen = !isFullscreen;
    app.classList.toggle('fullscreen', isFullscreen);
    if (isFullscreen) { document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); }
    else { document.exitFullscreen && document.exitFullscreen(); }
    setTimeout(() => { const w = parseInt(slideFrame.style.width); const h = parseInt(slideFrame.style.height); if (w && h) fitSlideToViewport(w, h); }, 400);
}
function toggleSidebar() {
    sidebar.classList.toggle('collapsed');
    setTimeout(() => { const w = parseInt(slideFrame.style.width); const h = parseInt(slideFrame.style.height); if (w && h) fitSlideToViewport(w, h); }, 400);
}

// ===== EVENTS =====
document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    switch (e.key) {
        case 'ArrowRight': case ' ': e.preventDefault(); next(); break;
        case 'ArrowLeft': e.preventDefault(); prev(); break;
        case 'Home': e.preventDefault(); first(); break;
        case 'End': e.preventDefault(); last(); break;
        case 'f': case 'F': e.preventDefault(); toggleFullscreen(); break;
        case 't': case 'T': e.preventDefault(); toggleSidebar(); break;
        case 'Escape':
            if (isFullscreen) toggleFullscreen();
            else if (hintPanel.classList.contains('show')) hintPanel.classList.remove('show');
            break;
    }
});
$('btnNext').addEventListener('click', next);
$('btnPrev').addEventListener('click', prev);
$('btnFirst').addEventListener('click', first);
$('btnLast').addEventListener('click', last);
$('btnFullscreen').addEventListener('click', toggleFullscreen);
$('toggleSidebar').addEventListener('click', toggleSidebar);
$('touchLeft').addEventListener('click', prev);
$('touchRight').addEventListener('click', next);
$('hintToggle').addEventListener('click', () => hintPanel.classList.toggle('show'));
window.addEventListener('resize', () => { const w = parseInt(slideFrame.style.width); const h = parseInt(slideFrame.style.height); if (w && h) fitSlideToViewport(w, h); });
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && isFullscreen) {
        isFullscreen = false; app.classList.remove('fullscreen');
        setTimeout(() => { const w = parseInt(slideFrame.style.width); const h = parseInt(slideFrame.style.height); if (w && h) fitSlideToViewport(w, h); }, 100);
    }
});

// ===== INIT =====
loadSlide(0);
</script>
</body>
</html>`;

// ===== WRITE OUTPUT =====
fs.writeFileSync(OUTPUT_FILE, outputHTML, 'utf-8');
const outputSize = fs.statSync(OUTPUT_FILE).size;
console.log(`\n🎉 Done! Generated: EduContentCMS_Slides.html`);
console.log(`   File size: ${(outputSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`   Open it directly in Chrome — no server needed!`);
