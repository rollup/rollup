import MagicString from 'magic-string';
import { RenderOptions } from '../../utils/renderHelpers';
import { getSystemExportFunctionLeft, getSystemExportStatement } from '../../utils/systemJsRendering';
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
		if (options.format === 'system') {
			const variable = this.argument.variable;
			const exportNames = options.exportNamesByVariable.get(variable!);
			if (exportNames && exportNames.length) {
				const _ = options.compact ? '' : ' ';
				const name = variable!.getName();
				if (this.prefix) {
					if (exportNames.length === 1) {
						code.overwrite(
							this.start,
							this.end,
							`exports('${exportNames[0]}',${_}${this.operator}${name})`
						);
					} else {
						code.overwrite(
							this.start,
							this.end,
							`(${this.operator}${name},${_}${getSystemExportStatement(
								[variable!],
								options
							)},${_}${name})`
						);
					}
				} else if (exportNames.length > 1) {
					code.overwrite(
						this.start,
						this.end,
						`(${getSystemExportFunctionLeft([variable!], false, options)}${this.operator}${name}))`
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
						`(exports('${exportNames[0]}',${_}${op}),${_}${name}${this.operator})`
					);
				}
			}
		}
	}
}
