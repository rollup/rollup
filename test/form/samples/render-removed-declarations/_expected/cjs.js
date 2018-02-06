'use strict';

// Middle removed
var kept1 = 1, kept2 = 3; // retained comment
var kept1 = 1,
    kept2 = 3;
var /* retained */ kept1 = 1 /* retained */, /* retained */ kept2 = 3 /* retained */;
var /* retained */kept1 = 1/* retained */, /* retained */kept2 = 3/* retained */;

// Start and end removed
var kept1 = 2; // retained comment
var kept1 = 2;
var kept1 = 2; // retained comment
var kept1 = 2; // retained comment
var /* retained */ kept1 = 2 /* retained */;
var /* retained */kept1 = 2/* retained */;

// Missing semicolons
var kept1 = 1; // retained comment
var kept1 = 1; // retained comment

console.log( kept1, kept2 );
