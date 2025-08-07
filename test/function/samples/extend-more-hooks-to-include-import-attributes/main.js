import foo from './foo.json' with { type: 'json' };
import('./lib2.js');
import('./lib3.js', { with: { type: 'javascript' } });
export default foo;
