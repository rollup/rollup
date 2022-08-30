define(['unchanged', 'changed', 'special-character', 'with/slash', './relative'], (function (unchanged, changedName, specialCharacter, slash, relative_js) { 'use strict';

	console.log(unchanged.foo, changedName, specialCharacter.bar, slash.baz, relative_js.quux);

}));
