import './generated-inlined.js';
import './generated-separate.js';

const inlined = import('./generated-inlined.js');
const separate = import('./generated-separate.js');

export { inlined, separate };
