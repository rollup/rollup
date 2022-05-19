import { CallOptions } from '../../CallOptions';
import { DeoptimizableEntity } from '../../DeoptimizableEntity';
import { WritableEntity } from '../../Entity';
import { HasEffectsContext, InclusionContext } from '../../ExecutionContext';
import { NodeEvent } from '../../NodeEvents';
import { ObjectPath, PathTracker, UNKNOWN_PATH } from '../../utils/PathTracker';
import { LiteralValue } from '../Literal';
import SpreadElement from '../SpreadElement';
import { ExpressionNode, IncludeChildren } from './Node';

export const UnknownValue = Symbol('Unknown Value');

export type LiteralValueOrUnknown = LiteralValue | typeof UnknownValue;

export class ExpressionEntity implements WritableEntity {
	included = false;

	deoptimizePath(_path: ObjectPath): void {}

	deoptimizeThisOnEventAtPath(
		_event: NodeEvent,
		_path: ObjectPath,
		thisParameter: ExpressionEntity,
		_recursionTracker: PathTracker
	): void {
		thisParameter.deoptimizePath(UNKNOWN_PATH);
	}

	/**
	 * If possible it returns a stringifyable literal value for this node that can be used
	 * for inlining or comparing values.
	 * Otherwise it should return UnknownValue.
	 */
	getLiteralValueAtPath(
		_path: ObjectPath,
		_recursionTracker: PathTracker,
		_origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		return UnknownValue;
	}

	getReturnExpressionWhenCalledAtPath(
		_path: ObjectPath,
		_callOptions: CallOptions,
		_recursionTracker: PathTracker,
		_origin: DeoptimizableEntity
	): ExpressionEntity {
		return UNKNOWN_EXPRESSION;
	}

	hasEffectsWhenAccessedAtPath(_path: ObjectPath, _context: HasEffectsContext): boolean {
		return true;
	}

	hasEffectsWhenAssignedAtPath(_path: ObjectPath, _context: HasEffectsContext): boolean {
		return true;
	}

	hasEffectsWhenCalledAtPath(
		_path: ObjectPath,
		_callOptions: CallOptions,
		_context: HasEffectsContext
	): boolean {
		return true;
	}

	include(_context: InclusionContext, _includeChildrenRecursively: IncludeChildren): void {
		this.included = true;
	}

	includeCallArguments(
		context: InclusionContext,
		args: readonly (ExpressionNode | SpreadElement)[]
	): void {
		for (const arg of args) {
			arg.include(context, false);
		}
	}
}

export const UNKNOWN_EXPRESSION: ExpressionEntity =
	new (class UnknownExpression extends ExpressionEntity {})();
