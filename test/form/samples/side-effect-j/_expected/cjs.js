'use strict';

var augment;
augment = y => y.augmented = true;

function x () {}
augment( x );

module.exports = x;
