export {default as foo} from './foo';

export var foo1 = foo(); // This should fail as foo lacks a local binding.
