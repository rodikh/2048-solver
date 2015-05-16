/**
 * Created by rodik on 5/13/15.
 */
(function (window) {
    const EMPTY_TILE = 0;
    var timer = performance.now();


    var Solver = function (game, options) {
        if (!options) {
            options = {}
        }

        this.settings = {
            maxIter: options.maxIter || 5
        };
        this.game = game;
        this.moveHistory = [];
    };

    Solver.prototype.solve = function () {
        var self = this;
        this.interval = setInterval(function () {
            if (self.game.gameover) {
                clearInterval(self.interval);
                return;
            }

            var moves = game.getAvailableMoves(self.game.board);
            var maxScore = 0,
                bestMove = moves[0];
            for (var i = 0; i < moves.length; i++) {
                var cloneBoard = self.game.getBoardClone(self.game.board);
                moves[i](cloneBoard);
                var score = self.isGoodMove(cloneBoard, self.settings.maxIter);
                if (score > maxScore) {
                    maxScore = score;
                    bestMove = moves[i];
                }
            }

            bestMove();
            self.moveHistory.push([bestMove.fnName, maxScore]);

            document.querySelector('.fps').innerText = 30 * 1000 / timer;
            timer = performance.now() - timer;
        }, 0);

    };

    Solver.prototype.stop = function () {
        clearInterval(this.interval);
    };


    Solver.prototype.isGoodMove = function (board, iter) {
        if (iter < 1) {
            return this.score(board);
        }

        var moves = this.game.getAvailableMoves(board),
            sumScore = 0;
        for (var i in moves) {
            var cloneBoard = this.game.getBoardClone(board);
            moves[i](cloneBoard);
            sumScore += this.isGoodMove(cloneBoard, iter - 1);// + score(board);
        }
        return sumScore;
    };

    Solver.prototype.score = function (board) {
        var sum = 0,
            empties = 0,
            highest = 0,
            bonus = 0,
            sortedness = 0;
        var i,j;

        for (i = 0; i < board.length; i++) {
            for (j = 0; j < board.length; j++) {
                if (board[i][j] === EMPTY_TILE) {
                    empties++;
                } else {
                    sum += board[i][j];
                    if (highest < board[i][j]) {
                        highest = board[i][j];
                    }
                }
            }
        }

        if (highest === board[board.length-1][0]) {
            bonus += highest;
        }

        for (i = 0; i < board.length; i++) {
            var row = this.game.getRow(i, board);
            if (!i%2) {
                row = row.reverse();
            }
            if (this.isSortedArray(row)) {
                sortedness+= (board.length - i) * 5;
            }
            if (this.isSortedArray(board[board.length-i-1])) {
                sortedness+= (board.length - i);
            }
        }


        return ~~(bonus + (sortedness * highest) + sum / (board.length*board.length - empties));
        //return highest + sum / (board.length*board.length - empties);
        //return sortedness;
        //return bonus;
    }

    function sortednessScore (board) {
        var row = this.game.getRow(0, board).reverse();

        if (this.isSortedArray(row)) {
            return 100;
        }
    }


    Solver.prototype.isSortedArray = function(arr) {
        for (var i = 1; i < arr.length; i++) {
            if (arr[i-1] < arr[i]) {
                return false;
            }
        }

        if (arr[0] === arr[arr.length-1] === 0) {
            return false;
        }

        return true;
    };

    window.Solver = Solver;
}(window));