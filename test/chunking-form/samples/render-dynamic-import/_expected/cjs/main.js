'use strict';

cjsSpecialHandler('./generated-imported-via-special-handler.js', 'main.js', 'imported-via-special-handler.js', null);
cjsSpecialHandler(someVariable, 'main.js', 'null', null);
cjsSpecialHandler(someCustomlyResolvedVariable, 'main.js', 'null', someCustomlyResolvedVariable);
