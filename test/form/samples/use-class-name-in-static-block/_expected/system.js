System.register([], (function () {
	'use strict';
	return {
		execute: (function () {

			let Test$1 = class Test {
				constructor() {
					assert.ok(Test.test);
					assert.ok(this.getText());
				}
				getText() {
					return Test.test;
				}
				static test = 'Test1';
				static {
					assert.ok(Test.test);
					new Test();
				}
			};

			class Test {
				constructor() {
					assert.ok(Test.test);
					assert.ok(this.getText());
				}
				getText() {
					return Test.test;
				}
				static test = 'Test2';
				static {
					assert.ok(Test.test);
					new Test();
				}
			}

			assert.ok(Test$1.test);
			assert.ok(Test.test);

		})
	};
}));
