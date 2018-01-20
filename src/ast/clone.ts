export default function clone<T>(node: T): T {
	if (!node) return node;
	if (typeof node !== 'object') return node;

	if (Array.isArray(node)) {
		const cloned = new Array(node.length);
		for (let i = 0; i < node.length; i += 1) cloned[i] = clone(node[i]);
		return <T & any[]>cloned;
	}

	const cloned = {};
	for (const key in node) {
		(<any>cloned)[key] = clone((<any>node)[key]);
	}

	return <T>cloned;
}
