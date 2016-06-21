import { x } from './x.js';
import './bar.js';

var result = x().foo().bar();
assert.ok( result.didFoo );
assert.ok( result.didBar );
