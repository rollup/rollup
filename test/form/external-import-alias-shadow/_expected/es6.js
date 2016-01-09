import { parse } from 'acorn';

function parse$$(source) {
	return parse(source, { ecmaVersion: 6 });
}

console.log(parse$$('foo'));