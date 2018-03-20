import { Node, GenericEsTreeNode } from './Node';

export function hasIncludedChild(baseNode: Node): boolean {
	let nodes = [baseNode];
	for (const node of nodes) {
		if (node.included) return true;
		for (const key of node.keys) {
			const value = (<GenericEsTreeNode>node)[key];
			if (value === null) continue;
			if (Array.isArray(value)) {
				for (const child of value) {
					if (child !== null) nodes.push(child);
				}
			} else nodes.push(value);
		}
	}
	return false;
}
