(do {})();
(do {}).y;
(do {}).y();
(do {}).y = 'retained';

const a = do {
  if (c1) {
    x();
  } else if (c2) {
    x.a;
  } else {
    x;
  }
};
a();
a.x();
a.y = 'retained';

const b = (do {})();
const c = (do {}).c;
const d = (do {}).d();
const e = (do {}).e = 'retained';
