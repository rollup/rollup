System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			function mutateThis () {
				this.x = 1;
			}
			mutateThis();

			function mutateNestedThis () {
				const mutateNested = () => this.bar = 1;
				mutateNested();
			}
			mutateNestedThis();

			function mutateThisConditionally () {
				if ( globalCondition ) {
					this.baz = 1;
				}
			}
			mutateThisConditionally();

			function CallSelfWithoutNew () {
				this.quux = 1;
				if ( globalCondition ) {
					CallSelfWithoutNew();
				}
			}
			const c = new CallSelfWithoutNew();

		}
	};
});
