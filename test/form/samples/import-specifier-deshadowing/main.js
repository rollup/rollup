import { Sticky as ReactSticky } from 'react-sticky';

var Sticky = function () {
	function Sticky() {}

	Sticky.foo = ReactSticky;

	return Sticky;
}();

export { Sticky as default };