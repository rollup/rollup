import './unused.js';
import './unusedFunction.js';
import './unusedSideEffect.js';
import importedValue from './used.js';
import importedUsedFunction from './usedFunction.js';
import importedUsedNamedFunction from './usedNamedFunction.js';
import './unusedSideEffectObject1.js';
import './unusedSideEffectObject2.js';

console.log(importedValue);
importedUsedFunction();
importedUsedNamedFunction();
