import api from './api/index';

let errored = false
try {
  api.namespace()
} catch {
  errored = true;
}
assert.ok(errored, 'namespace call should be preserved')
