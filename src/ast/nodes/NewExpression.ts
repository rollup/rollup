import CallOptions from '../CallOptions';
import { ExecutionContext, resetIgnoreForCall } from '../ExecutionContext';
import { EMPTY_PATH, ObjectPath, UNKNOWN_PATH } from '../values';
import * as NodeType from './NodeType';
import { ExpressionNode, NodeBase } from './shared/Node';

export default class NewExpression extends NodeBase {
	annotatedPure?: boolean;
	arguments!: ExpressionNode[];
	callee!: ExpressionNode;
	type!: NodeType.tNewExpression;

	private callOptions!: CallOptions;

	bind() {
		super.bind();
		for (const argument of this.arguments) {
			// This will make sure all properties of parameters behave as "unknown"
			argument.deoptimizePath(UNKNOWN_PATH);
		}
	}

	hasEffects(context: ExecutionContext): boolean {
		for (const argument of this.arguments) {
			if (argument.hasEffects(context)) return true;
		}
		if (this.annotatedPure) return false;
		const ignore = resetIgnoreForCall(context);
		if (this.callee.hasEffectsWhenCalledAtPath(EMPTY_PATH, this.callOptions, context)) return true;
		context.ignore = ignore;
		return false;
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, _context: ExecutionContext) {
		return path.length > 1;
	}

	initialise() {
		this.callOptions = CallOptions.create({
			args: this.arguments,
			callIdentifier: this,
			withNew: true
		});
	}
}
