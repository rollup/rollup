import api from './api/index';

let errored = false;
try {
	api.namespace.x = 1;
} catch {
	errored = true;
}
assert.ok(errored, 'namespace assignment should be preserved');
