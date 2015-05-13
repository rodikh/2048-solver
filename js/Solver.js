/**
 * Created by rodik on 5/13/15.
 */
(function (window) {
    const EMPTY_TILE = 0;

    var Solver = function (game) {
        this.game = game;
    };

    Solver.prototype.solve = function () {
        var self = this;
        this.moveHistory = [];
        var interval = setInterval(function () {
            if (self.game.gameover) {
                clearInterval(interval);
                return;
            }

            var cloneBoard = game.getBoardClone(self.game.board);
            var moves = game.getAvailableMoves(cloneBoard);
            var maxScore = 0,
                bestMove = moves[0];
            for (var i in moves) {
                var score = self.isGoodMove(cloneBoard, moves[i], 0);
                if (score > maxScore) {
                    maxScore = score;
                    bestMove = moves[i];
                }
            }

            bestMove();
            self.moveHistory.push([bestMove.fnName, maxScore]);
        }, 0);

    };

    var maxIter = 4;

    Solver.prototype.isGoodMove = function (board, iter) {
        if (iter === maxIter) {
            return score(board);
        }

        var moves = this.game.getAvailableMoves(board),
            sumScore = 0;
        for (var i in moves) {
            var cloneBoard = this.game.getBoardClone(board);
            moves[i](cloneBoard);
            sumScore += this.isGoodMove(cloneBoard, iter + 1) + score(board);
        }
        return sumScore;
    };

    function score(board) {
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

        //for (i = 0; i < board.length; i++) {
        //    var row = getRow(board, i);
        //    if (!i%2) {
        //        row = row.reverse();
        //    }
        //    if (isSorted(row)) {
        //        sortedness+= (board.length - i) * 5;
        //    }
        //    if (isSorted(board[board.length-i-1])) {
        //        sortedness+= (board.length - i);
        //    }
        //}

        var row = getRow(board, 0).reverse();

        if (isSorted(row)) {
            sortedness += 100;
        }

        //return ~~(bonus + (sortedness * highest) + sum / (board.length*board.length - empties));
        //return highest + sum / (board.length*board.length - empties);
        return sortedness;
        //return bonus;
    }

    function getRow(board, i) {
        var row = [];
        for (var j = 0; j < board.length; j++) {
            row.push(board[j][i])
        }
        return row;
    }

    function isSorted(row) {
        for (var i = 0; i < row.length-1; i++) {
            if (row[i] < row[i+1]) {
                return false;
            }
        }

        if (row[0] === row[row.length-1] === 0) {
            return false;
        }

        return true;
    }

    window.Solver = Solver;
}(window));