import type * as estree from 'estree';
import type { AcornNode } from '../rollup/types';

type ReadString = (start: number, length: number) => string;

export const convertProgram = (buffer: ArrayBuffer, readString: ReadString): any =>
	convertNode(0, new Uint32Array(buffer), readString);

const convertNode = (position: number, buffer: Uint32Array, readString: ReadString): any => {
	const nodeType = buffer[position];
	const converter = nodeConverters[nodeType];
	if (!converter) {
		console.trace();
		throw new Error(`Unknown node type: ${nodeType}`);
	}
	return converter(position + 1, buffer, readString);
};

/* eslint-disable sort-keys */
const nodeConverters: ((position: number, buffer: Uint32Array, readString: ReadString) => any)[] = [
	// index:0; ArrayExpression
	(position, buffer, readString): estree.ArrayExpression & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const elements = convertNodeList(position, buffer, readString);
		return {
			type: 'ArrayExpression',
			start,
			end,
			elements
		};
	},
	// index:1; ArrayPattern
	(position, buffer, readString): estree.ArrayPattern & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const elements = convertNodeList(position, buffer, readString);
		return {
			type: 'ArrayPattern',
			start,
			end,
			elements
		};
	},
	// index:2; ArrowFunctionExpression
	(position, buffer, readString): estree.ArrowFunctionExpression & AcornNode & { id: null } => {
		const start = buffer[position++];
		const end = buffer[position++];
		const async = !!buffer[position++];
		const generator = !!buffer[position++];
		const parameters = convertNodeList(buffer[position++], buffer, readString);
		const expression = !!buffer[position++];
		const body = convertNode(position, buffer, readString);
		return {
			type: 'ArrowFunctionExpression',
			start,
			end,
			async,
			body,
			expression,
			generator,
			id: null,
			params: parameters
		};
	},
	// index:3; AssignmentExpression
	(position, buffer, readString): estree.AssignmentExpression & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const left = convertNode(buffer[position++], buffer, readString);
		const right = convertNode(buffer[position++], buffer, readString);
		const operator = convertString(position, buffer, readString) as estree.AssignmentOperator;
		return {
			type: 'AssignmentExpression',
			start,
			end,
			left,
			operator,
			right
		};
	},
	// index:4; AssignmentPattern
	(position, buffer, readString): estree.AssignmentPattern & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const left = convertNode(buffer[position++], buffer, readString);
		const right = convertNode(position, buffer, readString);
		return {
			type: 'AssignmentPattern',
			start,
			end,
			left,
			right
		};
	},
	// index:5; AwaitExpression
	(position, buffer, readString): estree.AwaitExpression & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const argument = convertNode(position, buffer, readString);
		return {
			type: 'AwaitExpression',
			start,
			argument,
			end
		};
	},
	// index:6; BinaryExpression
	(position, buffer, readString): estree.BinaryExpression & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const left = convertNode(buffer[position++], buffer, readString);
		const right = convertNode(buffer[position++], buffer, readString);
		const operator = convertString(position, buffer, readString) as estree.BinaryOperator;
		return {
			type: 'BinaryExpression',
			start,
			end,
			left,
			operator,
			right
		};
	},
	// index:7; BlockStatement
	(position, buffer, readString): estree.BlockStatement & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const body = convertNodeList(position, buffer, readString);
		return {
			type: 'BlockStatement',
			start,
			body,
			end
		};
	},
	// index:8; BreakStatement
	(position, buffer, readString): estree.BreakStatement & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const labelPosition = buffer[position++];
		return {
			type: 'BreakStatement',
			start,
			end,
			label: labelPosition ? convertNode(labelPosition, buffer, readString) : null
		};
	},
	// index:9; CallExpression
	(position, buffer, readString): estree.CallExpression & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const optional = !!buffer[position++];
		const callee = convertNode(buffer[position++], buffer, readString);
		const argumentsList = convertNodeList(position, buffer, readString);
		return {
			type: 'CallExpression',
			start,
			end,
			arguments: argumentsList,
			callee,
			optional
		};
	},
	// index:10; CatchClause
	(position, buffer, readString): estree.CatchClause & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const parameterPosition = buffer[position++];
		const body = convertNode(position, buffer, readString);
		return {
			type: 'CatchClause',
			start,
			end,
			body,
			param: parameterPosition ? convertNode(parameterPosition, buffer, readString) : null
		};
	},
	// index:11; ChainExpression
	(position, buffer, readString): estree.ChainExpression & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const expression = convertNode(position, buffer, readString);
		return {
			type: 'ChainExpression',
			start,
			end,
			expression
		};
	},
	// index:12; ClassBody
	(position, buffer, readString): estree.ClassBody & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const body = convertNodeList(position, buffer, readString);
		return {
			type: 'ClassBody',
			start,
			end,
			body
		};
	},
	// index:13; ClassDeclaration
	(position, buffer, readString): estree.ClassDeclaration & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const idPosition = buffer[position++];
		const superClassPosition = buffer[position++];
		const body = convertNode(buffer[position], buffer, readString);
		return {
			type: 'ClassDeclaration',
			start,
			end,
			body,
			id: idPosition ? convertNode(idPosition, buffer, readString) : null,
			superClass: superClassPosition ? convertNode(superClassPosition, buffer, readString) : null
		};
	},
	// index:14; ClassExpression
	(position, buffer, readString): estree.ClassExpression & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const idPosition = buffer[position++];
		const superClassPosition = buffer[position++];
		const body = convertNode(buffer[position], buffer, readString);
		return {
			type: 'ClassExpression',
			start,
			end,
			body,
			id: idPosition ? convertNode(idPosition, buffer, readString) : null,
			superClass: superClassPosition ? convertNode(superClassPosition, buffer, readString) : null
		};
	},
	// index:15; ConditionalExpression
	(position, buffer, readString): estree.ConditionalExpression & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const test = convertNode(buffer[position++], buffer, readString);
		const consequent = convertNode(buffer[position++], buffer, readString);
		const alternate = convertNode(position, buffer, readString);
		return {
			type: 'ConditionalExpression',
			start,
			end,
			alternate,
			consequent,
			test
		};
	},
	// index:16; ContinueStatement
	(position, buffer, readString): estree.ContinueStatement & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const labelPosition = buffer[position];
		return {
			type: 'ContinueStatement',
			start,
			end,
			label: labelPosition ? convertNode(labelPosition, buffer, readString) : null
		};
	},
	// index:17; DebuggerStatement
	(position, buffer): estree.DebuggerStatement & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		return {
			type: 'DebuggerStatement',
			start,
			end
		};
	},
	// index:18; DoWhileStatement
	(position, buffer, readString): estree.DoWhileStatement & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const test = convertNode(buffer[position++], buffer, readString);
		const body = convertNode(position, buffer, readString);
		return {
			type: 'DoWhileStatement',
			start,
			end,
			body,
			test
		};
	},
	// index:19; EmptyStatement
	(position, buffer): estree.EmptyStatement & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		return {
			type: 'EmptyStatement',
			start,
			end
		};
	},
	// index:20; ExportAllDeclaration
	(position, buffer, readString): ExportAllDeclaration & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const assertions = convertNodeList(buffer[position++], buffer, readString);
		const exportedPosition = buffer[position++];
		const source = convertNode(position, buffer, readString);
		return {
			type: 'ExportAllDeclaration',
			start,
			end,
			exported: exportedPosition ? convertNode(exportedPosition, buffer, readString) : null,
			source,
			...(assertions.length > 0 ? { assertions } : {})
		};
	},
	// index:21; ExportDefaultDeclaration
	(position, buffer, readString): estree.ExportDefaultDeclaration & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const declaration = convertNode(position, buffer, readString);
		return {
			type: 'ExportDefaultDeclaration',
			start,
			end,
			declaration
		};
	},
	// index:22; ExportNamedDeclaration
	(position, buffer, readString): ExportNamedDeclaration & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const declarationPosition = buffer[position++];
		const sourcePosition = buffer[position++];
		const assertions = convertNodeList(buffer[position++], buffer, readString);
		const specifiers = convertNodeList(position, buffer, readString);
		return {
			type: 'ExportNamedDeclaration',
			start,
			end,
			declaration: declarationPosition
				? convertNode(declarationPosition, buffer, readString)
				: null,
			source: sourcePosition ? convertNode(sourcePosition, buffer, readString) : null,
			specifiers,
			...(assertions.length > 0 ? { assertions } : {})
		};
	},
	// index:23; ExportSpecifier
	(position, buffer, readString): estree.ExportSpecifier & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const exportedPosition = buffer[position++];
		const local = convertNode(position, buffer, readString);
		const exported = exportedPosition ? convertNode(exportedPosition, buffer, readString) : local;
		return {
			type: 'ExportSpecifier',
			start,
			end,
			exported,
			local
		};
	},
	// index:24; ExpressionStatement
	(position, buffer, readString): estree.ExpressionStatement & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const directivePosition = buffer[position++];
		const expression = convertNode(position, buffer, readString);
		return {
			type: 'ExpressionStatement',
			start,
			end,
			expression,
			...(directivePosition
				? { directive: convertString(directivePosition, buffer, readString) }
				: {})
		};
	},
	// index:25; ForInStatement
	(position, buffer, readString): estree.ForInStatement & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const left = convertNode(buffer[position++], buffer, readString);
		const right = convertNode(buffer[position++], buffer, readString);
		const body = convertNode(position, buffer, readString);
		return {
			type: 'ForInStatement',
			start,
			end,
			body,
			left,
			right
		};
	},
	// index:26; ForOfStatement
	(position, buffer, readString): estree.ForOfStatement & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const awaited = !!buffer[position++];
		const left = convertNode(buffer[position++], buffer, readString);
		const right = convertNode(buffer[position++], buffer, readString);
		const body = convertNode(position, buffer, readString);
		return {
			type: 'ForOfStatement',
			start,
			end,
			await: awaited,
			body,
			left,
			right
		};
	},
	// index:27; ForStatement
	(position, buffer, readString): estree.ForStatement & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const initPosition = buffer[position++];
		const testPosition = buffer[position++];
		const updatePosition = buffer[position++];
		const body = convertNode(position, buffer, readString);
		return {
			type: 'ForStatement',
			start,
			end,
			body,
			init: initPosition ? convertNode(initPosition, buffer, readString) : null,
			test: testPosition ? convertNode(testPosition, buffer, readString) : null,
			update: updatePosition ? convertNode(updatePosition, buffer, readString) : null
		};
	},
	// index:28; FunctionDeclaration
	(
		position,
		buffer,
		readString
	): estree.FunctionDeclaration & AcornNode & { expression: false } => {
		const start = buffer[position++];
		const end = buffer[position++];
		const async = !!buffer[position++];
		const generator = !!buffer[position++];
		const idPosition = buffer[position++];
		const parameters = convertNodeList(buffer[position++], buffer, readString);
		const body = convertNode(position, buffer, readString);
		return {
			type: 'FunctionDeclaration',
			start,
			end,
			async,
			body,
			expression: false,
			generator,
			id: idPosition ? convertNode(idPosition, buffer, readString) : null,
			params: parameters
		};
	},
	// index:29; FunctionExpression
	(position, buffer, readString): estree.FunctionExpression & AcornNode & { expression: false } => {
		const start = buffer[position++];
		const end = buffer[position++];
		const async = !!buffer[position++];
		const generator = !!buffer[position++];
		const idPosition = buffer[position++];
		const parameters = convertNodeList(buffer[position++], buffer, readString);
		const body = convertNode(position, buffer, readString);
		return {
			type: 'FunctionExpression',
			start,
			end,
			async,
			body,
			expression: false,
			generator,
			id: idPosition ? convertNode(idPosition, buffer, readString) : null,
			params: parameters
		};
	},
	// index:30; Identifier
	(position, buffer, readString): estree.Identifier & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const name = convertString(position, buffer, readString);
		return {
			type: 'Identifier',
			start,
			end,
			name
		};
	},
	// index:31; IfStatement
	(position, buffer, readString): estree.IfStatement & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const consequent = convertNode(buffer[position++], buffer, readString);
		const alternatePosition = buffer[position++];
		const test = convertNode(position, buffer, readString);
		return {
			type: 'IfStatement',
			start,
			end,
			alternate: alternatePosition ? convertNode(alternatePosition, buffer, readString) : null,
			consequent,
			test
		};
	},
	// index:32; ImportAttribute
	(position, buffer, readString): ImportAttribute & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const key = convertNode(buffer[position++], buffer, readString);
		const value = convertNode(position, buffer, readString);
		return {
			type: 'ImportAttribute',
			start,
			end,
			key,
			value
		};
	},
	// index:33; ImportDeclaration
	(position, buffer, readString): ImportDeclaration & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const source = convertNode(buffer[position++], buffer, readString);
		const assertions = convertNodeList(buffer[position++], buffer, readString);
		const specifiers = convertNodeList(position, buffer, readString);
		return {
			type: 'ImportDeclaration',
			start,
			end,
			source,
			specifiers,
			...(assertions.length > 0 ? { assertions } : {})
		};
	},
	// index:34; ImportDefaultSpecifier
	(position, buffer, readString): estree.ImportDefaultSpecifier & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const local = convertNode(position, buffer, readString);
		return {
			type: 'ImportDefaultSpecifier',
			start,
			end,
			local
		};
	},
	// index:35; ImportExpression
	(position, buffer, readString): ImportExpression & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const arguments_ = convertNodeList(buffer[position++], buffer, readString);
		const source = convertNode(position, buffer, readString);
		return {
			type: 'ImportExpression',
			start,
			end,
			source,
			...(arguments_.length > 0 ? { arguments: arguments_ } : {})
		};
	},
	// index:36; ImportNamespaceSpecifier
	(position, buffer, readString): estree.ImportNamespaceSpecifier & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const local = convertNode(position, buffer, readString);
		return {
			type: 'ImportNamespaceSpecifier',
			start,
			end,
			local
		};
	},
	// index:37; ImportSpecifier
	(position, buffer, readString): estree.ImportSpecifier & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const importedPosition = buffer[position++];
		const local = convertNode(position, buffer, readString);
		const imported = importedPosition ? convertNode(importedPosition, buffer, readString) : local;
		return {
			type: 'ImportSpecifier',
			start,
			end,
			imported,
			local
		};
	},
	// index:38; LabeledStatement
	(position, buffer, readString): estree.LabeledStatement & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const body = convertNode(buffer[position++], buffer, readString);
		const label = convertNode(position, buffer, readString);
		return {
			type: 'LabeledStatement',
			start,
			end,
			body,
			label
		};
	},
	// index:39; Literal<string>
	(position, buffer, readString): estree.SimpleLiteral & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const rawPosition = buffer[position++];
		const raw = rawPosition ? convertString(rawPosition, buffer, readString) : undefined;
		const value = convertString(position, buffer, readString);
		return {
			type: 'Literal',
			start,
			end,
			raw,
			value
		};
	},
	// index:40; Literal<boolean>
	(position, buffer): estree.SimpleLiteral & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const value = !!buffer[position++];
		return {
			type: 'Literal',
			start,
			end,
			raw: value ? 'true' : 'false',
			value
		};
	},
	// index:41; Literal<number>
	(position, buffer, readString): estree.SimpleLiteral & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const rawPosition = buffer[position++];
		const raw = rawPosition ? convertString(rawPosition, buffer, readString) : undefined;
		const value = new DataView(buffer.buffer).getFloat64(position << 2, true);
		return {
			type: 'Literal',
			start,
			end,
			raw,
			value
		};
	},
	// index:42; Literal<null>
	(position, buffer): estree.SimpleLiteral & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		return {
			type: 'Literal',
			start,
			end,
			raw: 'null',
			value: null
		};
	},
	// index:43; Literal<RegExp>
	(position, buffer, readString): estree.RegExpLiteral & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const pattern = convertString(buffer[position++], buffer, readString);
		const flags = convertString(position, buffer, readString);
		return {
			type: 'Literal',
			start,
			end,
			raw: `/${pattern}/${flags}`,
			regex: {
				flags,
				pattern
			},
			value: new RegExp(pattern, flags)
		};
	},
	// index:44; Literal<bigint>
	(position, buffer, readString): estree.BigIntLiteral & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const bigint = convertString(buffer[position++], buffer, readString);
		const raw = convertString(position, buffer, readString);
		return {
			type: 'Literal',
			start,
			end,
			bigint,
			raw,
			value: BigInt(bigint)
		};
	},
	// index:45; LogicalExpression
	(position, buffer, readString): estree.LogicalExpression & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const left = convertNode(buffer[position++], buffer, readString);
		const right = convertNode(buffer[position++], buffer, readString);
		const operator = convertString(position, buffer, readString) as estree.LogicalOperator;
		return {
			type: 'LogicalExpression',
			start,
			end,
			left,
			operator,
			right
		};
	},
	// index:46; MemberExpression
	(position, buffer, readString): estree.MemberExpression & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const optional = !!buffer[position++];
		const object = convertNode(buffer[position++], buffer, readString);
		const computed = !!buffer[position++];
		const property = convertNode(position, buffer, readString);
		return {
			type: 'MemberExpression',
			start,
			end,
			computed,
			object,
			optional,
			property
		};
	},
	// index:47; MetaProperty
	(position, buffer, readString): estree.MetaProperty & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const meta = convertNode(buffer[position++], buffer, readString);
		const property = convertNode(position, buffer, readString);
		return {
			type: 'MetaProperty',
			start,
			end,
			meta,
			property
		};
	},
	// index:48; MethodDefinition
	(position, buffer, readString): estree.MethodDefinition & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const kind = METHOD_DEFINITION_KINDS[buffer[position++]];
		const computed = !!buffer[position++];
		const isStatic = !!buffer[position++];
		const value = convertNode(buffer[position++], buffer, readString);
		const key = convertNode(position, buffer, readString);
		return {
			type: 'MethodDefinition',
			start,
			end,
			computed,
			key,
			kind,
			static: isStatic,
			value
		};
	},
	// index:49; NewExpression
	(position, buffer, readString): estree.NewExpression & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const argumentsPosition = buffer[position++];
		const callee = convertNode(position, buffer, readString);
		return {
			type: 'NewExpression',
			start,
			end,
			arguments: argumentsPosition ? convertNodeList(argumentsPosition, buffer, readString) : [],
			callee
		};
	},
	// index:50; ObjectExpression
	(position, buffer, readString): estree.ObjectExpression & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const properties = convertNodeList(position, buffer, readString);
		return {
			type: 'ObjectExpression',
			start,
			end,
			properties
		};
	},
	// index:51; ObjectPattern
	(position, buffer, readString): estree.ObjectPattern & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const properties = convertNodeList(position, buffer, readString);
		return {
			type: 'ObjectPattern',
			start,
			end,
			properties
		};
	},
	// index:52; PrivateIdentifier
	(position, buffer, readString): estree.PrivateIdentifier & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const name = convertString(position, buffer, readString);
		return {
			type: 'PrivateIdentifier',
			start,
			end,
			name
		};
	},
	// index:53; Program
	(position, buffer, readString): estree.Program & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const body = convertNodeList(position, buffer, readString);
		return {
			type: 'Program',
			start,
			end,
			body,
			sourceType: 'module'
		};
	},
	// index:54; Property
	(position, buffer, readString): estree.Property & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const kind = PROPERTY_KINDS[buffer[position++]];
		const method = !!buffer[position++];
		const computed = !!buffer[position++];
		const shorthand = !!buffer[position++];
		const valuePosition = buffer[position++];
		const key = convertNode(position, buffer, readString);
		return {
			type: 'Property',
			start,
			end,
			computed,
			key,
			kind,
			method,
			shorthand,
			value: valuePosition ? convertNode(valuePosition, buffer, readString) : key
		};
	},
	// index:55; PropertyDefinition
	(position, buffer, readString): estree.PropertyDefinition & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const computed = !!buffer[position++];
		const isStatic = !!buffer[position++];
		const valuePosition = buffer[position++];
		const key = convertNode(position, buffer, readString);
		return {
			type: 'PropertyDefinition',
			start,
			end,
			computed,
			key,
			static: isStatic,
			value: valuePosition ? convertNode(valuePosition, buffer, readString) : null
		};
	},
	// index:56; RestElement
	(position, buffer, readString): estree.RestElement & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const argument = convertNode(position, buffer, readString);
		return {
			type: 'RestElement',
			start,
			end,
			argument
		};
	},
	// index:57; ReturnStatement
	(position, buffer, readString): estree.ReturnStatement & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const argumentPosition = buffer[position];
		return {
			type: 'ReturnStatement',
			start,
			end,
			argument: argumentPosition ? convertNode(argumentPosition, buffer, readString) : null
		};
	},
	// index:58; SequenceExpression
	(position, buffer, readString): estree.SequenceExpression & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const expressions = convertNodeList(position, buffer, readString);
		return {
			type: 'SequenceExpression',
			start,
			end,
			expressions
		};
	},
	// index:59; SpreadElement
	(position, buffer, readString): estree.SpreadElement & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const argument = convertNode(position, buffer, readString);
		return {
			type: 'SpreadElement',
			start,
			end,
			argument
		};
	},
	// index:60; StaticBlock
	(position, buffer, readString): estree.StaticBlock & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const body = convertNodeList(position, buffer, readString);
		return {
			type: 'StaticBlock',
			start,
			end,
			body
		};
	},
	// index:61; Super
	(position, buffer): estree.Super & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		return {
			type: 'Super',
			start,
			end
		};
	},
	// index:62; SwitchCase
	(position, buffer, readString): estree.SwitchCase & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const testPosition = buffer[position++];
		const consequent = convertNodeList(position, buffer, readString);
		return {
			type: 'SwitchCase',
			start,
			end,
			consequent,
			test: testPosition ? convertNode(testPosition, buffer, readString) : null
		};
	},
	// index:63; SwitchStatement
	(position, buffer, readString): estree.SwitchStatement & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const discriminant = convertNode(buffer[position++], buffer, readString);
		const cases = convertNodeList(position, buffer, readString);
		return {
			type: 'SwitchStatement',
			start,
			end,
			cases,
			discriminant
		};
	},
	// index:64; TaggedTemplateExpression
	(position, buffer, readString): estree.TaggedTemplateExpression & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const tag = convertNode(buffer[position++], buffer, readString);
		const quasi = convertNode(position, buffer, readString);
		return {
			type: 'TaggedTemplateExpression',
			start,
			end,
			quasi,
			tag
		};
	},
	// index:65; TemplateElement
	(position, buffer, readString): estree.TemplateElement & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const tail = !!buffer[position++];
		const cookedPosition = buffer[position++];
		const raw = convertString(position, buffer, readString);
		return {
			type: 'TemplateElement',
			start,
			end,
			tail,
			value: {
				cooked: cookedPosition ? convertString(cookedPosition, buffer, readString) : null,
				raw
			}
		};
	},
	// index:66; TemplateLiteral
	(position, buffer, readString): estree.TemplateLiteral & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const expressions = convertNodeList(buffer[position++], buffer, readString);
		const quasis = convertNodeList(position, buffer, readString);
		return {
			type: 'TemplateLiteral',
			start,
			end,
			expressions,
			quasis
		};
	},
	// index:67; ThisExpression
	(position, buffer): estree.ThisExpression & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		return {
			type: 'ThisExpression',
			start,
			end
		};
	},
	// index:68; ThrowStatement
	(position, buffer, readString): estree.ThrowStatement & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const argument = convertNode(position, buffer, readString);
		return {
			type: 'ThrowStatement',
			start,
			end,
			argument
		};
	},
	// index:69; TryStatement
	(position, buffer, readString): estree.TryStatement & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const handlerPosition = buffer[position++];
		const finalizerPosition = buffer[position++];
		const block = convertNode(position, buffer, readString);
		return {
			type: 'TryStatement',
			start,
			end,
			block,
			finalizer: finalizerPosition ? convertNode(finalizerPosition, buffer, readString) : null,
			handler: handlerPosition ? convertNode(handlerPosition, buffer, readString) : null
		};
	},
	// index:70; UnaryExpression
	(position, buffer, readString): estree.UnaryExpression & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const operator = convertString(buffer[position++], buffer, readString) as estree.UnaryOperator;
		const argument = convertNode(position, buffer, readString);
		return {
			type: 'UnaryExpression',
			start,
			end,
			argument,
			operator,
			prefix: true
		};
	},
	// index:71; UpdateExpression
	(position, buffer, readString): estree.UpdateExpression & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const prefix = !!buffer[position++];
		const operator = convertString(buffer[position++], buffer, readString) as estree.UpdateOperator;
		const argument = convertNode(position, buffer, readString);
		return {
			type: 'UpdateExpression',
			start,
			end,
			argument,
			operator,
			prefix
		};
	},
	// index:72; VariableDeclaration
	(position, buffer, readString): estree.VariableDeclaration & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const kind = DECLARATION_KINDS[buffer[position++]];
		const declarations = convertNodeList(position, buffer, readString);
		return {
			type: 'VariableDeclaration',
			start,
			end,
			declarations,
			kind
		};
	},
	// index:73; VariableDeclarator
	(position, buffer, readString): estree.VariableDeclarator & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const init_position = buffer[position++];
		const id = convertNode(position, buffer, readString);
		return {
			type: 'VariableDeclarator',
			start,
			end,
			id,
			init: init_position ? convertNode(init_position, buffer, readString) : null
		};
	},
	// index:74; WhileStatement
	(position, buffer, readString): estree.WhileStatement & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const test = convertNode(buffer[position++], buffer, readString);
		const body = convertNode(position, buffer, readString);
		return {
			type: 'WhileStatement',
			start,
			end,
			body,
			test
		};
	},
	// index:75; YieldExpression
	(position, buffer, readString): estree.YieldExpression & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const delegate = !!buffer[position++];
		const argumentPosition = buffer[position];
		return {
			type: 'YieldExpression',
			start,
			end,
			argument: argumentPosition ? convertNode(argumentPosition, buffer, readString) : null,
			delegate
		};
	}
];

const DECLARATION_KINDS: ('var' | 'let' | 'const')[] = ['var', 'let', 'const'];

const PROPERTY_KINDS: ('init' | 'get' | 'set')[] = ['init', 'get', 'set'];

const METHOD_DEFINITION_KINDS: ('constructor' | 'method' | 'get' | 'set')[] = [
	'constructor',
	'method',
	'get',
	'set'
];

const convertNodeList = (position: number, buffer: Uint32Array, readString: ReadString): any[] => {
	const length = buffer[position++];
	const list: any[] = [];
	for (let index = 0; index < length; index++) {
		const nodePosition = buffer[position++];
		list.push(nodePosition ? convertNode(nodePosition, buffer, readString) : null);
	}
	return list;
};

const convertString = (position: number, buffer: Uint32Array, readString: ReadString): string => {
	const length = buffer[position++];
	const bytePosition = position << 2;
	return readString(bytePosition, length);
};

interface ImportAttribute {
	key: estree.Identifier | estree.Literal;
	type: 'ImportAttribute';
	value: estree.Literal;
}

interface ImportDeclaration extends estree.ImportDeclaration {
	assertions?: ImportAttribute[];
}

interface ExportNamedDeclaration extends estree.ExportNamedDeclaration {
	assertions?: ImportAttribute[];
}

interface ExportAllDeclaration extends estree.ExportAllDeclaration {
	assertions?: ImportAttribute[];
}

interface ImportExpression extends estree.ImportExpression {
	arguments?: estree.ObjectExpression[];
}
