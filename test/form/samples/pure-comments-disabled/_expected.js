// should be retained
/*@__PURE__*/ a();
/*@__PURE__*/ new a();

console.log('code');
console.log('should remain impure');

/*@__PURE__*/ drop1();
/*@__PURE__*/
drop2();
keep1()  ; keep2();
keep3() ; /*@__PURE__*/
drop3();
keep4()  ; /* other comment */ keep5();
keep6()  ; // other comment
keep7();
keep8()  && keep9();

/*@__PURE__*/ Drop1(),
/*@__PURE__*/
Drop2(),
Keep1()  , Keep2(),
Keep3() , /*@__PURE__*/
Drop3(),
Keep4()  , /* other comment */ Keep5(),
Keep6()  , // other comment
Keep7(),
Keep8()  && Keep9();
