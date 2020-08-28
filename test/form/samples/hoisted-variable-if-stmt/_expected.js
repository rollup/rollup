var foo; 

if (foo) {
    console.log("nope");
}

{
    var bar = true;
}

if (bar) {
    console.log("ok");
}
