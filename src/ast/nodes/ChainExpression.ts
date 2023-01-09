import type MagicString from 'magic-string';
import type { RenderOptions } from '../../utils/renderHelpers';
import type { DeoptimizableEntity } from '../DeoptimizableEntity';
import type { HasEffectsContext } from '../ExecutionContext';
import { SHARED_RECURSION_TRACKER } from '../utils/PathTracker';
import { EMPTY_PATH } from '../utils/PathTracker';
import type CallExpression from './CallExpression';
import type MemberExpression from './MemberExpression';
import type * as NodeType from './NodeType';
import type { LiteralValueOrUnknown } from './shared/Expression';
import { UnknownValue } from './shared/Expression';
import { NodeBase } from './shared/Node';

const unset = Symbol('unset');

export default class ChainExpression extends NodeBase implements DeoptimizableEntity {
	declare expression: CallExpression | MemberExpression;
	declare type: NodeType.tChainExpression;
	private objectValue: LiteralValueOrUnknown | typeof unset = unset;

	deoptimizeCache(): void {
		this.objectValue = unset;
	}

	getLiteralValueAtPath(): LiteralValueOrUnknown {
		if (this.getObjectValue() == null) return undefined;
		return UnknownValue;
	}

	hasEffects(context: HasEffectsContext): boolean {
		if (this.getObjectValue() == null) return false;
		return this.expression.hasEffects(context);
	}

	render(code: MagicString, options: RenderOptions): void {
		if (this.getObjectValue() == null) {
			code.remove(this.start, this.end);
		} else super.render(code, options);
	}

	private getObjectValue() {
		if (this.objectValue === unset) {
			let object =
				this.expression.type === 'CallExpression' ? this.expression.callee : this.expression.object;
			if (object.type === 'MemberExpression') object = (object as MemberExpression).object;
			this.objectValue = object.getLiteralValueAtPath(EMPTY_PATH, SHARED_RECURSION_TRACKER, this);
		}
		return this.objectValue;
	}
}
