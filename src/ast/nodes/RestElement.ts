import { HasEffectsContext } from '../ExecutionContext';
import { EMPTY_PATH, ObjectPath, UnknownKey } from '../utils/PathTracker';
import LocalVariable from '../variables/LocalVariable';
import Variable from '../variables/Variable';
import * as NodeType from './NodeType';
import { ExpressionEntity, UNKNOWN_EXPRESSION } from './shared/Expression';
import { NodeBase } from './shared/Node';
import { PatternNode } from './shared/Pattern';

export default class RestElement extends NodeBase implements PatternNode {
	declare argument: PatternNode;
	declare type: NodeType.tRestElement;
	protected deoptimized = false;
	private declarationInit: ExpressionEntity | null = null;

	addExportedVariables(
		variables: Variable[],
		exportNamesByVariable: Map<Variable, string[]>
	): void {
		this.argument.addExportedVariables(variables, exportNamesByVariable);
	}

	declare(kind: string, init: ExpressionEntity): LocalVariable[] {
		this.declarationInit = init;
		return this.argument.declare(kind, UNKNOWN_EXPRESSION);
	}

	deoptimizePath(path: ObjectPath): void {
		path.length === 0 && this.argument.deoptimizePath(EMPTY_PATH);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		return path.length > 0 || this.argument.hasEffectsWhenAssignedAtPath(EMPTY_PATH, context);
	}

	markDeclarationReached(): void {
		this.argument.markDeclarationReached();
	}

	protected applyDeoptimizations(): void {
		this.deoptimized = true;
		if (this.declarationInit !== null) {
			this.declarationInit.deoptimizePath([UnknownKey, UnknownKey]);
			this.context.requestTreeshakingPass();
		}
	}
}
