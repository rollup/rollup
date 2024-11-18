import type MagicString from 'magic-string';
import type { RenderOptions } from '../../utils/renderHelpers';
import {
	renderSystemExportExpression,
	renderSystemExportSequenceAfterExpression,
	renderSystemExportSequenceBeforeExpression
} from '../../utils/systemJsRendering';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import type { NodeInteraction, NodeInteractionAssigned } from '../NodeInteractions';
import { INTERACTION_ACCESSED } from '../NodeInteractions';
import { EMPTY_PATH, type ObjectPath } from '../utils/PathTracker';
import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { UNKNOWN_EXPRESSION } from './shared/Expression';
import type { ExpressionNode, IncludeChildren } from './shared/Node';
import { NodeBase } from './shared/Node';

export default class UpdateExpression extends NodeBase {
	declare argument: ExpressionNode;
	declare operator: '++' | '--';
	declare prefix: boolean;
	declare type: NodeType.tUpdateExpression;
	private declare interaction: NodeInteractionAssigned;

	hasEffects(context: HasEffectsContext): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		return this.argument.hasEffectsAsAssignmentTarget(context, true);
	}

	hasEffectsOnInteractionAtPath(path: ObjectPath, { type }: NodeInteraction): boolean {
		return path.length > 1 || type !== INTERACTION_ACCESSED;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		if (!this.deoptimized) this.applyDeoptimizations();
		this.included = true;
		this.argument.includeAsAssignmentTarget(context, includeChildrenRecursively, true);
	}

	initialise() {
		super.initialise();
		this.argument.setAssignedValue(UNKNOWN_EXPRESSION);
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
			variable.markReassigned();
		}
		this.scope.context.requestTreeshakingPass();
	}
}
