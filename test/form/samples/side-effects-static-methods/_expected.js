class Effect {
  static a() { log(); }
}
Effect.a();

class DeoptComputed {
  static a() {}
  static [foo]() { log(); }
}
DeoptComputed.a();

class DeoptGetter {
  static a() {}
  static get a() {}
}
DeoptGetter.a();

class DeoptAssign {
  static a() {}
}
DeoptAssign.a = log;
DeoptAssign.a();

class DeoptFully {
  static a() {}
}
unknown(DeoptFully);
DeoptFully.a();

class DeepAssign {
  static a = {}
  a = {}
}
DeepAssign.a.b = 1;
DeepAssign.prototype.a.b = 1;

class DynamicAssign {}
DynamicAssign[foo()] = 1;
