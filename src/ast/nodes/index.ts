import ArrayExpression from './ArrayExpression';
import ArrayPattern from './ArrayPattern';
import ArrowFunctionExpression from './ArrowFunctionExpression';
import AssignmentExpression from './AssignmentExpression';
import AssignmentPattern from './AssignmentPattern';
import AwaitExpression from './AwaitExpression';
import BinaryExpression from './BinaryExpression';
import BlockStatement from './BlockStatement';
import BreakStatement from './BreakStatement';
import CallExpression from './CallExpression';
import CatchClause from './CatchClause';
import ClassBody from './ClassBody';
import ClassDeclaration from './ClassDeclaration';
import ClassExpression from './ClassExpression';
import ConditionalExpression from './ConditionalExpression';
import DoWhileStatement from './DoWhileStatement';
import EmptyStatement from './EmptyStatement';
import ExportAllDeclaration from './ExportAllDeclaration';
import ExportDefaultDeclaration from './ExportDefaultDeclaration';
import ExportNamedDeclaration from './ExportNamedDeclaration';
import ExpressionStatement from './ExpressionStatement';
import ForStatement from './ForStatement';
import ForInStatement from './ForInStatement';
import ForOfStatement from './ForOfStatement';
import FunctionDeclaration from './FunctionDeclaration';
import FunctionExpression from './FunctionExpression';
import Identifier from './Identifier';
import IfStatement from './IfStatement';
import ImportDeclaration from './ImportDeclaration';
import LabeledStatement from './LabeledStatement';
import Literal from './Literal';
import LogicalExpression from './LogicalExpression';
import MemberExpression from './MemberExpression';
import MethodDefinition from './MethodDefinition';
import NewExpression from './NewExpression';
import ObjectExpression from './ObjectExpression';
import ObjectPattern from './ObjectPattern';
import Property from './Property';
import RestElement from './RestElement';
import ReturnStatement from './ReturnStatement';
import SequenceExpression from './SequenceExpression';
import SwitchCase from './SwitchCase';
import SwitchStatement from './SwitchStatement';
import TaggedTemplateExpression from './TaggedTemplateExpression';
import TemplateElement from './TemplateElement';
import TemplateLiteral from './TemplateLiteral';
import ThisExpression from './ThisExpression';
import ThrowStatement from './ThrowStatement';
import UnaryExpression from './UnaryExpression';
import UpdateExpression from './UpdateExpression';
import VariableDeclarator from './VariableDeclarator';
import VariableDeclaration from './VariableDeclaration';
import WhileStatement from './WhileStatement';
import YieldExpression from './YieldExpression';
import { StatementBase } from './shared/Statement';
import { NodeBase } from './shared/Node';

export const enum NodeType {
	ArrayExpression = 'ArrayExpression',
	ArrayPattern = 'ArrayPattern',
	ArrowFunctionExpression = 'ArrowFunctionExpression',
	AssignmentExpression = 'AssignmentExpression',
	AssignmentPattern = 'AssignmentPattern',
	AwaitExpression = 'AwaitExpression',
	BinaryExpression = 'BinaryExpression',
	BlockStatement = 'BlockStatement',
	BreakStatement = 'BreakStatement',
	CallExpression = 'CallExpression',
	CatchClause = 'CatchClause',
	ClassBody = 'ClassBody',
	ClassDeclaration = 'ClassDeclaration',
	ClassExpression = 'ClassExpression',
	ConditionalExpression = 'ConditionalExpression',
	DoWhileStatement = 'DoWhileStatement',
	EmptyStatement = 'EmptyStatement',
	ExportAllDeclaration = 'ExportAllDeclaration',
	ExportDefaultDeclaration = 'ExportDefaultDeclaration',
	ExportNamedDeclaration = 'ExportNamedDeclaration',
	ExportSpecifier = 'ExportSpecifier',
	ExpressionStatement = 'ExpressionStatement',
	ForStatement = 'ForStatement',
	ForInStatement = 'ForInStatement',
	ForOfStatement = 'ForOfStatement',
	FunctionDeclaration = 'FunctionDeclaration',
	FunctionExpression = 'FunctionExpression',
	Identifier = 'Identifier',
	IfStatement = 'IfStatement',
	Import = 'Import',
	ImportDeclaration = 'ImportDeclaration',
	ImportDefaultSpecifier = 'ImportDefaultSpecifier',
	ImportNamespaceSpecifier = 'ImportNamespaceSpecifier',
	ImportSpecifier = 'ImportSpecifier',
	LabeledStatement = 'LabeledStatement',
	Literal = 'Literal',
	LogicalExpression = 'LogicalExpression',
	MemberExpression = 'MemberExpression',
	MethodDefinition = 'MethodDefinition',
	NewExpression = 'NewExpression',
	ObjectExpression = 'ObjectExpression',
	ObjectPattern = 'ObjectPattern',
	Program = 'Program',
	Property = 'Property',
	RestElement = 'RestElement',
	ReturnStatement = 'ReturnStatement',
	SequenceExpression = 'SequenceExpression',
	SpreadElement = 'SpreadElement',
	SwitchCase = 'SwitchCase',
	SwitchStatement = 'SwitchStatement',
	TaggedTemplateExpression = 'TaggedTemplateExpression',
	TemplateElement = 'TemplateElement',
	TemplateLiteral = 'TemplateLiteral',
	ThisExpression = 'ThisExpression',
	ThrowStatement = 'ThrowStatement',
	TryStatement = 'TryStatement',
	UnaryExpression = 'UnaryExpression',
	UpdateExpression = 'UpdateExpression',
	VariableDeclarator = 'VariableDeclarator',
	VariableDeclaration = 'VariableDeclaration',
	WhileStatement = 'WhileStatement',
	YieldExpression = 'YieldExpression'
}

const nodes: {
	[name: string]: typeof NodeBase
} = {
	ArrayExpression,
	ArrayPattern,
	ArrowFunctionExpression,
	AssignmentExpression,
	AssignmentPattern,
	AwaitExpression,
	BinaryExpression,
	BlockStatement,
	BreakStatement,
	CallExpression,
	CatchClause,
	ClassBody,
	ClassDeclaration,
	ClassExpression,
	ConditionalExpression,
	DoWhileStatement,
	EmptyStatement,
	ExportAllDeclaration,
	ExportDefaultDeclaration,
	ExportNamedDeclaration,
	ExpressionStatement,
	ForStatement,
	ForInStatement,
	ForOfStatement,
	FunctionDeclaration,
	FunctionExpression,
	Identifier,
	IfStatement,
	ImportDeclaration,
	LabeledStatement,
	Literal,
	LogicalExpression,
	MemberExpression,
	MethodDefinition,
	NewExpression,
	ObjectExpression,
	ObjectPattern,
	Property,
	RestElement,
	ReturnStatement,
	SequenceExpression,
	SwitchCase,
	SwitchStatement,
	TaggedTemplateExpression,
	TemplateElement,
	TemplateLiteral,
	ThisExpression,
	ThrowStatement,
	TryStatement: StatementBase,
	UnaryExpression,
	UpdateExpression,
	VariableDeclarator,
	VariableDeclaration,
	WhileStatement,
	YieldExpression
};

export default nodes;
