/*@__PURE__*/
(() => {})();
console.log('should remain impure');

console.log('code');//@__PURE__
(() => {})();
console.log('should remain impure');

console.log('code')/*@__PURE__*/;
(() => {})();
console.log('should remain impure');

(() => {})();//@__PURE__
(() => {})();
console.log('should remain impure');

console.log('code');/*@__PURE__*///@__PURE__
/*@__PURE__*/ (() => {})();
console.log('should remain impure');

console.log('code'),//@__PURE__
(() => {})(),console.log('should remain impure');

console.log('code')/*@__PURE__*/,
(() => {})(),console.log('should remain impure');

(() => {})(),//@__PURE__
(() => {})(),console.log('should remain impure');

console.log('code');//@__PURE__
;console.log('should remain impure');

/*@__PURE__*/true && console.log('should remain impure');

/*@__PURE__*/true ? console.log('should remain impure') : console.log('code');

console.log('code');//@__PURE__
import code from './dep.js';
console.log('should remain impure', code);

/*@__PURE__*/
if (true) {
	console.log('should remain impure');
}
