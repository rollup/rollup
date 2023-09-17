import type MagicString from 'magic-string';
import type { Node } from '../ast/nodes/shared/Node';

export function treeshakeNode(node: Node, code: MagicString, start: number, end: number): void {
	code.remove(start, end);
	node.removeAnnotations(code);
}
