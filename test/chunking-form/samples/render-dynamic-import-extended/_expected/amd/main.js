define(['require'], (function (require) { 'use strict';

	amdDynamicImportPreload('./generated-has-dependencies', ["generated-no-dependencies.js"]);
	amdDynamicImportPreload('./generated-no-dependencies', []);
	amdDynamicImportPreload(somethingElse, null);

}));
