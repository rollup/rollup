console.log('dynamic2');

const DYNAMIC_A = 'DYNAMIC_A';
const DYNAMIC_B = 'DYNAMIC_B';

console.log('dynamic1');

export { DYNAMIC_A as DYNAMIC_B, DYNAMIC_B as DYNAMIC_A };
