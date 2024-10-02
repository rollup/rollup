import './dep1.js';
import { obj } from './dep2.js';
import './dep3.js';

const Foo = () => {};
export const result1 = <Foo {...obj} />;
export const result2 = <Foo {...obj} prop />;
export const result3 = <Foo
  prop1
  prop2
  {...obj}
  {...obj}
/>;
