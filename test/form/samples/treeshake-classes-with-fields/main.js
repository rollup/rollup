class Field {
	field;
}

class StaticField {
	static field;
}

class FieldWithValueEffect {
	field = console.log('ignored') || 'field';
}

class StaticFieldWithValueEffect {
	static field = console.log('retained') || 'field';
}

class ComputedField {
	['field'] = 'ignored';
}

class StaticComputedField {
	static ['field'] = 'ignored';
}

class ComputedFieldWithKeyEffect {
	[console.log('retained') || 'field'] = 'retained';
}

class StaticComputedFieldWithKeyEffect {
	static [console.log('retained') || 'field'] = 'retained';
}
