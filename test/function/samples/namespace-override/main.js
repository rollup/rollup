import * as ns from './exportAll.js';
import { hiddenConflictByExport, hiddenConflictByReexport } from './exportAll.js';

assert.deepStrictEqual(ns, {
	__proto__: null,
	a: 'a',
	aExportOverride: 'override',
	aReexportOverride: 'b',
	b: 'b',
	hiddenConflictByExport: 'hidden',
	hiddenConflictByReexport: 'b',
});
