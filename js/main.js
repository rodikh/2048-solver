(function (window, Solver) {
    'use strict';

    window.gui = new dat.GUI();

    var game = new Game();
    window.game = game;

    //window.solver = new Solver(game);

    //window.solver.solve();

} (window, window.Solver));