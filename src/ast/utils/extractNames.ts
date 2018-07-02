import ArrayPattern from '../nodes/ArrayPattern';
import AssignmentPattern from '../nodes/AssignmentPattern';
import Identifier from '../nodes/Identifier';
import ObjectPattern from '../nodes/ObjectPattern';
import RestElement from '../nodes/RestElement';
import { Node } from '../nodes/shared/Node';

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
			if (prop instanceof RestElement) {
				extractors[prop.argument.type](names, prop.argument);
			} else {
				extractors[prop.value.type](names, prop.value);
			}
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
