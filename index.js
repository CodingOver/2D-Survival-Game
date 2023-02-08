const canvas = document.getElementById('canvas')
const ctx = canvas.getContext("2d")

canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreEl = document.getElementById("scoreEl")
const startGameBtn = document.getElementById("startGameBtn")
const modalEl = document.getElementById("modalEl")
const scoreResult = document.getElementById("scoreResult")

const startGameAudio = new Audio('./audio/startGame.mp3')
const endGameAudio = new Audio('./audio/endGame.mp3')
const shootAudio = new Audio('./audio/shoot.mp3')
const enemyHitAudio = new Audio('./audio/enemyHit.mp3')
const enemyEliminatedAudio = new Audio('./audio/enemyHit.mp3')
const powerUpsAudio = new Audio('./audio/powerUp.mp3')
const backgorundSoundAudio = new Audio('./audio/backgroundSound.mp3')

backgorundSoundAudio.loop = true
const scene = {
    active: false
}

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
        this.powerUp = ''
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


    shoot(mouse, color) {
        const angle = Math.atan2(
            mouse.y - this.y,
            mouse.x - this.x
        )

        const velocity = {
            x: Math.cos(angle) * 6,
            y: Math.sin(angle) * 6
        }
        projectiles.push(
            new Projectiles(this.x, this.y, 5, color, velocity)
        )
        shootAudio.cloneNode().play()
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

const powerUpImg = new Image()
powerUpImg.src = "./img/Vector.png"

// Create a Power Ups
class PowerUp {
    constructor(x, y, velocity) {
        this.x = x
        this.y = y
        this.velocity = velocity
        this.width = 14
        this.height = 18
        this.radians = 0
    }
    draw() {
        ctx.save()
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2)
        ctx.rotate(this.radians)
        ctx.translate(-this.x - this.width / 2, -this.y - this.height / 2)
        ctx.drawImage(powerUpImg, this.x, this.y, 14, 18)
        ctx.restore()
    }
    update() {
        this.radians += 0.002
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

class BackgroundParticle {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.alpha = 0.1
        this.initialAlpha = this.alpha
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
        // this.alpha -= 0.01
    }
}



let player;
let powerUps = [];
let projectiles = [];
let enemies = [];
let particles = [];
let backgroundParticle = [];

function init() {
    const x = canvas.width / 2;
    const y = canvas.height / 2;
    player = new Player(x, y, 10, "white")
    projectiles = []
    enemies = []
    particles = []
    backgroundParticle = [];



    for (let x = 0; x < canvas.width; x += 30) {
        for (let y = 0; y < canvas.height; y += 30) {
            backgroundParticle.push(
                new BackgroundParticle(x, y, 3, "blue")
            )
        }
    }
}

function spawnEnemies() {
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

}

function spawnPowerUps() {
    let x, y;

    if (Math.random() < 0.5) {

        x = Math.random() < 0.5 ? 0 - 7 : canvas.width + 7
        y = Math.random() * canvas.height;

    } else {
        7
        x = Math.random() * canvas.width
        y = Math.random() < 0.5 ? 0 - 9 : canvas.height + 9

    }

    // colorizing Game
    const angle = Math.atan2(
        canvas.height / 2 - y, canvas.width / 2 - x)

    const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle)
    }


    powerUps.push(new PowerUp(x, y, velocity))
}

function createScoreLabel(projectile, score) {
    const scoreLabel = document.createElement('label')
    scoreLabel.innerHTML = score
    scoreLabel.style.position = "absolute"
    scoreLabel.style.color = "white"
    scoreLabel.style.userSelect = "none"
    scoreLabel.style.left = projectile.x + "px"
    scoreLabel.style.top = projectile.y + "px"
    document.body.appendChild(scoreLabel)

    gsap.to(scoreLabel, {
        opacity: 0,
        y: -30,
        duration: .75,
        onComplete: () => {
            scoreLabel.parentNode.removeChild(scoreLabel)
        }
    })

}

let animationId;
let score = 0;
let frame = 0;


function animate() {
    animationId = requestAnimationFrame(animate)
    frame++;
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Starting Enemy 
    if (frame % 100 === 0) spawnEnemies()
    if (frame % 500 === 0) spawnPowerUps()

    backgroundParticle.forEach((backgroundParticle) => {
        const distance = Math.hypot(
            player.x - backgroundParticle.x,
            player.y - backgroundParticle.y
        )

        const hideRadius = 100
        if (distance < hideRadius) {
            if (distance < 70) {
                backgroundParticle.alpha = 0
            } else {
                backgroundParticle.alpha = 0.5
            }
        } else if (distance >= hideRadius && backgroundParticle.alpha < backgroundParticle.initialAlpha) {
            backgroundParticle.alpha += 0.01
        } else if (distance >= hideRadius && backgroundParticle.alpha > backgroundParticle.initialAlpha) {
            backgroundParticle.alpha -= 0.01
        }

        backgroundParticle.update()
    })

    player.update()

    if (player.powerUp === "Automatic" && mouse.down) {
        if (frame % 3 === 0) {
            player.shoot(mouse, '#FFF500')
        }
    }

    powerUps.forEach((powerUp, index) => {
        const distance = Math.hypot(player.x - powerUp.x, player.y - powerUp.y)

        // Gain The Automatic Shooting Ability
        if (distance - player.radius - powerUp.width / 2 < 1) {
            player.color = '#FFF500'
            player.powerUp = "Automatic"
            powerUps.splice(index, 1)

            powerUpsAudio.cloneNode().play()

            setTimeout(() => {
                player.powerUp = null
                player.color = "#FFFFFF"
            }, 5000)
        } else {
            powerUp.update()
        }

    })

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
            endGameAudio.play()
            scene.active = false

            gsap.to('#whiteModalEl', {
                opacity: 1,
                scale: 1,
                duration: 0.45,
                ease: 'expo',
            })
        }

        // Detect collision on enemy & projectile hit
        projectiles.forEach((projectile, projectileIndex) => {
            const distance = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

            // Hit Enemy
            // Projectiles Touch Enemy
            if (distance - enemy.radius - projectile.radius < 1) {

                // Create Explosions
                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 3, enemy.color, {
                        x: (Math.random() - 0.5) * (Math.random() * 6),
                        y: (Math.random() - 0.5) * (Math.random() * 6)
                    }))
                }

                // Shrink Enemy
                if (enemy.radius - 10 > 5) {
                    enemyHitAudio.cloneNode().play()

                    // increase our score By 100
                    score += 100
                    scoreEl.innerHTML = score;

                    createScoreLabel(projectile, 100)
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })

                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1)
                    }, 0)

                } else {

                    // Eliminate Enemy
                    enemyEliminatedAudio.cloneNode().play()

                    // Remove from scene all together
                    // Bonus : Increase By 250
                    score += 250
                    scoreEl.innerHTML = score;
                    createScoreLabel(projectile, 250)

                    //  Change backgroundParticle Color
                    backgroundParticle.forEach((backgroundParticle) => {
                        backgroundParticle.color = enemy.color

                        gsap.to(backgroundParticle, {
                            alpha: 0.5,
                            duration: 0.015,
                            onComplete: () => {
                                gsap.to(backgroundParticle, {
                                    alpha: backgroundParticle.initialAlpha,
                                    duration: 0.03
                                })
                            }
                        })
                    })

                    setTimeout(() => {
                        const enemyFound = enemies.find((enemyValue) => {
                            return enemyValue === enemy
                        })
                        if (enemyFound) {
                            enemies.splice(index, 1)
                            projectiles.splice(projectileIndex, 1)
                        }

                    }, 0)
                }
            }

        })
    })
}

const mouse = {
    down: false,
    x: undefined,
    y: undefined
}

addEventListener("mousedown", ({ clientX, clientY }) => {
    mouse.x = clientX
    mouse.y = clientY

    mouse.down = true
})

addEventListener("mousemove", ({ clientX, clientY }) => {
    mouse.x = clientX
    mouse.y = clientY
})

addEventListener("mouseup", () => {
    mouse.down = false

})

addEventListener("touchstart", (event) => {
    mouse.x = event.touches[0].clientX
    mouse.y = event.touches[0].clientY

    mouse.down = true
})

addEventListener("touchmove", (event) => {
    mouse.x = event.touches[0].clientX
    mouse.y = event.touches[0].clientY
})

addEventListener("touchend", () => {
    mouse.down = false
})

addEventListener("click", ({ clientX, clientY }) => {
    if (scene.active && player.powerUp !== "Automatic") {
        mouse.x = clientX
        mouse.y = clientY
        player.shoot(mouse)
    }

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

addEventListener("resize", () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;

    init()
})

startGameBtn.addEventListener("click", () => {
    init()
    animate()
    startGameAudio.play()
    backgorundSoundAudio.currentTime = 125
    scene.active = true


    score = 0
    scoreEl.innerHTML = score
    scoreResult.innerHTML = score
    backgorundSoundAudio.play()


    gsap.to('#whiteModalEl', {
        opacity: 0,
        scale: 0.75,
        duration: 0.25,
        ease: 'expo.in',
        onComplete: () => {
            modalEl.style.display = 'none'
        }
    })
})