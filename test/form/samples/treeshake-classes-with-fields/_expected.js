class StaticFieldWithValueEffect {
	static field = console.log('retained') || 'field';
}

class ComputedFieldWithKeyEffect {
	[console.log('retained') || 'field'] = 'retained';
}

class StaticComputedFieldWithKeyEffect {
	static [console.log('retained') || 'field'] = 'retained';
}
