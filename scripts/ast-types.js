/** @typedef {'Node'|'OptionalNode'|'NodeList'|'Annotations'|'InvalidAnnotations'|'String'|'FixedString'|'OptionalString'|'Float'} FieldType */

/** @typedef {[name:string, type:FieldType]} FieldWithType */

/** @typedef {{
 *    astType?: string; // If several converters produce the same type, specify the actual type here
 *    estreeType?: string, // If the extended ESTree type is different from the AST type
 *    hasSameFieldsAs?: string, // If this node uses the same Rust converter as another one, specify the name here. This will skip Rust field constant generation.
 *    fields?: FieldWithType[],  // The non-boolean fields of the node, sorted by parse order
 *    flags?: string[], // The boolean fields of the node
 *    fixed?: Record<string,unknown>, // Any fields with fixed values
 *    fieldTypes?: Record<string,string>, // Add a type cast to a field
 *    additionalFields?: Record<string,string>, // Derived fields can be specified as arbitrary strings here
 *    hiddenFields?: string[], // Fields that are added in Rust but are not part of the AST, usually together with additionalFields
 *    variableNames?: Record<string,string>, // If the field name is not a valid identifier, specify the variable name here
 *    optionalFallback?: Record<string,string> // If an optional variable should not have "null" as fallback, but the value of another field
 *  }} NodeDescription */

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
	AwaitExpression: {
		fields: [['argument', 'Node']]
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
	BlockStatement: {
		fields: [['body', 'NodeList']]
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
		flags: ['optional'],
		variableNames: {
			arguments: 'callArguments'
		}
	},
	CatchClause: {
		fields: [
			['param', 'OptionalNode'],
			['body', 'Node']
		]
	},
	ChainExpression: {
		fields: [['expression', 'Node']]
	},
	ClassBody: {
		fields: [['body', 'NodeList']]
	},
	ClassDeclaration: {
		fields: [
			['id', 'OptionalNode'],
			['superClass', 'OptionalNode'],
			['body', 'Node']
		]
	},
	ClassExpression: {
		hasSameFieldsAs: 'ClassDeclaration'
	},
	ConditionalExpression: {
		fields: [
			['test', 'Node'],
			['consequent', 'Node'],
			['alternate', 'Node']
		]
	},
	ContinueStatement: {
		fields: [['label', 'OptionalNode']]
	},
	DebuggerStatement: {},
	Directive: {
		astType: 'ExpressionStatement',
		estreeType: 'estree.Directive',
		fields: [
			['directive', 'String'],
			['expression', 'Node']
		]
	},
	DoWhileStatement: {
		fields: [
			['body', 'Node'],
			['test', 'Node']
		]
	},
	EmptyStatement: {},
	ExportAllDeclaration: {
		estreeType: 'estree.ExportAllDeclaration & { attributes: ImportAttributeNode[] }',
		fields: [
			['exported', 'OptionalNode'],
			['source', 'Node'],
			['attributes', 'NodeList']
		]
	},
	ExportDefaultDeclaration: {
		fields: [['declaration', 'Node']]
	},
	ExportNamedDeclaration: {
		estreeType: 'estree.ExportNamedDeclaration & { attributes: ImportAttributeNode[] }',
		fields: [
			['specifiers', 'NodeList'],
			['source', 'OptionalNode'],
			['attributes', 'NodeList'],
			['declaration', 'OptionalNode']
		]
	},
	ExportSpecifier: {
		fields: [
			['local', 'Node'],
			['exported', 'OptionalNode']
		],
		optionalFallback: {
			exported: 'local'
		}
	},
	ExpressionStatement: {
		fields: [['expression', 'Node']]
	},
	ForInStatement: {
		fields: [
			['left', 'Node'],
			['right', 'Node'],
			['body', 'Node']
		]
	},
	ForOfStatement: {
		fields: [
			['left', 'Node'],
			['right', 'Node'],
			['body', 'Node']
		],
		flags: ['await'],
		variableNames: {
			await: 'awaited'
		}
	},
	ForStatement: {
		fields: [
			['init', 'OptionalNode'],
			['test', 'OptionalNode'],
			['update', 'OptionalNode'],
			['body', 'Node']
		]
	},
	FunctionDeclaration: {
		fields: [
			['annotations', 'Annotations'],
			['id', 'OptionalNode'],
			['params', 'NodeList'],
			['body', 'Node']
		],
		fixed: {
			expression: false
		},
		flags: ['async', 'generator']
	},
	FunctionExpression: {
		hasSameFieldsAs: 'FunctionDeclaration'
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
	ImportAttribute: {
		estreeType:
			"{ key: estree.Identifier | estree.Literal; type: 'ImportAttribute'; value: estree.Literal; }",
		fields: [
			['key', 'Node'],
			['value', 'Node']
		]
	},
	ImportDeclaration: {
		estreeType: 'estree.ImportDeclaration & { attributes: ImportAttributeNode[] }',
		fields: [
			['specifiers', 'NodeList'],
			['source', 'Node'],
			['attributes', 'NodeList']
		]
	},
	ImportDefaultSpecifier: {
		fields: [['local', 'Node']]
	},
	ImportExpression: {
		estreeType: 'estree.ImportExpression & { options: estree.Expression | null }',
		fields: [
			['source', 'Node'],
			['options', 'OptionalNode']
		]
	},
	ImportNamespaceSpecifier: {
		fields: [['local', 'Node']]
	},
	ImportSpecifier: {
		fields: [
			['imported', 'OptionalNode'],
			['local', 'Node']
		],
		optionalFallback: {
			imported: 'local'
		}
	},
	LabeledStatement: {
		fields: [
			['label', 'Node'],
			['body', 'Node']
		]
	},
	LiteralBigInt: {
		additionalFields: {
			value: 'BigInt(bigint)'
		},
		astType: 'Literal',
		estreeType: 'estree.BigIntLiteral',
		fields: [
			['bigint', 'String'],
			['raw', 'String']
		]
	},
	LiteralBoolean: {
		additionalFields: {
			raw: 'value ? "true" : "false"'
		},
		astType: 'Literal',
		estreeType: 'estree.SimpleLiteral',
		flags: ['value']
	},
	LiteralNull: {
		astType: 'Literal',
		estreeType: 'estree.SimpleLiteral',
		fixed: {
			raw: 'null',
			value: null
		}
	},
	LiteralNumber: {
		astType: 'Literal',
		estreeType: 'estree.SimpleLiteral',
		fields: [
			['raw', 'OptionalString'],
			['value', 'Float']
		]
	},
	LiteralRegExp: {
		additionalFields: {
			raw: '`/${pattern}/${flags}`',
			regex: '{ flags, pattern }',
			value: 'new RegExp(pattern, flags)'
		},
		astType: 'Literal',
		estreeType: 'estree.RegExpLiteral',
		fields: [
			['flags', 'String'],
			['pattern', 'String']
		],
		hiddenFields: ['flags', 'pattern']
	},
	LiteralString: {
		astType: 'Literal',
		estreeType: 'estree.SimpleLiteral',
		fields: [
			['value', 'String'],
			['raw', 'OptionalString']
		]
	},
	LogicalExpression: {
		fieldTypes: {
			operator: 'estree.LogicalOperator'
		},
		hasSameFieldsAs: 'BinaryExpression'
	},
	MemberExpression: {
		fields: [
			['object', 'Node'],
			['property', 'Node']
		],
		flags: ['computed', 'optional']
	},
	MetaProperty: {
		fields: [
			['meta', 'Node'],
			['property', 'Node']
		]
	},
	MethodDefinition: {
		fields: [
			['key', 'Node'],
			['value', 'Node'],
			['kind', 'FixedString']
		],
		fieldTypes: {
			kind: "estree.MethodDefinition['kind']"
		},
		flags: ['computed', 'static'],
		variableNames: {
			static: 'isStatic'
		}
	},
	NewExpression: {
		fields: [
			['annotations', 'Annotations'],
			['callee', 'Node'],
			['arguments', 'NodeList']
		],
		variableNames: {
			arguments: 'callArguments'
		}
	},
	ObjectExpression: {
		fields: [['properties', 'NodeList']]
	},
	ObjectPattern: {
		fields: [['properties', 'NodeList']]
	},
	PrivateIdentifier: {
		fields: [['name', 'String']]
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
	Property: {
		fields: [
			['key', 'OptionalNode'],
			['value', 'Node'],
			['kind', 'FixedString']
		],
		fieldTypes: { kind: "estree.Property['kind']" },
		flags: ['method', 'shorthand', 'computed'],
		optionalFallback: {
			key: 'value'
		}
	},
	PropertyDefinition: {
		fields: [
			['key', 'Node'],
			['value', 'OptionalNode']
		],
		flags: ['computed', 'static'],
		variableNames: {
			static: 'isStatic'
		}
	},
	RestElement: {
		fields: [['argument', 'Node']]
	},
	ReturnStatement: {
		fields: [['argument', 'OptionalNode']]
	},
	SequenceExpression: {
		fields: [['expressions', 'NodeList']]
	},
	SpreadElement: {
		fields: [['argument', 'Node']]
	},
	StaticBlock: {
		fields: [['body', 'NodeList']]
	},
	SuperElement: {
		astType: 'Super',
		estreeType: 'estree.Super'
	},
	SwitchCase: {
		fields: [
			['test', 'OptionalNode'],
			['consequent', 'NodeList']
		]
	},
	SwitchStatement: {
		fields: [
			['discriminant', 'Node'],
			['cases', 'NodeList']
		]
	},
	TaggedTemplateExpression: {
		fields: [
			['tag', 'Node'],
			['quasi', 'Node']
		]
	},
	TemplateElement: {
		additionalFields: {
			value: '{ cooked, raw}'
		},
		fields: [
			['cooked', 'OptionalString'],
			['raw', 'String']
		],
		flags: ['tail'],
		hiddenFields: ['cooked', 'raw']
	},
	TemplateLiteral: {
		fields: [
			['quasis', 'NodeList'],
			['expressions', 'NodeList']
		]
	},
	ThisExpression: {},
	ThrowStatement: {
		fields: [['argument', 'Node']]
	},
	TryStatement: {
		fields: [
			['block', 'Node'],
			['handler', 'OptionalNode'],
			['finalizer', 'OptionalNode']
		]
	},
	UnaryExpression: {
		fields: [
			['operator', 'FixedString'],
			['argument', 'Node']
		],
		fieldTypes: {
			operator: 'estree.UnaryOperator'
		},
		fixed: {
			prefix: true
		}
	},
	UpdateExpression: {
		fields: [
			['operator', 'FixedString'],
			['argument', 'Node']
		],
		fieldTypes: {
			operator: 'estree.UpdateOperator'
		},
		flags: ['prefix']
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
	},
	WhileStatement: {
		fields: [
			['test', 'Node'],
			['body', 'Node']
		]
	},
	YieldExpression: {
		fields: [['argument', 'OptionalNode']],
		flags: ['delegate']
	}
};

export const astNodeNamesWithFieldOrder = Object.entries(AST_NODES).map(([name, node]) => {
	/** @type {FieldWithType[]} */
	const fields =
		(node.hasSameFieldsAs ? AST_NODES[node.hasSameFieldsAs].fields : node.fields) || [];
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
