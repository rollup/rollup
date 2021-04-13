import('./generated-first.js');
import('./generated-second.js').then(function (n) { return n.b; });
import('./generated-second.js').then(function (n) { return n.c; });
