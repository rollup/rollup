import { module1 } from './foo%20bar';
import { module2 } from './foo%bar';
import { module3 } from './foo%E3%81%82bar';
import { module4 } from './foo%E3%81bar';

module1();
module2();
module3();
module4();
