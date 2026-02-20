const fs = require('fs');
const path = require('path');

// Configuration
const SLIDES_DIR = __dirname;
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

console.log('🔍 Analyzing 82 slides for content density...');
console.log('--------------------------------------------------');

const heavySlides = [];

// Simple helper to strip tags
function stripTags(html) {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

for (const ch of chapters) {
    for (const slideFile of ch.slides) {
        const filePath = path.join(SLIDES_DIR, slideFile);
        if (!fs.existsSync(filePath)) {
            console.log(`❌ Missing: ${slideFile}`);
            continue;
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        const text = stripTags(content);
        const length = text.length;

        // Heuristics for "Heavy" content
        // 1. Text length > 1000 characters (approx)
        // 2. Contains large tables (many <tr>)
        // 3. Contains tall code blocks

        const trCount = (content.match(/<tr/g) || []).length;
        const codeBlockCount = (content.match(/<pre/g) || []).length;

        let score = 0;
        if (length > 800) score += 1;
        if (length > 1200) score += 2; // Very text heavy
        if (trCount > 8) score += 1; // Large table
        if (trCount > 15) score += 2; // Huge table
        if (codeBlockCount > 1) score += 1;

        if (score >= 2) {
            heavySlides.push({
                file: slideFile,
                length: length,
                tables: trCount,
                score: score,
                preview: text.substring(0, 60) + '...'
            });
        }
    }
}

// Sort by score/length
heavySlides.sort((a, b) => b.length - a.length);

console.log(`Found ${heavySlides.length} potentially overcrowded slides:`);
heavySlides.forEach(s => {
    console.log(`\n[${s.file}] (Length: ${s.length} chars, Tables: ${s.tables})`);
    console.log(`   Preview: ${s.preview}`);
});

if (heavySlides.length === 0) {
    console.log("✅ No obviously overcrowded slides found based on heuristics.");
}
