import { parse } from 'acorn';

function parse$1(source) {
	return parse(source, { ecmaVersion: 6 });
}

console.log(parse$1('foo'));
