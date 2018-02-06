// Middle removed
var kept1 = 1, removed1 = 2, kept2 = 3; // retained comment
var kept1 = 1,
    removed1 = 2,
    kept2 = 3;
var /* retained */ kept1 = 1 /* retained */, /* removed */ removed1 = 2 /* removed */, /* retained */ kept2 = 3 /* retained */;
var/* retained */kept1 = 1/* retained */,/* removed */removed1 = 2/* removed */,/* retained */kept2 = 3/* retained */;

// Start and end removed
var removed1 = 1, kept1 = 2, removed2 = 3; // retained comment
var removed1 = 1,
    kept1 = 2,
    removed2 = 3;
var/* retained */removed1 = 1,kept1 = 2, removed2 = 3; // retained comment
var// removed
removed1 = 1,kept1 = 2, removed2 = 3; // retained comment
var /* removed */ removed1 = 1 /* removed */, /* retained */ kept1 = 2 /* retained */, /* removed */ removed2 = 3 /* removed */;
var/* removed */removed1 = 1/* removed */,/* retained */kept1 = 2/* retained */,/* removed */removed2 = 3/* removed */;

// Missing semicolons
var kept1 = 1 // retained comment
var kept1 = 1, removed1 = 2 // retained comment

// Everything removed
var removed1 = 1;

console.log( kept1, kept2 );
