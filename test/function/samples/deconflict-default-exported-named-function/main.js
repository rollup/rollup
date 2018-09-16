import ClassDeclaration1 from './classDeclaration1';
import ClassDeclaration2 from './classDeclaration2';
import ClassExpression1 from './classExpression1';
import ClassExpression2 from './classExpression2';
import functionDeclaration1 from './functionDeclaration1';
import functionDeclaration2 from './functionDeclaration2';
import functionExpression1 from './functionExpression1';
import functionExpression2 from './functionExpression2';
import { test } from './named.js';

assert.equal(test(), 'named');
assert.equal(functionDeclaration1(), 'functionDeclaration1');
assert.equal(functionDeclaration2(), 'functionDeclaration2');
assert.equal(functionExpression1(), 'functionExpression1');
assert.equal(functionExpression2(), 'functionExpression2');
assert.equal((new ClassDeclaration1()).name, 'classDeclaration1');
assert.equal((new ClassDeclaration2()).name, 'classDeclaration2');
assert.equal((new ClassExpression1()).name, 'classExpression1');
assert.equal((new ClassExpression2()).name, 'classExpression2');
