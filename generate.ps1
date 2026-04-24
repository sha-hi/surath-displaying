$ErrorActionPreference = "Stop"

$colors = @(
    '#FF3366', '#20A4F3', '#FFB01A', '#2EC4B6', '#8A2BE2', '#FF0054', '#4361EE', '#4CC9F0', '#F72585', '#7209B7'
)

$indexHtml = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quran Explorer - Juz 30</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
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
"@

for ($i = 78; $i -le 114; $i++) {
    Write-Host "Fetching Surah $i..."
    $response = Invoke-RestMethod -Uri "https://api.alquran.cloud/v1/surah/$i"
    $surah = $response.data
    
    $num = $surah.number
    $engName = $surah.englishName
    $engNameTrans = $surah.englishNameTranslation
    $arName = $surah.name

    $indexHtml += @"
            <a href="surah-${num}.html" class="surah-card">
                <div class="surah-number">${num}</div>
                <div class="surah-info">
                    <h2>${engName}</h2>
                    <p>${engNameTrans}</p>
                </div>
                <div class="surah-name-arabic">${arName}</div>
            </a>
"@

    # Convert ayahs to array of strings
    $ayahs = @()
    foreach ($ayah in $surah.ayahs) {
        $ayahs += $ayah.text
    }
    
    $ayahsJson = $ayahs | ConvertTo-Json -Compress
    
    $prevLink = if ($num -gt 78) { "<a href=`"surah-$($num - 1).html`" class=`"side-nav`">Previous Surah</a>" } else { "<div></div>" }
    $nextLink = if ($num -lt 114) { "<a href=`"surah-$($num + 1).html`" class=`"side-nav`">Next Surah</a>" } else { "<div></div>" }
    $alertScript = if ($num -lt 114) { "window.location.href = 'surah-$($num + 1).html';" } else { "alert('You have completed Surah An-Nas!');" }
    $prevScript = if ($num -gt 78) { "window.location.href = 'surah-$($num - 1).html';" } else { "" }
    $ayahsCount = $ayahs.Count

    $surahHtml = @"
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${arName}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css" />
</head>
<body class="surah-page">
    <div class="background-decor"></div>
    <div class="container">
        <header class="surah-header">
            <a href="index.html" class="back-btn">← Back to Home</a>
            <div class="surah-title-box">
                <h2>${arName}</h2>
                <p>${engName}</p>
            </div>
            <div class="spacer"></div>
        </header>

        <div class="ayah-display-container glass-panel">
            <div id="ayah" class="ayah-text"></div>
        </div>

        <div class="controls-container">
            <button id="prevBtn" class="nav-btn">Previous</button>
            <div class="progress-indicator">
                <span id="currentAyahNum">1</span> / ${ayahsCount}
            </div>
            <button id="nextBtn" class="nav-btn">Next</button>
        </div>
        
        <div class="surah-nav-links">
            ${prevLink}
            ${nextLink}
        </div>
    </div>

    <script>
        const ayahs = ${ayahsJson};
        const colors = ['#FF3366', '#20A4F3', '#FFB01A', '#2EC4B6', '#8A2BE2', '#FF0054', '#4361EE', '#4CC9F0', '#F72585', '#7209B7'];
        let currentAyah = 0;

        function showAyah() {
            const text = ayahs[currentAyah];
            let words = text.split(' ');
            let coloredHtml = '';
            words.forEach((word, index) => {
                if (!word.trim()) return;
                const color = colors[index % colors.length];
                coloredHtml += '<span class="word" style="color: ' + color + ';">' + word + '</span> ';
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
                ${alertScript}
            }
        });

        document.getElementById("prevBtn").addEventListener("click", () => {
            if (currentAyah > 0) {
                currentAyah--;
                showAyah();
            } else {
                ${prevScript}
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "ArrowRight") {
                document.getElementById("prevBtn").click();
            } else if (event.key === "ArrowLeft") {
                document.getElementById("nextBtn").click();
            }
        });

        setTimeout(showAyah, 100);
    </script>
</body>
</html>
"@
    Set-Content -Path "surah-${num}.html" -Value $surahHtml -Encoding UTF8
}

$indexHtml += @"
        </div>
    </div>
</body>
</html>
"@
Set-Content -Path "index.html" -Value $indexHtml -Encoding UTF8

Write-Host "Done!"
