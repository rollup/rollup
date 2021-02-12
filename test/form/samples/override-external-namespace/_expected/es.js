export * from 'external';

const a = 'defined';
let b;
var c;
const reassign = () => (b = 'defined');

export { a, b, c, reassign };
