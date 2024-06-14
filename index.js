$(document).ready(function () {
    const canvasDimension = $(document).height();

    let player;
    let lastX = (canvasDimension/2);
    let isMoving = false;
    let moveTimer;

    const enemies = [];
    const enemyPatterns = ["straight"];

    let isShooting = false;
    let fireRate = 0;
    const playerBullets = [];

    let points = 0;
    let health = 5;
    let level = 1;

    const gamescreen = {
        canvas: $("<canvas>", {
            id: "gamescreen"
        }),
        initialize: function() {
            this.canvas[0].width = canvasDimension;
            this.canvas[0].height = canvasDimension;
            this.context = this.canvas[0].getContext("2d");
            this.interval = setInterval(updateGameArea, 15);

            $("#gamecontainer").prepend(this.canvas);

            this.canvas.on("mousemove", function(info) {
                isMoving = true;
                clearTimeout(moveTimer);
                moveTimer = setTimeout(() => {
                    isMoving = false;
                }, 100);
                lastX = player.xPos;

                player.xPos = info.clientX-(gamescreen.canvas[0].getBoundingClientRect().left);
                player.yPos = info.clientY-(gamescreen.canvas[0].getBoundingClientRect().top);
            });

            this.canvas.on("mousedown", function() {
                isShooting = true;
            });

            $(document).on("mouseup", function() {
                isShooting = false;
                fireRate = 0;
            });
        },
        clear: function() {
            this.context.clearRect(0, 0, this.canvas[0].width, this.canvas[0].height);
        }
    };

    class Entity {
        constructor(x, y, w, h, c) {
            this._xPos = x;
            this._yPos = y;
            this._width = w;
            this._height = h;
            this._color = c;
        }

        get xPos() {
            return this._xPos;
        }
        get yPos() {
            return this._yPos;
        }
        get width() {
            return this._width;
        }
        get height() {
            return this._height;
        }
        get color() {
            return this._color;
        }

        set xPos(nv) {
            this._xPos = nv;
        }
        set yPos(nv) {
            this._yPos = nv;
        }
        set width(nv) {
            this._width = nv;
        }
        set height(nv) {
            this._height = nv;
        }
        set color(nv) {
            this._color = nv;
        }

        update() {
            let img = new Image();
            img.src = "assets/shark.svg";

            let hitbox = gamescreen.context;
            hitbox.drawImage(img, this._xPos-this._width, this._yPos-this._height, this._width, this._height);
        };

        shotBy(bullet) {
            let selfLeft = this._xPos - this._width;
            let selfRight = this._xPos;
            let selfTop = this._yPos - this._height;
            let selfBottom = this._yPos;

            let bulletLeft = bullet.xPos;
            let bulletRight = bullet.xPos + bullet.width;
            let bulletTop = bullet.yPos;
            let bulletBottom = bullet.yPos + bullet.height;

            let collision = true;
            if ((selfBottom < bulletTop) ||
                (selfTop > bulletBottom) ||
                (selfRight < bulletLeft) ||
                (selfLeft > bulletRight)) {
                    collision = false;
            }
            return collision;
        }
    };

    class Player extends Entity {
        constructor(x, y, w, h, c) {
            super(x, y, w, h, c);
        }

        update() {
            let spriteImg = new Image();
            if (lastX < player.xPos) spriteImg.src = "assets/sprite_player_r.svg";
            else if (lastX > player.xPos) spriteImg.src = "assets/sprite_player_l.svg";
            else spriteImg.src = "assets/sprite_player_f.svg";
            let sprite = gamescreen.context;
            sprite.drawImage(spriteImg, this._xPos-50, this._yPos-50, 100, 100);

            let img2 = new Image();
            let hitbox = gamescreen.context;
            img2.src = "assets/player.svg";
            hitbox.drawImage(img2, this._xPos-(this._width/2), this._yPos-(this._height/2), this._width, this._height);
        };

        shoot() {
            if (fireRate == 0) {
                if (level == 1) playerBullets.push(new PlayerBullet(this._xPos-5, this._yPos-(this._height/2)));
                else if (level == 2) {
                    playerBullets.push(
                        new PlayerBullet(this._xPos-15, this._yPos-(this._height/2)),
                        new PlayerBullet(this._xPos+5, this._yPos-(this._height/2))
                    );
                }
                else if (level == 3) {
                    playerBullets.push(
                        new PlayerBullet(this._xPos-25, this._yPos-(this._height/2)),
                        new PlayerBullet(this._xPos-5, this._yPos-(this._height/2)),
                        new PlayerBullet(this._xPos+15, this._yPos-(this._height/2))
                    );
                }
                else if (level == 4) {
                    playerBullets.push(
                        new PlayerBullet(this._xPos-35, this._yPos-(this._height/2)),
                        new PlayerBullet(this._xPos-15, this._yPos-(this._height/2)),
                        new PlayerBullet(this._xPos+5, this._yPos-(this._height/2)),
                        new PlayerBullet(this._xPos+25, this._yPos-(this._height/2))
                    );
                };
            }
            ++fireRate;
            if (fireRate > 5) fireRate = 0;
        }
    };

    class Enemy extends Entity {
        constructor(x, y, w, h, c, hp = 1) {
            super(x, y, w, h, c);
            this._hp = hp;
            this.startX = this._xPos - this._width;
            this.startY = this._yPos - this._height;
            this.pattern = enemyPatterns[Math.floor(Math.random()*enemyPatterns.length)];
            this.destinationX = canvasDimension + this._width;
            this.destinationY = Math.floor(Math.random() * (canvasDimension/4));
        }

        get hp() {
            return this._hp;
        }

        set hp(nv) {
            this._hp = nv;
        }

        move() {
            if (this.pattern == "straight" && (this._xPos != this.destinationX) && (this._yPos != this.destinationY)) {
                this._xPos = this._xPos + 3;
                if (this._xPos > this.destinationX) this._xPos = this.destinationX;
                this._yPos = ((this.destinationY - this.startY) / (this.destinationX - this.startX)) * this._xPos+this.startY;
            }
        }

        shoot() {}
    };

    class Bullet {
        constructor(x, y) {
            this._xPos = x;
            this._yPos = y;
        }

        get xPos() {
            return this._xPos;
        }
        get yPos() {
            return this._yPos;
        }

        set xPos(nv) {
            this._xPos = nv;
        }
        set yPos(nv) {
            this._yPos = nv;
        }
    };

    class PlayerBullet extends Bullet {
        constructor(x, y) {
            super(x, y);
            this._width = 10;
            this._height = 40;
        }

        get width() {
            return this._width;
        }
        get height() {
            return this._height;
        }

        set width(nv) {
            this._width = nv;
        }
        set height(nv) {
            this._height = nv;
        }

        update() {
            this._yPos = this._yPos - 45;
            let img = new Image();
            img.src = "assets/bullet_player.svg";

            let hitbox = gamescreen.context;
            hitbox.drawImage(img, this._xPos, this._yPos, this._width, this._height);
        };
    };

    function startGame() {
        player = new Player((canvasDimension/2)-10, canvasDimension*(4/5), 20, 20, "#3773b9");
        setInterval(() => {
            if (enemies.length < 10) enemies.push(new Enemy(Math.floor(Math.random()*canvasDimension)+25, Math.floor(Math.random()*(canvasDimension/4))+50, 50, 50, ["red", "orange", "yellow", "green", "blue", "purple"][Math.floor(Math.random()*6)]));
        }, 100);
        gamescreen.initialize();
    };

    function updateGameArea() {
        gamescreen.clear();

        let i = 0;
        while (i < enemies.length) {
            // enemies[i].move();
            enemies[i].update();
            if (enemies[i].xPos >= canvasDimension+enemies[i].dimension) {
                enemies.splice(i, 1);
                --i;
            };
            ++i;
        }

        i = 0;
        while (i < playerBullets.length) {
            let j = 0;
            let isHit = false;
            while (j < enemies.length) {
                isHit = enemies[j].shotBy(playerBullets[i]);
                if (isHit) {
                    --enemies[j].hp;
                    if (enemies[j].hp <= 0) {
                        enemies.splice(j, 1);
                        points = points + 100;
                    };
                    break;
                };
                ++j;
            };
            playerBullets[i].update();
            if (isHit || playerBullets[i].yPos < -100) {
                playerBullets.splice(i, 1);
                --i;
            };
            ++i;
        };

        if (isShooting) player.shoot();

        if (points >= 5000 && level < 2) level = 2;
        if (points >= 10000 && level < 3) level = 3;
        if (points >= 15000 && level < 4) level = 4;

        $("#points").html(points);
        $("#health").html(health);
        $("#level").html(level);

        player.update();

        if (!isMoving) lastX = player.xPos;
    };

    startGame();
});