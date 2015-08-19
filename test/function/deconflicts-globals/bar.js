import foo from './foo';

export default function() {
	assert.equal( foo(), 'foo' );
	return Number;
}
