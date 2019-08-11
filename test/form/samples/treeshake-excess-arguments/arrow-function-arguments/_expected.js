const noParams = () => console.log();
const someUsedParams = (p1, p2, p3) => console.log(p1, p3);

noParams();

const needed21 = 1;
const needed22 = 2;
const needed23 = 3;

someUsedParams(needed21, needed22, needed23);
someUsedParams(needed21, needed22, (needed23));
(someUsedParams)(needed21, needed22, needed23  );
