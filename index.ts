interface position{
    x:number;
    y:number;
}
interface size{
    w:number;
    h:number;
}
interface keys{
    right:boolean;
    left:boolean;
    other:boolean;
}
interface velocity{
    x:number;
    y:number;
}

class Ball{
    position:position;
    speed:number;
    color:string;
    size:number;
    velocity:velocity;
    constructor(x:number, y:number, spd:number, color:string, size:number){
        this.position ={
            x,
            y
        }
        this.speed = spd;
        this.velocity ={
            x:this.speed,
            y:this.speed   
        }
        this.color = color;
        this.size = size;
    }
    moveBall(){
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
    drawBall(ctx:CanvasRenderingContext2D){
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI*2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}

class Player{
    position:position;
    speed:number;
    color:string;
    size:size;
    keys:keys;
    velocity:velocity;
    constructor(x:number, y:number, spd:number, color:string, w:number, h:number){
        this.position = {
            x,
            y
        }
        this.size = {
            w,
            h
        }
        this.velocity = {
            x:0,
            y:0
        }
        this.speed = spd;
        this.color = color;
        this.keys = {
            right:false,
            left:false,
            other:false
        }
    }
    drawPlayer(ctx:CanvasRenderingContext2D){
        ctx.beginPath();
        ctx.rect(this.position.x, this.position.y, this.size.w, this.size.h);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
    movePlayer(){
        if(this.keys.right)
            this.velocity.x = this.speed;
        if(this.keys.left)
            this.velocity.x = -this.speed;

        this.position.x += this.velocity.x;
    }
    addKeyBoard(){
        const player = this;
        window.addEventListener("keydown", function(e) {
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
        window.addEventListener("keyup", function(e) {
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
    }
}

class Block{
    position:position;
    color:string;
    size:size;
    constructor(x:number, y:number, color:string, w:number, h:number){
        this.position = {
            x,
            y
        }
        this.size = {
            w,
            h
        }
        this.color = color;
    }
    drawBlock(ctx:CanvasRenderingContext2D){
        ctx.beginPath();
        ctx.rect(this.position.x, this.position.y, this.size.w, this.size.h);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}

class World{
    size:size;
    gravity:number;
    canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    blocklist:Block[][];
    balllist:Array<Ball>;
    playerlist:Array<Player>;
    constructor(w:number, h:number){
        this.size = {
            w,
            h
        }
        this.canvas = <HTMLCanvasElement> document.getElementById("canvas");
        this.ctx = <CanvasRenderingContext2D> this.canvas.getContext("2d");
        this.playerlist = [];
        this.balllist = [];
        this.blocklist = [];
    }
    createPlayer(){
        const x = this.size.w/2;
        const color = "red";
        const spd = 2;
        const w = 50;
        const h = 5;
        const y = this.size.h-(h*3);

        const player = new Player(x,y,spd,color,w,h);
        player.addKeyBoard();
        this.playerlist.push(player);
    }
    createBall(){
        const x = this.size.w/2;
        const y = this.size.h/2;
        const color = "blue";
        const spd = 1;
        const size = 5;

        const ball = new Ball(x,y,spd,color,size);
        this.balllist.push(ball);
    }
    createBlock(amount:number, row:number){
        const startx = 20;
        const starty = 20;
        const offsetw = 15;
        const offseth = 10
        const column = amount/row;
        
        for(let iic = 0; iic < column; iic++){
            this.blocklist[iic] = [];
            for(let iir = 0; iir < row; iir++){
                const color = "green";
                const w = 30;
                const h = 15;
                const x = startx+(iir*offsetw+(iir*w));
                const y = starty+(iic*offseth+(iic*h));

                const block = new Block(x,y,color,w,h);
                this.blocklist[iic][iir] = block;
            }
        }
    }
    createWorld(){
        this.canvas.height = this.size.h;
        this.canvas.width = this.size.w;
    }
    drawWorld(){
        this.clearWorld();

        this.blocklist.forEach(element => {
            element.forEach(block =>{
                block.drawBlock(this.ctx);
            })
        });
        this.balllist.forEach(ball => {
            ball.drawBall(this.ctx);
            ball.moveBall();
            isHittingSide(ball, this.size);
        });
        this.playerlist.forEach(player => {
            player.drawPlayer(this.ctx);
            player.movePlayer();
            isHittingSide(player, this.size);
        })

        collisionDetectionBlock(this.blocklist, this.balllist);
        collisionDetectionPlayer(this.playerlist, this.balllist);

        requestAnimationFrame(this.drawWorld.bind(this));
    }
    clearWorld(){
        this.ctx.clearRect(0,0,this.size.w,this.size.h);
    }
}

function isHittingSide(obj, world){
    if(obj instanceof Ball){
        if(obj.position.y < 0)
            obj.velocity.y *= -1;
        if(obj.position.y > world.h)
            document.location.reload();
        if(obj.position.x > world.w)
            obj.velocity.x *= -1;
        if(obj.position.x < 0)
            obj.velocity.x *= -1;
    }else if(obj instanceof Player){
        if(obj.position.x+obj.size.w > world.w)
            obj.position.x = world.w-obj.size.w;
        if(obj.position.x < 0)
            obj.velocity.x = 0;
    }
}

function collisionDetectionBlock(blocklist:Block[][], balllist:Ball[]) {
    blocklist.forEach(element => {
        element.forEach(block => {
            balllist.forEach(ball =>{
                if(collisionCircleRect(ball, block)){
                    ball.velocity.y *= -1;
                    removeObject(element, block);
                }
            })
        });
    });
}

function collisionDetectionPlayer(playerlist:Player[], balllist:Ball[]){
    playerlist.forEach(player => {
        balllist.forEach(ball => {
            if(collisionCircleRect(ball, player))
                ball.velocity.y *= -1; 
        });
    });
}

function removeObject(list:any[], obj:any){
    list.splice(list.indexOf(obj), 1);
}

function collisionCircleRect(circle, rect){
  const x = Math.max(rect.position.x, Math.min(circle.position.x, rect.position.x+rect.size.w));
  const y = Math.max(rect.position.y, Math.min(circle.position.y, rect.position.y+rect.size.h));

  const distance = Math.sqrt((x - circle.position.x) * (x - circle.position.x) + (y - circle.position.y) * (y - circle.position.y));
  
  return distance < circle.size;
}

start();
function start(){
    const gameworld = new World(500, 300);
    gameworld.createWorld();
    gameworld.createPlayer();
    gameworld.createBall();
    gameworld.createBlock(50, 10);
    gameworld.drawWorld();
}