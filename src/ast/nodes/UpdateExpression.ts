import type MagicString from 'magic-string';
import type { RenderOptions } from '../../utils/renderHelpers';
import {
	renderSystemExportExpression,
	renderSystemExportSequenceAfterExpression,
	renderSystemExportSequenceBeforeExpression
} from '../../utils/systemJsRendering';
import type { HasEffectsContext } from '../ExecutionContext';
import { EMPTY_PATH, type ObjectPath } from '../utils/PathTracker';
import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { type ExpressionNode, NodeBase } from './shared/Node';

export default class UpdateExpression extends NodeBase {
	declare argument: ExpressionNode;
	declare operator: '++' | '--';
	declare prefix: boolean;
	declare type: NodeType.tUpdateExpression;
	protected deoptimized = false;

	hasEffects(context: HasEffectsContext): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		return (
			this.argument.hasEffects(context) ||
			this.argument.hasEffectsWhenAssignedAtPath(EMPTY_PATH, context)
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath): boolean {
		return path.length > 1;
	}

	render(code: MagicString, options: RenderOptions): void {
		const {
			exportNamesByVariable,
			format,
			snippets: { _ }
		} = options;
		this.argument.render(code, options);
		if (format === 'system') {
			const variable = this.argument.variable!;
			const exportNames = exportNamesByVariable.get(variable);
			if (exportNames) {
				if (this.prefix) {
					if (exportNames.length === 1) {
						renderSystemExportExpression(variable, this.start, this.end, code, options);
					} else {
						renderSystemExportSequenceAfterExpression(
							variable,
							this.start,
							this.end,
							this.parent.type !== NodeType.ExpressionStatement,
							code,
							options
						);
					}
				} else {
					const operator = this.operator[0];
					renderSystemExportSequenceBeforeExpression(
						variable,
						this.start,
						this.end,
						this.parent.type !== NodeType.ExpressionStatement,
						code,
						options,
						`${_}${operator}${_}1`
					);
				}
			}
		}
	}

	protected applyDeoptimizations(): void {
		this.deoptimized = true;
		this.argument.deoptimizePath(EMPTY_PATH);
		if (this.argument instanceof Identifier) {
			const variable = this.scope.findVariable(this.argument.name);
			variable.isReassigned = true;
		}
		this.context.requestTreeshakingPass();
	}
}
