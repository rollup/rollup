import { resolve } from 'dns';
import 'util';
import { writeFileSync } from 'fs';

resolve('name');
writeFileSync('foo', 'bar');
