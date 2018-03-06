import ExecutionPathOptions from '../ExecutionPathOptions';
import MagicString from 'magic-string';
import { ExpressionNode, NodeBase } from './shared/Node';
import { NodeType } from './NodeType';
import { RenderOptions } from '../../utils/renderHelpers';

export default class SequenceExpression extends NodeBase {
	type: NodeType.SequenceExpression;
	expressions: ExpressionNode[];

	getValue(): any {
		return this.expressions[this.expressions.length - 1].getValue();
	}

	hasEffects(options: ExecutionPathOptions): boolean {
		return this.expressions.some(expression => expression.hasEffects(options));
	}

	includeInBundle() {
		let addedNewNodes = !this.included;
		this.included = true;
		if (this.expressions[this.expressions.length - 1].includeInBundle()) {
			addedNewNodes = true;
		}
		this.expressions.forEach(node => {
			if (node.shouldBeIncluded()) {
				if (node.includeInBundle()) {
					addedNewNodes = true;
				}
			}
		});
		return addedNewNodes;
	}

	render(code: MagicString, options: RenderOptions) {
		if (!this.module.graph.treeshake) {
			super.render(code, options);
		} else {
			const last = this.expressions[this.expressions.length - 1];
			last.render(code, options);

			if (
				this.parent.type === NodeType.CallExpression &&
				last.type === NodeType.MemberExpression &&
				this.expressions.length > 1
			) {
				this.expressions[0].included = true;
			}

			const included = this.expressions
				.slice(0, this.expressions.length - 1)
				.filter(expression => expression.included);
			if (included.length === 0) {
				code.remove(this.start, last.start);
				code.remove(last.end, this.end);
			} else {
				let previousEnd = this.start;
				for (const expression of included) {
					expression.render(code, options);
					code.remove(previousEnd, expression.start);
					code.appendLeft(expression.end, ', ');
					previousEnd = expression.end;
				}

				code.remove(previousEnd, last.start);
				code.remove(last.end, this.end);
			}
		}
	}
}
