(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	const x = globalFunction;
	switch ( anotherGlobal ) {
		case 2:
			x();
	}

	switch ( globalFunction() ) {
		case 4:
	}

})));
