const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// postavljamo dimenzija Canvasa na cijelu veličinu prozora preglednika
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);

const batWidth = 100;
const batHeight = 20;
let batX = (canvas.width - batWidth) / 2;

const ballRadius = 10;
let ball_x = canvas.width / 2;
let ball_y = canvas.height - batHeight - ballRadius - 20;
let ball_dx = 2;
let ball_dy = -2;

let brickRowCount = 0;
let brickColumnCount = 0;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;
let bricks = [];

let rightPressed = false;
let leftPressed = false;

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

let score = 0;
let bestScore = localStorage.getItem('bestScore') ? parseInt(localStorage.getItem('bestScore')) : 0;

function drawScore() {
    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'right';
    ctx.fillText('Score: ' + score, canvas.width - 20, 30);
    ctx.fillText('Best: ' + bestScore, canvas.width - 20, 60);
}

function keyDownHandler(e) {
    if (e.key === 'ArrowRight' || e.key === 'Right') {
        rightPressed = true;
    } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === 'ArrowRight' || e.key === 'Right') {
        rightPressed = false;
    } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        leftPressed = false;
    }
}

function moveBat() {
    if (rightPressed && batX < canvas.width - batWidth) {
        batX += 7; 
    } else if (leftPressed && batX > 0) {
        batX -= 7; 
    }
}

function kaboom() {
    // iteriramo kroz sve cigle i provjeravamo status (je li već uništena ili još postoji)
    for (let i = 0; i < brickColumnCount; i++) {
        for (let j = 0; j < brickRowCount; j++) {
            let b = bricks[i][j];
            if (b.status === 1) { 
                if (
                    // provjera je li došlo do sudara
                    ball_x > b.x &&
                    ball_x < b.x + brickWidth &&
                    ball_y > b.y &&
                    ball_y < b.y + brickHeight
                ) {
                    // ako je došlo do sudara mijenjamo smjer loptice i stavljamo status na nula (uništena je)
                    // igraču povećavamo score
                    ball_dy = -ball_dy; 
                    b.status = 0; 
                    score++;

                    if (score > bestScore) {
                        bestScore = score;
                        localStorage.setItem('bestScore', bestScore); 
                    }
                    

                    // ako smo uništili sve cigle igra je gotova - igrač pobjeđuje
                    if (score === brickRowCount * brickColumnCount) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.font = '48px Arial';
                        ctx.fillStyle = 'black';
                        ctx.textAlign = 'center';
                        ctx.fillText('YOU WIN!', canvas.width / 2, canvas.height / 2);
                        return; 
                    }
                }
            }
        }
    }
}

function initialiseBricks() {
    for (let i = 0; i < brickColumnCount; i++) {
        bricks[i] = [];
        for (let j = 0; j < brickRowCount; j++) {
            bricks[i][j] = { x: 0, y: 0, status: 1 }; 
        }
    }
}

function drawBricks() {
    for (let i = 0; i < brickColumnCount; i++) {
        for (let j = 0; j < brickRowCount; j++) {
            if (bricks[i][j].status === 1) {
                const brickX = (i * (brickWidth + brickPadding)) + brickOffsetLeft;
                const brickY = (j * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[i][j].x = brickX;
                bricks[i][j].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = 'pink';
                ctx.shadowColor = 'black';
                ctx.shadowBlur = 5;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawBat() {
    ctx.beginPath();
    ctx.rect(batX, canvas.height - batHeight - 10, batWidth, batHeight);
    ctx.fillStyle = 'red';
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 5;
    ctx.fill();
    ctx.closePath();
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball_x, ball_y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.closePath();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBricks(); 
    drawBat(); 
    drawBall(); 
    drawScore();
    kaboom(); 
    moveBat(); 

    // ažurira poziciju loptice na ekranu
    ball_x += ball_dx;
    ball_y += ball_dy;

    // logika za provjeru sudara loptice sa rubovima ekrana
    if (ball_x + ball_dx > canvas.width - ballRadius || ball_x + ball_dx < ballRadius) {
        ball_dx = -ball_dx;
    }
    if (ball_y + ball_dy < ballRadius) {
        ball_dy = -ball_dy;
    } 
    // ako loptica dotakne donji rub ekrana, kraj igre
    else if (ball_y + ballRadius > canvas.height) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); 
        ctx.font = '52px Arial'; 
        ctx.fillStyle = 'black'; 
        ctx.textAlign = 'center'; 
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
        return; 
    }
    else if (ball_y + ballRadius >= canvas.height - batHeight - 10) {
        if (ball_x > batX && ball_x < batX + batWidth) {
            ball_dy = -ball_dy; 
        }
    }

    requestAnimationFrame(draw); //kontinuirano ažurira stanje igre
}

function startGame() {

    // dohvaćamo korisnički unos za broj redova, stupaca i brzinu loptice
    const rows = document.getElementById('brickRows').value;
    const columns = document.getElementById('brickColumns').value;
    const speed = document.getElementById('ballSpeed').value;

    document.getElementById('gameForm').style.display = 'none';
    document.getElementById('gameCanvas').style.display = 'block';

    brickRowCount = parseInt(rows, 10);
    brickColumnCount = parseInt(columns, 10);
    const randomAngle = Math.random() * Math.PI / 3 - Math.PI / 6; 
    ball_dx = speed * Math.cos(randomAngle);
    ball_dy = -Math.abs(speed * Math.sin(randomAngle)); 
    initialiseBricks();

    draw(); // započinje igru
}

