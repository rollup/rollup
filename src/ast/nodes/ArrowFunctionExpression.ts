import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import type { NodeInteraction } from '../NodeInteractions';
import { INTERACTION_CALLED } from '../NodeInteractions';
import type ChildScope from '../scopes/ChildScope';
import ReturnValueScope from '../scopes/ReturnValueScope';
import { type ObjectPath, UNKNOWN_PATH } from '../utils/PathTracker';
import type BlockStatement from './BlockStatement';
import type CallExpression from './CallExpression';
import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { Flag, isFlagSet, setFlag } from './shared/BitFlags';
import FunctionBase from './shared/FunctionBase';
import type { ExpressionNode, IncludeChildren } from './shared/Node';
import { ObjectEntity } from './shared/ObjectEntity';
import { OBJECT_PROTOTYPE } from './shared/ObjectPrototype';
import type { PatternNode } from './shared/Pattern';

export default class ArrowFunctionExpression extends FunctionBase {
	declare body: BlockStatement | ExpressionNode;
	declare params: PatternNode[];
	declare preventChildBlockScope: true;
	declare scope: ReturnValueScope;
	declare type: NodeType.tArrowFunctionExpression;
	protected objectEntity: ObjectEntity | null = null;

	get expression(): boolean {
		return isFlagSet(this.flags, Flag.expression);
	}
	set expression(value: boolean) {
		this.flags = setFlag(this.flags, Flag.expression, value);
	}

	createScope(parentScope: ChildScope): void {
		this.scope = new ReturnValueScope(parentScope, false);
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

	protected onlyFunctionCallUsed(): boolean {
		const isIIFE =
			this.parent.type === NodeType.CallExpression &&
			(this.parent as CallExpression).callee === this;
		return isIIFE || super.onlyFunctionCallUsed();
	}

	includePath(
		_path: ObjectPath,
		context: InclusionContext,
		includeChildrenRecursively: IncludeChildren
	): void {
		super.includePath(UNKNOWN_PATH, context, includeChildrenRecursively);
		for (const parameter of this.params) {
			if (!(parameter instanceof Identifier)) {
				parameter.includePath(UNKNOWN_PATH, context, includeChildrenRecursively);
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
