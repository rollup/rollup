var augment;
augment = y => y.augmented = true;

function x () {}
augment( x );

export { x as default };
