const noParams = () => console.log();
const someUsedParams = (p1, p2, p3) => console.log(p1, p3);
const unneeded1 = 1;

noParams(unneeded1);

const unneeded2 = 1;

const needed21 = 1;
const needed22 = 2;
const needed23 = 3;

someUsedParams(needed21, needed22, needed23, unneeded2);
