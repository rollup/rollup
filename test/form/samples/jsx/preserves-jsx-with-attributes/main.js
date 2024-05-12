import './dep1.js';
import { value } from './dep2.js';
import './dep3.js';

const Foo = () => {};
export const result = <Foo bar baz="string" quux-nix={value} />;
