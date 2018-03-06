import CallOptions from '../CallOptions';
import TemplateLiteral from './TemplateLiteral';
import Identifier from './Identifier';
import ExecutionPathOptions from '../ExecutionPathOptions';
import { isGlobalVariable } from '../variables/GlobalVariable';
import { isNamespaceVariable } from '../variables/NamespaceVariable';
import { NodeType } from './NodeType';
import { ExpressionNode, NodeBase } from './shared/Node';

export default class TaggedTemplateExpression extends NodeBase {
	type: NodeType.TaggedTemplateExpression;
	tag: ExpressionNode;
	quasi: TemplateLiteral;

	private _callOptions: CallOptions;

	bindNode() {
		if (this.tag.type === NodeType.Identifier) {
			const variable = this.scope.findVariable((<Identifier>this.tag).name);

			if (isNamespaceVariable(variable)) {
				this.module.error(
					{
						code: 'CANNOT_CALL_NAMESPACE',
						message: `Cannot call a namespace ('${(<Identifier>this.tag).name}')`
					},
					this.start
				);
			}

			if ((<Identifier>this.tag).name === 'eval' && isGlobalVariable(variable)) {
				this.module.warn(
					{
						code: 'EVAL',
						message: `Use of eval is strongly discouraged, as it poses security risks and may cause issues with minification`,
						url: 'https://github.com/rollup/rollup/wiki/Troubleshooting#avoiding-eval'
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
				[],
				this._callOptions,
				options.getHasEffectsWhenCalledOptions()
			)
		);
	}

	initialiseNode() {
		this._callOptions = CallOptions.create({
			withNew: false,
			callIdentifier: this
		});
	}
}
