import { ExpressionEntity } from '../nodes/shared/Expression';
import { UNKNOWN_EXPRESSION, UNKNOWN_PATH } from '../values';
import ParameterScope from './ParameterScope';

export default class ReturnValueScope extends ParameterScope {
	private returnExpressions: ExpressionEntity[] = [];
	private returnExpression: ExpressionEntity | null = null;

	addReturnExpression(expression: ExpressionEntity) {
		this.returnExpressions.push(expression);
	}

	getReturnExpression(): ExpressionEntity {
		if (this.returnExpression === null) this.updateReturnExpression();
		return this.returnExpression;
	}

	private updateReturnExpression() {
		if (this.returnExpressions.length === 1) {
			this.returnExpression = this.returnExpressions[0];
		} else {
			this.returnExpression = UNKNOWN_EXPRESSION;
			for (const expression of this.returnExpressions) {
				expression.deoptimizePath(UNKNOWN_PATH);
			}
		}
	}
}
