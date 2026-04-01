


const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let cw, ch;

function resize() {
    cw = canvas.width = window.innerWidth;
    ch = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Cloud Configuration
class Mist {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * cw;
        this.y = ch - (Math.random() * 300); // Near the ground
        this.size = Math.random() * 300 + 200; // Massive soft puffs
        this.speed = Math.random() * 0.2 + 0.1;
        this.opacity = Math.random() * 0.1 + 0.05; // Very subtle
    }
    draw() {
        this.x += this.speed;
        if (this.x - this.size > cw) this.x = -this.size;

        // Use a radial gradient for soft edges
        let gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        gradient.addColorStop(0, `rgba(40, 50, 70, ${this.opacity})`);
        gradient.addColorStop(1, 'rgba(40, 50, 70, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

const clouds = Array.from({ length: 8 }, () => new Mist());

// Rain Configuration
const maxRain = 1000;
const degree = 9;
const radian = degree * (Math.PI / 180);
const fallingCharArr = [];

class RainDrop {
    constructor(isInitial = false) { this.reset(isInitial); }
    reset(isInitial = false) {
        this.z = Math.random() * 0.9 + 0.1;
        this.x = Math.random() * (cw + 200) - 100;
        this.y = isInitial ? Math.random() * ch : -100;
        this.speed = (Math.random() * 15 + 15) * this.z;
        this.len = (Math.random() * 20 + 10) * this.z;
        this.opacity = this.z * 0.4;
        this.isSplashing = false;
        this.splashTimer = 0;
    }
    draw() {
        if (!this.isSplashing) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(174, 194, 224, ${this.opacity})`;
            ctx.lineWidth = this.z * 1.5;
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x - this.len * Math.sin(radian), this.y - this.len * Math.cos(radian));
            ctx.stroke();
            this.x += this.speed * Math.sin(radian);
            this.y += this.speed * Math.cos(radian);
            if (this.y > ch - 20) this.isSplashing = true;
        } else {
            this.drawSplash();
        }
        if (this.y > ch + 100 || this.x > cw + 100 || this.x < -100) this.reset();
    }
    drawSplash() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fillRect(this.x, this.y, this.z, this.z);
        this.splashTimer++;
        if (this.splashTimer > 2) this.reset();
    }
}

function update() {
    if (fallingCharArr.length < maxRain) {
        fallingCharArr.push(new RainDrop(true));
        fallingCharArr.sort((a, b) => a.z - b.z);
    }

    // 1. Dark blue-grey sky
    ctx.fillStyle = "#0a0c12"; 
    ctx.fillRect(0, 0, cw, ch);

    // 3. Clouds/Mist (The atmospheric layer)
    clouds.forEach(c => c.draw());

    // 4. Subtle overall fog overlay
    ctx.fillStyle = "rgba(10, 15, 25, 0.3)"; 
    ctx.fillRect(0, 0, cw, ch);

    // 5. Rain
    for (let drop of fallingCharArr) {
        drop.draw();
    }

    requestAnimationFrame(update);
}

update();
