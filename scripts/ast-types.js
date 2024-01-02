/** @typedef {'Node'|'OptionalNode'|'NodeList'|'Annotations'|'InvalidAnnotations'|'FixedString'} FieldType */

/** @typedef {{fields?: Record<string,FieldType>, flags?: string[], fixed?: Record<string,unknown>, fieldTypes?: Record<string,string>}} NodeDescription */

/** @type {Record<string, NodeDescription>} */
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
			params: 'NodeList'
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
		},
		fieldTypes: {
			operator: 'estree.AssignmentOperator'
		}
	},
	AssignmentPattern: {
		fields: {
			left: 'Node',
			right: 'Node'
		}
	},
	BreakStatement: {
		fields: {
			label: 'OptionalNode'
		}
	},
	Program: {
		fields: {
			annotations: 'InvalidAnnotations',
			body: 'NodeList'
		},
		fixed: {
			sourceType: 'module'
		}
	}
};

export const astNodeNamesWithFieldOrder = Object.entries(AST_NODES).map(([name, node]) => {
	const fields = node.fields || {};
	const fieldNames = Object.keys(fields);
	return {
		fieldNames,
		isSimple:
			fieldNames.every(name => fields[name] !== 'OptionalNode') &&
			fieldNames.filter(name =>
				['Node', 'NodeList', 'Annotations', 'InvalidAnnotations'].includes(fields[name])
			).length <= 1,
		name
	};
});
