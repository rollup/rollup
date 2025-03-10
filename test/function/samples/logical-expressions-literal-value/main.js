var MyEnum =
	(unknownGlobal,
	(MyEnum2 => {
		MyEnum2['foo'] = 'FOO';
		MyEnum2['bar'] = 'BAR';
		return MyEnum2;
	})(MyEnum || {}));

assert.strictEqual(MyEnum.foo, 'FOO');
