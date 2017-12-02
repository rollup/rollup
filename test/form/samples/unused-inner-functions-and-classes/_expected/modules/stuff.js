export function bar () { console.log("outer bar"); }



function Baz() {
    function bar () { console.log("inner bar"); }
    function bog () { console.log("inner bog"); }
    return bar(), bog;
}

export { Baz as baz };
