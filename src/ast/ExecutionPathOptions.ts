import Immutable from 'immutable';
import CallExpression from './nodes/CallExpression';
import CallOptions from './CallOptions';
import ThisVariable from './variables/ThisVariable';
import ParameterVariable from './variables/ParameterVariable';
import { ObjectPath } from './variables/VariableReassignmentTracker';
import { Entity, WritableEntity } from './Entity';
import Property from './nodes/Property';
import { ExpressionEntity } from './nodes/shared/Expression';

const OPTION_IGNORED_LABELS = 'IGNORED_LABELS';
const OPTION_ACCESSED_NODES = 'ACCESSED_NODES';
const OPTION_ARGUMENTS_VARIABLES = 'ARGUMENTS_VARIABLES';
const OPTION_ASSIGNED_NODES = 'ASSIGNED_NODES';
const OPTION_IGNORE_BREAK_STATEMENTS = 'IGNORE_BREAK_STATEMENTS';
const OPTION_IGNORE_RETURN_AWAIT_YIELD = 'IGNORE_RETURN_AWAIT_YIELD';
const OPTION_NODES_CALLED_AT_PATH_WITH_OPTIONS =
	'NODES_CALLED_AT_PATH_WITH_OPTIONS';
const OPTION_REPLACED_VARIABLE_INITS = 'REPLACED_VARIABLE_INITS';
const OPTION_RETURN_EXPRESSIONS_ACCESSED_AT_PATH =
	'RETURN_EXPRESSIONS_ACCESSED_AT_PATH';
const OPTION_RETURN_EXPRESSIONS_ASSIGNED_AT_PATH =
	'RETURN_EXPRESSIONS_ASSIGNED_AT_PATH';
const OPTION_RETURN_EXPRESSIONS_CALLED_AT_PATH =
	'RETURN_EXPRESSIONS_CALLED_AT_PATH';

export type RESULT_KEY = {};
export const RESULT_KEY: RESULT_KEY = {};

export default class ExecutionPathOptions {
	_optionValues: Immutable.Map<string, any>;

	static create () {
		return new this(Immutable.Map());
	}

	constructor (optionValues: Immutable.Map<string, any>) {
		this._optionValues = optionValues;
	}

	get (option: string) {
		return this._optionValues.get(option);
	}

	remove (option: string) {
		return new ExecutionPathOptions(this._optionValues.remove(option));
	}

	set (option: string, value: any) {
		return new ExecutionPathOptions(this._optionValues.set(option, value));
	}

	setIn (optionPath: (string | Entity | RESULT_KEY)[], value: any) {
		return new ExecutionPathOptions(this._optionValues.setIn(optionPath, value));
	}

	addAccessedNodeAtPath (path: ObjectPath, node: ExpressionEntity) {
		return this.setIn([OPTION_ACCESSED_NODES, node, ...path, RESULT_KEY], true);
	}

	addAccessedReturnExpressionAtPath (path: ObjectPath, callExpression: CallExpression | Property) {
		return this.setIn(
			[
				OPTION_RETURN_EXPRESSIONS_ACCESSED_AT_PATH,
				callExpression,
				...path,
				RESULT_KEY
			],
			true
		);
	}

	addAssignedNodeAtPath (path: ObjectPath, node: WritableEntity) {
		return this.setIn([OPTION_ASSIGNED_NODES, node, ...path, RESULT_KEY], true);
	}

	addAssignedReturnExpressionAtPath (path: ObjectPath, callExpression: CallExpression | Property) {
		return this.setIn(
			[
				OPTION_RETURN_EXPRESSIONS_ASSIGNED_AT_PATH,
				callExpression,
				...path,
				RESULT_KEY
			],
			true
		);
	}

	addCalledNodeAtPathWithOptions (path: ObjectPath, node: ExpressionEntity, callOptions: CallOptions) {
		return this.setIn(
			[
				OPTION_NODES_CALLED_AT_PATH_WITH_OPTIONS,
				node,
				...path,
				RESULT_KEY,
				callOptions
			],
			true
		);
	}

	addCalledReturnExpressionAtPath (path: ObjectPath, callExpression: CallExpression | Property) {
		return this.setIn(
			[
				OPTION_RETURN_EXPRESSIONS_CALLED_AT_PATH,
				callExpression,
				...path,
				RESULT_KEY
			],
			true
		);
	}

	getArgumentsVariables (): ExpressionEntity[] {
		return <ExpressionEntity[]>(this.get(OPTION_ARGUMENTS_VARIABLES) || []);
	}

	getHasEffectsWhenCalledOptions () {
		return this.setIgnoreReturnAwaitYield()
			.setIgnoreBreakStatements(false)
			.setIgnoreNoLabels();
	}

	getReplacedVariableInit (variable: ThisVariable | ParameterVariable): ExpressionEntity {
		return this._optionValues.getIn([OPTION_REPLACED_VARIABLE_INITS, variable]);
	}

	hasNodeBeenAccessedAtPath (path: ObjectPath, node: ExpressionEntity): boolean {
		return this._optionValues.getIn([
			OPTION_ACCESSED_NODES,
			node,
			...path,
			RESULT_KEY
		]);
	}

	hasNodeBeenAssignedAtPath (path: ObjectPath, node: WritableEntity): boolean {
		return this._optionValues.getIn([
			OPTION_ASSIGNED_NODES,
			node,
			...path,
			RESULT_KEY
		]);
	}

	hasNodeBeenCalledAtPathWithOptions (path: ObjectPath, node: ExpressionEntity, callOptions: CallOptions): boolean {
		const previousCallOptions = this._optionValues.getIn([
			OPTION_NODES_CALLED_AT_PATH_WITH_OPTIONS,
			node,
			...path,
			RESULT_KEY
		]);
		return (
			previousCallOptions &&
			previousCallOptions.find((_: any, otherCallOptions: CallOptions) =>
				otherCallOptions.equals(callOptions)
			)
		);
	}

	hasReturnExpressionBeenAccessedAtPath (path: ObjectPath, callExpression: CallExpression | Property): boolean {
		return this._optionValues.getIn([
			OPTION_RETURN_EXPRESSIONS_ACCESSED_AT_PATH,
			callExpression,
			...path,
			RESULT_KEY
		]);
	}

	hasReturnExpressionBeenAssignedAtPath (path: ObjectPath, callExpression: CallExpression | Property): boolean {
		return this._optionValues.getIn([
			OPTION_RETURN_EXPRESSIONS_ASSIGNED_AT_PATH,
			callExpression,
			...path,
			RESULT_KEY
		]);
	}

	hasReturnExpressionBeenCalledAtPath (path: ObjectPath, callExpression: CallExpression | Property): boolean {
		return this._optionValues.getIn([
			OPTION_RETURN_EXPRESSIONS_CALLED_AT_PATH,
			callExpression,
			...path,
			RESULT_KEY
		]);
	}

	ignoreBreakStatements () {
		return this.get(OPTION_IGNORE_BREAK_STATEMENTS);
	}

	ignoreLabel (labelName: string) {
		return this._optionValues.getIn([OPTION_IGNORED_LABELS, labelName]);
	}

	ignoreReturnAwaitYield () {
		return this.get(OPTION_IGNORE_RETURN_AWAIT_YIELD);
	}

	replaceVariableInit (variable: ThisVariable | ParameterVariable, init: ExpressionEntity) {
		return this.setIn([OPTION_REPLACED_VARIABLE_INITS, variable], init);
	}

	setArgumentsVariables (variables: ExpressionEntity[]) {
		return this.set(OPTION_ARGUMENTS_VARIABLES, variables);
	}

	setIgnoreBreakStatements (value = true) {
		return this.set(OPTION_IGNORE_BREAK_STATEMENTS, value);
	}

	setIgnoreLabel (labelName: string) {
		return this.setIn([OPTION_IGNORED_LABELS, labelName], true);
	}

	setIgnoreNoLabels () {
		return this.remove(OPTION_IGNORED_LABELS);
	}

	setIgnoreReturnAwaitYield (value = true) {
		return this.set(OPTION_IGNORE_RETURN_AWAIT_YIELD, value);
	}
}
