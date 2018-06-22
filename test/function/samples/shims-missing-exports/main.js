import { missing, unusedMissing } from './dep1.js';
import depDefault, * as dep from './dep2';

const doesNotMatter = unusedMissing;
const doesNotMatterAsWell = dep.notPresent;

function almostUseUnused(useIt) {
	if (useIt) {
		assert.ok(unusedMissing);
	}
}

almostUseUnused(false);

export { missing, depDefault };
