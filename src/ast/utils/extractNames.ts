import Identifier from '../nodes/Identifier';
import { Node } from '../nodes/shared/Node';
import ObjectPattern from '../nodes/ObjectPattern';
import ArrayPattern from '../nodes/ArrayPattern';
import RestElement from '../nodes/RestElement';
import AssignmentPattern from '../nodes/AssignmentPattern';

export default function extractNames(param: Node) {
	const names: string[] = [];
	extractors[param.type](names, param);
	return names;
}

interface Extractors {
	[nodeType: string]: (names: string[], param: Node) => void;
}

const extractors: Extractors = {
	Identifier(names, param: Identifier) {
		names.push(param.name);
	},

	ObjectPattern(names, param: ObjectPattern) {
		param.properties.forEach(prop => {
			extractors[prop.value.type](names, prop.value);
		});
	},

	ArrayPattern(names, param: ArrayPattern) {
		param.elements.forEach(element => {
			if (element) extractors[element.type](names, element);
		});
	},

	RestElement(names, param: RestElement) {
		extractors[param.argument.type](names, param.argument);
	},

	AssignmentPattern(names, param: AssignmentPattern) {
		extractors[param.left.type](names, param.left);
	}
};
