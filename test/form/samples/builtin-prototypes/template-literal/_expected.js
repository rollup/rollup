// retained
`ab`();
`ab`.unknown.unknown();
`ab`.unknown.unknown().unknown;

// deep property access is forbidden
`ab`.x.y;

// due to strict mode, extension is forbidden
`ab`.x = 1;

// throws when called
`ab`();
