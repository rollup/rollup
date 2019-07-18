console.log(true ? /*@__PURE__*/ noEffect() : null);
console.log(false ? null : /*@__PURE__*/ noEffect());
console.log(true && /*@__PURE__*/ noEffect());
console.log(false || /*@__PURE__*/ noEffect());
