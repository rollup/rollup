function a() {
  a = someGlobal;
  return a();
}

a();
