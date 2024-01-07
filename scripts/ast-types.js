/** @typedef {'Node'|'OptionalNode'|'NodeList'|'Annotations'|'InvalidAnnotations'|'String'|'FixedString'|'OptionalString'|'Float'} FieldType */

/** @typedef {[name:string, type:FieldType]} FieldWithType */

/** @typedef {{astType?: string, estreeType?: string, fields?: FieldWithType[], flags?: string[], fixed?: Record<string,unknown>, fieldTypes?: Record<string,string>, additionalFields?: Record<string,string>}} NodeDescription */

/** @type {Record<string, NodeDescription>} */
export const AST_NODES = {
	ArrayExpression: {
		fields: [['elements', 'NodeList']]
	},
	ArrayPattern: {
		fields: [['elements', 'NodeList']]
	},
	ArrowFunctionExpression: {
		fields: [
			['annotations', 'Annotations'],
			['params', 'NodeList'],
			['body', 'Node']
		],
		fixed: {
			id: null
		},
		flags: ['async', 'expression', 'generator']
	},
	AssignmentExpression: {
		fields: [
			['operator', 'FixedString'],
			['left', 'Node'],
			['right', 'Node']
		],
		fieldTypes: {
			operator: 'estree.AssignmentOperator'
		}
	},
	AssignmentPattern: {
		fields: [
			['left', 'Node'],
			['right', 'Node']
		]
	},
	BinaryExpression: {
		fields: [
			['operator', 'FixedString'],
			['left', 'Node'],
			['right', 'Node']
		],
		fieldTypes: {
			operator: 'estree.BinaryOperator'
		}
	},
	BreakStatement: {
		fields: [['label', 'OptionalNode']]
	},
	CallExpression: {
		fields: [
			['annotations', 'Annotations'],
			['callee', 'Node'],
			['arguments', 'NodeList']
		],
		flags: ['optional']
	},
	Directive: {
		astType: 'ExpressionStatement',
		estreeType: 'Directive',
		fields: [
			['directive', 'String'],
			['expression', 'Node']
		]
	},
	ExpressionStatement: {
		fields: [['expression', 'Node']]
	},
	Identifier: {
		fields: [['name', 'String']]
	},
	IfStatement: {
		fields: [
			['test', 'Node'],
			['consequent', 'Node'],
			['alternate', 'OptionalNode']
		]
	},
	LiteralBoolean: {
		additionalFields: {
			raw: 'value ? "true" : "false"'
		},
		astType: 'Literal',
		estreeType: 'SimpleLiteral',
		flags: ['value']
	},
	LiteralNumber: {
		astType: 'Literal',
		estreeType: 'SimpleLiteral',
		fields: [
			['raw', 'OptionalString'],
			['value', 'Float']
		]
	},
	LiteralString: {
		astType: 'Literal',
		estreeType: 'SimpleLiteral',
		fields: [
			['value', 'String'],
			['raw', 'OptionalString']
		]
	},
	LogicalExpression: {
		fields: [
			['operator', 'FixedString'],
			['left', 'Node'],
			['right', 'Node']
		],
		fieldTypes: {
			operator: 'estree.LogicalOperator'
		}
	},
	MemberExpression: {
		fields: [
			['object', 'Node'],
			['property', 'Node']
		],
		flags: ['computed', 'optional']
	},
	Program: {
		fields: [
			['body', 'NodeList'],
			['annotations', 'InvalidAnnotations']
		],
		fixed: {
			sourceType: 'module'
		}
	},
	VariableDeclaration: {
		fields: [
			['kind', 'FixedString'],
			['declarations', 'NodeList']
		],
		fieldTypes: {
			kind: "estree.VariableDeclaration['kind']"
		}
	},
	VariableDeclarator: {
		fields: [
			['id', 'Node'],
			['init', 'OptionalNode']
		]
	}
};

// TODO Lukas FixedString and Float should be part of the type name and ordered and not receive a position. "Simple" should be replaced similarly with adding the field name to the type. The sorting should put the constant length types first and then the rest alphabetically.
// TODO Lukas always add reserved_bytes
export const astNodeNamesWithFieldOrder = Object.entries(AST_NODES).map(([name, node]) => {
	const fields = node.fields || [];
	/** @type {FieldWithType[]} */
	const allFields = [];
	/** @type {FieldWithType[]} */
	const reservedFields = [];
	/** @type {FieldWithType|null|undefined} */
	let inlinedVariableField = undefined;
	for (const field of fields) {
		allFields.push(field);
		switch (field[1]) {
			case 'Annotations':
			case 'InvalidAnnotations':
			case 'String':
			case 'NodeList':
			case 'Node': {
				if (inlinedVariableField === undefined) {
					inlinedVariableField = field;
				} else {
					reservedFields.push(field);
				}
				break;
			}
			case 'OptionalNode': {
				// Optional nodes cannot be inlined, but they also cannot be parsed
				// out-of-order, so nothing is inlined as the inlined node is always
				// parsed first.
				if (inlinedVariableField === undefined) {
					inlinedVariableField = null;
				}
				reservedFields.push(field);
				break;
			}
			case 'OptionalString':
			case 'FixedString':
			case 'Float': {
				reservedFields.push(field);
				break;
			}
			default: {
				throw new Error(`Unknown field type ${field[0]}`);
			}
		}
	}
	return {
		allFields,
		inlinedVariableField,
		name,
		reservedFields
	};
});
