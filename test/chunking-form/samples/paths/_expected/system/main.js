System.register(['https://external-url.com/changed-new.js', 'https://external-url.com/unchanged.js', 'external-changed-new', 'external-unchanged', '../external-relative-changed-new', '../external-relative-unchanged', './internal-changed-new', './internal-unchanged.js'], function (exports, module) {
    'use strict';
    var changedOld_js, unchanged_js, externalChangedOld, externalUnchanged, externalRelativeChangedOld, externalRelativeUnchanged, internalChangedOld, internalUnchanged;
    return {
        setters: [function (module) {
            changedOld_js = module.default;
            exports('externalUrlChangedOld', module.default);
        }, function (module) {
            unchanged_js = module.default;
            exports('externalUrlUnchanged', module.default);
        }, function (module) {
            externalChangedOld = module.default;
            exports('externalChangedOld', module.default);
        }, function (module) {
            externalUnchanged = module.default;
            exports('externalUnchanged', module.default);
        }, function (module) {
            externalRelativeChangedOld = module.default;
            exports('externalRelativeChangedOld', module.default);
        }, function (module) {
            externalRelativeUnchanged = module.default;
            exports('externalRelativeUnchanged', module.default);
        }, function (module) {
            internalChangedOld = module.default;
            exports('internalChangedOld', module.default);
        }, function (module) {
            internalUnchanged = module.default;
            exports('internalUnchanged', module.default);
        }],
        execute: function () {



        }
    };
});
