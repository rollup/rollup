import foo from './foo.json' with { type: 'json' };
import('./lib.js', { with: { type: 'javascript' } });
import('./lib2.js');
export default foo;
