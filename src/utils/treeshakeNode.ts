import MagicString from 'magic-string';
import * as NodeType from '../ast/nodes/NodeType';
import { Node } from '../ast/nodes/shared/Node';

export function treeshakeNode(node: Node, code: MagicString, start: number, end: number) {
	code.remove(start, end);
	if (node.annotations) {
		for (const annotation of node.annotations) {
			if (!annotation.comment) {
				continue;
			}
			if (annotation.comment.start < start) {
				code.remove(annotation.comment.start, annotation.comment.end);
			} else {
				return;
			}
		}
	}
}

export function removeAnnotations(node: Node, code: MagicString) {
	if (!node.annotations && node.parent.type === NodeType.ExpressionStatement) {
		node = node.parent as Node;
	}
	if (node.annotations) {
		for (const annotation of node.annotations.filter((a) => a.comment)) {
			code.remove(annotation.comment!.start, annotation.comment!.end);
		}
	}
}
