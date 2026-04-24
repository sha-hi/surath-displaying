const fs = require('fs');
const https = require('https');

async function fetchSurah(id) {
    return new Promise((resolve, reject) => {
        https.get(`https://api.alquran.cloud/v1/surah/${id}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data).data);
                } catch(e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

const colors = [
    '#FF3366', // Vibrant Pink
    '#20A4F3', // Bright Blue
    '#FFB01A', // Bright Orange
    '#2EC4B6', // Teal
    '#8A2BE2', // Blue Violet
    '#FF0054', // Strong Red
    '#4361EE', // Royal Blue
    '#4CC9F0', // Sky Blue
    '#F72585', // Magenta
    '#7209B7', // Deep Purple
];

async function main() {
    let indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quran Explorer - Juz 30</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css" />
</head>
<body>
    <div class="background-decor"></div>
    <div class="container">
        <header class="header">
            <h1>Quran Explorer</h1>
            <p>Juz 30 (Surah 78 - 114)</p>
        </header>
        <div class="surah-grid">
`;

    const surahs = [];
    for (let i = 78; i <= 114; i++) {
        console.log('Fetching Surah ' + i);
        const surah = await fetchSurah(i);
        surahs.push(surah);
    }

    for (let i = 0; i < surahs.length; i++) {
        const surah = surahs[i];
        
        indexHtml += `            <a href="surah-${surah.number}.html" class="surah-card">
                <div class="surah-number">${surah.number}</div>
                <div class="surah-info">
                    <h2>${surah.englishName}</h2>
                    <p>${surah.englishNameTranslation}</p>
                </div>
                <div class="surah-name-arabic">${surah.name}</div>
            </a>\n`;
        
        const ayahs = surah.ayahs.map(a => a.text);
        
        let surahHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${surah.name}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css" />
</head>
<body class="surah-page">
    <div class="background-decor"></div>
    <div class="container">
        <header class="surah-header">
            <a href="index.html" class="back-btn">← Back to Home</a>
            <div class="surah-title-box">
                <h2>${surah.name}</h2>
                <p>${surah.englishName}</p>
            </div>
            <div class="spacer"></div>
        </header>

        <div class="ayah-display-container glass-panel">
            <div id="ayah" class="ayah-text"></div>
        </div>

        <div class="controls-container">
            <button id="prevBtn" class="nav-btn">Previous</button>
            <div class="progress-indicator">
                <span id="currentAyahNum">1</span> / ${ayahs.length}
            </div>
            <button id="nextBtn" class="nav-btn">Next</button>
        </div>
        
        <div class="surah-nav-links">
            ${surah.number > 78 ? `<a href="surah-${surah.number - 1}.html" class="side-nav">Previous Surah</a>` : '<div></div>'}
            ${surah.number < 114 ? `<a href="surah-${surah.number + 1}.html" class="side-nav">Next Surah</a>` : '<div></div>'}
        </div>
    </div>

    <script>
        const ayahs = ${JSON.stringify(ayahs)};
        const colors = ${JSON.stringify(colors)};
        let currentAyah = 0;

        function showAyah() {
            const text = ayahs[currentAyah];
            // Fix for Basmalah being included in the first ayah sometimes (API depends on surah)
            let words = text.split(' ');
            let coloredHtml = '';
            words.forEach((word, index) => {
                if (!word.trim()) return;
                const color = colors[index % colors.length];
                coloredHtml += \`<span class="word" style="color: \${color};">\${word}</span> \`;
            });
            
            const ayahEl = document.getElementById("ayah");
            ayahEl.style.opacity = 0;
            ayahEl.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                ayahEl.innerHTML = coloredHtml;
                ayahEl.style.opacity = 1;
                ayahEl.style.transform = 'translateY(0)';
                document.getElementById("currentAyahNum").innerText = currentAyah + 1;
            }, 200);
        }

        document.getElementById("nextBtn").addEventListener("click", () => {
            if (currentAyah < ayahs.length - 1) {
                currentAyah++;
                showAyah();
            } else {
                ${surah.number < 114 ? `window.location.href = 'surah-${surah.number + 1}.html';` : `alert('You have completed Surah An-Nas!');`}
            }
        });

        document.getElementById("prevBtn").addEventListener("click", () => {
            if (currentAyah > 0) {
                currentAyah--;
                showAyah();
            } else {
                ${surah.number > 78 ? `window.location.href = 'surah-${surah.number - 1}.html';` : ``}
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "ArrowRight") {
                // In RTL, right arrow should go to previous
                document.getElementById("prevBtn").click();
            } else if (event.key === "ArrowLeft") {
                // In RTL, left arrow should go to next
                document.getElementById("nextBtn").click();
            }
        });

        // Initialize first ayah
        setTimeout(showAyah, 100);
    </script>
</body>
</html>`;
        fs.writeFileSync(`surah-${surah.number}.html`, surahHtml);
    }
    
    indexHtml += `        </div>
    </div>
</body>
</html>`;
    fs.writeFileSync('index.html', indexHtml);
    
    const cssContent = `:root {
    --bg-color: #0f172a;
    --text-main: #f8fafc;
    --text-muted: #94a3b8;
    --accent: #38bdf8;
    --accent-hover: #0284c7;
    --glass-bg: rgba(30, 41, 59, 0.7);
    --glass-border: rgba(255, 255, 255, 0.1);
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', sans-serif;
    background-color: var(--bg-color);
    color: var(--text-main);
    min-height: 100vh;
    overflow-x: hidden;
    position: relative;
}

.background-decor {
    position: fixed;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at center, #1e1b4b 0%, var(--bg-color) 40%);
    z-index: -1;
    opacity: 0.8;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

/* Home Page */
.header {
    text-align: center;
    margin-bottom: 4rem;
    animation: fadeInDown 0.8s ease;
}

.header h1 {
    font-size: 3.5rem;
    font-weight: 800;
    background: linear-gradient(135deg, #38bdf8, #818cf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 0.5rem;
}

.header p {
    font-size: 1.2rem;
    color: var(--text-muted);
}

.surah-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}

.surah-card {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    text-decoration: none;
    color: var(--text-main);
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    animation: fadeInUp 0.5s ease backwards;
}

.surah-card:hover {
    transform: translateY(-5px) scale(1.02);
    border-color: var(--accent);
    box-shadow: 0 10px 30px rgba(56, 189, 248, 0.2);
}

.surah-number {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #38bdf8, #818cf8);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    margin-right: 1rem;
    flex-shrink: 0;
}

.surah-info {
    flex-grow: 1;
}

.surah-info h2 {
    font-size: 1.1rem;
    margin-bottom: 0.2rem;
}

.surah-info p {
    font-size: 0.85rem;
    color: var(--text-muted);
}

.surah-name-arabic {
    font-family: 'Amiri', serif;
    font-size: 1.5rem;
    color: var(--accent);
}

/* Stagger animation delays for cards */
.surah-card:nth-child(1) { animation-delay: 0.05s; }
.surah-card:nth-child(2) { animation-delay: 0.1s; }
.surah-card:nth-child(3) { animation-delay: 0.15s; }
.surah-card:nth-child(4) { animation-delay: 0.2s; }
.surah-card:nth-child(5) { animation-delay: 0.25s; }

/* Surah Page */
.surah-page {
    direction: rtl;
}

.surah-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 3rem;
}

.back-btn {
    direction: ltr;
    color: var(--text-muted);
    text-decoration: none;
    display: flex;
    align-items: center;
    transition: color 0.3s;
    font-weight: 600;
}

.back-btn:hover {
    color: var(--accent);
}

.surah-title-box {
    text-align: center;
}

.surah-title-box h2 {
    font-family: 'Amiri', serif;
    font-size: 2.5rem;
    color: var(--accent);
    margin-bottom: 0.2rem;
}

.surah-title-box p {
    color: var(--text-muted);
    direction: ltr;
}

.glass-panel {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 24px;
    padding: 3rem;
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(20px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    margin-bottom: 2rem;
}

.ayah-text {
    font-family: 'Amiri', serif;
    font-size: 4rem;
    line-height: 1.8;
    text-align: center;
    transition: all 0.3s ease;
}

.word {
    display: inline-block;
    margin: 0 8px;
    text-shadow: 0 2px 10px rgba(0,0,0,0.5);
    transition: transform 0.2s ease;
}

.word:hover {
    transform: scale(1.1);
}

.controls-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    direction: ltr;
    margin-bottom: 2rem;
}

.nav-btn {
    background: linear-gradient(135deg, var(--accent), #818cf8);
    border: none;
    color: white;
    padding: 1rem 2rem;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(56, 189, 248, 0.3);
}

.nav-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(56, 189, 248, 0.5);
}

.nav-btn:active {
    transform: translateY(1px);
}

.progress-indicator {
    font-size: 1.2rem;
    font-weight: 600;
    background: var(--glass-bg);
    padding: 0.8rem 1.5rem;
    border-radius: 12px;
    border: 1px solid var(--glass-border);
}

.surah-nav-links {
    display: flex;
    justify-content: space-between;
    direction: ltr;
    margin-top: 3rem;
    border-top: 1px solid var(--glass-border);
    padding-top: 2rem;
}

.side-nav {
    color: var(--text-muted);
    text-decoration: none;
    font-weight: 600;
    transition: color 0.3s;
}

.side-nav:hover {
    color: var(--accent);
}

@media (max-width: 768px) {
    .header h1 { font-size: 2.5rem; }
    .surah-header { flex-direction: column; gap: 1.5rem; }
    .ayah-text { font-size: 2.5rem; }
    .glass-panel { padding: 1.5rem; min-height: 250px; }
    .controls-container { flex-direction: row; gap: 1rem; }
    .nav-btn { padding: 0.8rem 1.5rem; font-size: 1rem; }
}

@keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
`;
    fs.writeFileSync('style.css', cssContent);

    console.log('All files generated successfully.');
}

main().catch(console.error);
