var o, t, n, r = {};

function u() {
  return t ? o : (t = 1, o = function(o) {
    console.log(o);
  });
}

var i = function() {
  if (n) return r;
  n = 1;
  var o = u();
  return r.Foo = function() {
    function t(o) {
      this.x = o;
    }
    return t.prototype.output = function() {
      o(this.x);
    }, t;
  }(), r;
}();

new i.Foo(123).output();

var e = i.Foo;

export { e as Bar };
