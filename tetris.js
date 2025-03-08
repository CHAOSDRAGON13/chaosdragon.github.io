import pygame
import random

# Initialize Pygame
pygame.init()

# Screen setup (flexible resolution)
WIDTH, HEIGHT = 800, 600
GRID_SIZE = 30
GRID_WIDTH, GRID_HEIGHT = WIDTH // GRID_SIZE, HEIGHT // GRID_SIZE
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Tetris")

# Colors
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
RED = (255, 0, 0)
CYAN = (0, 255, 255)
YELLOW = (255, 255, 0)
MAGENTA = (255, 0, 255)
ORANGE = (255, 165, 0)
BLUE = (0, 0, 255)
GREEN = (0, 255, 0)

# Tetris shapes (Square, T, L, Z, I, etc.)
SHAPES = [
    [[1, 1], [1, 1]],  # Square
    [[0, 1, 0], [1, 1, 1]],  # T
    [[1, 0, 0], [1, 1, 1]],  # L
    [[0, 0, 1], [1, 1, 1]],  # J (reverse L)
    [[1, 1, 0], [0, 1, 1]],  # Z
    [[0, 1, 1], [1, 1, 0]],  # S (reverse Z)
    [[1, 1, 1, 1]]  # I
]
COLORS = [YELLOW, MAGENTA, ORANGE, BLUE, RED, GREEN, CYAN]

# Game variables
clock = pygame.time.Clock()
score = 0
level = 1
base_speed = 500  # milliseconds per move (adjustable)
game_over = False

# Grid to store placed blocks
grid = [[0 for _ in range(GRID_WIDTH)] for _ in range(GRID_HEIGHT)]

class Tetromino:
    def __init__(self):
        self.shape = random.choice(SHAPES)
        self.color = COLORS[SHAPES.index(self.shape)]
        self.x = GRID_WIDTH // 2 - len(self.shape[0]) // 2
        self.y = 0

    def rotate(self):
        # Rotate 90 degrees clockwise
        self.shape = list(zip(*self.shape[::-1]))

    def move(self, dx, dy):
        self.x += dx
        self.y += dy

    def draw(self):
        for i, row in enumerate(self.shape):
            for j, val in enumerate(row):
                if val:
                    pygame.draw.rect(screen, self.color,
                                     ( (self.x + j) * GRID_SIZE, (self.y + i) * GRID_SIZE, GRID_SIZE - 1, GRID_SIZE - 1))

    def collides(self):
        for i, row in enumerate(self.shape):
            for j, val in enumerate(row):
                if val:
                    new_x, new_y = self.x + j, self.y + i
                    if (new_x < 0 or new_x >= GRID_WIDTH or
                        new_y >= GRID_HEIGHT or
                        (new_y >= 0 and grid[new_y][new_x])):
                        return True
        return False

def place_tetromino(tetromino):
    global grid, score
    for i, row in enumerate(tetromino.shape):
        for j, val in enumerate(row):
            if val:
                grid[tetromino.y + i][tetromino.x + j] = tetromino.color
    lines_cleared = 0
    for i in range(GRID_HEIGHT - 1, -1, -1):
        if all(grid[i]):
            del grid[i]
            grid.insert(0, [0 for _ in range(GRID_WIDTH)])
            lines_cleared += 1
    score += lines_cleared * 100

def draw_grid():
    for i in range(GRID_HEIGHT):
        for j in range(GRID_WIDTH):
            if grid[i][j]:
                pygame.draw.rect(screen, grid[i][j],
                                 (j * GRID_SIZE, i * GRID_SIZE, GRID_SIZE - 1, GRID_SIZE - 1))

def game_over_screen():
    font = pygame.font.SysFont(None, 48)
    game_over_text = font.render("GAME OVER!", True, RED)
    score_text = font.render(f"Final Score: {score}", True, WHITE)
    restart_text = font.render("PRESS ENTER NEW GAME!", True, WHITE)
    screen.blit(game_over_text, (WIDTH // 2 - game_over_text.get_width() // 2, HEIGHT // 2 - 50))
    screen.blit(score_text, (WIDTH // 2 - score_text.get_width() // 2, HEIGHT // 2))
    screen.blit(restart_text, (WIDTH // 2 - restart_text.get_width() // 2, HEIGHT // 2 + 50))

# Main game loop
tetromino = Tetromino()
fall_time = 0
fall_speed = base_speed

running = True
while running:
    if not game_over:
        fall_time += clock.get_rawtime()
        clock.tick()

        # Handle input
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_UP:
                    tetromino.rotate()
                    if tetromino.collides():
                        tetromino.rotate()  # Undo if collision
                        tetromino.rotate()
                        tetromino.rotate()
                if event.key == pygame.K_LEFT:
                    tetromino.move(-1, 0)
                    if tetromino.collides():
                        tetromino.move(1, 0)
                if event.key == pygame.K_RIGHT:
                    tetromino.move(1, 0)
                    if tetromino.collides():
                        tetromino.move(-1, 0)
                if event.key == pygame.K_DOWN:
                    fall_speed = base_speed // 10  # Faster when held

            if event.type == pygame.KEYUP:
                if event.key == pygame.K_DOWN:
                    fall_speed = base_speed  # Reset speed when released

        # Move tetromino down
        if fall_time >= fall_speed:
            tetromino.move(0, 1)
            if tetromino.collides():
                tetromino.move(0, -1)
                place_tetromino(tetromino)
                tetromino = Tetromino()
                if tetromino.collides():
                    game_over = True
            fall_time = 0

        # Level up
        if score >= 10000 and level == 1:
            level = 2
            base_speed = int(base_speed * 0.9)  # 10% faster
            fall_speed = base_speed

        # Draw everything
        screen.fill(BLACK)
        tetromino.draw()
        draw_grid()
        font = pygame.font.SysFont(None, 36)
        score_text = font.render(f"Score: {score}  Level: {level}", True, WHITE)
        screen.blit(score_text, (10, 10))

    else:
        screen.fill(BLACK)
        game_over_screen()
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            if event.type == pygame.KEYDOWN and event.key == pygame.K_RETURN:
                # Reset game
                grid = [[0 for _ in range(GRID_WIDTH)] for _ in range(GRID_HEIGHT)]
                score = 0
                level = 1
                base_speed = 500
                fall_speed = base_speed
                tetromino = Tetromino()
                game_over = False

    pygame.display.flip()

pygame.quit()
