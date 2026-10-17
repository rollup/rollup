import isReference, { type NodeWithFieldDefinition } from 'is-reference';
import { childNodeKeys } from '../ast/childNodeKeys';
import ArrowFunctionExpression from '../ast/nodes/ArrowFunctionExpression';
import CallExpression from '../ast/nodes/CallExpression';
import FunctionDeclaration from '../ast/nodes/FunctionDeclaration';
import FunctionExpression from '../ast/nodes/FunctionExpression';
import Identifier from '../ast/nodes/Identifier';
import MethodDefinition from '../ast/nodes/MethodDefinition';
import NewExpression from '../ast/nodes/NewExpression';
import PropertyDefinition from '../ast/nodes/PropertyDefinition';
import type { Node } from '../ast/nodes/shared/Node';
import type Variable from '../ast/variables/Variable';

type EvaluatedFunction = ArrowFunctionExpression | FunctionDeclaration | FunctionExpression;

function isEvaluatedFunction(node: Node): node is EvaluatedFunction {
	return (
		node instanceof ArrowFunctionExpression ||
		node instanceof FunctionDeclaration ||
		node instanceof FunctionExpression
	);
}

export function visitDirectlyEvaluatedBindings(
	node: Node,
	visit: (variable: Variable) => void
): void {
	const visitNode = (current: Node | null | undefined): void => {
		if (!current) return;

		if (current instanceof Identifier) {
			// `export { name }` aliases a binding and does not read it.
			if (
				current.variable &&
				current.parent.type !== 'ExportSpecifier' &&
				isReference(current, current.parent as NodeWithFieldDefinition)
			) {
				visit(current.variable);
			}
			return;
		}

		if (current.type === 'ImportDeclaration') return;

		if (current instanceof CallExpression || current instanceof NewExpression) {
			const { callee } = current;
			if (callee && isEvaluatedFunction(callee)) {
				for (const parameter of callee.params) visitNode(parameter);
				visitNode(callee.body);
			} else if (callee) {
				visitNode(callee);
			}
			for (const argument of current.arguments) visitNode(argument);
			return;
		}

		if (isEvaluatedFunction(current)) return;

		if (current instanceof PropertyDefinition) {
			for (const decorator of current.decorators) visitNode(decorator);
			if (current.computed) visitNode(current.key);
			// Instance fields run on construction, not when the class is evaluated.
			if (current.static) visitNode(current.value);
			return;
		}

		if (current instanceof MethodDefinition) {
			for (const decorator of current.decorators) visitNode(decorator);
			if (current.computed) visitNode(current.key);
			return;
		}

		const childKeys = childNodeKeys[current.type];
		if (!childKeys) return;
		for (const key of childKeys) {
			const value: unknown = (current as unknown as Record<string, unknown>)[key];
			if (Array.isArray(value)) {
				for (const child of value) {
					if (child && typeof child === 'object') visitNode(child as Node);
				}
			} else if (value && typeof value === 'object') {
				visitNode(value as Node);
			}
		}
	};

	visitNode(node);
}
