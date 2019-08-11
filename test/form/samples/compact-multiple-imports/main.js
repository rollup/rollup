import 'external-1';
import 'external-2';
import {value as a} from 'external-3';
import {value as b} from 'external-4';
import 'external-5';

assert.equal(a, '3');
assert.equal(b, '4');
