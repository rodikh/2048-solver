(function (window) {
    'use strict';

    const EMPTY_TILE = 0;
    const BREAK = 'break';
    /**
     * Game manager
     * @constructor
     */
    var Game = function () {
        this.sizeX = 4;
        this.sizeY = 4;
        this.gameover = false;
        this.win = false;
        this.reset();

        this.bindKeyboard();

    };

    Game.prototype.bindKeyboard = function () {
        var self = this;
        window.addEventListener('keydown', function (event) {
            switch (event.keyCode) {
                case 37: // Left
                    self.swipe('left');
                    break;

                case 38: // Up
                    self.swipe('up');
                    break;

                case 39: // Right
                    self.swipe('right');
                    break;

                case 40: // Down
                    self.swipe('down');
                    break;
            }
        }, false);

    }

    /**
     * Reset the game data to a new game state
     */
    Game.prototype.reset = function () {
        this.board = [];
        for (var i = 0; i < this.sizeX; i++) {
            var row = [];
            for (var j = 0; j < this.sizeY; j++) {
                row.push(EMPTY_TILE);
            }
            this.board.push(row);
        }

        this.spawnTile();
        this.spawnTile();

        console.log('Game Reset');
        this.print();

    };

    Game.prototype.swipe = function (direction, board) {
        if (this.gameover) {
            return;
        }
        if (!board) {
            board = this.board;
        }
        var moved = this['swipe' + direction.charAt(0).toUpperCase() + direction.slice(1)](board);
        this.upgradeTiles(board);
        if (!moved) {
            return;
        }

        this.spawnTile(board);
        if (this.getEmptyTiles(board) === false) {
            if (!this.getAvailableMoves(board)) {
                if (board === this.board) {
                    this.gameover = true;
                }
            }
        }
        this.print();
    };

    Game.prototype.swipeUp = function (board) {
        var self = this;
        var moved = false;
        this.iterateSlide('up', function (i, j, k) {
            if (board[k][j] !== EMPTY_TILE) {
                if (board[k][j] === board[i][j]) {
                    self.moveTile(k, j, i, j, board);
                    moved = true;
                } else {
                    if (k !== i - 1) {
                        self.moveTile(k + 1, j, i, j, board);
                        moved = true;
                    }
                }
                return BREAK;
            } else if (k === 0) {
                self.moveTile(k, j, i, j, board);
                moved = true;
            }
        }, board);

        return moved;
    };

    Game.prototype.swipeDown = function (board) {
        var self = this;
        var moved = false;
        this.iterateSlide('down', function (i, j, k) {
            if (board[k][j] !== EMPTY_TILE) {
                if (board[k][j] === board[i][j]) {
                    self.moveTile(k, j, i, j, board);
                    moved = true;
                } else {
                    if (k !== i + 1) {
                        self.moveTile(k - 1, j, i, j, board);
                        moved = true;
                    }
                }
                return BREAK;
            } else if (k === board.length - 1) {
                self.moveTile(k, j, i, j, board);
                moved = true;
            }
        }, board);
        return moved;
    };

    Game.prototype.swipeLeft = function (board) {
        var self = this;
        var moved = false;
        this.iterateSlide('left', function (i, j, k) {
            if (board[i][k] !== EMPTY_TILE) {
                if (board[i][k] === board[i][j]) {
                    self.moveTile(i, k, i, j, board);
                    moved = true;
                } else {
                    if (k !== j - 1) {
                        self.moveTile(i, k + 1, i, j, board);
                        moved = true;
                    }
                }
                return BREAK;
            } else if (k === 0) {
                self.moveTile(i, k, i, j, board);
                moved = true;
            }
        }, board);

        return moved;
    };

    Game.prototype.swipeRight = function (board) {
        var self = this;
        var moved = false;
        this.iterateSlide('right', function (i, j, k) {
            if (board[i][k] !== EMPTY_TILE) {
                if (board[i][k] === board[i][j]) {
                    self.moveTile(i, k, i, j, board);
                    moved = true;
                } else {
                    if (k !== j + 1) {
                        self.moveTile(i, k - 1, i, j, board);
                        moved = true;
                    }
                }
                return BREAK;
            } else if (k === board[i].length - 1) {
                self.moveTile(i, k, i, j, board);
                moved = true;
            }
        }, board);

        return moved;
    };

    Game.prototype.getEmptyTiles = function (board) {
        if (!board) {
            board = this.board;
        }
        var randOpts = [];
        for (var i = 0; i < board.length; i++) {
            for (var j = 0; j < board[i].length; j++) {
                if (board[i][j] === EMPTY_TILE) {
                    randOpts.push([i, j]);
                }
            }
        }
        return randOpts.length ? randOpts : false;
    };

    Game.prototype.getAvailableMoves = function (board) {
        var moves = [];
        var boardCopy = this.getBoardClone(board);
        if (this.swipeLeft(boardCopy)) {
            moves.push(this.swipe.bind(this, 'left'));
            moves[moves.length-1].fnName = 'left';
        }
        if (this.swipeDown(boardCopy)) {
            moves.push(this.swipe.bind(this, 'down'));
            moves[moves.length-1].fnName = 'down';
        }
        if (this.swipeUp(boardCopy)) {
            moves.push(this.swipe.bind(this, 'up'));
            moves[moves.length-1].fnName = 'up';
        }
        if (this.swipeRight(boardCopy)) {
            moves.push(this.swipe.bind(this, 'right'));
            moves[moves.length-1].fnName = 'right';
        }

        return moves.length? moves : false;
    };

    Game.prototype.spawnTile = function (board) {
        if (!board) {
            board = this.board;
        }
        var randOpts = this.getEmptyTiles(board);
        if (randOpts === false) {
            return false;
        }
        var randIndex = Math.floor(Math.random() * randOpts.length);
        var xy = randOpts[randIndex];


        var tileValue = Math.random() < 0.9 ? 2 : 4;

        board[xy[0]][xy[1]] = tileValue;
    };

    Game.prototype.print = function () {
        for (var i = 0; i < this.board.length; i++) {
            for (var j = 0; j < this.board[i].length; j++) {
                var el = document.querySelector('table#game tr:nth-child(' + parseInt(i + 1) + ') td:nth-child(' + parseInt(j + 1) + ')');
                el.innerText = this.board[i][j];
                el.setAttribute('data-value', this.board[i][j]);
            }
            //console.log(this.board[i]);
        }
    };

    Game.prototype.getBoardClone = function (board) {
        if (!board) {
            board = this.board;
        }

        var clone = [];
        for (var i = 0; i < board.length; i++) {
            clone.push(board[i].slice())
        }
        return clone;
    };

    Game.prototype.moveTile = function (i, j, k, p, board) {
        if (!board) {
            board = this.board;
        }
        if (board[i][j] === board[k][p]) {
            board[i][j] += 1;
        } else {
            board[i][j] = board[k][p];
        }
        board[k][p] = EMPTY_TILE;

        return true;
    };

    Game.prototype.upgradeTiles = function (board) {
        if (!board) {
            board = this.board;
        }

        for (var i = 0; i < board.length; i++) {
            for (var j = 0; j < board.length; j++) {
                if (board[i][j] % 2 === 1) {
                    board[i][j] = (board[i][j] - 1) * 2;
                    if (board[i][j] === 2048) {
                        if (board === this.board){
                            this.gameover = true;
                            this.win = true;
                        }
                    }
                }
            }
        }
    };

    Game.prototype.iterateSlide = function (dir, cb, board) {
        if (!board) {
            board = this.board;
        }

        var i, j, k;
        var max = board.length;
        switch (dir) {
            case 'up':
                for (j = 0; j < max; j++) {
                    for (i = 0; i < max; i++) {
                        if (board[i][j] !== EMPTY_TILE) {
                            for (k = i - 1; k > -1; k--) {
                                if (cb(i, j, k) === BREAK) {
                                    break;
                                }
                            }
                        }
                    }
                }
                break;
            case 'down':
                for (j = 0; j < max; j++) {
                    for (i = max - 1; i > -1; i--) {
                        if (board[i][j] !== EMPTY_TILE) {
                            for (k = i + 1; k < max; k++) {
                                if (cb(i, j, k) === BREAK) {
                                    break;
                                }
                            }
                        }
                    }
                }
                break;
            case 'left':
                for (i = 0; i < max; i++) {
                    for (j = 0; j < max; j++) {
                        if (board[i][j] !== EMPTY_TILE) {
                            for (k = j - 1; k > -1; k--) {
                                if (cb(i, j, k) === BREAK) {
                                    break;
                                }
                            }
                        }
                    }
                }
                break;
            case 'right':
                for (i = 0; i < max; i++) {
                    for (j = max - 1; j > -1; j--) {
                        if (board[i][j] !== EMPTY_TILE) {
                            for (k = j + 1; k < max; k++) {
                                if (cb(i, j, k) === BREAK) {
                                    break;
                                }
                            }
                        }
                    }
                }
                break;
        }

    };

    window.Game = Game;

}(window));