define(['require'], function (require) { 'use strict';

	amdSpecialHandler('./generated-imported-via-special-handler', 'main.js', 'imported-via-special-handler.js', null);
	amdSpecialHandler(someVariable, 'main.js', 'null', null);
	amdSpecialHandler(someCustomlyResolvedVariable, 'main.js', 'null', someCustomlyResolvedVariable);

});
