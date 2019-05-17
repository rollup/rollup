import { value as name } from 'resolveto-name';
import { value as externalName } from 'resolveto-external-name';
import { value as object } from 'resolveto-object';
import { value as externalObject } from 'resolveto-external-object';
import { value as unresolved } from 'resolveto-unresolved';

assert.strictEqual(externalName, 'external name');
assert.strictEqual(externalObject, 'external object');
assert.strictEqual(name, 'existing name');
assert.strictEqual(object, 'existing object');
assert.strictEqual(unresolved, 'unresolved');
