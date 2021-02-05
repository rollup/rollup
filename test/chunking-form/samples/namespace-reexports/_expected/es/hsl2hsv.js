var hsl2hsv = (h, s, l) => {
  const t = s * (l < 0.5 ? 1 : 1 - l),
    V = 1 + t,
    S = 2 * t / V ;
  return [h, S, V];
};

var p = 5;

export default hsl2hsv;
export { p };
