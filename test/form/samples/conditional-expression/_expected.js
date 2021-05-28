// side-effect in condition
foo() ? 1 : 2;

var unknownValue = bar();

// unknown branch with side-effect
unknownValue ? foo() : 2;
unknownValue ? 1 : foo();
(unknownValue ? function () {} : function () {this.x = 1;})();

// known side-effect
foo() ;
((function () {this.x = 1;}) )();
(() => () => console.log( 'effect' ) )()();
foo();
((function () {this.x = 1;}))();
(() => () => console.log( 'effect' ))()();
