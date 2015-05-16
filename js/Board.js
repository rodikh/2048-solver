/**
 * Created by rodik on 5/13/15.
 */
(function (window) {
    const EMPTY_TILE = 0;
    const BREAK = 'break';
    const STOP = 'stop';

    var Board = function (size) {
        this.size = size || 4;
        this.reset();
    };

    Board.prototype.reset = function () {
        var i, j, size = this.size;
        this.rows = [];
        this.empty = [];
        this.board = [];
        this.highest = 0;
        this.isMapped = false;
        for (i = 0; i < size; i++) {
            this.board[i] = [];
            this.rows[i] = [];
            for (j = 0; j < size; j++) {
                this.board[i][j] = 0;
            }
        }

        this.spawnTile();
        this.spawnTile();
    };

    Board.prototype.move = function (direction, dryRun) {
        var reverse = (direction === 'down' || direction === 'right');
        var vertical = (direction === 'up' || direction === 'down');

        var moved = false;

        var result = this.each(function (i,j,value) {
            if (value !== EMPTY_TILE) {
                var result = this.iterateBack(vertical, reverse, i, j, function (k,l,runner,start,end,previous) {
                    if (this.board[k][l] !== EMPTY_TILE) {
                        if (value === this.board[k][l]) {
                            if (dryRun) {
                                return true;
                            }
                            this.moveTile(i, j, k, l);
                            moved = true;
                        } else {
                            if (runner !== start) {
                                if (dryRun) {
                                    return true;
                                }
                                this.moveTile(i, j, previous[0], previous[1]);
                                moved = true;
                            }
                        }
                        return BREAK;
                    } else if (runner === end) {
                        if (dryRun) {
                            return true;
                        }
                        this.moveTile(i, j, k, l);
                        moved = true;
                    }
                });

                if (result === true) {
                    return true;
                }
            }
        }, reverse);

        if (result === true) {
            return true;
        }
        if (!moved) {
            return false;
        }
        this.upgradeTiles();
        this.spawnTile();

        return moved;
    };

    Board.prototype.moveTile = function (x1,y1,x2,y2) {
        if (this.board[x1][y1] === this.board[x2][y2]) {
            this.setTile(x2,y2, this.board[x2][y2] * -2);
        } else {
            this.setTile(x2,y2,this.board[x1][y1]);
        }
        this.setTile(x1,y1,EMPTY_TILE);

        return true;
    };

    function compare (a, op, b) {
        switch (op) {
            case '>=':  return a >= b;
            case '<=':  return a <= b;
        }
    }

    Board.prototype.iterateBack = function (vertical, reverse, i, j, cb) {
        var k,
            op = (reverse) ?  '<=' : '>=',
            end = (reverse) ? this.size - 1 : 0,
            start = (vertical) ? i : j,
            inc = (reverse) ? 1 : -1,
            result;

        if (reverse) {
            start++;
        } else {
            start--;
        }

        for (k = start; compare(k,op,end); k = k + inc) {
            if (vertical) {
                result = cb.call(this,k,j,k,start,end, [k-inc,j]);
                if (result === BREAK) {
                    break;
                } else if (result === true) {
                    return true;
                }
            } else {
                result = cb.call(this,i,k,k,start,end, [i,k-inc])
                if (result === BREAK) {
                    break;
                } else if (result === true) {
                    return true;
                }
            }
        }
    };

    Board.prototype.getAvailableMoves = function () {
        var moves = [],
            i,
            directions = ['left', 'down', 'up', 'right'];
        for (i = 0; i < directions.length; i++) {
            if (this.move(directions[i], 1)) {
                moves.push({fn:this.move, args: [directions[i]]});
            }
        }

        return moves.length ? moves : false;
    };

    Board.prototype.map = function () {
        this.each(function (i, j, value) {
            this.rows[j][i] = value;
            if (value === EMPTY_TILE) {
                this.empty.push([i, j]);
            }
            if (value > this.highest) {
                this.highest = value;
            }

        });
        this.isMapped = true;
    };

    Board.prototype.each = function (cb, reverse) {
        var i, j, size = this.size,
            result;
        for (i = 0; i < size; i++) {
            for (j = 0; j < size; j++) {
                if (reverse) {  // right,down
                    result = cb.call(this, size - 1 - i, size - 1 - j, this.board[size - 1 - i][size - 1 - j]);
                    if (result === STOP) {
                        return;
                    } else if (result === true) {
                        return true;
                    }
                } else {        // left,up
                    result = cb.call(this, i, j, this.board[i][j])
                    if (result === STOP) {
                        return;
                    } else if (result === true) {
                        return true;
                    }
                }
            }
        }
    };

    Board.prototype.getRandomEmptyTile = function () {
        if (!this.isMapped) {
            this.map();
        }

        return this.empty ? this.empty[Math.floor(Math.random() * this.empty.length)] : false;
    };


    Board.prototype.setTile = function (i,j,value) {
        this.rows[j][i] = value;
        if (this.highest < value) {
            this.highest = value;
        }
        if (this.board[i][j] === EMPTY_TILE) {
            //todo better way
            for (var k = 0; k < this.empty.length; k++) {
                if (this.empty[k][0] === i && this.empty[k][1] === j) {
                    this.empty.splice(k, 1);
                    break;
                }
            }
        }
        this.board[i][j] = value;

        if(value === EMPTY_TILE) {
            this.empty.push([i,j]);
        }
    };

    Board.prototype.spawnTile = function () {
        var xy = this.getRandomEmptyTile();
        if (!xy) {
            return false;
        }

        this.setTile(xy[0], xy[1], Math.random() < 0.9 ? 2 : 4);
    };

    Board.prototype.clone = function () {
        var clone = new Board(this.size);
        for (var i = 0; i < this.size; i++) {
            clone.board[i] = this.board[i].slice();
        }
        clone.map();
        return clone;
    };

    Board.prototype.upgradeTiles = function () {
        this.each(function (i,j,value) {
            if (value < 0) {
                value = -value;
                this.setTile(i,j, value);
            }
        });
    };


    window.Board = Board;
}(window));