import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import type { NodeInteraction } from '../NodeInteractions';
import { INTERACTION_CALLED } from '../NodeInteractions';
import ReturnValueScope from '../scopes/ReturnValueScope';
import type Scope from '../scopes/Scope';
import { type ObjectPath } from '../utils/PathTracker';
import type BlockStatement from './BlockStatement';
import Identifier from './Identifier';
import type * as NodeType from './NodeType';
import FunctionBase from './shared/FunctionBase';
import type { ExpressionNode, IncludeChildren } from './shared/Node';
import { ObjectEntity } from './shared/ObjectEntity';
import { OBJECT_PROTOTYPE } from './shared/ObjectPrototype';
import type { PatternNode } from './shared/Pattern';

export default class ArrowFunctionExpression extends FunctionBase {
	declare async: boolean;
	declare body: BlockStatement | ExpressionNode;
	declare params: readonly PatternNode[];
	declare preventChildBlockScope: true;
	declare scope: ReturnValueScope;
	declare type: NodeType.tArrowFunctionExpression;
	protected objectEntity: ObjectEntity | null = null;

	createScope(parentScope: Scope): void {
		this.scope = new ReturnValueScope(parentScope, this.context);
	}

	hasEffects(): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		return false;
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		if (super.hasEffectsOnInteractionAtPath(path, interaction, context)) {
			return true;
		}

		if (this.annotationNoSideEffects) {
			return false;
		}

		if (interaction.type === INTERACTION_CALLED) {
			const { ignore, brokenFlow } = context;
			context.ignore = {
				breaks: false,
				continues: false,
				labels: new Set(),
				returnYield: true,
				this: false
			};
			if (this.body.hasEffects(context)) return true;
			context.ignore = ignore;
			context.brokenFlow = brokenFlow;
		}
		return false;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		super.include(context, includeChildrenRecursively);
		for (const parameter of this.params) {
			if (!(parameter instanceof Identifier)) {
				parameter.include(context, includeChildrenRecursively);
			}
		}
	}

	protected getObjectEntity(): ObjectEntity {
		if (this.objectEntity !== null) {
			return this.objectEntity;
		}
		return (this.objectEntity = new ObjectEntity([], OBJECT_PROTOTYPE));
	}
}
