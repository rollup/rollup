import Node, { ForEachReturnExpressionCallback } from '../../Node';
import FunctionScope from '../../scopes/FunctionScope';
import BlockScope from '../../scopes/FunctionScope';
import VirtualObjectExpression from './VirtualObjectExpression';
import BlockStatement from '../BlockStatement';
import Identifier from '../Identifier';
import Pattern from '../Pattern';
import CallOptions from '../../CallOptions';
import ExecutionPathOptions from '../../ExecutionPathOptions';
import { PredicateFunction } from '../../values';
import { ObjectPath } from '../../variables/VariableReassignmentTracker';

export default class FunctionNode extends Node {
  id: Identifier;
  body: BlockStatement;
  scope: BlockScope;
  params: Pattern[];

  prototypeObject: VirtualObjectExpression;

  bindNode () {
    this.body.bindImplicitReturnExpressionToScope();
  }

  forEachReturnExpressionWhenCalledAtPath (
    path: ObjectPath,
    callOptions: CallOptions,
    callback: ForEachReturnExpressionCallback,
    options: ExecutionPathOptions
  ) {
    path.length === 0 &&
      this.scope.forEachReturnExpressionWhenCalled(
        callOptions,
        callback,
        options
      );
  }

  hasEffects (options: ExecutionPathOptions) {
    return this.id && this.id.hasEffects(options);
  }

  hasEffectsWhenAccessedAtPath (path: ObjectPath, _options: ExecutionPathOptions) {
    if (path.length <= 1) {
      return false;
    }
    if (path[0] === 'prototype') {
      return this.prototypeObject.hasEffectsWhenAccessedAtPath(path.slice(1));
    }
    return true;
  }

  hasEffectsWhenAssignedAtPath (path: ObjectPath, _options: ExecutionPathOptions) {
    if (path.length <= 1) {
      return false;
    }
    if (path[0] === 'prototype') {
      return this.prototypeObject.hasEffectsWhenAssignedAtPath(path.slice(1));
    }
    return true;
  }

  hasEffectsWhenCalledAtPath (path: ObjectPath, callOptions: CallOptions, options: ExecutionPathOptions) {
    if (path.length > 0) {
      return true;
    }
    const innerOptions = this.scope.getOptionsWhenCalledWith(
      callOptions,
      options
    );
    return (
      this.params.some(param => param.hasEffects(innerOptions)) ||
      this.body.hasEffects(innerOptions)
    );
  }

  includeInBundle () {
    this.scope.variables.arguments.includeVariable();
    return super.includeInBundle();
  }

  initialiseNode () {
    this.prototypeObject = new VirtualObjectExpression();
  }

  initialiseScope (parentScope: FunctionScope) {
    this.scope = new FunctionScope({ parent: parentScope });
  }

  someReturnExpressionWhenCalledAtPath (
    path: ObjectPath,
    callOptions: CallOptions,
    predicateFunction: (options: ExecutionPathOptions) => PredicateFunction,
    options: ExecutionPathOptions
  ): boolean {
    return (
      path.length > 0 ||
      this.scope.someReturnExpressionWhenCalled(
        callOptions,
        predicateFunction,
        options
      )
    );
  }
}
