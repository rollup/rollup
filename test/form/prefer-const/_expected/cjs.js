'use strict';

const external = require('external');
const other = require('other');
const another = require('another');

const a = 1;
const b = 2;


const namespace = Object.freeze({
	a: a,
	b: b
});

console.log( Object.keys( namespace ) );

const main = 42;

module.exports = main;
