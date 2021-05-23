class Static {
  static t() { return true; }
  static f() { return false; }
  static x = 10;
}

if (Static.t()) log("t");
if (Static.f()) log("f");
if (!Static.t()) log("!t");
if (Static.x) log("x");

class Undef {
  static 'y';
}
if (Undef.y) log("y");

class Deopt {
  static z = false;
}
unknown(Deopt);
if (Deopt.z) log("z");
