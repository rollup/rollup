import Node from '../Node';

export default class TemplateElement extends Node {
	type: 'TemplateElement';
	tail: boolean;
	value: {
		cooked: string;
		raw: string;
	};

	hasEffects () {
		return false;
	}
}
