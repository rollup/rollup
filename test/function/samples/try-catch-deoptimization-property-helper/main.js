import { remoteHelpers } from './remote-helpers';

const helpers = {
	fails: exec => {
		try {
			exec();
			return false;
		} catch {
			return true;
		}
	},
	method(exec) {
		try {
			exec();
			return false;
		} catch {
			return true;
		}
	}
};

const alias = helpers.fails;

// Callbacks with a block body whose contents tree-shaking may consider pure
// must still be retained through deoptimized try-catch feature detection.
const propertyDetection = helpers.fails(() => {
	Object.getPrototypeOf(null);
});
assert.ok(propertyDetection, 'property access helper: callback was not retained');

const methodDetection = helpers.method(() => {
	Object.getPrototypeOf(null);
});
assert.ok(methodDetection, 'object method helper: callback was not retained');

const aliasDetection = alias(() => {
	Object.getPrototypeOf(null);
});
assert.ok(aliasDetection, 'aliased helper: callback was not retained');

const remoteDetection = remoteHelpers.fails(() => {
	Object.getPrototypeOf(null);
});
assert.ok(remoteDetection, 'helper from another module: callback was not retained');

assert.ok(!helpers.fails(() => {}), 'no false positive feature detection');

// When the callback is retained, the helper must be able to access the value
// the callback returns instead of failing with a TypeError.
const resultHelper = {
	fails: exec => {
		try {
			exec().ok;
			return false;
		} catch {
			return true;
		}
	}
};
assert.ok(!resultHelper.fails(() => {
	Object.create(null);
	return { ok: true };
}), 'helper using the callback result: callback was not retained');
