
var c, cc;

var KEYS = {
    SPACE: "SPACE",
    LEFT: "LEFT",
    UP: "UP",
    RIGHT: "RIGHT",
    DOWN: "DOWN"
};

const clamp = (num, min, max) => {
    return Math.max(min, Math.min(num, max))
}

class ResourceManager {
    constructor() {
        this.resourceCache = {};
        this.loading = [];
        this.callbacks = [];
    }

    load(resource) {
        if (resource instanceof Array) {
            resource.forEach(res => this._load(res));
        } else this._load(resource);
    }

    _load(url) {
        if (this.resourceCache[url]) return this.resourceCache[url];
        else {
            this.loading.push(url);

            const img = new Image();
            img.onload = () => {
                this.resourceCache[url] = img;
                if (this.isReady()) this.callbacks.forEach(cb => cb());
            }
            img.src = url;
            this.resourceCache[url] = img;
        }
    }

    get(url) {
        return this.resourceCache[url];
    }

    isReady() {
        let ready = true;
        for (let k in this.resourceCache) {
            if (this.resourceCache.hasOwnProperty(k) && !(this.resourceCache[k]))
                ready = false;
        };
        return ready;
    }

    onReady(func) {
        this.callbacks.push(func);
    }
}

const assets = [
    'assets/baseball_bat.png',
    'assets/blue_foot.png',
    'assets/blue_shoulder.png',
    'assets/bottom_wall.png',
    'assets/bullet.png',
    'assets/end_flag.png',
    'assets/green_foot.png',
    'assets/green_shoulder.png',
    'assets/helmet.png',
    'assets/left_wall.png',
    'assets/limb.png',
    'assets/machine_gun.png',
    'assets/metal_bat.png',
    'assets/pistol_reload.png',
    'assets/pistol.png',
    'assets/player_gun.png',
    'assets/player_hold.png',
    'assets/player_machine_gun_reload.png',
    'assets/player_machine_gun.png',
    'assets/player_standing.png',
    'assets/right_wall.png',
    'assets/start_flag.png',
];

rm = new ResourceManager();
document.addEventListener("DOMContentLoaded", () => {
    c = document.getElementById('canvas');
    cc = c.getContext('2d');


    const ViewportDemo = new Game(c.width, c.height, 100);

    const startDemo = () => {
        let time = Date.now();
        let dt = (ViewportDemo.initialTime - time) / 1000.0;

        ViewportDemo.update(dt);
        ViewportDemo.render();

        ViewportDemo.initialTime = time;
        requestAnimationFrame(startDemo);
    }

    const drawTestImage = () => {
        const img = rm.get('assets/player_standing.png');
        debugger;
        cc.drawImage(img, 100, 100);
    }

    rm.load(assets);
    rm.onReady(startDemo);
    // rm.onReady(drawTestImage);

    // startDemo();
});

class Game {
    constructor(vpWidth, vpHeight, cellCount) {
        // this.cellSize = vpWidth / cellCount; // renders entire map
        this.cellSize = 25; // for camera
        this.width = cellCount * this.cellSize;
        this.height = cellCount * this.cellSize;

        // this.camera = new Camera(vpWidth, vpHeight, this.width, this.height, cellCount);
        // this.map = new Map(cellCount, this.cellSize);

        this.inputHandler = new InputManager();
        // this.viewport = new Viewport(this.cellSize, cellCount);
        this.player = new Player(this.cellSize, this.inputHandler, this.cellSize, cellCount);
        // this.camera.follow(this.player);

        this.initialTime = Date.now();
    }



    update(dt) {
        this.player.update(dt);
        // this.viewport.update(this.player.position.x, this.player.position.y);
        // this.camera.update();
    }

    render() {
        // this.map.render();
        cc.fillStyle = "#000";
        cc.fillRect(0, 0, c.width, c.height);
        // this.viewport.render(this.map.grid);
        // this.camera.render(this.map.grid);
        this.player.render();
    }
}

class InputManager {
    constructor() {
        this.pressedKeys = {};

        document.addEventListener('keydown', e => this.setKey(e, true));
        document.addEventListener('keyup', e => this.setKey(e, false));
    }

    setKey(e, status) {
        e.preventDefault();
        let key;
        switch (e.keyCode) {
            case 32:
                key = KEYS.SPACE;
                break;
            case 37:
                key = KEYS.LEFT;
                break;
            case 38:
                key = KEYS.UP;
                break;
            case 39:
                key = KEYS.RIGHT;
                break;
            case 40:
                key = KEYS.DOWN;
                break;
            default:
                // Convert ASCII codes to letters
                key = String.fromCharCode(e.keyCode);

        }

        this.pressedKeys[key] = status;
    }

    isPressed(key) {
        return this.pressedKeys[key];
    }
}

class Player {
    constructor(size, inputHandler, cellSize, cellCount) {
        this.size = size / 3; //c.width / (size * 2);
        // this.screenX = 0;
        // this.screenY = 0;
        this.sprite = rm.get('assets/player_standing.png');
        console.log(this.sprite);
        this.width = this.sprite.width;
        this.height = this.sprite.height;
        console.log(this.width, this.height);

        this.position = {
            x: this.size,
            y: this.size
        };

        this.velocity = {
            x: 0,
            y: 0
        };

        this.speed = this.size * 20;


        this.ih = inputHandler;

        this.cellSize = cellSize;
        this.cellCount = cellCount;
    }

    init() {
        this.sprite = rm.get('assets/player_standing.png');
        // console.log(this.sprite);
        this.width = this.sprite.width;
        this.height = this.sprite.height;
    }

    handleInput() {
        if (this.ih.isPressed(KEYS.UP)) {
            // this.velocity.x = 0;
            this.velocity.y = this.speed;
        } else if (this.ih.isPressed(KEYS.DOWN)) {
            // this.velocity.x = 0;
            this.velocity.y = -this.speed;
        } else {
            this.velocity.y = 0;
            // this.velocity.x = 0;
        }

        if (this.ih.isPressed(KEYS.RIGHT)) {
            // this.velocity.y = 0;
            this.velocity.x = -this.speed;
        } else if (this.ih.isPressed(KEYS.LEFT)) {
            // this.velocity.y = 0;
            this.velocity.x = this.speed;
        } else {
            this.velocity.x = 0;
            // this.velocity.y = 0;
        }
    }

    update(dt) {
        this.handleInput();
        // const maxX = this.size * 100 * 3 - (c.width - 10 * (c.width / 100));
        // const maxY = this.size * 100 * 3 - (c.height - 10 * (c.height / 100));
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
        this.position.x = Math.max(0, Math.min(this.position.x, (this.cellCount - 1) * this.cellSize));
        this.position.y = Math.max(0, Math.min(this.position.y, (this.cellCount - 1) * this.cellSize));
        // this.screenX = this.position.x;
        // this.screenY = this.position.y;
        // console.log(this.screenX, this.screenY);postition.
    }

    render(offsetX, offsetY) {
        // cc.fillStyle = "#0ff";
        // cc.beginPath();
        // cc.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2)
        // cc.closePath();
        // cc.fill();
        cc.drawImage(this.sprite, this.position.x, this.position.y, 50, 50, 0, 0, 50, 50);
    }
}

