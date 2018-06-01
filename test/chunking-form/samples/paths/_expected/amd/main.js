define(['exports', 'https://external-url.com/changed-new.js', 'https://external-url.com/unchanged.js', 'external-changed-new', 'external-unchanged', '../external-relative-changed-new', '../external-relative-unchanged', './internal-changed-new', './internal-unchanged.js'], function (exports, changedOld_js, unchanged_js, externalChangedOld, externalUnchanged, externalRelativeChangedOld, externalRelativeUnchanged, __chunk_1, __chunk_2) { 'use strict';

    changedOld_js = changedOld_js && changedOld_js.hasOwnProperty('default') ? changedOld_js['default'] : changedOld_js;
    unchanged_js = unchanged_js && unchanged_js.hasOwnProperty('default') ? unchanged_js['default'] : unchanged_js;
    externalChangedOld = externalChangedOld && externalChangedOld.hasOwnProperty('default') ? externalChangedOld['default'] : externalChangedOld;
    externalUnchanged = externalUnchanged && externalUnchanged.hasOwnProperty('default') ? externalUnchanged['default'] : externalUnchanged;
    externalRelativeChangedOld = externalRelativeChangedOld && externalRelativeChangedOld.hasOwnProperty('default') ? externalRelativeChangedOld['default'] : externalRelativeChangedOld;
    externalRelativeUnchanged = externalRelativeUnchanged && externalRelativeUnchanged.hasOwnProperty('default') ? externalRelativeUnchanged['default'] : externalRelativeUnchanged;



    exports.externalUrlChangedOld = changedOld_js;
    exports.externalUrlUnchanged = unchanged_js;
    exports.externalChangedOld = externalChangedOld;
    exports.externalUnchanged = externalUnchanged;
    exports.externalRelativeChangedOld = externalRelativeChangedOld;
    exports.externalRelativeUnchanged = externalRelativeUnchanged;
    exports.internalChangedOld = __chunk_1.default;
    exports.internalUnchanged = __chunk_2.default;

    Object.defineProperty(exports, '__esModule', { value: true });

});
