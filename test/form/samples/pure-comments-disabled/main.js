// should be retained
/*@__PURE__*/ a();
/*@__PURE__*/ new a();

console.log('code')/*@__PURE__*/;
/*@__PURE__*/(() => {})();
console.log('should remain impure');
