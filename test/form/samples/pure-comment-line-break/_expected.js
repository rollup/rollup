const x = 'code';
console.log('should remain impure');

console.log('should remain impure');

console.log('code');
console.log('should remain impure');

console.log('code')/*@__PURE__*/;
console.log('should remain impure');
console.log('should remain impure');

console.log('code');
console.log('should remain impure');

console.log('code'),
console.log('should remain impure');

console.log('code')/*@__PURE__*/,
console.log('should remain impure');

console.log('should remain impure');

console.log('code');
console.log('should remain impure');

console.log('should remain impure');

console.log('should remain impure') ;

console.log('code');
console.log('should remain impure', x);


{
	console.log('should remain impure');
}
keep1() /*@__PURE__*/ ; keep2();
keep3() ; 
keep4() /*@__PURE__*/ ; /* other comment */ keep5();
keep6() /*@__PURE__*/ ; // other comment
keep7();
keep8() /*@__PURE__*/ && keep9();

/*@__PURE__*/ Drop1(), // FIXME: unrelated issue
Keep1() /*@__PURE__*/ , Keep2(),
Keep3() , 
Keep4() /*@__PURE__*/ , /* other comment */ Keep5(),
Keep6() /*@__PURE__*/ , // other comment
Keep7(),
Keep8() /*@__PURE__*/ && Keep9();

// FIXME: unrelated issue
/*@__PURE__*/ Drop10(),
/*@__PURE__*/ Drop13();
