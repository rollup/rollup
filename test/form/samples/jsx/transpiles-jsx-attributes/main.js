import './dep1.js';
import { Foo, value } from './dep2.js';
import './dep3.js';

export const result = <Foo
  bar
  baz:foo="string"
  quux-nix={value}
  element=<Foo/>
  fragment=<></>
/>;
