import './dep1.js';
import { spread } from './dep2.js';
import './dep3.js';
const Foo = () => {};
export const element = <Foo>{...spread}</Foo>;
export const fragment = <>{...spread}</>;
