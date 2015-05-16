(function (window, Board) {
    'use strict';

    /**
     * Game manager
     * @constructor
     */
    var Game = function () {
        this.board = new Board();
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
    };

    /**
     * Reset the game data to a new game state
     */
    Game.prototype.reset = function () {
        this.board.reset();
        console.log('Game Reset');
        this.print();

    };

    Game.prototype.swipe = function (direction, board) {
        if (!board) {
            board = this.board;
        }
        if (this.gameover) {
            return;
        }

        var moved = board.move(direction);
        console.log('moved', moved);
        if (!moved) {
            return;
        }

        //if (!this.board.getAvailableMoves()) {
        //    this.gameover = true;
        //}
        this.print();
    };


    Game.prototype.print = function () {
        this.board.each(function (i,j,value) {
            var el = document.querySelector('table#game tr:nth-child(' + parseInt(i + 1) + ') td:nth-child(' + parseInt(j + 1) + ')');
            el.innerText = value;
            el.setAttribute('data-value', value);
        });
    };

    window.Game = Game;

}(window, window.Board));