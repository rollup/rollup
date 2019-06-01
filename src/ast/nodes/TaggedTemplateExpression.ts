import CallOptions from '../CallOptions';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import { EMPTY_PATH } from '../values';
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
			const variable = this.scope.findVariable((this.tag as Identifier).name);

			if (variable.isNamespace) {
				this.context.error(
					{
						code: 'CANNOT_CALL_NAMESPACE',
						message: `Cannot call a namespace ('${(this.tag as Identifier).name}')`
					},
					this.start
				);
			}

			if ((this.tag as Identifier).name === 'eval') {
				this.context.warn(
					{
						code: 'EVAL',
						message: `Use of eval is strongly discouraged, as it poses security risks and may cause issues with minification`,
						url: 'https://rollupjs.org/guide/en#avoiding-eval'
					},
					this.start
				);
			}
		}
	}

	hasEffects(options: ExecutionPathOptions) {
		return (
			super.hasEffects(options) ||
			this.tag.hasEffectsWhenCalledAtPath(
				EMPTY_PATH,
				this.callOptions,
				options.getHasEffectsWhenCalledOptions()
			)
		);
	}

	initialise() {
		this.callOptions = CallOptions.create({
			callIdentifier: this,
			withNew: false
		});
	}
}
