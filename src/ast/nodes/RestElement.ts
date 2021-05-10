import { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { EMPTY_PATH, ObjectPath, UnknownKey } from '../utils/PathTracker';
import Variable from '../variables/Variable';
import * as NodeType from './NodeType';
import { ExpressionEntity, UNKNOWN_EXPRESSION } from './shared/Expression';
import { IncludeChildren, NodeBase } from './shared/Node';
import { PatternNode } from './shared/Pattern';

export default class RestElement extends NodeBase implements PatternNode {
	argument!: PatternNode;
	type!: NodeType.tRestElement;
	private declarationInit: ExpressionEntity | null = null;
	private deoptimized = false;

	addExportedVariables(
		variables: Variable[],
		exportNamesByVariable: Map<Variable, string[]>
	): void {
		this.argument.addExportedVariables(variables, exportNamesByVariable);
	}

	declare(kind: string, init: ExpressionEntity) {
		this.declarationInit = init;
		return this.argument.declare(kind, UNKNOWN_EXPRESSION);
	}

	deoptimizePath(path: ObjectPath) {
		path.length === 0 && this.argument.deoptimizePath(EMPTY_PATH);
	}

	hasEffects(context: HasEffectsContext): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		return this.argument.hasEffects(context);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		return path.length > 0 || this.argument.hasEffectsWhenAssignedAtPath(EMPTY_PATH, context);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		if (!this.deoptimized) this.applyDeoptimizations();
		this.included = true;
		this.argument.include(context, includeChildrenRecursively);
	}

	private applyDeoptimizations():void {
		this.deoptimized = true;
		if (this.declarationInit !== null) {
			this.declarationInit.deoptimizePath([UnknownKey, UnknownKey]);
		}
	}
}
