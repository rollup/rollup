import './other.js';
import 'external' with { type: 'foo' };
import 'external' with { type: 'bar' };
import 'external';
import('external', { with: { type: 'baz' } });
import './dep.js' with { type: 'foo' };
