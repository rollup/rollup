'use strict';

var something = require('./inner/more_inner/something.js');
require('./inner/some_effect.js');



exports.Something = something.Something;
