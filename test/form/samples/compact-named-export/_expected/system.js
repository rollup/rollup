System.register('foo',[],function(exports){'use strict';return{execute:function(){let x = exports('x',42);
x=exports('x',x+1);
x=exports('x',x+1);
(exports('x',x+1),x++);
exports('x',++x);}}});