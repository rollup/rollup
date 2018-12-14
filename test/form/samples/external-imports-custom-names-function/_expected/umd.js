(function (factory) {
	typeof define === 'function' && define.amd ? define(['a-b-c'], factory) :
	factory(global.a_b_c);
}(function (aBC) { 'use strict';

	aBC.foo();

}));
