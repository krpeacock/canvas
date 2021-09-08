const TILE_SIZE = 64;
const FOCUS_SIZE = 128;
const CANVAS_SIZE = 16384;
const PREVIEW_SIZE = 512;
const PREVIEW_SCALE_RATIO = CANVAS_SIZE / PREVIEW_SIZE;

class Position {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    focus() {
        return
    }
}

class Focus {
    position: Position;
    constructor(position: Position) {
        this.position = new Position(
            Math.min(position.x, CANVAS_SIZE - FOCUS_SIZE),
            Math.min(position.y, CANVAS_SIZE - FOCUS_SIZE),
        );
    }

    tiles(): number[] {

        let xTilesCount = FOCUS_SIZE / TILE_SIZE;
        let yTilesCount = FOCUS_SIZE / TILE_SIZE;
        if (this.position.x % TILE_SIZE != 0) {
            xTilesCount += 1
        }
        if (this.position.y % TILE_SIZE != 0) {
            yTilesCount += 1
        }

        let tiles = [];
        let tilesPerRow = CANVAS_SIZE / TILE_SIZE;
        let startTile = Math.floor(this.position.x / TILE_SIZE) + Math.floor(this.position.y / TILE_SIZE) * tilesPerRow;
        for (let i = 0; i < yTilesCount; i++) {
            for (let j = 0; j < xTilesCount; j++) {
                tiles.push(startTile + i * tilesPerRow + j);
            }
        }
        return tiles;
    }
}


let testCases = [
    {
        x: 0,
        y: 0,
        expected: [0, 1, 256, 257]
    }, {
        x: 48,
        y: 0,
        expected: [0, 1, 2, 256, 257, 258]
    }, {
        x: 0,
        y: 63,
        expected: [0, 1, 256, 257, 512, 513]
    }, {
        x: 56,
        y: 32,
        expected: [0, 1, 2, 256, 257, 258, 512, 513, 514]
    }, {
        x: 16383,
        y: 16383,
        expected: [65278, 65279, 65534, 65535],
    }
]

testCases.forEach((tc, idx) => {
    let got = new Focus(new Position(tc.x, tc.y)).tiles();
    if (got.length !== tc.expected.length || !got.every((v, idx) => tc.expected[idx] === v)) {
        console.log(`testcase number ${idx} failed, got ${got}, expected ${tc.expected}`);
    }
});
