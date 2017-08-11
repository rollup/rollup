'use strict';

var augment;
augment = x => x.augmented = true;

function x () {}
augment( x );

module.exports = x;