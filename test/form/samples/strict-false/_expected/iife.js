(function () {
    const localVariable = 'local';

    try {
        globalVariable = localVariable;
    } catch (error) {
        console.log('use strict; detected', error);

        Function("g", "globalVariable = g")(localVariable);
    }

}());
