(function (unchanged, changedName, specialCharacter, slash, relative_js) {
	'use strict';

	changedName = changedName && changedName.hasOwnProperty('default') ? changedName['default'] : changedName;

	console.log(unchanged.foo, changedName, specialCharacter.bar, slash.baz, relative_js.quux);

}(unchanged, changedName, specialCharacter, slash, relative_js));
