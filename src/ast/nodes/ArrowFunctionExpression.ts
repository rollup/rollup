import { type CallOptions } from '../CallOptions';
import { type HasEffectsContext } from '../ExecutionContext';
import ReturnValueScope from '../scopes/ReturnValueScope';
import type Scope from '../scopes/Scope';
import { type ObjectPath } from '../utils/PathTracker';
import BlockStatement from './BlockStatement';
import * as NodeType from './NodeType';
import FunctionBase from './shared/FunctionBase';
import { type ExpressionNode } from './shared/Node';
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

	protected getObjectEntity(): ObjectEntity {
		if (this.objectEntity !== null) {
			return this.objectEntity;
		}
		return (this.objectEntity = new ObjectEntity([], OBJECT_PROTOTYPE));
	}
}
