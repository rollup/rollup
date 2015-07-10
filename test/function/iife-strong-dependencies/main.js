import { A } from './A';
import { B } from './B';
import { C } from './C';
import { D } from './D';

export var a1 = new A();
export var b1 = new B();
export var c1 = new C();
export var d1 = new D();

export var a2 = b1.a();
export var b2 = a1.b();
export var c2 = d1.c();
export var d2 = c1.d();
