const canvas = document.getElementById('canvas')
const ctx = canvas.getContext("2d")

canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreEl = document.getElementById("scoreEl")
const startGameBtn = document.getElementById("startGameBtn")
const modalEl = document.getElementById("modalEl")
const scoreResult = document.getElementById("scoreResult")

// Create a  Player
class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = {
            x: 0,
            y: 0
        }
        this.friction = .99
    }

    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    update() {
        this.draw()
        this.velocity.x *= this.friction
        this.velocity.y *= this.friction

        if (this.x - this.radius + this.velocity.x > 0 && this.x + this.radius + this.velocity.x < canvas.width) {
            this.x = this.x + this.velocity.x
        } else {
            this.velocity.x = 0
        }

        if (this.y - this.radius + this.velocity.y > 0 && this.y + this.radius + this.velocity.y < canvas.height) {
            this.y = this.y + this.velocity.y
        } else {
            this.velocity.y = 0
        }
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
        this.type = 'linear'
        this.center = {
            x,
            y
        }
        this.radians = 0

        if (Math.random() < 0.25) {
            this.type = "homing"
            if (Math.random() < 0.5) {
                this.type = "spinning"

                if (Math.random() < 0.75) {
                    this.type = "homingSpinning"
                }
            }
        }
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.fill()
    }
    update() {
        this.draw()

        if (this.type === 'linear') {
            // linear travel
            this.x = this.x + this.velocity.x;
            this.y = this.y + this.velocity.y;
        } else if (this.type === 'homing') {
            const angle = Math.atan2(player.y - this.y, player.x - this.x)

            this.velocity = {
                x: Math.cos(angle),
                y: Math.sin(angle)
            }

            this.x = this.x + this.velocity.x;
            this.y = this.y + this.velocity.y;
        } else if (this.type === 'spinning') {
            this.radians += 0.05
            this.center.x += this.velocity.x;
            this.center.y += this.velocity.y;

            this.x = this.center.x + Math.cos(this.radians) * 100
            this.y = this.center.y + Math.sin(this.radians) * 100
        } else if (this.type === "homingSpinning") {
            const angle = Math.atan2(player.y - this.y, player.x - this.x)

            this.velocity = {
                x: Math.cos(angle),
                y: Math.sin(angle)
            }
            this.radians += 0.05
            this.center.x += this.velocity.x;
            this.center.y += this.velocity.y;

            this.x = this.center.x + Math.cos(this.radians) * 100
            this.y = this.center.y + Math.sin(this.radians) * 100

        }
    }

}
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }
    draw() {
        ctx.save()
        ctx.globalAlpha = this.alpha
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.fill()
        ctx.restore()
    }
    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}
const x = canvas.width / 2;
const y = canvas.height / 2;

let player = new Player(x, y, 10, "white")
let projectiles = [];
let enemies = [];
let particles = [];

function init() {
    player = new Player(x, y, 10, "white")
    projectiles = []
    enemies = []
    particles = []
    score = 0
    scoreEl.innerHTML = score
    scoreResult.innerHTML = score
}

function spawnEnemies() {
    setInterval(() => {
        const radius = Math.floor(Math.random() * (30 - 10 + 1)) + 10;


        let x, y;
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }
        // colorizing Game
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`
        const angle = Math.atan2(
            canvas.height / 2 - y, canvas.width / 2 - x)

        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }


        enemies.push(new Enemy(x, y, radius, color, velocity))

    }, 4000)
}

let animationId;
let score = 0;
function animate() {
    animationId = requestAnimationFrame(animate)
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    player.update()
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1)
        } else {
            particle.update()
        }
    })
    projectiles.forEach((projectile, index) => {
        projectile.update()

        // Remove Projectile From Edges Of Screen
        if (
            projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y + projectile.radius > canvas.height
        ) {
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0)
        }
    })

    enemies.forEach((enemy, index) => {
        enemy.update()
        const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y)

        // End Game
        if (distance - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animationId)
            modalEl.style.display = "flex"
            scoreResult.innerHTML = score;
        }

        // Detect collision on enemy & projectile hit
        projectiles.forEach((projectile, projectileIndex) => {
            const distance = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

            // Projectiles Touch Enemy
            if (distance - enemy.radius - projectile.radius < 1) {

                // Create Explosions
                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 3, enemy.color, {
                        x: (Math.random() - 0.5) * (Math.random() * 6),
                        y: (Math.random() - 0.5) * (Math.random() * 6)
                    }))
                }

                if (enemy.radius - 10 > 5) {

                    // increase our score By 100
                    score += 100
                    scoreEl.innerHTML = score;

                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1)
                    }, 0)
                } else {

                    // Remove from scene all together
                    // Bonus : Increase By 250
                    score += 250
                    scoreEl.innerHTML = score;

                    setTimeout(() => {
                        enemies.splice(index, 1)
                        projectiles.splice(projectileIndex, 1)
                    }, 0)
                }
            }
        })
    })
}

addEventListener("click", (event) => {
    const angle = Math.atan2(
        event.clientY - player.y,
        event.clientX - player.x
    )

    const velocity = {
        x: Math.cos(angle) * 6,
        y: Math.sin(angle) * 6
    }
    projectiles.push(
        new Projectiles(player.x, player.y, 5, "white", velocity)
    )
})
addEventListener("keydown", ({ keyCode }) => {
    if (keyCode === 37 || keyCode === 65) {
        player.velocity.x -= 1
    } else if (keyCode === 38 || keyCode === 87) {
        player.velocity.y -= 1
    } else if (keyCode === 39 || keyCode === 68) {
        player.velocity.x += 1
    } else if (keyCode === 40 || keyCode === 83) {
        player.velocity.y += 1
    }
})

startGameBtn.addEventListener("click", () => {
    init()
    animate()
    spawnEnemies()
    modalEl.style.display = "none"
})