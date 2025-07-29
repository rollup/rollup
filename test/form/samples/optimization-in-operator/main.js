import foo from './foo';

export default function check(name) {
	if (name in foo) return true;
	return false;
}
