phina.globalize();

const SCREEN_HEIGHT = 640;
const SCREEN_WIDTH = 320;
const BLOCK_SIZE = 32;
const BLOCK_NUM_H = SCREEN_HEIGHT / BLOCK_SIZE;
const BLOCK_NUM_W = SCREEN_WIDTH / BLOCK_SIZE;
const BLOCK_OFFSET = BLOCK_SIZE / 2;
const GRID = {
    x: Grid(SCREEN_WIDTH, BLOCK_NUM_W),
    y: Grid(SCREEN_HEIGHT, BLOCK_NUM_H)
};
const TETROMINOS = [
    // type I
    [
        [{x: -2, y: 0}, {x: -1, y: 0}, {x: 1, y: 0}],
        [{x: 0, y: -2}, {x: 0, y: -1}, {x: 0, y: 1}],
        [{x: 2, y: 0}, {x: 1, y: 0}, {x: -1, y: 0}],
        [{x: 0, y: 2}, {x: 0, y: 1}, {x: 0, y: -1}]
    ],
    // type square
    [
        [{x: 0, y: -1}, {x: 1, y: -1}, {x: 1, y: 0}],
        [{x: 0, y: -1}, {x: 1, y: -1}, {x: 1, y: 0}],
        [{x: 0, y: -1}, {x: 1, y: -1}, {x: 1, y: 0}],
        [{x: 0, y: -1}, {x: 1, y: -1}, {x: 1, y: 0}]
    ],
    // type S
    [
        [{x: -1, y: 0}, {x: 0, y: -1}, {x: 1, y: -1}],
        [{x: 0, y: -1}, {x: 1, y: 0}, {x: 1, y: 1}],
        [{x: 1, y: 0}, {x: 0, y: 1}, {x: -1, y: 1}],
        [{x: 0, y: 1}, {x: -1, y: 0}, {x: -1, y: -1}]

    ],
    // type Z
    [
        [{x: -1, y: -1}, {x: 0, y: -1}, {x: 1, y: 0}],
        [{x: 1, y: -1}, {x: 1, y: 0}, {x: 0, y: 1}],
        [{x: -1, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}],
        [{x: 0, y: -1}, {x: -1, y: 0}, {x: -1, y: 1}]
    ],
    // type J
    [
        [{x: -1, y: -1}, {x: -1, y: 0}, {x: 1, y: 0}],
        [{x: 1, y: -1}, {x: 0, y: -1}, {x: 0, y: 1}],
        [{x: 1, y: 1}, {x: 1, y: 0}, {x: -1, y: 0}],
        [{x: -1, y: 1}, {x: 0, y: 1}, {x: 0, y: -1}]
    ],
    // type L
    [
        [{x: 1, y: -1}, {x: 1, y: 0}, {x: -1, y: 0}],
        [{x: 1, y: 1}, {x: 0, y: 1}, {x: 0, y: -1}],
        [{x: -1, y: 1}, {x: -1, y: 0}, {x: 1, y: 0}],
        [{x: -1, y: -1}, {x: 0, y: -1}, {x: 0, y: 1}]
    ],
    // type T
    [
        [{x: -1, y: 0}, {x: 0, y: -1}, {x: 1, y: 0}],
        [{x: 0, y: -1}, {x: 1, y: 0}, {x: 0, y: 1}],
        [{x: 1, y: 0}, {x: 0, y: 1}, {x: -1, y: 0}],
        [{x: 0, y: 1}, {x: -1, y: 0}, {x: 0, y: -1}]
    ]
];

const ASSETS = {
    "image": {
        "blocks": "./assets/images/blocks.png"
    }
};

phina.define('MainScene', {
    superClass: 'DisplayScene',
    init: function () {
        this.superInit({
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT
        });

        this.time = 0;
        this.downInterval = 1000;
        this.backgroundColor = 'gray';
        this.blocks = [[]];
        this.mostBottom = false;

        this.current = Tetromino(Random.randint(0, 6), 4, 0).addChildTo(this);
    },


    update: function (app) {
        const key = app.keyboard;

        if (key.getKeyDown('space')) {
            this.current.rotateCW();
            this.fixPosition();
        }
        if (key.getKeyDown('shift')) {
            this.current.rotateCCW();
            this.fixPosition();
        }
        if (key.getKeyDown('right')) {
            this.current.moveRight();
            this.fixPosition();
        }
        if (key.getKeyDown('left')) {
            this.current.moveLeft();
            this.fixPosition();
        }

        this.time += app.deltaTime;
        if (this.time / this.downInterval >= 1) {
            if (this.mostBottom) {
                // フラグが立っていれば固定
                this.current.blocks.forEach(block => {
                    this.blocks[block.y].append(block.x);
                });
            } else {
                // フラグが立ってない場合は1段落下処理
                this.current.moveDown();
                this.fixPosition();
            }
            this.time -= this.downInterval;
        }
    },
    fixPosition: function () {
        if (this.current.right > SCREEN_WIDTH) {
            this.current.moveLeft();
        }
        if (this.current.bottom > SCREEN_HEIGHT) {
            this.current.moveUp();
            this.mostBottom = true;
        } else {
            this.mostBottom = false;
        }
        if (this.current.left < 0) {
            this.current.moveRight();
        }
    }
});

phina.define('Tetromino', {
    superClass: 'DisplayElement',

    _accessor: {
        right: {
            get: function () {
                return this.x + this._right * BLOCK_SIZE;
            }
        },
        bottom: {
            get: function () {
                return this.y + this._bottom * BLOCK_SIZE;
            }
        },
        left: {
            get: function () {
                return this.x + this._left * BLOCK_SIZE;
            }
        },
        blocks: {
            get: function () {
                const block = TETROMINOS[this.type][this.rotate];
                return [
                    {x: this.gx, y: this.gy},
                    {x: this.gx + block[0].x, y: this.gy + block[0].y},
                    {x: this.gx + block[1].x, y: this.gy + block[1].y},
                    {x: this.gx + block[2].x, y: this.gy + block[2].y}
                ]
            }
        }
    },

    init: function (type, gx, gy) {
        this.superInit();
        this.type = type;
        this.gx = gx;
        this.gy = gy;
        this.x = GRID.x.span(gx) + BLOCK_OFFSET;
        this.y = GRID.y.span(gy) + BLOCK_OFFSET;
        this._top = 0;
        this._right = 0;
        this._bottom = 0;
        this._left = 0;
        this.rotate = 0;
        TETROMINOS[this.type][this.rotate].forEach(coords => {
            const block = Sprite("blocks", BLOCK_SIZE, BLOCK_SIZE);
            block.setFrameIndex(this.type, BLOCK_SIZE, BLOCK_SIZE);
            block.addChildTo(this);
        });
        Sprite("blocks", BLOCK_SIZE, BLOCK_SIZE).setFrameIndex(this.type, BLOCK_SIZE, BLOCK_SIZE).addChildTo(this);
        this.adjustRelativeBlocks();
    },
    moveUp: function () {
        this.gy--;
        this.positionUpdate();
    },
    moveRight: function () {
        this.gx++;
        this.positionUpdate();
    },
    moveDown: function () {
        this.gy++;
        this.positionUpdate();
    },
    moveLeft: function () {
        this.gx--;
        this.positionUpdate();
    },
    rotateCW: function () {
        this.rotate = (this.rotate + 1) % 4;
        this.adjustRelativeBlocks();
    },
    rotateCCW: function () {
        this.rotate = (this.rotate + 3) % 4;
        this.adjustRelativeBlocks();
    },
    adjustRelativeBlocks: function () {
        this._top = 0;
        this._right = 0;
        this._bottom = 0;
        this._left = 0;
        Array.range(3).forEach(index => {
            const x = TETROMINOS[this.type][this.rotate][index].x;
            const y = TETROMINOS[this.type][this.rotate][index].y;
            this.children[index].x = x * BLOCK_SIZE;
            this.children[index].y = y * BLOCK_SIZE;
            if (this._top > y) {
                this._top = y;
            }
            if (this._right < x) {
                this._right = x;
            }
            if (this._bottom < y) {
                this._bottom = y;
            }
            if (this._left > x) {
                this._left = x;
            }
        });
    },
    positionUpdate() {
        this.x = GRID.x.span(this.gx) + BLOCK_OFFSET;
        this.y = GRID.y.span(this.gy) + BLOCK_OFFSET;
    },
    update: function (app) {

    }
});

phina.main(() => {
    const app = GameApp({
        title: "テトリス",
        fps: 60,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        assets: ASSETS,
    });

    app.run();
});