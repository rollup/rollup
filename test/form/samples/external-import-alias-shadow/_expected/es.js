import { parse as parse$1 } from 'acorn';

function parse(source) {
	return parse$1(source, { ecmaVersion: 6 });
}

console.log(parse('foo'));
