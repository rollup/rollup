if (false) {
    var foo = true;
    var unused;
}

if (foo) {
    console.log("nope");
}

if (true) {
    if (false) {
        var bar = false;
    } else {
        bar = true;
    }
}

if (bar) {
    console.log("ok");
}
