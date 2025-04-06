"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var meanValue_exports = {};
__export(meanValue_exports, {
  MeanValue: () => MeanValue
});
module.exports = __toCommonJS(meanValue_exports);
class MeanValue {
  _sum;
  _count;
  /**
   * constructor
   *
   */
  constructor() {
    this._sum = 0;
    this._count = 0;
  }
  /**
   * reset
   *
   * reinitializes a meanvalue
   *
   */
  reset() {
    this._sum = 0;
    this._count = 0;
  }
  /**
   * add
   *
   * updates meanvalue by adding a new value and returns the new meanValue
   *
   * @param value new value to add
   * @returns current meanValue
   */
  add(value) {
    this._sum += value;
    this._count++;
    return this._sum / this._count;
  }
  /**
   * get
   *
   * returns current meanValue
   *
   * @returns current meanValue
   */
  get() {
    return this._sum / this._count;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MeanValue
});
//# sourceMappingURL=meanValue.js.map
