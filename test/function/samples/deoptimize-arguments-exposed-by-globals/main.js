// The arguments themselves are returned
const viaObject = { mutated: false };
Object(viaObject).mutated = true;
assert.strictEqual(viaObject.mutated ? 'mutated' : 'unchanged', 'mutated', 'Object');

const viaArray = { mutated: false };
Array(viaArray)[0].mutated = true;
assert.strictEqual(viaArray.mutated ? 'mutated' : 'unchanged', 'mutated', 'Array');

const viaArrayOf = { mutated: false };
Array.of(viaArrayOf)[0].mutated = true;
assert.strictEqual(viaArrayOf.mutated ? 'mutated' : 'unchanged', 'mutated', 'Array.of');

const viaWeakRef = { mutated: false };
new WeakRef(viaWeakRef).deref().mutated = true;
assert.strictEqual(viaWeakRef.mutated ? 'mutated' : 'unchanged', 'mutated', 'WeakRef');

// Values stored in the arguments are returned
const viaArrayFrom = { mutated: false };
Array.from([viaArrayFrom])[0].mutated = true;
assert.strictEqual(viaArrayFrom.mutated ? 'mutated' : 'unchanged', 'mutated', 'Array.from');

const viaArrayFromMapper = { mutated: false };
Array.from([0], () => viaArrayFromMapper)[0].mutated = true;
assert.strictEqual(
	viaArrayFromMapper.mutated ? 'mutated' : 'unchanged',
	'mutated',
	'Array.from mapper'
);

const viaArrayFromThis = { mutated: false };
Array.from(
	[0],
	function () {
		return this;
	},
	viaArrayFromThis
)[0].mutated = true;
assert.strictEqual(
	viaArrayFromThis.mutated ? 'mutated' : 'unchanged',
	'mutated',
	'Array.from thisArg'
);

const viaValues = { mutated: false };
Object.values({ viaValues })[0].mutated = true;
assert.strictEqual(viaValues.mutated ? 'mutated' : 'unchanged', 'mutated', 'Object.values');

const viaEntries = { mutated: false };
Object.entries({ viaEntries })[0][1].mutated = true;
assert.strictEqual(viaEntries.mutated ? 'mutated' : 'unchanged', 'mutated', 'Object.entries');

const viaFromEntries = { mutated: false };
Object.fromEntries([['key', viaFromEntries]]).key.mutated = true;
assert.strictEqual(
	viaFromEntries.mutated ? 'mutated' : 'unchanged',
	'mutated',
	'Object.fromEntries'
);

const viaCreate = { mutated: false };
Object.create({ viaCreate }).viaCreate.mutated = true;
assert.strictEqual(viaCreate.mutated ? 'mutated' : 'unchanged', 'mutated', 'Object.create');

const viaDescriptor = { mutated: false };
Object.getOwnPropertyDescriptor({ viaDescriptor }, 'viaDescriptor').value.mutated = true;
assert.strictEqual(
	viaDescriptor.mutated ? 'mutated' : 'unchanged',
	'mutated',
	'Object.getOwnPropertyDescriptor'
);

const viaDescriptors = { mutated: false };
Object.getOwnPropertyDescriptors({ viaDescriptors }).viaDescriptors.value.mutated = true;
assert.strictEqual(
	viaDescriptors.mutated ? 'mutated' : 'unchanged',
	'mutated',
	'Object.getOwnPropertyDescriptors'
);

const viaDefineProperty = { mutated: false };
const definedProperty = {};
Object.defineProperty(definedProperty, 'key', { value: viaDefineProperty });
definedProperty.key.mutated = true;
assert.strictEqual(
	viaDefineProperty.mutated ? 'mutated' : 'unchanged',
	'mutated',
	'Object.defineProperty'
);

const viaDefineProperties = { mutated: false };
const definedProperties = {};
Object.defineProperties(definedProperties, { key: { value: viaDefineProperties } });
definedProperties.key.mutated = true;
assert.strictEqual(
	viaDefineProperties.mutated ? 'mutated' : 'unchanged',
	'mutated',
	'Object.defineProperties'
);

const viaMap = { mutated: false };
new Map([['key', viaMap]]).get('key').mutated = true;
assert.strictEqual(viaMap.mutated ? 'mutated' : 'unchanged', 'mutated', 'Map');

const viaSet = { mutated: false };
for (const value of new Set([viaSet])) value.mutated = true;
assert.strictEqual(viaSet.mutated ? 'mutated' : 'unchanged', 'mutated', 'Set');

const viaWeakMap = { mutated: false };
const weakMapKey = {};
new WeakMap([[weakMapKey, viaWeakMap]]).get(weakMapKey).mutated = true;
assert.strictEqual(viaWeakMap.mutated ? 'mutated' : 'unchanged', 'mutated', 'WeakMap');

const viaErrorCause = { mutated: false };
new Error('error', { cause: viaErrorCause }).cause.mutated = true;
assert.strictEqual(viaErrorCause.mutated ? 'mutated' : 'unchanged', 'mutated', 'Error');

const viaAggregateError = { mutated: false };
new AggregateError([viaAggregateError]).errors[0].mutated = true;
assert.strictEqual(
	viaAggregateError.mutated ? 'mutated' : 'unchanged',
	'mutated',
	'AggregateError'
);

const viaPromiseResolve = { mutated: false };
const viaPromiseAll = { mutated: false };
export const promise = (async () => {
	(await Promise.resolve(viaPromiseResolve)).mutated = true;
	assert.strictEqual(
		viaPromiseResolve.mutated ? 'mutated' : 'unchanged',
		'mutated',
		'Promise.resolve'
	);
	(await Promise.all([viaPromiseAll]))[0].mutated = true;
	assert.strictEqual(viaPromiseAll.mutated ? 'mutated' : 'unchanged', 'mutated', 'Promise.all');
})();
