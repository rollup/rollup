export class Test {
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
