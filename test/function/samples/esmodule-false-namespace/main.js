import * as staticUnresolvable from './staticUnresolvable';
checkEsModule(staticUnresolvable, 'staticUnresolvable');

import * as externalAuto from 'external1';
checkEsModule(externalAuto, 'externalAuto');

import * as externalDefault from 'external2';
checkEsModule(externalDefault, 'externalDefault');

import * as externalDefaultOnly from 'external3';
checkEsModule(externalDefaultOnly, 'externalDefaultOnly');

export default import('./dynamic.js').then(ns => checkEsModule(ns, 'dynamic'));

function checkEsModule(ns, type) {
	assert.strictEqual(ns.__esModule, undefined, type);
}
