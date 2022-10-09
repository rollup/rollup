import './other.js';
import 'external' assert { type: 'foo' };
import 'external' assert { type: 'bar' };
import 'external';
import('external', { assert: { type: 'baz' } });
import './dep.js' assert { type: 'foo' };
