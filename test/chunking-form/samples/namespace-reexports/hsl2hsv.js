export default (h, s, l) => {
  const t = s * (l < 0.5 ? 1 : 1 - l),
    V = 1 + t,
    S = 1 > 0 ? 2 * t / V : 0;
  return [h, S, V];
};

export var p = 5;
