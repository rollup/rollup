switch (someGlobal) {
    case 1:
        var hoisted = true;
    case 2:
        if (hoisted) {
            throw "failed";
        }
}
