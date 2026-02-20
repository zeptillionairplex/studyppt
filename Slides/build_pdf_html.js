const fs = require('fs');
const path = require('path');

// Configuration
const SLIDES_DIR = __dirname;
const OUTPUT_FILE = path.join(SLIDES_DIR, 'EduContentCMS_Print.html');

const chapters = [
    { name: "Chapter 1", slides: ["chapter01/01.html", "chapter01/02.html", "chapter01/03.html", "chapter01/04.html", "chapter01/05.html"] },
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

console.log('🖨️  Building printable HTML version...');

let htmlBody = '';

// Helper to extract body content
function extractBody(html) {
    const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    return match ? match[1] : html;
}

// Helper to extract style content
function extractStyle(html) {
    const matches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    if (!matches) return '';
    return matches.map(s => s.replace(/<style[^>]*>/i, '').replace(/<\/style>/i, '')).join('\n');
}

// Global Styles
let globalStyles = `
    @page { size: landscape; margin: 0; }
    body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page-break { page-break-after: always; break-after: page; }
    .print-slide-wrapper {
        width: 1280px; height: 720px;
        position: relative; overflow: hidden;
        page-break-inside: avoid;
        border-bottom: 1px dashed #ccc; /* Visual separator for screen only */
    }
    @media print {
        .print-slide-wrapper { border: none; }
    }
    /* Reset body overrides from individual slides */
    .print-slide-wrapper body { width: 100%; height: 100%; overflow: hidden; position: static; }
`;

for (const ch of chapters) {
    for (const slideFile of ch.slides) {
        const filePath = path.join(SLIDES_DIR, slideFile);
        if (!fs.existsSync(filePath)) continue;

        const content = fs.readFileSync(filePath, 'utf-8');
        const bodyContent = extractBody(content);
        const styleContent = extractStyle(content);

        // Scope the styles to this slide wrapper to avoid conflicts (simple prefixing)
        // Note: Real scoping is hard without shadow DOM, but here most styles are identical or scoped to classes.
        // We will just concatenate all CSS. Since user uses Tailwind + shared classes, it should be fine.
        // HOWEVER, to be safe, we wrap each slide in a div and hope styles cascade correctly.
        // The problem is body styles. We need to reset them.

        globalStyles += `\n/* ${slideFile} */\n${styleContent}\n`;

        htmlBody += `
        <div class="print-slide-wrapper page-break">
            ${bodyContent}
        </div>
        `;
    }
}

const printHTML = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="utf-8">
    <title>EduContent CMS - Printable Slides</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=Black+Han+Sans&family=Roboto+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
    <style>
        ${globalStyles}
        /* Specific overrides for print context */
        body { width: auto !important; height: auto !important; overflow: visible !important; }
        .slide-container { width: 1280px !important; height: 720px !important; margin: 0 auto; page-break-inside: avoid; }
    </style>
</head>
<body>
    ${htmlBody}
</body>
</html>`;

fs.writeFileSync(OUTPUT_FILE, printHTML, 'utf-8');
console.log(`✅ Generated: ${OUTPUT_FILE}`);
console.log(`   Open in Chrome -> Print (Ctrl+P) -> Save as PDF`);
console.log(`   Settings: Layout=Landscape, Margins=None, Scale=Custom(if needed)`);
