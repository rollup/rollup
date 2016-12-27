export function foo () { console.log("outer foo"); }
export function bar () { console.log("outer bar"); }
export function bog () { console.log("outer bog"); }
export function boo () { console.log("outer boo"); }

function Baz() {
    function foo () { console.log("inner foo"); }
    function bar () { console.log("inner bar"); }
    function bog () { console.log("inner bog"); }
    function boo () { console.log("inner boo"); }

    return bar(), bog;
}

export { Baz as baz };
