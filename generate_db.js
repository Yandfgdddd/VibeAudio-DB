const fs = require('fs');
const path = require('path');

const BOOKS_DIR = path.join(__dirname, 'books'); 
const OUTPUT_FILE = path.join(__dirname, 'catalog.json');

// 👇 TERA CLOUDFLARE PAGES URL
const CLOUDFLARE_BASE_URL = 'https://vibeaudio-db.pages.dev';

function getAllJsonFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllJsonFiles(filePath, fileList); 
        } else if (filePath.endsWith('.json')) {
            fileList.push(filePath); 
        }
    }
    return fileList;
}

function buildDatabase() {
    console.log(`\n🚀 VibeAudio DB Compiler (Moods & Cloudflare Edition)`);
    const jsonFiles = getAllJsonFiles(BOOKS_DIR);
    const megaCatalog = [];

    for (const file of jsonFiles) {
        try {
            const content = fs.readFileSync(file, 'utf-8');
            const book = JSON.parse(content);
            if (!book.bookId) continue;

            const relativePath = path.relative(__dirname, file).replace(/\\/g, '/');
            const cloudflareUrl = `${CLOUDFLARE_BASE_URL}/${relativePath}`;

            megaCatalog.push({
                bookId: book.bookId,
                title: book.title,
                author: book.author || "Unknown",
                // 🔥 Moods array ka pehla element genre ban jayega
                genre: (book.moods && book.moods.length > 0) ? book.moods[0] : "General",
                moods: book.moods || [], 
                cover: book.cover || "",
                totalChapters: book.chapters ? book.chapters.length : (book.chapters_en ? book.chapters_en.length : 0),
                dataPath: cloudflareUrl 
            });
        } catch (err) {
            console.error(`❌ Error in ${path.basename(file)}:`, err.message);
        }
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(megaCatalog));
    console.log(`🎉 SUCCESS: Compiled ${megaCatalog.length} books into catalog.json!`);
}
buildDatabase();