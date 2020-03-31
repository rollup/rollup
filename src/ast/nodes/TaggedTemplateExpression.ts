import { CallOptions, NO_ARGS } from '../CallOptions';
import { HasEffectsContext } from '../ExecutionContext';
import { EMPTY_PATH } from '../utils/PathTracker';
import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { ExpressionNode, NodeBase } from './shared/Node';
import TemplateLiteral from './TemplateLiteral';

export default class TaggedTemplateExpression extends NodeBase {
	quasi!: TemplateLiteral;
	tag!: ExpressionNode;
	type!: NodeType.tTaggedTemplateExpression;

	private callOptions!: CallOptions;

	bind() {
		super.bind();
		if (this.tag.type === NodeType.Identifier) {
			const name = (this.tag as Identifier).name;
			const variable = this.scope.findVariable(name);

			if (variable.isNamespace) {
				this.context.warn(
					{
						code: 'CANNOT_CALL_NAMESPACE',
						message: `Cannot call a namespace ('${name}')`,
					},
					this.start
				);
			}

			if (name === 'eval') {
				this.context.warn(
					{
						code: 'EVAL',
						message: `Use of eval is strongly discouraged, as it poses security risks and may cause issues with minification`,
						url: 'https://rollupjs.org/guide/en/#avoiding-eval',
					},
					this.start
				);
			}
		}
	}

	hasEffects(context: HasEffectsContext) {
		return (
			super.hasEffects(context) ||
			this.tag.hasEffectsWhenCalledAtPath(EMPTY_PATH, this.callOptions, context)
		);
	}

	initialise() {
		this.callOptions = {
			args: NO_ARGS,
			withNew: false,
		};
	}
}
