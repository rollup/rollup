import { type CallOptions } from '../CallOptions';
import { type HasEffectsContext, InclusionContext } from '../ExecutionContext';
import ReturnValueScope from '../scopes/ReturnValueScope';
import type Scope from '../scopes/Scope';
import { type ObjectPath } from '../utils/PathTracker';
import BlockStatement from './BlockStatement';
import Identifier from './Identifier';
import * as NodeType from './NodeType';
import FunctionBase from './shared/FunctionBase';
import { type ExpressionNode, IncludeChildren } from './shared/Node';
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

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	): boolean {
		if (super.hasEffectsWhenCalledAtPath(path, callOptions, context)) return true;
		const { ignore, brokenFlow } = context;
		context.ignore = {
			breaks: false,
			continues: false,
			labels: new Set(),
			returnYield: true
		};
		if (this.body.hasEffects(context)) return true;
		context.ignore = ignore;
		context.brokenFlow = brokenFlow;
		return false;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		super.include(context, includeChildrenRecursively);
		for (const param of this.params) {
			if (!(param instanceof Identifier)) {
				param.include(context, includeChildrenRecursively);
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
