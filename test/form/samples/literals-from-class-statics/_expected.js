log("t");
log("x");

class Undef {
  static 'y';
}
if (Undef.y) log("y");

class Deopt {
  static z = false;
}
unknown(Deopt);
if (Deopt.z) log("z");
