export var x = 42;
import( './main' ).then(x => {
  console.log( x );
});
