import bar from 'bar1';
import bar$1 from 'bar2';

function foo() {
    this.bar = bar$1;
}

console.log(bar);
console.log(foo);
