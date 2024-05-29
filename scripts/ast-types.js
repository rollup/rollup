/**
 * This file contains the AST node descriptions for the ESTree AST.
 * From this file, "npm run build:ast:converters" will generate
 * - /rust/parse_ast/src/convert_ast/converter/ast_constants.rs:
 *   Constants that describe how the AST nodes are encoded in Rust.
 * - /src/utils/bufferToAst.ts:
 *   Helper functions that are used by this.parse in plugins to convert a buffer
 *   to a JSON AST.
 * - /src/ast/bufferParsers.ts
 *   Helper functions that are used by Module.ts to convert a buffer to an
 *   internal Rollup AST. While this uses roughly the same AST format, it
 *   instantiates the classes in /src/ast/nodes instead.
 * - /src/ast/childNodeKeys.ts
 *   A list of which AST nodes keys represent child nodes. This is used by the
 *   legacy parser to instantiate a Rollup AST from a JSON AST.
 *
 * JavaScript AST nodes follow the ESTree format specified here
 * https://github.com/estree/estree. While the binary buffer format could
 * theoretically deviate from this, it should be either a one-to-one or a
 * many-to-one mapping (Example: All Literal* nodes in the buffer are encoded
 * as "type: Literal" in the JSON AST).
 *
 * For encoded non-JavaScript AST nodes like TypeScript or JSX, we try to follow
 * the format of typescript-eslint, which can be derived from their playground
 * https://typescript-eslint.io/play/#showAST=es&fileType=.tsx
 */

/** @typedef {"Node"|"OptionalNode"|"NodeList"|"Annotations"|"InvalidAnnotations"|"String"|"FixedString"|"OptionalString"|"Float"} FieldType */

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
 *    useMacro?: boolean // Generate a Rust macro instead of separate constants
 *  }} NodeDescription */

/** @type {Record<string, NodeDescription>} */
export const AST_NODES = {
	PanicError: {
		estreeType: "{ type: 'PanicError', message: string }",
		fields: [['message', 'String']],
		useMacro: false
	},
	ParseError: {
		estreeType: "{ type: 'ParseError', message: string }",
		fields: [['message', 'String']],
		useMacro: false
	},
	// eslint-disable-next-line sort-keys
	ArrayExpression: {
		fields: [['elements', 'NodeList']],
		useMacro: false
	},
	ArrayPattern: {
		fields: [['elements', 'NodeList']],
		useMacro: false
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
		},
		useMacro: false
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
		],
		useMacro: false
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
		},
		useMacro: false
	},
	BlockStatement: {
		fields: [['body', 'NodeList']],
		useMacro: false
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
		useMacro: false,
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
		},
		useMacro: false
	},
	ChainExpression: {
		fields: [['expression', 'Node']],
		useMacro: false
	},
	ClassBody: {
		fields: [['body', 'NodeList']],
		scriptedFields: {
			body: ` const bodyPosition = $position;
        const body: (MethodDefinition | PropertyDefinition)[] = (node.body = []);
			  if (bodyPosition) {
			    const length = buffer[bodyPosition];
          for (let index = 0; index < length; index++) {
            const nodePosition = buffer[bodyPosition + 1 + index];
            body.push(
              convertNode(
                node,
                (buffer[nodePosition + 3] & 1) === 0 ? scope.instanceScope : scope,
                nodePosition,
                buffer,
                readString
              )
            );
          }
        }`
		},
		useMacro: false
	},
	ClassDeclaration: {
		fields: [
			['id', 'OptionalNode'],
			['superClass', 'OptionalNode'],
			['body', 'Node']
		],
		scopes: {
			id: 'scope.parent as ChildScope'
		},
		useMacro: false
	},
	ClassExpression: {
		hasSameFieldsAs: 'ClassDeclaration',
		scopes: {
			id: 'scope'
		},
		useMacro: false
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
		],
		useMacro: false
	},
	ExportDefaultDeclaration: {
		fields: [['declaration', 'Node']],
		useMacro: false
	},
	ExportNamedDeclaration: {
		estreeType: 'estree.ExportNamedDeclaration & { attributes: ImportAttributeNode[] }',
		fields: [
			['specifiers', 'NodeList'],
			['source', 'OptionalNode'],
			['attributes', 'NodeList'],
			['declaration', 'OptionalNode']
		],
		useMacro: false
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
		},
		useMacro: false
	},
	FunctionExpression: {
		hasSameFieldsAs: 'FunctionDeclaration',
		scopes: {
			id: 'node.idScope'
		},
		useMacro: false
	},
	Identifier: {
		fields: [['name', 'String']],
		useMacro: false
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
		],
		useMacro: false
	},
	ImportDeclaration: {
		estreeType: 'estree.ImportDeclaration & { attributes: ImportAttributeNode[] }',
		fields: [
			['specifiers', 'NodeList'],
			['source', 'Node'],
			['attributes', 'NodeList']
		],
		useMacro: false
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
		},
		useMacro: false
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
		flags: ['value'],
		useMacro: false
	},
	LiteralNull: {
		additionalFields: {
			value: 'null'
		},
		astType: 'Literal',
		estreeType: 'estree.SimpleLiteral & {value: null}',
		fixed: {
			raw: 'null'
		},
		useMacro: false
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
		hiddenFields: ['flags', 'pattern'],
		useMacro: false
	},
	LiteralString: {
		astType: 'Literal',
		estreeType: 'estree.SimpleLiteral & {value: string}',
		fields: [
			['value', 'String'],
			['raw', 'OptionalString']
		],
		useMacro: false
	},
	LogicalExpression: {
		fieldTypes: {
			operator: 'estree.LogicalOperator'
		},
		hasSameFieldsAs: 'BinaryExpression',
		useMacro: false
	},
	MemberExpression: {
		fields: [
			['object', 'Node'],
			['property', 'Node']
		],
		flags: ['computed', 'optional'],
		useMacro: false
	},
	MetaProperty: {
		fields: [
			['meta', 'Node'],
			['property', 'Node']
		],
		useMacro: false
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
		useMacro: false,
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
		useMacro: false,
		variableNames: {
			arguments: 'callArguments'
		}
	},
	ObjectExpression: {
		fields: [['properties', 'NodeList']],
		useMacro: false
	},
	ObjectPattern: {
		fields: [['properties', 'NodeList']],
		useMacro: false
	},
	PrivateIdentifier: {
		fields: [['name', 'String']],
		useMacro: false
	},
	Program: {
		fields: [
			['body', 'NodeList'],
			['invalidAnnotations', 'InvalidAnnotations']
		],
		fixed: {
			sourceType: 'module'
		},
		useMacro: false
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
		},
		useMacro: false
	},
	PropertyDefinition: {
		fields: [
			['key', 'Node'],
			['value', 'OptionalNode']
		],
		// "static" needs to come first as ClassBody depends on it
		flags: ['static', 'computed'],
		useMacro: false,
		variableNames: {
			static: 'isStatic'
		}
	},
	RestElement: {
		fields: [['argument', 'Node']],
		useMacro: false
	},
	ReturnStatement: {
		fields: [['argument', 'OptionalNode']]
	},
	SequenceExpression: {
		fields: [['expressions', 'NodeList']],
		useMacro: false
	},
	SpreadElement: {
		fields: [['argument', 'Node']],
		useMacro: false
	},
	StaticBlock: {
		fields: [['body', 'NodeList']],
		useMacro: false
	},
	SuperElement: {
		astType: 'Super',
		estreeType: 'estree.Super',
		useMacro: false
	},
	SwitchCase: {
		fields: [
			['test', 'OptionalNode'],
			['consequent', 'NodeList']
		],
		useMacro: false
	},
	SwitchStatement: {
		fields: [
			['discriminant', 'Node'],
			['cases', 'NodeList']
		],
		scopes: {
			discriminant: 'node.parentScope'
		},
		useMacro: false
	},
	TaggedTemplateExpression: {
		fields: [
			['tag', 'Node'],
			['quasi', 'Node']
		],
		useMacro: false
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
		hiddenFields: ['cooked', 'raw'],
		useMacro: false
	},
	TemplateLiteral: {
		fields: [
			['quasis', 'NodeList'],
			['expressions', 'NodeList']
		],
		useMacro: false
	},
	ThisExpression: {},
	ThrowStatement: {
		fields: [['argument', 'Node']],
		useMacro: false
	},
	TryStatement: {
		fields: [
			['block', 'Node'],
			['handler', 'OptionalNode'],
			['finalizer', 'OptionalNode']
		],
		useMacro: false
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
		},
		useMacro: false
	},
	UpdateExpression: {
		fields: [
			['operator', 'FixedString'],
			['argument', 'Node']
		],
		fieldTypes: {
			operator: 'estree.UpdateOperator'
		},
		flags: ['prefix'],
		useMacro: false
	},
	VariableDeclaration: {
		fields: [
			['kind', 'FixedString'],
			['declarations', 'NodeList']
		],
		fieldTypes: {
			kind: "estree.VariableDeclaration['kind']"
		},
		useMacro: false
	},
	VariableDeclarator: {
		fields: [
			['id', 'Node'],
			['init', 'OptionalNode']
		],
		useMacro: false
	},
	WhileStatement: {
		fields: [
			['test', 'Node'],
			['body', 'Node']
		],
		useMacro: false
	},
	YieldExpression: {
		fields: [['argument', 'OptionalNode']],
		flags: ['delegate']
	}
};

/** @type { {name: string; fields: FieldWithType[]; node: NodeDescription; originalNode: NodeDescription;}[] } */
export const astNodeNamesWithFieldOrder = Object.entries(AST_NODES).map(([name, originalNode]) => {
	const node = originalNode.hasSameFieldsAs
		? AST_NODES[originalNode.hasSameFieldsAs]
		: originalNode;
	return {
		fields: node.fields || [],
		name,
		node,
		originalNode
	};
});
