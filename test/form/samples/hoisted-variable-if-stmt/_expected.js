var foo; 

if (foo) {
    console.log("nope");
}

{
    var bar; {
        bar = true;
    }
}

if (bar) {
    console.log("ok");
}
