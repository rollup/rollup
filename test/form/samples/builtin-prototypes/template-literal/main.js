// retained
`ab`();
`ab`.unknown.unknown();
`ab`.unknown.unknown().unknown;

// removed
`ab`.trim();
`ab`.trim().trim();
`ab`.toString().trim();

// property access is allowed
const accessString = `ab`.x;

// deep property access is forbidden
const deepString = `ab`.x.y;

// due to strict mode, extension is forbidden
`ab`.x = 1;

// throws when called
`ab`();
