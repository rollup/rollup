import Identifier from '../ast/nodes/Identifier';
import ImportAttribute from '../ast/nodes/ImportAttribute';
import ImportExpression from '../ast/nodes/ImportExpression';
import Literal, { LiteralValue } from '../ast/nodes/Literal';
import ObjectExpression from '../ast/nodes/ObjectExpression';
import Property from '../ast/nodes/Property';
import SpreadElement from '../ast/nodes/SpreadElement';
import { EMPTY_OBJECT } from './blank';

export function getAssertionsFromImportExpression(node: ImportExpression): Record<string, string> {
	const assertProperty = node.arguments?.[0]?.properties.find(
		(property): property is Property => getPropertyKey(property) === 'assert'
	)?.value;
	if (!assertProperty) {
		return EMPTY_OBJECT;
	}
	const assertFields = (assertProperty as ObjectExpression).properties
		.map(property => {
			const key = getPropertyKey(property);
			if (
				typeof key === 'string' &&
				typeof ((property as Property).value as Literal)?.value === 'string'
			) {
				return [key, ((property as Property).value as Literal).value] as [string, string];
			}
			return null;
		})
		.filter((property): property is [string, string] => !!property);
	if (assertFields.length > 0) {
		return Object.fromEntries(assertFields);
	}
	return EMPTY_OBJECT;
}

const getPropertyKey = (
	property: Property | SpreadElement | ImportAttribute
): LiteralValue | undefined =>
	((property as Property | ImportAttribute).key as Identifier).name ||
	((property as Property | ImportAttribute).key as Literal).value;

export function getAssertionsFromImportExportDeclaration(
	assertions: ImportAttribute[] | undefined
) {
	return assertions?.length
		? Object.fromEntries(
				assertions.map(assertion => [getPropertyKey(assertion), assertion.value.value])
		  )
		: EMPTY_OBJECT;
}

export function doAssertionsDiffer(
	assertionA: Record<string, string>,
	assertionB: Record<string, string>
): boolean {
	const keysA = Object.keys(assertionA);
	return (
		keysA.length !== Object.keys(assertionB).length ||
		keysA.some(key => assertionA[key] !== assertionB[key])
	);
}
