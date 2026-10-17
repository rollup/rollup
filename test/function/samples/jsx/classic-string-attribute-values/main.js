const props = (
	<input
		title="Terms &amp; Conditions &quot;apply&quot; &#65;&#x42;"
		pattern="\d{3}-\d{4}"
		data-path="C:\new\table"
		data-quote='say "hi"'
		data-lines="first
second"
	/>
);

assert.strictEqual(props.title, 'Terms & Conditions "apply" AB');
assert.strictEqual(props.pattern, '\\d{3}-\\d{4}');
assert.strictEqual(props['data-path'], 'C:\\new\\table');
assert.strictEqual(props['data-quote'], 'say "hi"');
assert.strictEqual(props['data-lines'], 'first\nsecond');
