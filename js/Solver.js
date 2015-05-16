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
            maxIter: options.maxIter || 6
        };
        this.game = game;
        this.moveHistory = [];
    };

    Solver.prototype.solve = function () {
        var self = this;
        this.interval = setInterval(function () {
            self.solveOne();
            //document.querySelector('.fps').innerText = 30 * 1000 / timer;
            //timer = performance.now() - timer;
        }, 50);

    };

    Solver.prototype.solveOne = function (verbose) {
        var moves = this.game.board.getAvailableMoves();
        if (this.game.gameover || !moves) {
            clearInterval(this.interval);
            return;
        }

        var maxScore = 0,
            bestMove = moves[0];
        for (var i = 0; i < moves.length; i++) {
            var cloneBoard = this.game.board.clone();
            moves[i].fn.apply(cloneBoard, moves[i].args);
            moves[i].score = this.isGoodMove(cloneBoard, this.settings.maxIter);
            if (moves[i].score > maxScore) {
                maxScore = moves[i].score;
                bestMove = moves[i];
            }
        }

        bestMove.fn.apply(this.game.board, bestMove.args);
        this.game.print();
        this.moveHistory.push(bestMove);
    };

    Solver.prototype.history = function () {
        var history = [];
        for (var i = this.moveHistory.length - 1; i >= 0; i--) {
            history.push({args: JSON.stringify(this.moveHistory[i].args), score: this.moveHistory[i].score});
        }
        console.log(history);
    };

    Solver.prototype.stop = function () {
        clearInterval(this.interval);
    };


    Solver.prototype.isGoodMove = function (board, iter) {
        if (iter < 1) {
            return this.score(board);
        }


        var moves = board.getAvailableMoves(),
            sumScore = 0;
        for (var i = 0; i < moves.length; i++) {
            var cloneBoard = this.game.board.clone();
            moves[i].fn.apply(cloneBoard, moves[i].args);
            sumScore += this.isGoodMove(cloneBoard, iter - 1);
        }
        sumScore += this.score(board);
        return sumScore;
    };

    Solver.prototype.score = function (board) {
        var sum = 0,
            empties = board.empty,
            highest = board.highest,
            bonus = 0,
            sortedness = 0;
        var i;

        board.each(function (i,j,value) {
            sum += value;
        });

        for (i = 0; i < board.size; i++) {
            var row = board.rows[i];
            if (this.isSortedArray(row,1)) {
                sortedness+= (board.size - i) * 10;
            }
            if (this.isSortedArray(board.board[board.size-i-1])) {
                sortedness+= (board.size - i) * 3;
            }
        }


        //return sortedness;
        return ~~(bonus + (sortedness * highest) + sum / (board.length*board.length - empties));
        //return highest + sum / (board.length*board.length - empties);
        //return sortedness;
        //return bonus;
    };

    function compare (a, op, b) {
        switch (op) {
            case '>':  return a > b;
            case '<':  return a < b;
        }
    }

    Solver.prototype.isSortedArray = function(arr, reverse) {
        var op = (reverse) ? '>' : '<';
        for (var i = 1; i < arr.length; i++) {
            if (compare(arr[i-1], op, arr[i])) {
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