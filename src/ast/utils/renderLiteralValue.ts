import { UnknownValue } from '../nodes/shared/Expression';

export function getRenderedLiteralValue(value: unknown) {
	if (value === undefined) {
		return 'void 0';
	}
	if (typeof value === 'boolean') {
		return String(value);
	}
	if (typeof value === 'string') {
		return JSON.stringify(value);
	}
	if (typeof value === 'number') {
		return getSimplifiedNumber(value);
	}
	return UnknownValue;
}

function getSimplifiedNumber(value: number) {
	if (Object.is(-0, value)) {
		return '-0';
	}
	const exp = value.toExponential();
	const [base, exponent] = exp.split('e');
	const floatLength = base.split('.')[1]?.length || 0;
	const finalizedExp = `${base.replace('.', '')}e${parseInt(exponent) - floatLength}`;
	const stringifiedValue = String(value).replace('+', '');
	return finalizedExp.length < stringifiedValue.length ? finalizedExp : stringifiedValue;
}
