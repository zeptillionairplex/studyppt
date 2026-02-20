const fs = require('fs');
const path = require('path');

// Configuration
const SLIDES_DIR = __dirname;
const COMPACT_CSS = `
<style>
    /* COMPACT MODE OVERRIDE */
    .slide-container { padding: 20px 30px !important; }
    .header { margin-bottom: 10px !important; padding-bottom: 5px !important; }
    .title { font-size: 1.8rem !important; }
    .subtitle { font-size: 1rem !important; }
    .content-wrapper { padding-top: 5px !important; }
    
    /* Table Compactness */
    .decision-table th, .decision-table td { padding: 6px 10px !important; font-size: 0.8rem !important; }
    .decision-table th { padding: 8px !important; }
    .step-icon { width: 40px !important; height: 40px !important; font-size: 1.2rem !important; }
    
    /* General Text Compactness */
    p, li, .step-desc, .side-text { font-size: 0.85rem !important; line-height: 1.4 !important; }
    h1, h2, h3 { margin-bottom: 4px !important; }
    .section-label { margin-bottom: 6px !important; font-size: 0.8rem !important; }
    
    /* Box Compactness */
    .step-card, .framework-area, .flow-area { padding: 10px !important; min-height: 0 !important; height: auto !important; }
    .badge { padding: 0.4rem 0.8rem !important; font-size: 0.85rem !important; }
    .quote-box { padding: 1.5rem !important; }
    .quote-text { font-size: 1.3rem !important; }
</style>
`;

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

function stripTags(html) {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

console.log('🔧 Applying Compact Mode to heavy slides...');

let fixedCount = 0;

for (const ch of chapters) {
    for (const slideFile of ch.slides) {
        const filePath = path.join(SLIDES_DIR, slideFile);
        if (!fs.existsSync(filePath)) continue;

        let content = fs.readFileSync(filePath, 'utf-8');

        // Check if already patched to avoid duplication
        if (content.includes('/* COMPACT MODE OVERRIDE */')) {
            console.log(`  Skipping ${slideFile} (Already patched)`);
            continue;
        }

        const text = stripTags(content);
        const length = text.length;
        const trCount = (content.match(/<tr/g) || []).length;

        // Heuristic Thresholds
        let needsFix = (length > 3000) || (trCount > 8);

        if (needsFix) {
            console.log(`  👉 Fixing ${slideFile} (Len: ${length}, Tables: ${trCount})`);

            // Inject before </head>
            const newContent = content.replace('</head>', COMPACT_CSS + '</head>');
            fs.writeFileSync(filePath, newContent, 'utf-8');
            fixedCount++;
        }
    }
}

console.log(`\n✅ Applied fixes to ${fixedCount} slides.`);
