var Ball = /** @class */ (function () {
    function Ball(x, y, spd, color, size) {
        this.position = {
            x: x,
            y: y
        };
        this.speed = spd;
        this.velocity = {
            x: this.speed,
            y: this.speed
        };
        this.color = color;
        this.size = size;
    }
    Ball.prototype.moveBall = function () {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    };
    Ball.prototype.drawBall = function (ctx) {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    };
    return Ball;
}());
var Player = /** @class */ (function () {
    function Player(x, y, spd, color, w, h) {
        this.position = {
            x: x,
            y: y
        };
        this.size = {
            w: w,
            h: h
        };
        this.velocity = {
            x: 0,
            y: 0
        };
        this.speed = spd;
        this.color = color;
        this.keys = {
            right: false,
            left: false,
            other: false
        };
    }
    Player.prototype.drawPlayer = function (ctx) {
        ctx.beginPath();
        ctx.rect(this.position.x, this.position.y, this.size.w, this.size.h);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    };
    Player.prototype.movePlayer = function () {
        if (this.keys.right)
            this.velocity.x = this.speed;
        if (this.keys.left)
            this.velocity.x = -this.speed;
        this.position.x += this.velocity.x;
    };
    Player.prototype.addKeyBoard = function () {
        var player = this;
        window.addEventListener("keydown", function (e) {
            switch (e.keyCode) {
                case 68:
                    player.keys.right = true;
                    break;
                case 65:
                    player.keys.left = true;
                    break;
                default: player.keys.other = true;
            }
        });
        window.addEventListener("keyup", function (e) {
            switch (e.keyCode) {
                case 68:
                    player.keys.right = false;
                    break;
                case 65:
                    player.keys.left = false;
                    break;
                default: player.keys.other = false;
            }
        });
    };
    return Player;
}());
var Block = /** @class */ (function () {
    function Block(x, y, color, w, h) {
        this.position = {
            x: x,
            y: y
        };
        this.size = {
            w: w,
            h: h
        };
        this.color = color;
    }
    Block.prototype.drawBlock = function (ctx) {
        ctx.beginPath();
        ctx.rect(this.position.x, this.position.y, this.size.w, this.size.h);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    };
    return Block;
}());
var World = /** @class */ (function () {
    function World(w, h) {
        this.size = {
            w: w,
            h: h
        };
        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.playerlist = [];
        this.balllist = [];
        this.blocklist = [];
    }
    World.prototype.createPlayer = function () {
        var x = this.size.w / 2;
        var color = "red";
        var spd = 2;
        var w = 50;
        var h = 5;
        var y = this.size.h - (h * 3);
        var player = new Player(x, y, spd, color, w, h);
        player.addKeyBoard();
        this.playerlist.push(player);
    };
    World.prototype.createBall = function () {
        var x = this.size.w / 2;
        var y = this.size.h / 2;
        var color = "blue";
        var spd = 1;
        var size = 5;
        var ball = new Ball(x, y, spd, color, size);
        this.balllist.push(ball);
    };
    World.prototype.createBlock = function (amount, row) {
        var startx = 20;
        var starty = 20;
        var offsetw = 15;
        var offseth = 10;
        var column = amount / row;
        for (var iic = 0; iic < column; iic++) {
            this.blocklist[iic] = [];
            for (var iir = 0; iir < row; iir++) {
                var color = "green";
                var w = 30;
                var h = 15;
                var x = startx + (iir * offsetw + (iir * w));
                var y = starty + (iic * offseth + (iic * h));
                var block = new Block(x, y, color, w, h);
                this.blocklist[iic][iir] = block;
            }
        }
    };
    World.prototype.createWorld = function () {
        this.canvas.height = this.size.h;
        this.canvas.width = this.size.w;
    };
    World.prototype.drawWorld = function () {
        var _this = this;
        this.clearWorld();
        this.blocklist.forEach(function (element) {
            element.forEach(function (block) {
                block.drawBlock(_this.ctx);
            });
        });
        this.balllist.forEach(function (ball) {
            ball.drawBall(_this.ctx);
            ball.moveBall();
            isHittingSide(ball, _this.size);
        });
        this.playerlist.forEach(function (player) {
            player.drawPlayer(_this.ctx);
            player.movePlayer();
            isHittingSide(player, _this.size);
        });
        collisionDetectionBlock(this.blocklist, this.balllist);
        collisionDetectionPlayer(this.playerlist, this.balllist);
        requestAnimationFrame(this.drawWorld.bind(this));
    };
    World.prototype.clearWorld = function () {
        this.ctx.clearRect(0, 0, this.size.w, this.size.h);
    };
    return World;
}());
function isHittingSide(obj, world) {
    if (obj instanceof Ball) {
        if (obj.position.y < 0)
            obj.velocity.y *= -1;
        if (obj.position.y > world.h)
            document.location.reload();
        if (obj.position.x > world.w)
            obj.velocity.x *= -1;
        if (obj.position.x < 0)
            obj.velocity.x *= -1;
    }
    else if (obj instanceof Player) {
        if (obj.position.x + obj.size.w > world.w)
            obj.position.x = world.w - obj.size.w;
        if (obj.position.x < 0)
            obj.velocity.x = 0;
    }
}
function collisionDetectionBlock(blocklist, balllist) {
    blocklist.forEach(function (element) {
        element.forEach(function (block) {
            balllist.forEach(function (ball) {
                if (collisionCircleRect(ball, block)) {
                    ball.velocity.y *= -1;
                    removeObject(element, block);
                }
            });
        });
    });
}
function collisionDetectionPlayer(playerlist, balllist) {
    playerlist.forEach(function (player) {
        balllist.forEach(function (ball) {
            if (collisionCircleRect(ball, player))
                ball.velocity.y *= -1;
        });
    });
}
function removeObject(list, obj) {
    list.splice(list.indexOf(obj), 1);
}
function collisionCircleRect(circle, rect) {
    var x = Math.max(rect.position.x, Math.min(circle.position.x, rect.position.x + rect.size.w));
    var y = Math.max(rect.position.y, Math.min(circle.position.y, rect.position.y + rect.size.h));
    var distance = Math.sqrt((x - circle.position.x) * (x - circle.position.x) + (y - circle.position.y) * (y - circle.position.y));
    return distance < circle.size;
}
start();
function start() {
    var gameworld = new World(500, 300);
    gameworld.createWorld();
    gameworld.createPlayer();
    gameworld.createBall();
    gameworld.createBlock(50, 10);
    gameworld.drawWorld();
}
