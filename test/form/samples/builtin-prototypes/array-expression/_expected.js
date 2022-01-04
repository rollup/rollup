[1].map(x => console.log(1));
[1].map(x => x).map(x => console.log(1));
[1].map(x => console.log(1)).map(x => x);
[1]
	.map(x => x)
	.map(x => x)
	.map(x => console.log(1));
[1]
	.map(x => x)
	.map(x => console.log(1))
	.map(x => x);

[]();
const _atArray = [{ effect() {} }];
_atArray.at(0).effect = () => console.log(1);
_atArray[0].effect();
const _entriesArray = [{ effect() {} }];
[..._entriesArray.entries()][0][1].effect = () => console.log(1);
_entriesArray[0].effect();
const _sliceArray = [{ effect() {} }];
_sliceArray.slice()[0].effect = () => console.log(1);
_sliceArray[0].effect();
const _valuesArray = [{ effect() {} }];
[..._valuesArray.values()][0].effect = () => console.log(1);
_valuesArray[0].effect();
[1].every(() => console.log(1) || true);
const _everyArray = [{ effect() {} }];
_everyArray.every(element => (element.effect = () => console.log(1)));
_everyArray[0].effect();
[1].filter(() => console.log(1) || true);
const _filterArray = [{ effect() {} }];
_filterArray.filter(element => (element.effect = () => console.log(1)));
_filterArray[0].effect();
[1].find(() => console.log(1) || true);
const _findArray = [{ effect() {} }];
_findArray.find(element => (element.effect = () => console.log(1)));
_findArray[0].effect();
[1].findLast(() => console.log(1) || true);
const _findLastArray = [{ effect() {} }];
_findLastArray.findLast(element => (element.effect = () => console.log(1)));
_findLastArray[0].effect();
[1].findIndex(() => console.log(1) || true);
const _findIndexArray = [{ effect() {} }];
_findIndexArray.findIndex(element => (element.effect = () => console.log(1)));
_findIndexArray[0].effect();
[1].findLastIndex(() => console.log(1) || true);
const _findLastIndexArray = [{ effect() {} }];
_findLastIndexArray.findLastIndex(element => (element.effect = () => console.log(1)));
_findLastIndexArray[0].effect();
[1].flatMap(() => console.log(1) || 1);
const _flatMapArray = [{ effect() {} }];
_flatMapArray.flatMap(element => (element.effect = () => console.log(1)));
_flatMapArray[0].effect();
[1].forEach(() => console.log(1) || true);
const _forEachArray = [{ effect() {} }];
_forEachArray.forEach(element => (element.effect = () => console.log(1)));
_forEachArray[0].effect();
[1].map(() => console.log(1) || 1);
const _mapArray = [{ effect() {} }];
_mapArray.map(element => (element.effect = () => console.log(1)));
_mapArray[0].effect();
[1].reduce(() => console.log(1) || 1, 1);
const _reduceArray = [{ effect() {} }];
_reduceArray.reduce((_, element) => (element.effect = () => console.log(1)), 1);
_reduceArray[0].effect();
[1].reduceRight(() => console.log(1) || 1, 1);
const _reduceRightArray = [{ effect() {} }];
_reduceRightArray.reduceRight((_, element) => (element.effect = () => console.log(1)), 1);
_reduceRightArray[0].effect();
[1].some(() => console.log(1) || true);
const _someArray = [{ effect() {} }];
_someArray.some(element => (element.effect = () => console.log(1)));
_someArray[0].effect();

// mutator methods
const exported = [1];
exported.copyWithin(0);
exported.fill(0);
exported.pop();
exported.push(0);
exported.reverse();
exported.shift();
[1].sort(() => console.log(1) || 0);
exported.sort();
exported.splice(0);
exported.unshift(0);

export { exported };
