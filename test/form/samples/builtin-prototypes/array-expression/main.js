const array = [];
const join1 = array.join(',');
const join2 = [].join(',');
const join3 = [].join(',').trim();
const length = [].length;
const map1 = [1].map(x => x);
const map2 = [1].map(x => console.log(1));
const map3 = [1].map(x => x).map(x => x);
const map4 = [1].map(x => x).map(x => console.log(1));
const map5 = [1].map(x => console.log(1)).map(x => x);
const map6 = [1]
	.map(x => x)
	.map(x => x)
	.map(x => x);
const map7 = [1]
	.map(x => x)
	.map(x => x)
	.map(x => console.log(1));
const map8 = [1]
	.map(x => x)
	.map(x => console.log(1))
	.map(x => x);

[]();

// accessor methods
const removedTestArray = [{ noEffect() {} }];
removedTestArray[0].noEffect();

const _at = [].at(1);
const _atArray = [{ effect() {} }];
_atArray.at(0).effect = () => console.log(1);
_atArray[0].effect();

const _entries = [].entries();
const _entriesArray = [{ effect() {} }];
[..._entriesArray.entries()][0][1].effect = () => console.log(1);
_entriesArray[0].effect();

const _flat = [].flat().join(',').trim();
const _flat2 = [].flat(1).join(',').trim();
const _includes = [].includes(1).valueOf();
const _indexOf = [].indexOf(1).toPrecision(1);
const _join = [].join(',').trim();
const _keys = [].keys();
const _lastIndexOf = [].lastIndexOf(1).toPrecision(1);

const _slice = [].slice(1).concat([]);
const _sliceArray = [{ effect() {} }];
_sliceArray.slice()[0].effect = () => console.log(1);
_sliceArray[0].effect();

const _values = [].values();
const _valuesArray = [{ effect() {} }];
[..._valuesArray.values()][0].effect = () => console.log(1);
_valuesArray[0].effect();

// iteration methods
const _every = [1].every(() => true).valueOf();
const _everyEffect = [1].every(() => console.log(1) || true);
const _everyArray = [{ effect() {} }];
_everyArray.every(element => (element.effect = () => console.log(1)));
_everyArray[0].effect();

const _filter = [1].filter(() => true).join(',');
const _filterEffect = [1].filter(() => console.log(1) || true);
const _filterArray = [{ effect() {} }];
_filterArray.filter(element => (element.effect = () => console.log(1)));
_filterArray[0].effect();

const _find = [1].find(() => true);
const _findEffect = [1].find(() => console.log(1) || true);
const _findArray = [{ effect() {} }];
_findArray.find(element => (element.effect = () => console.log(1)));
_findArray[0].effect();

const _findLast = [1].findLast(() => true);
const _findLastEffect = [1].findLast(() => console.log(1) || true);
const _findLastArray = [{ effect() {} }];
_findLastArray.findLast(element => (element.effect = () => console.log(1)));
_findLastArray[0].effect();

const _findIndex = [1].findIndex(() => true).toPrecision(1);
const _findIndexEffect = [1].findIndex(() => console.log(1) || true);
const _findIndexArray = [{ effect() {} }];
_findIndexArray.findIndex(element => (element.effect = () => console.log(1)));
_findIndexArray[0].effect();

const _findLastIndex = [1].findLastIndex(() => true).toPrecision(1);
const _findLastIndexEffect = [1].findLastIndex(() => console.log(1) || true);
const _findLastIndexArray = [{ effect() {} }];
_findLastIndexArray.findLastIndex(element => (element.effect = () => console.log(1)));
_findLastIndexArray[0].effect();

const _flatMap = [1].flatMap(() => 1).join(',');
const _flatMapEffect = [1].flatMap(() => console.log(1) || 1);
const _flatMapArray = [{ effect() {} }];
_flatMapArray.flatMap(element => (element.effect = () => console.log(1)));
_flatMapArray[0].effect();

const _forEach = [1].forEach(() => {});
const _forEachEffect = [1].forEach(() => console.log(1) || true);
const _forEachArray = [{ effect() {} }];
_forEachArray.forEach(element => (element.effect = () => console.log(1)));
_forEachArray[0].effect();

const _map = [1].map(() => 1).join(',');
const _mapEffect = [1].map(() => console.log(1) || 1);
const _mapArray = [{ effect() {} }];
_mapArray.map(element => (element.effect = () => console.log(1)));
_mapArray[0].effect();

const _reduce = [1].reduce(() => 1, 1);
const _reduceEffect = [1].reduce(() => console.log(1) || 1, 1);
const _reduceArray = [{ effect() {} }];
_reduceArray.reduce((_, element) => (element.effect = () => console.log(1)), 1);
_reduceArray[0].effect();

const _reduceRight = [1].reduceRight(() => 1, 1);
const _reduceRightEffect = [1].reduceRight(() => console.log(1) || 1, 1);
const _reduceRightArray = [{ effect() {} }];
_reduceRightArray.reduceRight((_, element) => (element.effect = () => console.log(1)), 1);
_reduceRightArray[0].effect();

const _some = [1].some(() => true).valueOf();
const _someEffect = [1].some(() => console.log(1) || true);
const _someArray = [{ effect() {} }];
_someArray.some(element => (element.effect = () => console.log(1)));
_someArray[0].effect();

// mutator methods
export const exported = [1];

const _copyWithin = [1].copyWithin(0).join(',');
exported.copyWithin(0);
const _fill = [1].fill(0).join(',');
exported.fill(0);
const _pop = [1].pop();
exported.pop();
const _push = [1].push(0).toPrecision(1);
exported.push(0);
const _reverse = [1].reverse().join(',');
exported.reverse();
const _shift = [1].shift();
exported.shift();
const _sort = [1].sort(() => 0).join(',');
const _sortEffect = [1].sort(() => console.log(1) || 0);
exported.sort();
const _splice = [1].splice(0).join(',');
exported.splice(0);
const _unshift = [1].unshift(0).toPrecision(1);
exported.unshift(0);

const _toLocaleString = [1].toLocaleString().trim();
const _toString = [1].toString().trim();

// inherited
const _hasOwnProperty = [1].hasOwnProperty('toString').valueOf();
const _isPrototypeOf = [1].isPrototypeOf([]).valueOf();
const _propertyIsEnumerable = [1].propertyIsEnumerable('toString').valueOf();
const _valueOf = [1].valueOf();
