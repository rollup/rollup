// -> Middle removed
var kept1 = 1, removed1 = 2, kept2 = 3;

// with comments
var /* retained */ kept1 = 1 /* retained */, /* removed */ removed1 = 2 /* removed */, /* retained */ kept2 = 3 /* retained */; // retained

// without spaces
var kept1 = 1,removed1 = 2,kept2 = 3;

// with comments without spaces
var/* retained */kept1 = 1/* retained */,/* removed */removed1 = 2/* removed */,/* retained */kept2 = 3/* retained */;// retained

// with line-breaks
var kept1 = 1,
    removed1 = 2,
    kept2 = 3;

// with line-breaks and comments
var /* retained */ kept1 = 1, // retained
    /* removed */ removed1 = 2, // removed
    /* retained */ kept2 = 3; // retained

// mixed
var kept1 = 1, // retained
    removed1 = 2, kept2 = 3;

// -> Start and end removed
var removed1 = 1, kept1 = 2, removed2 = 3;

// with comments
var /* removed */ removed1 = 1 /* removed */, /* retained */ kept1 = 2 /* retained */, /* removed */ removed2 = 3 /* removed */; // retained

// without spaces
var removed1 = 1,kept1 = 2,removed2 = 3;

// with comments without spaces
var/* removed */removed1 = 1/* removed */,/* retained */kept1 = 2/* retained */,/* removed */removed2 = 3/* removed */;// retained

// with line-breaks
var removed1 = 1,
    kept1 = 2,
    removed2 = 3;

// with line-breaks and comments
var /* removed */ removed1 = 1, // removed
    /* retained */ kept1 = 2, // retained
    /* removed */ removed2 = 3;

// mixed
var // retained
    removed1 = 1, kept1 = 2, // retained
    removed2 = 3;

// -> Missing semicolons
var kept1 = 1 // retained
var kept1 = 1, removed1 = 2 // retained

// -> No line-break after declaration
var kept1 = 1, // retained
    removed1 = 2;console.log(1);

// -> Everything removed
var removed1 = 1;

console.log( kept1, kept2 );
