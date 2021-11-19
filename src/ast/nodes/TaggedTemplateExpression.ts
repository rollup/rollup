import MagicString from 'magic-string';
import { NormalizedTreeshakingOptions } from '../../rollup/types';
import { RenderOptions } from '../../utils/renderHelpers';
import { CallOptions } from '../CallOptions';
import { HasEffectsContext } from '../ExecutionContext';
import { EMPTY_PATH } from '../utils/PathTracker';
import Identifier from './Identifier';
import * as NodeType from './NodeType';
import TemplateLiteral from './TemplateLiteral';
import { ExpressionNode, NodeBase } from './shared/Node';

export default class TaggedTemplateExpression extends NodeBase {
	declare quasi: TemplateLiteral;
	declare tag: ExpressionNode;
	declare type: NodeType.tTaggedTemplateExpression;

	private declare callOptions: CallOptions;

	bind(): void {
		super.bind();
		if (this.tag.type === NodeType.Identifier) {
			const name = (this.tag as Identifier).name;
			const variable = this.scope.findVariable(name);

			if (variable.isNamespace) {
				this.context.warn(
					{
						code: 'CANNOT_CALL_NAMESPACE',
						message: `Cannot call a namespace ('${name}')`
					},
					this.start
				);
			}
		}
	}

	hasEffects(context: HasEffectsContext): boolean {
		for (const expression of this.quasi.expressions) {
			if (expression.hasEffects(context)) return true;
		}
		if (
			(this.context.options.treeshake as NormalizedTreeshakingOptions).annotations &&
			this.annotations
		)
			return false;
		return (
			this.tag.hasEffects(context) ||
			this.tag.hasEffectsWhenCalledAtPath(EMPTY_PATH, this.callOptions, context)
		);
	}

	initialise(): void {
		this.callOptions = {
			args: this.quasi.expressions,
			thisParam:
				this.tag instanceof MemberExpression && !this.tag.variable
					? this.tag.object
					: null,
			withNew: false
		};
	}

	render(code: MagicString, options: RenderOptions): void {
		this.tag.render(code, options, { isCalleeOfRenderedParent: true });
		this.quasi.render(code, options);
	}
}
