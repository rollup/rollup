undefined?.foo();
undefined?.foo?.bar?.();
undefined?.();

if (undefined?.foo) {
  console.log("shaked");
}

if (undefined?.foo?.bar || false) {
  console.log("shaked");
}

(undefined || null)?.foo();
(undefined ?? null ?? undefined?.bar)?.foo();

null?.bar();

// remains
exist?.foo?.();

if (exist?.z) {
  console.log("remains")
}
