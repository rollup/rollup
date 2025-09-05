define(['./generated-lib1', './generated-vendor'], (function (libs, vendor) { 'use strict';

	console.log(libs.value1);
	console.log(vendor.bar);
	console.log(libs.value2);
	console.log(vendor.bar);

}));
