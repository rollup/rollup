function s(t) {
    t(x);
}

function f(b) {
    return x.concat((b ? 1 : 0))
}

function w(b) {
    f(b);
}

w(1);
s(() => {
  return w(0)
});
