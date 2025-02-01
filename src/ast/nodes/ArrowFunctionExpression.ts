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
import type { DeclarationPatternNode } from './shared/Pattern';

export default class ArrowFunctionExpression extends FunctionBase {
	declare body: BlockStatement | ExpressionNode;
	declare params: DeclarationPatternNode[];
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
		return false;
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		if (
			this.annotationNoSideEffects &&
			path.length === 0 &&
			interaction.type === INTERACTION_CALLED
		) {
			return false;
		}
		if (super.hasEffectsOnInteractionAtPath(path, interaction, context)) {
			return true;
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

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		super.include(context, includeChildrenRecursively);
		for (const parameter of this.params) {
			if (!(parameter instanceof Identifier)) {
				parameter.include(context, includeChildrenRecursively);
			}
		}
	}

	includeNode(context: InclusionContext) {
		this.included = true;
		this.body.includePath(UNKNOWN_PATH, context);
		for (const parameter of this.params) {
			if (!(parameter instanceof Identifier)) {
				parameter.includePath(UNKNOWN_PATH, context);
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
