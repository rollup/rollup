'use strict';

cjsDynamicImportPreload('./generated-has-dependencies.js', ["generated-no-dependencies.js"]);
cjsDynamicImportPreload('./generated-no-dependencies.js', []);
cjsDynamicImportPreload(somethingElse, null);
