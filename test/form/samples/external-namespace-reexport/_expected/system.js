System.register('myBundle', ['highcharts'], function (exports, module) {
	'use strict';
	return {
		setters: [function (module) {
			exports('Highcharts', module);
		}],
		execute: function () {



		}
	};
});
