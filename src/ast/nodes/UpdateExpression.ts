import MagicString from 'magic-string';
import { RenderOptions } from '../../utils/renderHelpers';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import { EMPTY_PATH, ObjectPath } from '../values';
import { isIdentifier } from './Identifier';
import * as NodeType from './NodeType';
import { ExpressionNode, NodeBase } from './shared/Node';

export default class UpdateExpression extends NodeBase {
	type: NodeType.tUpdateExpression;
	operator: '++' | '--';
	argument: ExpressionNode;
	prefix: boolean;

	bind() {
		super.bind();
		this.argument.deoptimizePath(EMPTY_PATH);
		if (isIdentifier(this.argument)) {
			const variable = this.scope.findVariable(this.argument.name);
			variable.isReassigned = true;
		}
	}

	hasEffects(options: ExecutionPathOptions): boolean {
		return (
			this.argument.hasEffects(options) ||
			this.argument.hasEffectsWhenAssignedAtPath(EMPTY_PATH, options)
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, _options: ExecutionPathOptions) {
		return path.length > 1;
	}

	render(code: MagicString, options: RenderOptions) {
		this.argument.render(code, options);
		const variable = this.argument.variable;
		if (options.format === 'system' && variable && variable.exportName) {
			const name = variable.getName();
			if (this.prefix) {
				code.overwrite(
					this.start,
					this.end,
					`exports('${variable.exportName}', ${this.operator}${name})`
				);
			} else {
				let op;
				switch (this.operator) {
					case '++':
						op = `${name} + 1`;
						break;
					case '--':
						op = `${name} - 1`;
						break;
				}
				code.overwrite(
					this.start,
					this.end,
					`(exports('${variable.exportName}', ${op}), ${name}${this.operator})`
				);
			}
		}
	}
}
