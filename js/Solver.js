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
            maxIter: options.maxIter || 5,
            intervalTime: options.intervalTime || 0
        };
        this.game = game;
        this.moveHistory = [];

        gui.add(this.settings, 'maxIter', 0, 9).step(1);
        gui.add(this.settings, 'intervalTime');
        var folder = gui.addFolder('weights');
        folder.add(this.weights, 'smooth');
        folder.add(this.weights, 'sort');
        folder.add(this.weights, 'empty');
        folder.add(this.weights, 'highest');
        folder.add(this.weights, 'bonus');
    };

    Solver.prototype.solve = function () {
        var self = this;
        this.interval = setInterval(function () {
            self.solveOne();
            //document.querySelector('.fps').innerText = 30 * 1000 / timer;
            //timer = performance.now() - timer;
        }, this.settings.intervalTime);

    };

    Solver.prototype.solveOne = function () {
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
            var moveScore = this.isGoodMove(cloneBoard, iter - 1);
            sumScore += moveScore / moves.length;
        }
        sumScore += this.score(board);
        return parseInt(sumScore);
    };

    Solver.prototype.weights = {
        smooth    : 1.0,
        sort      : 2.0,
        empty     : 1.5,
        highest   : 1.0,
        bonus     : 1.0
    };

    Solver.prototype.score = function (board) {
        var highest = 0,
            bonus = 0,
            empty = board.empty.length,
            smoothness = this.smoothness(board),
            sortedness = this.sortedness(board);


        if(board.highest === board.board[board.size-1][0]) {
            bonus += 100;
        }

        return  (sortedness     * this.weights.sort) +
                (board.highest  * this.weights.highest) +
                (smoothness     * this.weights.smooth) +
                (empty          * this.weights.empty) +
                (bonus          * this.weights.bonus);

        //return parseInt(~~(bonus + (sortedness * highest) + sum / (board.length*board.length - empties)));
        //return highest + sum / (board.length*board.length - empties);
    };

    Solver.prototype.smoothness = function (board) {
        var smoothness = 0;
        board.each(function (i,j,value) {
            if (value === EMPTY_TILE) {
                return false;
            }
            var smooth = 0,
                flatVal = Math.log2(value),
                flatComp;
            if (i > 0 && board.board[i-1][j] !== EMPTY_TILE) {
                flatComp = Math.log2(board.board[i-1][j]);
                smooth += Math.abs(flatVal - flatComp);
            }
            if (j > 0 && board.board[i][j-1] !== EMPTY_TILE) {
                flatComp = Math.log2(board.board[i][j-1]);
                smooth += Math.abs(flatVal - flatComp);
            }

            smoothness += smooth;
        });

        return -smoothness;
    };

    Solver.prototype.sortedness = function (board) {
        var sortedness = 0,
            i;
        for (i = 0; i < board.size; i++) {
            var row = board.rows[i];
            if (this.isSortedArray(row,1) !== false) {
                sortedness+= (board.size - i) * 3;
            }
            if (this.isSortedArray(board.board[board.size-i-1])) {
                sortedness+= (board.size - i);
            }
        }
        return sortedness;
    };

    function compare (a, op, b) {
        switch (op) {
            case '>':  return a > b;
            case '<':  return a < b;
        }
    }

    Solver.prototype.isSortedArray = function(arr, reverse) {
        if (arr[0] === arr[arr.length-1] === EMPTY_TILE) {
            return false;
        }
        var op = (reverse) ? '>' : '<';

        var smoothness = 0;
        for (var i = 1; i < arr.length; i++) {
            if (compare(arr[i-1], op, arr[i])) {
                return false;
            }
            smoothness += Math.abs(Math.log2(arr[i-1]) - Math.log2(arr[i]));
        }


        return true;
    };

    window.Solver = Solver;
}(window));