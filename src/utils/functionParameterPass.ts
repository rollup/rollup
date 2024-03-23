/* eslint-disable @typescript-eslint/no-unused-vars */
import type Module from '../Module';
import type CallExpression from '../ast/nodes/CallExpression';
import type FunctionDeclaration from '../ast/nodes/FunctionDeclaration';
import type { LiteralValue } from '../ast/nodes/Literal';
import { EMPTY_PATH, SHARED_RECURSION_TRACKER } from '../ast/utils/PathTracker';
import LocalVariable from '../ast/variables/LocalVariable';
import ParameterVariable from '../ast/variables/ParameterVariable';

function collectTopLevelFunctionCalls(modules: Module[]) {
	const topLevelFunctions = new Map<FunctionDeclaration, CallExpression[]>();
	modules = modules.filter(module => module.dynamicImporters.length === 0);
	for (const module of modules) {
		const scope = module.scope.variables;
		for (const [_, v] of scope) {
			if (!(v instanceof LocalVariable)) continue;
			if (v.kind !== 'function') continue;
			const allUses = v.AllUsedPlaces;
			const containNonCallExpression = allUses.some(use => use.parent.type !== 'CallExpression');
			if (containNonCallExpression) continue;
			const function_ = v.declarations[0].parent as FunctionDeclaration;
			const allParameterIsIdentifier = function_.params.every(
				parameter => parameter.type === 'Identifier'
			);
			if (!allParameterIsIdentifier) continue;
			topLevelFunctions.set(
				function_,
				allUses.map(use => use.parent as CallExpression)
			);
		}
	}
	return topLevelFunctions;
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

			if (parameter.variable instanceof ParameterVariable) {
				changed = true;
				deleteFunctions.add(function_);
				parameter.variable.setKnownLiteralValue(literalValues[0]);
			}
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
