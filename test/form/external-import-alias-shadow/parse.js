import { parse as acornParse } from 'acorn';

export default function parse(source) {
	return acornParse(source, { ecmaVersion: 6 });
}
