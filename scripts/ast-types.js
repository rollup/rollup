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
 *    baseForAdditionalFields?: string[], // Fields needed to define additional fields
 *    hiddenFields?: string[], // Fields that are added in Rust but are not part of the AST, usually together with additionalFields
 *    variableNames?: Record<string,string>, // If the field name is not a valid identifier, specify the variable name here
 *    optionalFallback?: Record<string,string> // If an optional variable should not have "null" as fallback, but the value of another field,
 *    postProcessFields?: Record<string,[variableName:string, code:string]>, // If this is specified, the field will be extracted into a variable and this code is injected after the field is assigned
 *    scopes?: Record<string, string> // If the field gets a parent scope other than node.scope
 *    scriptedFields?: Record<string,string> // If fields are parsed via custom logic, $position references the node position
 *  }} NodeDescription */

/** @type {Record<string, NodeDescription>} */
export const AST_NODES = {
	PanicError: {
		estreeType: "{ type: 'PanicError', message: string }",
		fields: [['message', 'String']]
	},
	ParseError: {
		estreeType: "{ type: 'ParseError', message: string }",
		fields: [['message', 'String']]
	},
	// eslint-disable-next-line sort-keys
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
		flags: ['async', 'expression', 'generator'],
		postProcessFields: {
			annotations: [
				'annotations',
				"node.annotationNoSideEffects = annotations.some(comment => comment.type === 'noSideEffects')"
			],
			params: [
				'parameters',
				`scope.addParameterVariables(
           parameters.map(
             parameter => parameter.declare('parameter', UNKNOWN_EXPRESSION) as ParameterVariable[]
           ),
           parameters[parameters.length - 1] instanceof RestElement
         );`
			]
		},
		scopes: {
			body: 'scope.bodyScope'
		}
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
		estreeType: 'estree.SimpleCallExpression',
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
		],
		postProcessFields: {
			param: ['parameter', "parameter?.declare('parameter', UNKNOWN_EXPRESSION)"]
		},
		scopes: {
			body: 'scope.bodyScope'
		}
	},
	ChainExpression: {
		fields: [['expression', 'Node']]
	},
	ClassBody: {
		fields: [['body', 'NodeList']],
		scriptedFields: {
			body: `const length = buffer[$position];
        const body: (MethodDefinition | PropertyDefinition)[] = (node.body = []);
        for (let index = 0; index < length; index++) {
          const nodePosition = buffer[$position + 1 + index];
          body.push(
            convertNode(
              node,
              (buffer[nodePosition + 3] & 1) === 0 ? scope.instanceScope : scope,
              nodePosition,
              buffer,
              readString
            )
          );
        }`
		}
	},
	ClassDeclaration: {
		fields: [
			['id', 'OptionalNode'],
			['superClass', 'OptionalNode'],
			['body', 'Node']
		],
		scopes: {
			id: 'scope.parent as ChildScope'
		}
	},
	ClassExpression: {
		hasSameFieldsAs: 'ClassDeclaration',
		scopes: {
			id: 'scope'
		}
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
		flags: ['async', 'generator'],
		postProcessFields: {
			annotations: [
				'annotations',
				"node.annotationNoSideEffects = annotations.some(comment => comment.type === 'noSideEffects')"
			],
			params: [
				'parameters',
				`scope.addParameterVariables(
					 parameters.map(
						 parameter => parameter.declare('parameter', UNKNOWN_EXPRESSION) as ParameterVariable[]
					 ),
					 parameters[parameters.length - 1] instanceof RestElement
				 );`
			]
		},
		scopes: {
			body: 'scope.bodyScope',
			id: 'scope.parent as ChildScope'
		}
	},
	FunctionExpression: {
		hasSameFieldsAs: 'FunctionDeclaration',
		scopes: {
			id: 'node.idScope'
		}
	},
	Identifier: {
		fields: [['name', 'String']]
	},
	IfStatement: {
		fields: [
			['test', 'Node'],
			['consequent', 'Node'],
			['alternate', 'OptionalNode']
		],
		scopes: {
			alternate: '(node.alternateScope = new TrackingScope(scope))',
			consequent: '(node.consequentScope = new TrackingScope(scope))'
		}
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
		],
		scriptedFields: {
			source: `node.source = convertNode(node, scope, $position, buffer, readString);
			  node.sourceAstNode = convertJsonNode($position, buffer, readString);`
		}
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
		baseForAdditionalFields: ['bigint'],
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
		baseForAdditionalFields: ['value'],
		estreeType: 'estree.SimpleLiteral & {value: boolean}',
		flags: ['value']
	},
	LiteralNull: {
		additionalFields: {
			value: 'null'
		},
		astType: 'Literal',
		estreeType: 'estree.SimpleLiteral & {value: null}',
		fixed: {
			raw: 'null'
		}
	},
	LiteralNumber: {
		astType: 'Literal',
		estreeType: 'estree.SimpleLiteral & {value: number}',
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
		baseForAdditionalFields: ['flags', 'pattern'],
		estreeType: 'estree.RegExpLiteral',
		fields: [
			['flags', 'String'],
			['pattern', 'String']
		],
		hiddenFields: ['flags', 'pattern']
	},
	LiteralString: {
		astType: 'Literal',
		estreeType: 'estree.SimpleLiteral & {value: string}',
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
		// "static" needs to come first as ClassBody depends on it
		flags: ['static', 'computed'],
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
			['invalidAnnotations', 'InvalidAnnotations']
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
		// "static" needs to come first as ClassBody depends on it
		flags: ['static', 'computed'],
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
		],
		scopes: {
			discriminant: 'node.parentScope'
		}
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
		baseForAdditionalFields: ['cooked', 'raw'],
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
