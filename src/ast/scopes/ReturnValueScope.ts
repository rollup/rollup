import type { NodeInteractionCalled } from '../NodeInteractions';
import type { IdentifierWithVariable } from '../nodes/Identifier';
import { type ExpressionEntity, UNKNOWN_EXPRESSION } from '../nodes/shared/Expression';
import { ReturnedIdentifier } from '../nodes/shared/ReturnedIdentifier';
import SpreadElement from '../nodes/SpreadElement';
import { isIdentifierNode } from '../utils/identifyNode';
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
		if (this.returnExpression === null) this.updateReturnExpression();
		return this.returnExpression!;
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

	private updateReturnExpression() {
		const { returnExpressions } = this;
		const [firstExpression] = returnExpressions;
		// A single return, or the same variable returned on all paths, can be
		// resolved to that variable
		if (firstExpression && this.returnExpressionsResolveToSameVariable(firstExpression)) {
			this.returnExpression = firstExpression.variable.isTargetOfAssignment
				? new ReturnedIdentifier(firstExpression)
				: firstExpression;
		} else if (returnExpressions.length === 1) {
			this.returnExpression = firstExpression;
		} else {
			this.returnExpression = UNKNOWN_EXPRESSION;
			for (const expression of returnExpressions) {
				expression.deoptimizePath(UNKNOWN_PATH);
			}
		}
	}

	private returnExpressionsResolveToSameVariable(
		firstExpression: ExpressionEntity
	): firstExpression is IdentifierWithVariable {
		if (!isIdentifierNode(firstExpression) || firstExpression.variable === null) {
			return false;
		}
		return this.returnExpressions.every(
			expression => isIdentifierNode(expression) && expression.variable === firstExpression.variable
		);
	}
}
