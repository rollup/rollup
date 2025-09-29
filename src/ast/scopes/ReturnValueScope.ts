import type { NodeInteractionCalled } from '../NodeInteractions';
import { type ExpressionEntity } from '../nodes/shared/Expression';
import { MultiExpression } from '../nodes/shared/MultiExpression';
import SpreadElement from '../nodes/SpreadElement';
import { UNKNOWN_PATH } from '../utils/PathTracker';
import { UNDEFINED_EXPRESSION } from '../values';
import ParameterScope from './ParameterScope';

export default class ReturnValueScope extends ParameterScope {
	private returnExpression: ExpressionEntity | null = null;
	private readonly returnExpressions: ExpressionEntity[] = [];

	addReturnExpression(expression: ExpressionEntity): void {
		this.returnExpressions.push(expression);
	}

	deoptimizeArgumentsOnCall({ args }: NodeInteractionCalled): void {
		const { parameters } = this;
		let position = 0;
		for (; position < args.length - 1; position++) {
			// Only the "this" argument arg[0] can be null
			const argument = args[position + 1]!;
			if (argument instanceof SpreadElement) {
				// This deoptimizes the current and remaining parameters and arguments
				for (; position < parameters.length; position++) {
					args[position + 1]?.deoptimizePath(UNKNOWN_PATH);
					for (const variable of parameters[position]) {
						variable.markReassigned();
					}
				}
				break;
			}
			if (this.hasRest && position >= parameters.length - 1) {
				argument.deoptimizePath(UNKNOWN_PATH);
			} else {
				const variables = parameters[position];
				if (variables) {
					for (const variable of variables) {
						variable.addArgumentForDeoptimization(argument);
					}
				}
				this.addArgumentToBeDeoptimized(argument);
			}
		}
		const nonRestParameterLength = this.hasRest ? parameters.length - 1 : parameters.length;
		for (; position < nonRestParameterLength; position++) {
			for (const variable of parameters[position]) {
				variable.addArgumentForDeoptimization(UNDEFINED_EXPRESSION);
			}
		}
	}

	getReturnExpression(): ExpressionEntity {
		if (!this.returnExpression) {
			this.returnExpression =
				this.returnExpressions.length === 1
					? this.returnExpressions[0]
					: new MultiExpression(this.returnExpressions);
		}

		return this.returnExpression;
	}

	deoptimizeAllParameters() {
		for (const parameter of this.parameters) {
			for (const variable of parameter) {
				variable.deoptimizePath(UNKNOWN_PATH);
				variable.markReassigned();
			}
		}
	}

	reassignAllParameters() {
		for (const parameter of this.parameters) {
			for (const variable of parameter) {
				variable.markReassigned();
			}
		}
	}

	protected addArgumentToBeDeoptimized(_argument: ExpressionEntity) {}
}
