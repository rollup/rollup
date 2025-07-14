console.log('source phase implementation dependency');

var mod5 = `import 'should not be resolved';
export var p = 5;
`;

var mod3 = `import './dep3.js';

export const mod4 = 'mod4';
`;

console.log('dep3');

const mod4 = 'mod4';

console.log(mod5, mod5, mod3, mod4, mod5);
