document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("tetris");
    const context = canvas.getContext("2d");

    context.scale(30, 30);

    const ROWS = 20;
    const COLUMNS = 10;
    let dropCounter = 0;
    let dropInterval = 1000;
    let lastTime = 0;
    let score = 0;
    let gameOver = false;

    const colors = [
        null,
        "cyan",
        "yellow",
        "purple",
        "green",
        "red",
        "blue",
        "orange"
    ];

    const pieces = [
        [[1, 1, 1, 1]], // I
        [[1, 1], [1, 1]], // O
        [[0, 1, 0], [1, 1, 1]], // T
        [[0, 1, 1], [1, 1, 0]], // S
        [[1, 1, 0], [0, 1, 1]], // Z
        [[1, 0, 0], [1, 1, 1]], // J
        [[0, 0, 1], [1, 1, 1]]  // L
    ];

    function createPiece() {
        const typeId = Math.floor(Math.random() * pieces.length);
        return pieces[typeId];
    }

    function collide(arena, player) {
        return player.matrix.some((row, y) =>
            row.some((value, x) =>
                value !== 0 &&
                (arena[y + player.pos.y] && arena[y + player.pos.y][x + player.pos.x]) !== 0
            )
        );
    }

    function merge(arena, player) {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    arena[y + player.pos.y][x + player.pos.x] = value;
                }
            });
        });
    }

    function clearLines() {
        let rowCount = 1;
        outer: for (let y = arena.length - 1; y >= 0; y--) {
            if (arena[y].every(value => value !== 0)) {
                arena.splice(y, 1);
                arena.unshift(new Array(COLUMNS).fill(0));
                score += rowCount * 100;
                rowCount *= 2;
            }
        }
        document.getElementById("score").innerText = "Score: " + score;
    }

    function checkGameOver() {
        return arena[0].some(cell => cell !== 0);
    }

    function rotate(matrix) {
        return matrix[0].map((_, i) => matrix.map(row => row[i])).reverse();
    }

    function playerReset() {
        player.matrix = createPiece();
        player.pos.y = 0;
        player.pos.x = Math.floor(COLUMNS / 2) - Math.floor(player.matrix[0].length / 2);

        if (collide(arena, player)) {
            gameOver = true;
            document.getElementById("gameover").style.display = "block";
            document.getElementById("finalscore").innerText = "Final Score: " + score;
        }
    }

    function drawMatrix(matrix, offset) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    context.fillStyle = colors[value];
                    context.fillRect(x + offset.x, y + offset.y, 1, 1);
                }
            });
        });
    }

    function draw() {
        context.fillStyle = "#000";
        context.fillRect(0, 0, canvas.width, canvas.height);
        drawMatrix(arena, { x: 0, y: 0 });
        drawMatrix(player.matrix, player.pos);
    }

    function update(time = 0) {
        if (gameOver) return;

        const deltaTime = time - lastTime;
        lastTime = time;
        dropCounter += deltaTime;

        if (dropCounter > dropInterval) {
            player.pos.y++;
            if (collide(arena, player)) {
                player.pos.y--;
                merge(arena, player);
                clearLines();
                if (checkGameOver()) {
                    gameOver = true;
                    document.getElementById("gameover").style.display = "block";
                    document.getElementById("finalscore").innerText = "Final Score: " + score;
                } else {
                    playerReset();
                }
            }
            dropCounter = 0;
        }

        draw();
        requestAnimationFrame(update);
    }

    function resetGame() {
        arena.forEach(row => row.fill(0));
        score = 0;
        gameOver = false;
        document.getElementById("score").innerText = "Score: 0";
        document.getElementById("gameover").style.display = "none";
        playerReset();
        update();
    }

    function playerMove(dir) {
        player.pos.x += dir;
        if (collide(arena, player)) {
            player.pos.x -= dir;
        }
    }

    function playerRotate() {
        const rotated = rotate(player.matrix);
        if (!collide(arena, { matrix: rotated, pos: player.pos })) {
            player.matrix = rotated;
        }
    }

    function playerDrop() {
        player.pos.y++;
        if (collide(arena, player)) {
            player.pos.y--;
            merge(arena, player);
            clearLines();
            playerReset();
        }
        dropCounter = 0;
    }

    document.addEventListener("keydown", event => {
        if (event.key === "Enter" && gameOver) {
            resetGame();
        }
        if (gameOver) return;
        if (event.key === "ArrowLeft") {
            playerMove(-1);
        } else if (event.key === "ArrowRight") {
            playerMove(1);
        } else if (event.key === "ArrowDown") {
            playerDrop();
        } else if (event.key === "ArrowUp") {
            playerRotate();
        }
    });

    const arena = Array.from({ length: ROWS }, () => new Array(COLUMNS).fill(0));
    const player = { pos: { x: 0, y: 0 }, matrix: createPiece() };

    playerReset();
    update();
});
