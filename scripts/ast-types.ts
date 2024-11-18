/**
 * This file contains the AST node descriptions for the ESTree AST.
 * From this file, "npm run build:ast-converters" will generate
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
 * the format of typescript-eslint, which can be derived from
 * @typescript-eslint/types/dist/generated/ast-spec.d.ts
 */

export type AstNodeName =
	| 'PanicError'
	| 'ParseError'
	| 'ArrayExpression'
	| 'ArrayPattern'
	| 'ArrowFunctionExpression'
	| 'AssignmentExpression'
	| 'AssignmentPattern'
	| 'AwaitExpression'
	| 'BinaryExpression'
	| 'BlockStatement'
	| 'BreakStatement'
	| 'CallExpression'
	| 'CatchClause'
	| 'ChainExpression'
	| 'ClassBody'
	| 'ClassDeclaration'
	| 'ClassExpression'
	| 'ConditionalExpression'
	| 'ContinueStatement'
	| 'DebuggerStatement'
	| 'Decorator'
	| 'Directive'
	| 'DoWhileStatement'
	| 'EmptyStatement'
	| 'ExportAllDeclaration'
	| 'ExportDefaultDeclaration'
	| 'ExportNamedDeclaration'
	| 'ExportSpecifier'
	| 'ExpressionStatement'
	| 'ForInStatement'
	| 'ForOfStatement'
	| 'ForStatement'
	| 'FunctionDeclaration'
	| 'FunctionExpression'
	| 'Identifier'
	| 'IfStatement'
	| 'ImportAttribute'
	| 'ImportDeclaration'
	| 'ImportDefaultSpecifier'
	| 'ImportExpression'
	| 'ImportNamespaceSpecifier'
	| 'ImportSpecifier'
	| 'JSXAttribute'
	| 'JSXClosingElement'
	| 'JSXClosingFragment'
	| 'JSXElement'
	| 'JSXEmptyExpression'
	| 'JSXExpressionContainer'
	| 'JSXFragment'
	| 'JSXIdentifier'
	| 'JSXMemberExpression'
	| 'JSXNamespacedName'
	| 'JSXOpeningElement'
	| 'JSXOpeningFragment'
	| 'JSXSpreadAttribute'
	| 'JSXSpreadChild'
	| 'JSXText'
	| 'LabeledStatement'
	| 'LiteralBigInt'
	| 'LiteralBoolean'
	| 'LiteralNull'
	| 'LiteralNumber'
	| 'LiteralRegExp'
	| 'LiteralString'
	| 'LogicalExpression'
	| 'MemberExpression'
	| 'MetaProperty'
	| 'MethodDefinition'
	| 'NewExpression'
	| 'ObjectExpression'
	| 'ObjectPattern'
	| 'PrivateIdentifier'
	| 'Program'
	| 'Property'
	| 'PropertyDefinition'
	| 'RestElement'
	| 'ReturnStatement'
	| 'SequenceExpression'
	| 'SpreadElement'
	| 'StaticBlock'
	| 'Super'
	| 'SwitchCase'
	| 'SwitchStatement'
	| 'TaggedTemplateExpression'
	| 'TemplateElement'
	| 'TemplateLiteral'
	| 'ThisExpression'
	| 'ThrowStatement'
	| 'TryStatement'
	| 'UnaryExpression'
	| 'UpdateExpression'
	| 'VariableDeclaration'
	| 'VariableDeclarator'
	| 'WhileStatement'
	| 'YieldExpression';

export type AstUnionName =
	| 'BindingPattern'
	| 'DestructuringPattern'
	| 'Expression'
	| 'JSXTagNameExpression'
	| 'JSXChild'
	| 'Literal'
	| 'ModuleDeclaration'
	| 'Parameter'
	| 'Statement';

export type AstTypeName = AstNodeName | AstUnionName;

export const NODE_UNION_TYPES: Record<AstUnionName, AstTypeName[]> = {
	// Everything that can be used to declare bindings
	BindingPattern: ['Identifier', 'ArrayPattern', 'ObjectPattern'],
	// Everything that can be used for destructuring; MemberExpression is included
	// here because it can be used in destructuring assignments
	DestructuringPattern: ['AssignmentPattern', 'BindingPattern', 'MemberExpression', 'RestElement'],
	Expression: [
		'ArrayExpression',
		'ArrowFunctionExpression',
		'AssignmentExpression',
		'AwaitExpression',
		'BinaryExpression',
		'CallExpression',
		'ChainExpression',
		'ClassExpression',
		'ConditionalExpression',
		'FunctionExpression',
		'Identifier',
		'ImportExpression',
		'Literal',
		'LogicalExpression',
		'MemberExpression',
		'MetaProperty',
		'NewExpression',
		'ObjectExpression',
		'SequenceExpression',
		'TaggedTemplateExpression',
		'TemplateLiteral',
		'ThisExpression',
		'UnaryExpression',
		'UpdateExpression',
		'YieldExpression'
	],
	JSXChild: ['JSXElement', 'JSXExpressionContainer', 'JSXSpreadChild', 'JSXFragment', 'JSXText'],
	JSXTagNameExpression: ['JSXMemberExpression', 'JSXIdentifier', 'JSXNamespacedName'],
	Literal: [
		'LiteralBigInt',
		'LiteralBoolean',
		'LiteralNull',
		'LiteralNumber',
		'LiteralRegExp',
		'LiteralString'
	],
	ModuleDeclaration: [
		'ExportAllDeclaration',
		'ExportDefaultDeclaration',
		'ExportNamedDeclaration',
		'ImportDeclaration'
	],
	Parameter: ['BindingPattern', 'AssignmentPattern', 'RestElement'],
	Statement: [
		'BlockStatement',
		'BreakStatement',
		'ClassDeclaration',
		'ContinueStatement',
		'DebuggerStatement',
		'DoWhileStatement',
		'EmptyStatement',
		'ExpressionStatement',
		'ForInStatement',
		'ForOfStatement',
		'ForStatement',
		'FunctionDeclaration',
		'IfStatement',
		'LabeledStatement',
		'ReturnStatement',
		'StaticBlock',
		'SwitchStatement',
		'ThrowStatement',
		'TryStatement',
		'VariableDeclaration',
		'WhileStatement'
	]
};

export const AST_NODES: Record<AstNodeName, NodeDescription> = {
	PanicError: {
		fields: [{ name: 'message', type: 'String' }],
		useMacro: false
	},
	ParseError: {
		fields: [{ name: 'message', type: 'String' }],
		useMacro: false
	},
	// eslint-disable-next-line sort-keys
	ArrayExpression: {
		fields: [
			{
				allowNull: true,
				name: 'elements',
				nodeTypes: ['Expression', 'SpreadElement'],
				type: 'NodeList'
			}
		],
		useMacro: false
	},
	ArrayPattern: {
		fields: [
			{ allowNull: true, name: 'elements', nodeTypes: ['DestructuringPattern'], type: 'NodeList' }
		],
		useMacro: false
	},
	ArrowFunctionExpression: {
		fields: [
			{ name: 'annotations', type: 'Annotations', valid: true },
			{ name: 'params', nodeTypes: ['Parameter'], type: 'NodeList' },
			{ name: 'body', nodeTypes: ['BlockStatement', 'Expression'], type: 'Node' }
		],
		fixed: {
			// TODO Lukas remove
			id: 'null'
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
             parameter => parameter.declare('parameter', EMPTY_PATH, UNKNOWN_EXPRESSION) as ParameterVariable[]
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
			{
				name: 'operator',
				type: 'FixedString',
				values: [
					'=',
					'+=',
					'-=',
					'*=',
					'/=',
					'%=',
					'**=',
					'<<=',
					'>>=',
					'>>>=',
					'|=',
					'^=',
					'&=',
					'||=',
					'&&=',
					'??='
				]
			},
			{ name: 'left', nodeTypes: ['DestructuringPattern'], type: 'Node' },
			{ name: 'right', nodeTypes: ['Expression'], type: 'Node' }
		]
	},
	AssignmentPattern: {
		fields: [
			{ name: 'left', nodeTypes: ['BindingPattern'], type: 'Node' },
			{ name: 'right', nodeTypes: ['Expression'], type: 'Node' }
		],
		useMacro: false
	},
	AwaitExpression: {
		fields: [{ name: 'argument', nodeTypes: ['Expression'], type: 'Node' }]
	},
	BinaryExpression: {
		fields: [
			{
				name: 'operator',
				type: 'FixedString',
				values: [
					'==',
					'!=',
					'===',
					'!==',
					'<',
					'<=',
					'>',
					'>=',
					'<<',
					'>>',
					'>>>',
					'+',
					'-',
					'*',
					'/',
					'%',
					'**',
					'^',
					'&',
					'|',
					'in',
					'instanceof'
				]
			},
			{ name: 'left', nodeTypes: ['Expression', 'PrivateIdentifier'], type: 'Node' },
			{ name: 'right', nodeTypes: ['Expression'], type: 'Node' }
		],
		useMacro: false
	},
	BlockStatement: {
		fields: [{ name: 'body', nodeTypes: ['Statement'], type: 'NodeList' }],
		useMacro: false
	},
	BreakStatement: {
		fields: [{ allowNull: true, name: 'label', nodeTypes: ['Identifier'], type: 'Node' }]
	},
	CallExpression: {
		fields: [
			{ name: 'annotations', type: 'Annotations', valid: true },
			{ name: 'callee', nodeTypes: ['Expression', 'Super'], type: 'Node' },
			{ name: 'arguments', nodeTypes: ['Expression', 'SpreadElement'], type: 'NodeList' }
		],
		flags: ['optional'],
		useMacro: false
	},
	CatchClause: {
		fields: [
			{ allowNull: true, name: 'param', nodeTypes: ['BindingPattern'], type: 'Node' },
			{ name: 'body', nodeTypes: ['BlockStatement'], type: 'Node' }
		],
		postProcessFields: {
			param: ['parameter', "parameter?.declare('parameter', EMPTY_PATH, UNKNOWN_EXPRESSION)"]
		},
		scopes: {
			body: 'scope.bodyScope'
		},
		useMacro: false
	},
	ChainExpression: {
		fields: [
			{ name: 'expression', nodeTypes: ['CallExpression', 'MemberExpression'], type: 'Node' }
		],
		useMacro: false
	},
	ClassBody: {
		fields: [
			{
				name: 'body',
				nodeTypes: ['MethodDefinition', 'PropertyDefinition', 'StaticBlock'],
				type: 'NodeList'
			}
		],
		scriptedFields: {
			body: ` const bodyPosition = $position;
			  if (bodyPosition) {
			    const length = buffer[bodyPosition];
			    const body: (MethodDefinition | PropertyDefinition)[] = (node.body = new Array(length));
          for (let index = 0; index < length; index++) {
            const nodePosition = buffer[bodyPosition + 1 + index];
            body[index] = convertNode(
                node,
                (buffer[nodePosition + 3] & 1) === 0 ? scope.instanceScope : scope,
                nodePosition,
                buffer
            );
          }
        } else {
          node.body = [];
        }`
		},
		useMacro: false
	},
	ClassDeclaration: {
		fields: [
			{ name: 'decorators', nodeTypes: ['Decorator'], type: 'NodeList' },
			{ allowNull: true, name: 'id', nodeTypes: ['Identifier'], type: 'Node' },
			{ allowNull: true, name: 'superClass', nodeTypes: ['Expression'], type: 'Node' },
			{ name: 'body', nodeTypes: ['ClassBody'], type: 'Node' }
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
			{ name: 'test', nodeTypes: ['Expression'], type: 'Node' },
			{ name: 'consequent', nodeTypes: ['Expression'], type: 'Node' },
			{ name: 'alternate', nodeTypes: ['Expression'], type: 'Node' }
		]
	},
	ContinueStatement: {
		fields: [{ allowNull: true, name: 'label', nodeTypes: ['Identifier'], type: 'Node' }]
	},
	DebuggerStatement: {},
	Decorator: {
		fields: [{ name: 'expression', nodeTypes: ['Expression'], type: 'Node' }]
	},
	Directive: {
		astType: 'ExpressionStatement',
		fields: [
			{ name: 'directive', type: 'String' },
			{ name: 'expression', nodeTypes: ['LiteralString'], type: 'Node' }
		]
	},
	DoWhileStatement: {
		fields: [
			{ name: 'body', nodeTypes: ['Statement'], type: 'Node' },
			{ name: 'test', nodeTypes: ['Expression'], type: 'Node' }
		]
	},
	EmptyStatement: {},
	ExportAllDeclaration: {
		fields: [
			{ allowNull: true, name: 'exported', nodeTypes: ['Identifier'], type: 'Node' },
			{ name: 'source', nodeTypes: ['LiteralString'], type: 'Node' },
			{ name: 'attributes', nodeTypes: ['ImportAttribute'], type: 'NodeList' }
		],
		useMacro: false
	},
	ExportDefaultDeclaration: {
		fields: [
			{
				name: 'declaration',
				nodeTypes: ['FunctionDeclaration', 'ClassDeclaration', 'Expression'],
				type: 'Node'
			}
		],
		useMacro: false
	},
	ExportNamedDeclaration: {
		fields: [
			{ name: 'specifiers', nodeTypes: ['ExportSpecifier'], type: 'NodeList' },
			{ allowNull: true, name: 'source', nodeTypes: ['Literal'], type: 'Node' },
			{ name: 'attributes', nodeTypes: ['ImportAttribute'], type: 'NodeList' },
			{
				allowNull: true,
				name: 'declaration',
				nodeTypes: ['FunctionDeclaration', 'VariableDeclaration', 'ClassDeclaration'],
				type: 'Node'
			}
		],
		useMacro: false
	},
	ExportSpecifier: {
		fields: [
			{ name: 'local', nodeTypes: ['Identifier', 'LiteralString'], type: 'Node' },
			{
				allowNull: true,
				name: 'exported',
				nodeTypes: ['Identifier', 'LiteralString'],
				type: 'Node'
			}
		],
		optionalFallback: {
			exported: 'local'
		}
	},
	ExpressionStatement: {
		fields: [{ name: 'expression', nodeTypes: ['Expression'], type: 'Node' }]
	},
	ForInStatement: {
		fields: [
			{ name: 'left', nodeTypes: ['VariableDeclaration', 'DestructuringPattern'], type: 'Node' },
			{ name: 'right', nodeTypes: ['Expression'], type: 'Node' },
			{ name: 'body', nodeTypes: ['Statement'], type: 'Node' }
		]
	},
	ForOfStatement: {
		fields: [
			{ name: 'left', nodeTypes: ['VariableDeclaration', 'DestructuringPattern'], type: 'Node' },
			{ name: 'right', nodeTypes: ['Expression'], type: 'Node' },
			{ name: 'body', nodeTypes: ['Statement'], type: 'Node' }
		],
		flags: ['await']
	},
	ForStatement: {
		fields: [
			{
				allowNull: true,
				name: 'init',
				nodeTypes: ['Expression', 'VariableDeclaration'],
				type: 'Node'
			},
			{ allowNull: true, name: 'test', nodeTypes: ['Expression'], type: 'Node' },
			{ allowNull: true, name: 'update', nodeTypes: ['Expression'], type: 'Node' },
			{ name: 'body', nodeTypes: ['Statement'], type: 'Node' }
		]
	},
	FunctionDeclaration: {
		fields: [
			{ name: 'annotations', type: 'Annotations', valid: true },
			{ allowNull: true, name: 'id', nodeTypes: ['Identifier'], type: 'Node' },
			{ name: 'params', nodeTypes: ['Parameter'], type: 'NodeList' },
			{ name: 'body', nodeTypes: ['BlockStatement'], type: 'Node' }
		],
		fixed: {
			// TODO Lukas remove
			expression: 'false'
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
						 parameter => parameter.declare('parameter', EMPTY_PATH, UNKNOWN_EXPRESSION) as ParameterVariable[]
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
		fields: [{ name: 'name', type: 'String' }],
		useMacro: false
	},
	IfStatement: {
		fields: [
			{ name: 'test', nodeTypes: ['Expression'], type: 'Node' },
			{ name: 'consequent', nodeTypes: ['Statement'], type: 'Node' },
			{ allowNull: true, name: 'alternate', nodeTypes: ['Statement'], type: 'Node' }
		],
		scopes: {
			alternate: '(node.alternateScope = new TrackingScope(scope))',
			consequent: '(node.consequentScope = new TrackingScope(scope))'
		}
	},
	ImportAttribute: {
		fields: [
			{ name: 'key', nodeTypes: ['Identifier', 'Literal'], type: 'Node' },
			{ name: 'value', nodeTypes: ['Literal'], type: 'Node' }
		],
		useMacro: false
	},
	ImportDeclaration: {
		fields: [
			{
				name: 'specifiers',
				nodeTypes: ['ImportDefaultSpecifier', 'ImportNamespaceSpecifier', 'ImportSpecifier'],
				type: 'NodeList'
			},
			{ name: 'source', nodeTypes: ['LiteralString'], type: 'Node' },
			{ name: 'attributes', nodeTypes: ['ImportAttribute'], type: 'NodeList' }
		],
		useMacro: false
	},
	ImportDefaultSpecifier: {
		fields: [{ name: 'local', nodeTypes: ['Identifier'], type: 'Node' }]
	},
	ImportExpression: {
		fields: [
			{ name: 'source', nodeTypes: ['Expression'], type: 'Node' },
			// TODO Lukas this should be "attributes"
			{ allowNull: true, name: 'options', nodeTypes: ['Expression'], type: 'Node' }
		],
		scriptedFields: {
			source: `node.source = convertNode(node, scope, $position, buffer);
			  node.sourceAstNode = convertJsonNode($position, buffer);`
		},
		useMacro: false
	},
	ImportNamespaceSpecifier: {
		fields: [{ name: 'local', nodeTypes: ['Identifier'], type: 'Node' }]
	},
	ImportSpecifier: {
		fields: [
			{ allowNull: true, name: 'imported', nodeTypes: ['Identifier', 'Literal'], type: 'Node' },
			{ name: 'local', nodeTypes: ['Identifier'], type: 'Node' }
		],
		optionalFallback: {
			imported: 'local'
		}
	},
	JSXAttribute: {
		fields: [
			{ name: 'name', nodeTypes: ['JSXIdentifier', 'JSXNamespacedName'], type: 'Node' },
			{
				allowNull: true,
				name: 'value',
				nodeTypes: ['JSXElement', 'JSXExpressionContainer', 'JSXSpreadChild', 'Literal'],
				type: 'Node'
			}
		]
	},
	JSXClosingElement: {
		fields: [{ name: 'name', nodeTypes: ['JSXTagNameExpression'], type: 'Node' }]
	},
	JSXClosingFragment: {
		fields: []
	},
	JSXElement: {
		fields: [
			{ name: 'openingElement', nodeTypes: ['JSXOpeningElement'], type: 'Node' },
			{ name: 'children', nodeTypes: ['JSXChild'], type: 'NodeList' },
			{ allowNull: true, name: 'closingElement', nodeTypes: ['JSXClosingElement'], type: 'Node' }
		]
	},
	JSXEmptyExpression: {
		useMacro: false
	},
	JSXExpressionContainer: {
		fields: [{ name: 'expression', nodeTypes: ['Expression', 'JSXEmptyExpression'], type: 'Node' }],
		useMacro: false
	},
	JSXFragment: {
		fields: [
			{ name: 'openingFragment', nodeTypes: ['JSXOpeningFragment'], type: 'Node' },
			{ name: 'children', nodeTypes: ['JSXChild'], type: 'NodeList' },
			{ name: 'closingFragment', nodeTypes: ['JSXClosingFragment'], type: 'Node' }
		]
	},
	JSXIdentifier: {
		fields: [{ name: 'name', type: 'String' }]
	},
	JSXMemberExpression: {
		fields: [
			{ name: 'object', nodeTypes: ['JSXTagNameExpression'], type: 'Node' },
			{ name: 'property', nodeTypes: ['JSXIdentifier'], type: 'Node' }
		],
		useMacro: false
	},
	JSXNamespacedName: {
		fields: [
			{ name: 'namespace', nodeTypes: ['JSXIdentifier'], type: 'Node' },
			{ name: 'name', nodeTypes: ['JSXIdentifier'], type: 'Node' }
		],
		useMacro: false
	},
	JSXOpeningElement: {
		fields: [
			{ name: 'name', nodeTypes: ['JSXTagNameExpression'], type: 'Node' },
			{ name: 'attributes', nodeTypes: ['JSXAttribute', 'JSXSpreadAttribute'], type: 'NodeList' }
		],
		flags: ['selfClosing'],
		useMacro: false
	},
	JSXOpeningFragment: {
		additionalFields: {
			attributes: { type: 'never[]', value: '[]' },
			selfClosing: { type: 'false', value: 'false' }
		}
	},
	JSXSpreadAttribute: {
		fields: [{ name: 'argument', nodeTypes: ['Expression'], type: 'Node' }],
		useMacro: false
	},
	JSXSpreadChild: {
		fields: [{ name: 'expression', nodeTypes: ['Expression', 'JSXEmptyExpression'], type: 'Node' }]
	},
	JSXText: {
		fields: [
			{ name: 'value', type: 'String' },
			{ name: 'raw', type: 'String' }
		]
	},
	LabeledStatement: {
		fields: [
			{ name: 'label', nodeTypes: ['Identifier'], type: 'Node' },
			{ name: 'body', nodeTypes: ['Statement'], type: 'Node' }
		]
	},
	LiteralBigInt: {
		additionalFields: {
			value: { type: 'bigint', value: 'BigInt(bigint)' }
		},
		astType: 'Literal',
		baseForAdditionalFields: ['bigint'],
		fields: [
			{ name: 'bigint', type: 'String' },
			{ name: 'raw', type: 'String' }
		]
	},
	LiteralBoolean: {
		additionalFields: {
			raw: { type: 'string', value: 'value ? "true" : "false"' }
		},
		astType: 'Literal',
		baseForAdditionalFields: ['value'],
		flags: ['value']
	},
	LiteralNull: {
		additionalFields: {
			value: { type: 'null', value: 'null' }
		},
		astType: 'Literal',
		fixed: {
			raw: '"null"'
		}
	},
	LiteralNumber: {
		astType: 'Literal',
		fields: [
			{ name: 'raw', optional: true, type: 'String' },
			{ name: 'value', type: 'Float' }
		]
	},
	LiteralRegExp: {
		additionalFields: {
			raw: { type: 'string', value: '`/${pattern}/${flags}`' },
			regex: { type: '{ flags: string; pattern: string; }', value: '{ flags, pattern }' },
			value: { type: 'RegExp', value: 'new RegExp(pattern, flags)' }
		},
		astType: 'Literal',
		baseForAdditionalFields: ['flags', 'pattern'],
		fields: [
			{ name: 'flags', type: 'String' },
			{ name: 'pattern', type: 'String' }
		],
		hiddenFields: ['flags', 'pattern']
	},
	LiteralString: {
		astType: 'Literal',
		fields: [
			{ name: 'value', type: 'String' },
			{ name: 'raw', optional: true, type: 'String' }
		]
	},
	LogicalExpression: {
		hasSameFieldsAs: 'BinaryExpression',
		hasSameFieldsOverrides: {
			operator: {
				name: 'operator',
				type: 'FixedString',
				values: ['||', '&&', '??']
			}
		},
		useMacro: false
	},
	MemberExpression: {
		fields: [
			{ name: 'object', nodeTypes: ['Expression', 'Super'], type: 'Node' },
			{ name: 'property', nodeTypes: ['Expression', 'PrivateIdentifier'], type: 'Node' }
		],
		flags: ['computed', 'optional'],
		useMacro: false
	},
	MetaProperty: {
		fields: [
			{ name: 'meta', nodeTypes: ['Identifier'], type: 'Node' },
			{ name: 'property', nodeTypes: ['Identifier'], type: 'Node' }
		],
		useMacro: false
	},
	MethodDefinition: {
		fields: [
			{ name: 'decorators', nodeTypes: ['Decorator'], type: 'NodeList' },
			{ name: 'key', nodeTypes: ['Expression', 'PrivateIdentifier'], type: 'Node' },
			{ name: 'value', nodeTypes: ['FunctionExpression'], type: 'Node' },
			{ name: 'kind', type: 'FixedString', values: ['constructor', 'method', 'get', 'set'] }
		],
		// "static" needs to come first as ClassBody depends on it
		flags: ['static', 'computed'],
		useMacro: false
	},
	NewExpression: {
		fields: [
			{ name: 'annotations', type: 'Annotations', valid: true },
			{ name: 'callee', nodeTypes: ['Expression'], type: 'Node' },
			{ name: 'arguments', nodeTypes: ['Expression', 'SpreadElement'], type: 'NodeList' }
		],
		useMacro: false
	},
	ObjectExpression: {
		fields: [{ name: 'properties', nodeTypes: ['Property', 'SpreadElement'], type: 'NodeList' }]
	},
	ObjectPattern: {
		fields: [{ name: 'properties', nodeTypes: ['Property', 'RestElement'], type: 'NodeList' }]
	},
	PrivateIdentifier: {
		fields: [{ name: 'name', type: 'String' }]
	},
	Program: {
		fields: [
			{
				name: 'body',
				nodeTypes: ['Statement', 'Directive', 'ModuleDeclaration'],
				type: 'NodeList'
			},
			{ name: 'invalidAnnotations', type: 'Annotations', valid: false }
		],
		fixed: {
			sourceType: '"module"'
		},
		useMacro: false
	},
	Property: {
		fields: [
			{
				allowNull: true,
				name: 'key',
				nodeTypes: ['Expression'],
				type: 'Node'
			},
			{
				name: 'value',
				nodeTypes: ['Expression', 'DestructuringPattern'],
				type: 'Node'
			},
			{ name: 'kind', type: 'FixedString', values: ['init', 'get', 'set'] }
		],
		flags: ['method', 'shorthand', 'computed'],
		optionalFallback: {
			key: 'value'
		},
		useMacro: false
	},
	PropertyDefinition: {
		fields: [
			{ name: 'decorators', nodeTypes: ['Decorator'], type: 'NodeList' },
			{ name: 'key', nodeTypes: ['Expression', 'PrivateIdentifier'], type: 'Node' },
			{ allowNull: true, name: 'value', nodeTypes: ['Expression'], type: 'Node' }
		],
		// "static" needs to come first as ClassBody depends on it
		flags: ['static', 'computed'],
		useMacro: false
	},
	RestElement: {
		fields: [{ name: 'argument', nodeTypes: ['DestructuringPattern'], type: 'Node' }],
		useMacro: false
	},
	ReturnStatement: {
		fields: [{ allowNull: true, name: 'argument', nodeTypes: ['Expression'], type: 'Node' }]
	},
	SequenceExpression: {
		fields: [{ name: 'expressions', nodeTypes: ['Expression'], type: 'NodeList' }]
	},
	SpreadElement: {
		fields: [{ name: 'argument', nodeTypes: ['Expression'], type: 'Node' }],
		useMacro: false
	},
	StaticBlock: {
		fields: [{ name: 'body', nodeTypes: ['Statement'], type: 'NodeList' }]
	},
	Super: {
		converterFunction: 'superElement'
	},
	SwitchCase: {
		fields: [
			{ allowNull: true, name: 'test', nodeTypes: ['Expression'], type: 'Node' },
			{ name: 'consequent', nodeTypes: ['Statement'], type: 'NodeList' }
		]
	},
	SwitchStatement: {
		fields: [
			{ name: 'discriminant', nodeTypes: ['Expression'], type: 'Node' },
			{ name: 'cases', nodeTypes: ['SwitchCase'], type: 'NodeList' }
		],
		scopes: {
			discriminant: 'node.parentScope'
		}
	},
	TaggedTemplateExpression: {
		fields: [
			{ name: 'tag', nodeTypes: ['Expression'], type: 'Node' },
			{ name: 'quasi', nodeTypes: ['TemplateLiteral'], type: 'Node' }
		]
	},
	TemplateElement: {
		additionalFields: {
			value: { type: '{ cooked?: string; raw: string; }', value: '{ cooked, raw}' }
		},
		baseForAdditionalFields: ['cooked', 'raw'],
		fields: [
			{ name: 'cooked', optional: true, type: 'String' },
			{ name: 'raw', type: 'String' }
		],
		flags: ['tail'],
		hiddenFields: ['cooked', 'raw']
	},
	TemplateLiteral: {
		fields: [
			{ name: 'quasis', nodeTypes: ['TemplateElement'], type: 'NodeList' },
			{ name: 'expressions', nodeTypes: ['Expression'], type: 'NodeList' }
		],
		useMacro: false
	},
	ThisExpression: {},
	ThrowStatement: {
		fields: [{ name: 'argument', nodeTypes: ['Expression'], type: 'Node' }]
	},
	TryStatement: {
		fields: [
			{ name: 'block', nodeTypes: ['BlockStatement'], type: 'Node' },
			{ allowNull: true, name: 'handler', nodeTypes: ['CatchClause'], type: 'Node' },
			{ allowNull: true, name: 'finalizer', nodeTypes: ['BlockStatement'], type: 'Node' }
		],
		useMacro: false
	},
	UnaryExpression: {
		fields: [
			{
				name: 'operator',
				type: 'FixedString',
				values: ['-', '+', '!', '~', 'typeof', 'void', 'delete']
			},
			{ name: 'argument', nodeTypes: ['Expression'], type: 'Node' }
		],
		fixed: {
			prefix: 'true'
		}
	},
	UpdateExpression: {
		fields: [
			{ name: 'operator', type: 'FixedString', values: ['++', '--'] },
			{ name: 'argument', nodeTypes: ['Expression'], type: 'Node' }
		],
		flags: ['prefix']
	},
	VariableDeclaration: {
		fields: [
			{
				name: 'kind',
				type: 'FixedString',
				values: ['var', 'let', 'const', 'using', 'await using']
			},
			{ name: 'declarations', nodeTypes: ['VariableDeclarator'], type: 'NodeList' }
		],
		useMacro: false
	},
	VariableDeclarator: {
		fields: [
			{ name: 'id', nodeTypes: ['BindingPattern'], type: 'Node' },
			{ allowNull: true, name: 'init', nodeTypes: ['Expression'], type: 'Node' }
		],
		useMacro: false
	},
	WhileStatement: {
		fields: [
			{ name: 'test', nodeTypes: ['Expression'], type: 'Node' },
			{ name: 'body', nodeTypes: ['Statement'], type: 'Node' }
		]
	},
	YieldExpression: {
		fields: [{ allowNull: true, name: 'argument', nodeTypes: ['Expression'], type: 'Node' }],
		flags: ['delegate']
	}
};

interface NodeFieldDescription {
	type: 'Node';
	name: string;
	nodeTypes: AstTypeName[];
	allowNull?: true;
}

interface NodeListFieldDescription {
	type: 'NodeList';
	name: string;
	nodeTypes: AstTypeName[];
	allowNull?: true;
}

interface StringFieldDescription {
	type: 'String';
	name: string;
	optional?: true;
}

interface FixedStringFieldDescription {
	type: 'FixedString';
	name: string;
	values: string[];
}

interface FloatFieldDescription {
	type: 'Float';
	name: string;
}

interface AnnotationFieldDescription {
	type: 'Annotations';
	name: string;
	valid: boolean;
}

export type FieldDescription =
	| NodeFieldDescription
	| NodeListFieldDescription
	| StringFieldDescription
	| FixedStringFieldDescription
	| FloatFieldDescription
	| AnnotationFieldDescription;

export interface NodeDescription {
	astType?: AstTypeName; // If several converters produce the same type, specify the actual type here
	converterFunction?: string; // What function name to use in converters instead of the kebab case node name
	hasSameFieldsAs?: AstNodeName; // If this node uses the same Rust converter as another one, specify the name here. This will skip Rust field constant generation.
	hasSameFieldsOverrides?: Record<string, FieldDescription>; // If hasSameFields is used, this can specify overrides by field.
	fields?: FieldDescription[]; // The non-boolean fields of the node, sorted by parse order
	flags?: string[]; // The boolean fields of the node
	fixed?: Record<string, string>; // Any fields with fixed values
	additionalFields?: Record<string, { value: string; type: string }>; // Derived fields can be specified as arbitrary strings here
	baseForAdditionalFields?: string[]; // Fields needed to define additional fields
	hiddenFields?: string[]; // Fields that are added in Rust but are not part of the AST, usually together with additionalFields
	optionalFallback?: Record<string, string>; // If an optional variable should not have "null" as fallback, but the value of another field,
	postProcessFields?: Record<string, [variableName: string, code: string]>; // If this is specified, the field will be extracted into a variable and this code is injected after the field is assigned
	scopes?: Record<string, string>; // If the field gets a parent scope other than node.scope
	scriptedFields?: Record<string, string>; // If fields are parsed via custom logic, $position references the node position
	useMacro?: boolean; // Generate a Rust macro instead of separate constants
}

export const astNodeNamesWithFieldOrder: {
	name: AstNodeName;
	fields: FieldDescription[];
	node: NodeDescription;
	originalNode: NodeDescription;
}[] = Object.entries(AST_NODES).map(([name, originalNode]) => {
	let node = originalNode;
	let fields = originalNode.fields || [];
	if (originalNode.hasSameFieldsAs) {
		node = AST_NODES[originalNode.hasSameFieldsAs];
		fields = (node.fields || []).map(field => {
			const override = originalNode.hasSameFieldsOverrides?.[field.name];
			return override || field;
		});
	}
	return {
		fields,
		name: name as AstNodeName,
		node,
		originalNode
	};
});
