import MagicString from 'magic-string';
import { RenderOptions } from '../../utils/renderHelpers';
import { getSystemExportStatement } from '../../utils/systemJsRendering';
import { HasEffectsContext } from '../ExecutionContext';
import { EMPTY_PATH, ObjectPath } from '../utils/PathTracker';
import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { ExpressionNode, NodeBase } from './shared/Node';

export default class UpdateExpression extends NodeBase {
	argument!: ExpressionNode;
	operator!: '++' | '--';
	prefix!: boolean;
	type!: NodeType.tUpdateExpression;

	bind() {
		super.bind();
		this.argument.deoptimizePath(EMPTY_PATH);
		if (this.argument instanceof Identifier) {
			const variable = this.scope.findVariable(this.argument.name);
			variable.isReassigned = true;
		}
	}

	hasEffects(context: HasEffectsContext): boolean {
		return (
			this.argument.hasEffects(context) ||
			this.argument.hasEffectsWhenAssignedAtPath(EMPTY_PATH, context)
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath) {
		return path.length > 1;
	}

	render(code: MagicString, options: RenderOptions) {
		this.argument.render(code, options);
		const variable = this.argument.variable;
		if (options.format === 'system' && variable && variable.exportNames.length > 0) {
			const _ = options.compact ? '' : ' ';
			if (variable.exportNames.length === 1) {
				const name = variable.getName();
				if (this.prefix) {
					code.overwrite(
						this.start,
						this.end,
						`exports('${variable.exportNames[0]}',${_}${this.operator}${name})`
					);
				} else {
					let op;
					switch (this.operator) {
						case '++':
							op = `${name}${_}+${_}1`;
							break;
						case '--':
							op = `${name}${_}-${_}1`;
							break;
					}
					code.overwrite(
						this.start,
						this.end,
						`(exports('${variable.exportNames[0]}',${_}${op}),${_}${name}${this.operator})`
					);
				}
			} else {
				// Regardless of prefix, we render the export as part of a sequence expression after the update
				code.appendLeft(this.end, `,${_}${getSystemExportStatement([variable], options)}`);
			}
		}
	}
}
