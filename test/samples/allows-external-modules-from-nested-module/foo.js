import { relative } from 'path';

var path = 'a/b/c';
var path2 = 'a/c/b';

export default relative( path, path2 );