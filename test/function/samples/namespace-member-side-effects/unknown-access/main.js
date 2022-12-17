import api from './api/index';
import { external } from 'external';

let errored = false;
try {
	api.namespace[external].foo;
} catch {
	errored = true;
}
assert.ok(errored, 'unknown nested member access should be preserved');
