const withEntities = <input key="a &amp; b" pattern="\d+" title="&lt;tag&gt;" />;
assert.strictEqual(withEntities.key, 'a & b');
assert.strictEqual(withEntities.props.pattern, '\\d+');
assert.strictEqual(withEntities.props.title, '<tag>');

const withLineBreak = (
	<input
		key="first
second"
	/>
);
assert.strictEqual(withLineBreak.key, 'first\nsecond');
