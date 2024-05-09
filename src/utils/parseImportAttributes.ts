import type Identifier from '../ast/nodes/Identifier';
import type ImportAttribute from '../ast/nodes/ImportAttribute';
import type ImportExpression from '../ast/nodes/ImportExpression';
import type { default as Literal, LiteralValue } from '../ast/nodes/Literal';
import ObjectExpression from '../ast/nodes/ObjectExpression';
import type Property from '../ast/nodes/Property';
import type SpreadElement from '../ast/nodes/SpreadElement';
import { EMPTY_OBJECT } from './blank';
import { LOGLEVEL_WARN } from './logging';
import { logImportAttributeIsInvalid, logImportOptionsAreInvalid } from './logs';

const ATTRIBUTE_KEYWORDS = new Set(['assert', 'with']);

export function getAttributesFromImportExpression(node: ImportExpression): Record<string, string> {
	const {
		scope: { context },
		options,
		start
	} = node;
	if (!(options instanceof ObjectExpression)) {
		if (options) {
			context.module.log(LOGLEVEL_WARN, logImportAttributeIsInvalid(context.module.id), start);
		}
		return EMPTY_OBJECT;
	}
	const assertProperty = options.properties.find((property): property is Property =>
		ATTRIBUTE_KEYWORDS.has(getPropertyKey(property) as string)
	)?.value;
	if (!assertProperty) {
		return EMPTY_OBJECT;
	}
	if (!(assertProperty instanceof ObjectExpression)) {
		context.module.log(LOGLEVEL_WARN, logImportOptionsAreInvalid(context.module.id), start);
		return EMPTY_OBJECT;
	}
	const assertFields = (assertProperty as ObjectExpression).properties
		.map(property => {
			const key = getPropertyKey(property);
			if (
				typeof key === 'string' &&
				typeof ((property as Property).value as Literal).value === 'string'
			) {
				return [key, ((property as Property).value as Literal).value] as [string, string];
			}
			context.module.log(
				LOGLEVEL_WARN,
				logImportAttributeIsInvalid(context.module.id),
				property.start
			);
			return null;
		})
		.filter((property): property is [string, string] => !!property);
	if (assertFields.length > 0) {
		return Object.fromEntries(assertFields);
	}
	return EMPTY_OBJECT;
}

const getPropertyKey = (property: Property | SpreadElement | ImportAttribute): LiteralValue => {
	const key = (property as Property | ImportAttribute).key;
	return (
		key &&
		!(property as Property).computed &&
		((key as Identifier).name || (key as Literal<string>).value)
	);
};

export function getAttributesFromImportExportDeclaration(
	attributes: ImportAttribute[]
): Record<string, string> {
	return attributes?.length
		? Object.fromEntries(
				attributes.map(assertion => [getPropertyKey(assertion), assertion.value.value])
			)
		: EMPTY_OBJECT;
}

export function doAttributesDiffer(
	assertionA: Record<string, string>,
	assertionB: Record<string, string>
): boolean {
	const keysA = Object.keys(assertionA);
	return (
		keysA.length !== Object.keys(assertionB).length ||
		keysA.some(key => assertionA[key] !== assertionB[key])
	);
}
