const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// FORZAR DIMENSIONES VERTICALES PREMIUM PARA MÓVIL
//canvas.width = 500;
//canvas.height = 550; 

// ... (El resto del código se queda exactamente igual)


const hudHighScore = document.getElementById('hud-high-score');
const strikeSlots = document.querySelectorAll('.strike-slot');
const statScore = document.getElementById('stat-score');
const statHigh = document.getElementById('stat-high');
const statDrive = document.getElementById('stat-drive');
const statStreak = document.getElementById('stat-streak');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScore = document.getElementById('final-score');
const finalDrive = document.getElementById('final-drive');
const restartBtn = document.getElementById('restart-btn');
const swingBtn = document.getElementById('swing-btn');

let score = 0;
let strikes = 0;
let streak = 0;
let longestDrive = 0;
let highScore = localStorage.getItem('bats_premium_high') || 0;
let isGameOver = false;

const pitchZoneY = canvas.height - 110;
const targetZoneRadius = 32;

let ball = { x: canvas.width / 2, y: 150, radius: 7, speed: 4.5, active: false };
let bat = { angle: -Math.PI / 3, isSwinging: false, duration: 10, currentFrame: 0 };

let feedbackText = "";
let feedbackTimer = 0;
let feedbackColor = "#fff";

function init() {
    score = 0;
    strikes = 0;
    streak = 0;
    longestDrive = 0;
    isGameOver = false;
    
    statScore.textContent = "0";
    statStreak.textContent = "0";
    statDrive.textContent = "-";
    hudHighScore.textContent = highScore;
    statHigh.textContent = highScore;
    
    updateStrikesUI();
    gameOverScreen.classList.add('hidden');
    setTimeout(resetBall, 800);
}

/*function resetBall() {
    if (isGameOver) return;
    ball.x = canvas.width / 2;
    ball.y = 150;
    ball.active = true;
    ball.speed = 4.8 + Math.min(score * 0.35, 7); 
}*/

function resetBall() {
    if (isGameOver) return;
    ball.x = canvas.width / 2;
    ball.y = 150;
    ball.active = true;
    
    // INCREMENTO DINÁMICO DE VELOCIDAD POR JONRÓN:
    // Comienza en una velocidad base de 4.8.
    // Suma 0.4 de velocidad por cada Home Run anotado (score).
    // Tope máximo de 10.5 para mantener el juego justo pero muy desafiante.
    ball.speed = 4.8 + Math.min(score * 0.4, 5.7); 
}



function updateStrikesUI() {
    strikeSlots.forEach((slot, index) => {
        if (index < strikes) {
            slot.classList.add('active');
            slot.textContent = "⚾"; // Inserta la pelota cuando es Strike
        } else {
            slot.classList.remove('active');
            slot.textContent = "";  // Vacío si está limpio
        }
    });
}


function triggerFeedback(text, color) {
    feedbackText = text;
    feedbackColor = color;
    feedbackTimer = 35;
}

function executeSwing() {
    if (isGameOver || bat.isSwinging) return;

    bat.isSwinging = true;
    bat.currentFrame = 0;

    if (ball.active) {
        const distance = Math.abs(ball.y - pitchZoneY);

        if (distance <= targetZoneRadius) {
            score++;
            streak++;
            ball.active = false;
            
            const accuracy = 1 - (distance / targetZoneRadius);
            const driveDistance = Math.floor(340 + (accuracy * 110) + Math.random() * 20);
            
            if (driveDistance > longestDrive) {
                longestDrive = driveDistance;
            }

            statScore.textContent = score;
            statStreak.textContent = streak;
            statDrive.textContent = `${driveDistance} ft`;
            
            triggerFeedback(`¡HOME RUN! 🚀 ${driveDistance} ft`, "#f2a900");
            setTimeout(resetBall, 1200);
        } else {
            registerStrike();
        }
    }
}

function registerStrike() {
    strikes++;
    streak = 0;
    statStreak.textContent = "0";
    updateStrikesUI();
    triggerFeedback("¡STRIKE! ❌", "#cc0033");
    ball.active = false;

    if (strikes >= 3) {
        endGame();
    } else {
        setTimeout(resetBall, 1200);
    }
}

function endGame() {
    isGameOver = true;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('bats_premium_high', highScore);
    }
    finalScore.textContent = score;
    finalDrive.textContent = longestDrive > 0 ? `${longestDrive} ft` : "-";
    gameOverScreen.classList.remove('hidden');
}

function drawStadium() {
    ctx.fillStyle = "#0c0e1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    const lightPositions = [150, 300, 500, 650];
    lightPositions.forEach(x => {
        ctx.beginPath();
        ctx.moveTo(x, 40);
        ctx.lineTo(x - 40, canvas.height);
        ctx.lineTo(x + 40, canvas.height);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#222538";
        ctx.fillRect(x - 20, 30, 40, 10);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x - 16, 32, 8, 6);
        ctx.fillRect(x + 8, 32, 8, 6);
    });

    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("★ HOME RUN DERBY ★", canvas.width / 2, 120);

    ctx.fillStyle = "#16281c";
    ctx.fillRect(0, 180, canvas.width, canvas.height - 180);

    ctx.fillStyle = "#233d2a";
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height);
    ctx.lineTo(120, 260);
    ctx.quadraticCurveTo(canvas.width / 2, 160, canvas.width - 120, 260);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height - 10);
    ctx.lineTo(160, 270);
    ctx.moveTo(canvas.width / 2, canvas.height - 10);
    ctx.lineTo(canvas.width - 160, 270);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    const bases = [{x: canvas.width/2, y: 190}, {x: 240, y: 280}, {x: canvas.width - 240, y: 280}];
    bases.forEach(b => {
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-6, -6, 12, 12);
        ctx.restore();
    });

    ctx.fillStyle = "#8a6242";
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 195, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, pitchZoneY, targetZoneRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, pitchZoneY + 12);
    ctx.lineTo(canvas.width / 2 - 10, pitchZoneY + 2);
    ctx.lineTo(canvas.width / 2 - 10, pitchZoneY - 8);
    ctx.lineTo(canvas.width / 2 + 10, pitchZoneY - 8);
    ctx.lineTo(canvas.width / 2 + 10, pitchZoneY + 2);
    ctx.closePath();
    ctx.fill();
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStadium();

    if (ball.active && !isGameOver) {
        ball.y += ball.speed;

        if (ball.y > pitchZoneY + targetZoneRadius + 10) {
            registerStrike();
        }

        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(255,255,255,0.5)";
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    const batterX = canvas.width / 2 - 40;
    const batterY = pitchZoneY - 5;

    ctx.fillStyle = "#161729";
    ctx.beginPath();
    ctx.arc(batterX, batterY, 15, 0, Math.PI * 2);
    ctx.arc(batterX - 4, batterY + 20, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(batterX - 10, batterY - 8);
    ctx.lineTo(batterX - 14, batterY - 20);
    ctx.lineTo(batterX - 2, batterY - 12);
    ctx.moveTo(batterX + 10, batterY - 8);
    ctx.lineTo(batterX + 14, batterY - 20);
    ctx.lineTo(batterX + 2, batterY - 12);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 9px sans-serif";
    ctx.fillText("BATS", batterX - 4, batterY + 22);

    if (bat.isSwinging) {
        bat.currentFrame++;
        const progress = bat.currentFrame / bat.duration;
        bat.angle = -Math.PI / 3 + progress * (Math.PI * 1.1);

        if (bat.currentFrame >= bat.duration) {
            bat.isSwinging = false;
            bat.angle = -Math.PI / 3;
        }
    }

    ctx.save();
    ctx.translate(canvas.width / 2 - 15, pitchZoneY);
    ctx.rotate(bat.angle);
    ctx.fillStyle = "#dca463";
    ctx.fillRect(-3, -50, 6, 50);
    ctx.fillStyle = "#704824";
    ctx.fillRect(-4, -10, 8, 10);
    ctx.restore();

    if (feedbackTimer > 0) {
        ctx.fillStyle = feedbackColor;
        ctx.font = "bold 20px Arial";
        ctx.textAlign = "center";
        ctx.fillText(feedbackText, canvas.width / 2, pitchZoneY - 60);
        feedbackTimer--;
    }

    requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        executeSwing();
    }
});

swingBtn.addEventListener('click', executeSwing);
restartBtn.addEventListener('click', init);

init();
gameLoop();


// Lógica robusta para forzar/ofrecer la instalación de la PWA
let deferredPrompt;
const installBanner = document.getElementById('pwa-install-banner');
const acceptInstallBtn = document.getElementById('pwa-accept-btn');
const closeInstallBtn = document.getElementById('pwa-close-btn');

// Ocultar automáticamente el banner si el usuario YA está dentro de la app instalada (Standalone)
if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
    if (installBanner) installBanner.style.display = 'none';
}

window.addEventListener('beforeinstallprompt', (e) => {
    // Evita el aviso genérico del navegador
    e.preventDefault();
    // Guarda el evento para usarlo después
    deferredPrompt = e;
    // Asegura que el banner sea visible si el navegador da luz verde
    if (installBanner) {
        installBanner.style.display = 'block';
    }
});

if (acceptInstallBtn) {
    acceptInstallBtn.addEventListener('click', async () => {
        // Si el navegador soporta el disparo nativo, lo ejecutamos
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to install: ${outcome}`);
            deferredPrompt = null;
        } else {
            // Plan de respaldo si el navegador bloquea el prompt automático (como en iOS o navegadores de escritorio)
            alert("To install: Tap your browser's menu (⋮ or Share icon) and select 'Add to Home Screen' / 'Install App' ⚾");
        }
        if (installBanner) installBanner.style.display = 'none';
    });
}

if (closeInstallBtn) {
    closeInstallBtn.addEventListener('click', () => {
        if (installBanner) installBanner.style.display = 'none';
    });
}

