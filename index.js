const canvas = document.getElementById('canvas')
const ctx = canvas.getContext("2d")

canvas.width = innerWidth;
canvas.height = innerHeight;


// Create a  Player
class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

// Create a Shoot Projectiles
class Projectiles {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.fill()
    }
    update() {
        this.draw()
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

// Create Enemy
class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.fill()
    }
    update() {
        this.draw()
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}
const x = canvas.width / 2;
const y = canvas.height / 2;
const player = new Player(x, y, 30, "red")
const projectiles = [];
const enemies = [];

function spawnEnemies() {
    setInterval(() => {
        const radius = Math.random() * (30 - 10)

        let x, y;
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }
        const color = "black"
        const angle = Math.atan2(
            canvas.height / 2 - y, canvas.width / 2 - x)

        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }


        enemies.push(new Enemy(x, y, radius, color, velocity))

    }, 1000)
}

let animationId;
function animate() {
    animationId = requestAnimationFrame(animate)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    player.draw()

    projectiles.forEach((projectile) => {
        projectile.update()
    })

    enemies.forEach((enemy, index) => {
        enemy.update()
        const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y)

        // End Game
        if (distance - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animationId)
        }

        // Detect collision on enemy & prjectile // hit
        projectiles.forEach((projectile, projectileIndex) => {
            const distance = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

            // Object Touch 
            if (distance - enemy.radius - projectile.radius < 1) {
                setTimeout(() => {
                    enemies.splice(index, 1)
                    projectiles.splice(projectileIndex, 1)
                }, 0)
            }
        })
    })
}

addEventListener("click", (event) => {
    const angle = Math.atan2(
        event.clientY - canvas.height / 2, event.clientX - canvas.width / 2)

    const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle)
    }
    projectiles.push(
        new Projectiles(canvas.width / 2, canvas.height / 2, 5, "blue", velocity)
    )
})
animate()
spawnEnemies()