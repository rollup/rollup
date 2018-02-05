import { Test } from 'a';
import Test$1 from 'b';

const Test$2 = () => {
  console.log(Test);
};

const Test1 = () => {
  console.log(Test$1);
};

export { Test$2 as Test, Test1 };
