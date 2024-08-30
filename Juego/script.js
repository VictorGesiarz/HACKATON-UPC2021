const COLORS = ['#fff', '#fcba03', '#5cba0f', '#0f3dba', '#ba170f', '#a921b8']
const countOccurrences = (arr, val) => arr.reduce((a, v) => (v === val ? a + 1 : a), 0);


class Game {
    constructor(GAME, SIZE, CELLS) {
        this.SIZE = SIZE
        this.CELLS = CELLS
        this.GAME = GAME    
        this.current_player = 0
        this.moves = 20

        this.pause = false
        this.board = this.set_board()
    }

    set_board() {
        let board = []
        for (let i = 0; i < this.SIZE; i++) {
            let row = [];
            for (let j = 0; j < this.SIZE; j++) {
                row.push(0);
            }
            board.push(row);
        }
        return board
    }

    copy_board() {
        let board = []
        for (let i = 0; i < this.SIZE; i++) {
            let row = []
            for (let j = 0; j < this.SIZE; j++) {
                row.push(this.board[i][j])
            }
            board.push(row)
        }
        return board
    }

    get_index(DIV) {
        for (let i = 0; i < this.SIZE; i++) {
            if (this.CELLS[i].includes(DIV)) {
                return [i, this.CELLS[i].indexOf(DIV)]
            }
        }
    }

    set_alive(e) {
        if (e.path[1] == this.GAME && this.current_player < 4) {
            const DIV = document.elementsFromPoint(e.pageX, e.pageY)[0]
            var index = this.get_index(DIV)

            if (this.board[index[0]][index[1]] == 0) {
                this.board[index[0]][index[1]] = this.current_player + 1
                this.draw_board()
                
                this.moves--
                const MOVES = document.getElementById('moves')
                MOVES.innerText = `Moves left: ${this.moves}`

                if (this.moves == 0) {
                    this.current_player++
                    this.moves = 20
                    this.player_turn()
                }
            }
            
        }  
        if (this.current_player >= 4) {
            this.start()
        }
    }

    draw_board() {
        for (let i = 0; i < this.SIZE; i++) {
            for (let j = 0; j < this.SIZE; j++) {
                this.CELLS[i][j].style.setProperty('--color', `${COLORS[this.board[i][j]]}`)
            }
        }
    }

    player_turn() {
        const PLAYERS = document.querySelectorAll('.player')
        PLAYERS[this.current_player % 4].classList.add('current')
        PLAYERS[this.current_player % 4 > 0 ? this.current_player % 4 - 1 : 3].classList.remove('current')
        PLAYERS[this.current_player % 4].style.setProperty('--bg-color', `${COLORS[this.current_player % 4 + 1]}`)
        const MOVES = document.getElementById('moves')
        MOVES.innerText = `Moves left: ${this.moves}`
    }

    async start() {
        let running = true
        while (running) {
            let c = this.copy_board()
            
            for (let i = 0; i < this.SIZE; i++) {
                for (let j = 0; j < this.SIZE; j++) {
                    if (!this.pause) {

                        let neighbours = [this.board[i == 0 ? this.SIZE-1 : (i - 1) % this.SIZE][j == 0 ? this.SIZE-1 : (j - 1) % this.SIZE],
                                          this.board[i == 0 ? this.SIZE-1 : (i - 1) % this.SIZE][j % this.SIZE],
                                          this.board[i == 0 ? this.SIZE-1 : (i - 1) % this.SIZE][(j + 1) % this.SIZE],
                                          this.board[i % this.SIZE][j == 0 ? this.SIZE-1 : (j - 1) % this.SIZE],
                                          this.board[i % this.SIZE][(j + 1) % this.SIZE],
                                          this.board[(i + 1) % this.SIZE][j == 0 ? this.SIZE-1 : (j - 1) % this.SIZE],
                                          this.board[(i + 1) % this.SIZE][j % this.SIZE],
                                          this.board[(i + 1) % this.SIZE][(j + 1) % this.SIZE]]

                        let tie = false;
                        if (this.board[i][j] == COLORS.length - 1){
                            let freqs = [];
                            for (let k = 1; k < 5; k++) {
                                freqs.push(countOccurrences(neighbours, k));                          
                            }
                            let maximum  = Math.max.apply(null, freqs);
                            

                            if (countOccurrences(freqs, maximum) < 2) {
                                c[i][j] = freqs.indexOf(maximum) + 1;
                            }
                        }

                
                        for (let k = 1; k < 5; k++) {
                            let freqs = countOccurrences(neighbours, k) + countOccurrences(neighbours, COLORS.length - 1);
                            
                            if(this.board[i][j] == 0 && freqs == 3){
                                c[i][j] = tie ? COLORS.length - 1 : k;
                                tie = true; 
                            }
                            else if(this.board[i][j] == k && 2 > freqs ||  freqs  > 3){
                                c[i][j] = 0
                            }
                        }                        
                    }
                }
            }

            if (!this.pause) {
                this.board = c
            }
            await new Promise(r => setTimeout(r, 300));
            this.draw_board()
        }
    }
}


document.addEventListener("DOMContentLoaded", function() {
    let SIZE = 30
    let width = screen.width;
    if (Number(width) < 500) {
        SIZE = 25
    }
    if (Number(width) < 400) {
        SIZE = 20
    }

    const GAME = document.getElementById('game-container')
    GAME.style.setProperty('--size', SIZE)

    const CELLS = []
    for (let i = 0; i < SIZE; i++) {
        var row = []
        for (let j = 0; j < SIZE; j++) {
            const CELL = document.createElement('div')
            CELL.classList.add('cell')
            row.push(CELL)
            GAME.append(CELL)
        }
        CELLS.push(row)
    }


    document.addEventListener('click', function(e) {
        G.set_alive(e)
    })
    document.addEventListener('keydown', function(e) {
        if (e.key == ' ') {
            G.pause = !G.pause
        }
    })


    const G = new Game(GAME, SIZE, CELLS)
    G.player_turn()
    G.draw_board()
})