import type Module from '../Module';
import type CallExpression from '../ast/nodes/CallExpression';
import type FunctionDeclaration from '../ast/nodes/FunctionDeclaration';
import type { LiteralValue } from '../ast/nodes/Literal';
import type { ExpressionNode } from '../ast/nodes/shared/Node';
import { EMPTY_PATH, SHARED_RECURSION_TRACKER } from '../ast/utils/PathTracker';
import LocalVariable from '../ast/variables/LocalVariable';
import ParameterVariable from '../ast/variables/ParameterVariable';

function collectTopLevelFunctionCalls(modules: Module[]) {
	const topLevelFunctions = new Map<FunctionDeclaration, CallExpression[]>();
	modules = modules.filter(module => module.dynamicImporters.length === 0);
	for (const module of modules) {
		const scope = module.scope.variables;
		for (const [_, v] of scope) {
			if (!(v instanceof LocalVariable) || v.kind !== 'function') continue;

			const allUses = v.AllUsedPlaces;
			if (allUses.length === 0) continue;

			const containNonCallExpression = allUses.some(use => use.parent.type !== 'CallExpression');
			if (containNonCallExpression) continue;

			const function_ = v.declarations[0].parent as FunctionDeclaration;
			if (function_.params.length === 0) continue;

			const allParameterIsIdentifier = function_.params.every(
				parameter =>
					parameter.type === 'Identifier' && parameter.variable instanceof ParameterVariable
			);
			if (!allParameterIsIdentifier) continue;

			if (allUses.length === 1) {
				forwardFunctionUsedOnce(function_, allUses[0].parent as CallExpression);
			} else {
				topLevelFunctions.set(
					function_,
					allUses.map(use => use.parent as CallExpression)
				);
			}
		}
	}
	return topLevelFunctions;
}

function forwardFunctionUsedOnce(function_: FunctionDeclaration, call: CallExpression) {
	const maxLength = Math.min(function_.params.length, call.arguments.length);
	for (let index = 0; index < maxLength; index++) {
		const parameterVariable = function_.params[index].variable as ParameterVariable;
		parameterVariable.setKnownValue(call.arguments[index] as ExpressionNode);
	}
}

function setKnownLiteralValue(topLevelFunctions: Map<FunctionDeclaration, CallExpression[]>) {
	let changed = false;
	const deleteFunctions: Set<FunctionDeclaration> = new Set();

	for (const [function_, calls] of topLevelFunctions) {
		let parameterLength = function_.params.length;
		for (const call of calls) {
			parameterLength = Math.min(parameterLength, call.arguments.length);
		}
		for (let index = 0; index < parameterLength; index++) {
			const parameter = function_.params[index];
			const literalValues: LiteralValue[] = [];
			let allLiteral = true;
			for (const call of calls) {
				const literal = call.arguments[index].getLiteralValueAtPath(
					EMPTY_PATH,
					SHARED_RECURSION_TRACKER,
					call
				);
				if (typeof literal === 'symbol') {
					allLiteral = false;
					break;
				}
				literalValues.push(literal);
			}

			if (!allLiteral) continue;

			const allSame = literalValues.every(literal => literal === literalValues[0]);
			if (!allSame) continue;

			changed = true;
			deleteFunctions.add(function_);
			const parameterVariable = parameter.variable as ParameterVariable;
			parameterVariable.setKnownValue(calls[0].arguments[index] as ExpressionNode);
		}
	}

	for (const function_ of deleteFunctions) {
		topLevelFunctions.delete(function_);
	}
	return changed;
}

export function functionParameterPass(modules: Module[]) {
	const topLevelFunctions = collectTopLevelFunctionCalls(modules);
	let changed = true;
	while (changed) {
		changed = setKnownLiteralValue(topLevelFunctions);
	}
}
