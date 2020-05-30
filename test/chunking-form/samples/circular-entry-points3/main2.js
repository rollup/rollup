import { C } from './dep2.js';
export var p = 43;
export {p as p2} from './main1'

new C().fn(p);