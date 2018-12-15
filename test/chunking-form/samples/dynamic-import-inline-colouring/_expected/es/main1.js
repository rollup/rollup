import './generated-chunk.js';
import './generated-chunk2.js';

const inlined = import('./generated-chunk.js');
const separate = import('./generated-chunk2.js');

export { inlined, separate };
