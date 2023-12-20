/** @typedef {'Node'|'NodeList'|'Annotations'|'FixedString'} FieldType */

/** @type {Record<string, {fields?: Record<string,FieldType>, flags?: string[], fixed?: Record<string,unknown>}>} */
export const AST_NODES = {
	ArrayExpression: {
		fields: {
			elements: 'NodeList'
		}
	},
	ArrayPattern: {
		fields: {
			elements: 'NodeList'
		}
	},
	ArrowFunctionExpression: {
		fields: {
			annotations: 'Annotations',
			body: 'Node',
			parameters: 'NodeList'
		},
		fixed: {
			id: null
		},
		flags: ['async', 'expression', 'generator']
	},
	AssignmentExpression: {
		fields: {
			left: 'Node',
			operator: 'FixedString',
			right: 'Node'
		}
	},
	AssignmentPattern: {
		fields: {
			left: 'Node',
			right: 'Node'
		}
	}
};
