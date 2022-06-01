import MagicString from 'magic-string';
import CallExpression from '../ast/nodes/CallExpression';
import NewExpression from '../ast/nodes/NewExpression';
import { findFirstOccurrenceOutsideComment, RenderOptions } from './renderHelpers';

export function renderCallArguments(
	code: MagicString,
	options: RenderOptions,
	node: CallExpression | NewExpression
): void {
	if (node.arguments.length > 0) {
		if (node.arguments[node.arguments.length - 1].included) {
			for (const arg of node.arguments) {
				arg.render(code, options);
			}
		} else {
			let lastIncludedIndex = node.arguments.length - 2;
			while (lastIncludedIndex >= 0 && !node.arguments[lastIncludedIndex].included) {
				lastIncludedIndex--;
			}
			if (lastIncludedIndex >= 0) {
				for (let index = 0; index <= lastIncludedIndex; index++) {
					node.arguments[index].render(code, options);
				}
				code.remove(
					findFirstOccurrenceOutsideComment(
						code.original,
						',',
						node.arguments[lastIncludedIndex].end
					),
					node.end - 1
				);
			} else {
				code.remove(
					findFirstOccurrenceOutsideComment(code.original, '(', node.callee.end) + 1,
					node.end - 1
				);
			}
		}
	}
}
