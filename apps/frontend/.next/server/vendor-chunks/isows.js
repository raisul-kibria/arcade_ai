"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/isows";
exports.ids = ["vendor-chunks/isows"];
exports.modules = {

/***/ "(ssr)/../../node_modules/isows/_esm/index.js":
/*!**********************************************!*\
  !*** ../../node_modules/isows/_esm/index.js ***!
  \**********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   WebSocket: () => (/* binding */ WebSocket)\n/* harmony export */ });\n/* harmony import */ var ws__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ws */ \"(ssr)/../../node_modules/ws/wrapper.mjs\");\n/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils.js */ \"(ssr)/../../node_modules/isows/_esm/utils.js\");\n\n\nconst WebSocket = (()=>{\n    try {\n        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.getNativeWebSocket)();\n    } catch  {\n        if (ws__WEBPACK_IMPORTED_MODULE_0__.WebSocket) return ws__WEBPACK_IMPORTED_MODULE_0__.WebSocket;\n        return ws__WEBPACK_IMPORTED_MODULE_0__;\n    }\n})(); //# sourceMappingURL=index.js.map\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi4vLi4vbm9kZV9tb2R1bGVzL2lzb3dzL19lc20vaW5kZXguanMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQWlDO0FBQ2U7QUFDekMsTUFBTUUsWUFBWSxDQUFDO0lBQ3RCLElBQUk7UUFDQSxPQUFPRCw2REFBa0JBO0lBQzdCLEVBQ0EsT0FBTTtRQUNGLElBQUlELHlDQUFvQixFQUNwQixPQUFPQSx5Q0FBb0I7UUFDL0IsT0FBT0EsK0JBQVVBO0lBQ3JCO0FBQ0osS0FBSyxDQUNMLGlDQUFpQyIsInNvdXJjZXMiOlsid2VicGFjazovL0BhcmNhZGUtYWkvZnJvbnRlbmQvLi4vLi4vbm9kZV9tb2R1bGVzL2lzb3dzL19lc20vaW5kZXguanM/NTA1MSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBXZWJTb2NrZXRfIGZyb20gXCJ3c1wiO1xuaW1wb3J0IHsgZ2V0TmF0aXZlV2ViU29ja2V0IH0gZnJvbSBcIi4vdXRpbHMuanNcIjtcbmV4cG9ydCBjb25zdCBXZWJTb2NrZXQgPSAoKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBnZXROYXRpdmVXZWJTb2NrZXQoKTtcbiAgICB9XG4gICAgY2F0Y2gge1xuICAgICAgICBpZiAoV2ViU29ja2V0Xy5XZWJTb2NrZXQpXG4gICAgICAgICAgICByZXR1cm4gV2ViU29ja2V0Xy5XZWJTb2NrZXQ7XG4gICAgICAgIHJldHVybiBXZWJTb2NrZXRfO1xuICAgIH1cbn0pKCk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiXSwibmFtZXMiOlsiV2ViU29ja2V0XyIsImdldE5hdGl2ZVdlYlNvY2tldCIsIldlYlNvY2tldCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/../../node_modules/isows/_esm/index.js\n");

/***/ }),

/***/ "(ssr)/../../node_modules/isows/_esm/utils.js":
/*!**********************************************!*\
  !*** ../../node_modules/isows/_esm/utils.js ***!
  \**********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getNativeWebSocket: () => (/* binding */ getNativeWebSocket)\n/* harmony export */ });\nfunction getNativeWebSocket() {\n    if (typeof WebSocket !== \"undefined\") return WebSocket;\n    if (typeof global.WebSocket !== \"undefined\") return global.WebSocket;\n    if (typeof window.WebSocket !== \"undefined\") return window.WebSocket;\n    if (typeof self.WebSocket !== \"undefined\") return self.WebSocket;\n    throw new Error(\"`WebSocket` is not supported in this environment\");\n} //# sourceMappingURL=utils.js.map\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi4vLi4vbm9kZV9tb2R1bGVzL2lzb3dzL19lc20vdXRpbHMuanMiLCJtYXBwaW5ncyI6Ijs7OztBQUFPLFNBQVNBO0lBQ1osSUFBSSxPQUFPQyxjQUFjLGFBQ3JCLE9BQU9BO0lBQ1gsSUFBSSxPQUFPQyxPQUFPRCxTQUFTLEtBQUssYUFDNUIsT0FBT0MsT0FBT0QsU0FBUztJQUMzQixJQUFJLE9BQU9FLE9BQU9GLFNBQVMsS0FBSyxhQUM1QixPQUFPRSxPQUFPRixTQUFTO0lBQzNCLElBQUksT0FBT0csS0FBS0gsU0FBUyxLQUFLLGFBQzFCLE9BQU9HLEtBQUtILFNBQVM7SUFDekIsTUFBTSxJQUFJSSxNQUFNO0FBQ3BCLEVBQ0EsaUNBQWlDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vQGFyY2FkZS1haS9mcm9udGVuZC8uLi8uLi9ub2RlX21vZHVsZXMvaXNvd3MvX2VzbS91dGlscy5qcz81NmRkIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBnZXROYXRpdmVXZWJTb2NrZXQoKSB7XG4gICAgaWYgKHR5cGVvZiBXZWJTb2NrZXQgIT09IFwidW5kZWZpbmVkXCIpXG4gICAgICAgIHJldHVybiBXZWJTb2NrZXQ7XG4gICAgaWYgKHR5cGVvZiBnbG9iYWwuV2ViU29ja2V0ICE9PSBcInVuZGVmaW5lZFwiKVxuICAgICAgICByZXR1cm4gZ2xvYmFsLldlYlNvY2tldDtcbiAgICBpZiAodHlwZW9mIHdpbmRvdy5XZWJTb2NrZXQgIT09IFwidW5kZWZpbmVkXCIpXG4gICAgICAgIHJldHVybiB3aW5kb3cuV2ViU29ja2V0O1xuICAgIGlmICh0eXBlb2Ygc2VsZi5XZWJTb2NrZXQgIT09IFwidW5kZWZpbmVkXCIpXG4gICAgICAgIHJldHVybiBzZWxmLldlYlNvY2tldDtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJgV2ViU29ja2V0YCBpcyBub3Qgc3VwcG9ydGVkIGluIHRoaXMgZW52aXJvbm1lbnRcIik7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD11dGlscy5qcy5tYXAiXSwibmFtZXMiOlsiZ2V0TmF0aXZlV2ViU29ja2V0IiwiV2ViU29ja2V0IiwiZ2xvYmFsIiwid2luZG93Iiwic2VsZiIsIkVycm9yIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/../../node_modules/isows/_esm/utils.js\n");

/***/ })

};
;