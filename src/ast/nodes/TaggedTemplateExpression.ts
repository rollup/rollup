import Node from '../Node';
import CallOptions from '../CallOptions';
import Expression from './Expression';
import TemplateLiteral from './TemplateLiteral';
import Identifier from './Identifier';
import ExecutionPathOptions from '../ExecutionPathOptions';

export default class TaggedTemplateExpression extends Node {
	type: 'TaggedTemplateExpression';
	tag: Expression;
	quasi: TemplateLiteral;

	private _callOptions: CallOptions;

	bindNode () {
		if (this.tag.type === 'Identifier') {
			const variable = this.scope.findVariable((<Identifier>this.tag).name);

			if (variable.isNamespace) {
				this.module.error(
					{
						code: 'CANNOT_CALL_NAMESPACE',
						message: `Cannot call a namespace ('${(<Identifier>this.tag).name}')`
					},
					this.start
				);
			}

			if ((<Identifier>this.tag).name === 'eval' && variable.isGlobal) {
				this.module.warn(
					{
						code: 'EVAL',
						message: `Use of eval is strongly discouraged, as it poses security risks and may cause issues with minification`,
						url:
							'https://github.com/rollup/rollup/wiki/Troubleshooting#avoiding-eval'
					},
					this.start
				);
			}
		}
	}

	hasEffects (options: ExecutionPathOptions) {
		return (
			super.hasEffects(options) ||
			this.tag.hasEffectsWhenCalledAtPath(
				[],
				this._callOptions,
				options.getHasEffectsWhenCalledOptions()
			)
		);
	}

	initialiseNode () {
		this._callOptions = CallOptions.create({ withNew: false, caller: this });
	}
}
