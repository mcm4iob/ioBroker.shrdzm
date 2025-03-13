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
var shrdzmHistory_exports = {};
__export(shrdzmHistory_exports, {
  doEnergy: () => doEnergy,
  doPower: () => doPower
});
module.exports = __toCommonJS(shrdzmHistory_exports);
var import_meanValue = require("./meanValue");
const historyCache = {};
function initCache(obisCode) {
  if (!historyCache[obisCode]) {
    historyCache[obisCode] = {
      minute: {
        curr: {
          id: -1,
          startValue: 0,
          currValue: 0,
          meanValue: new import_meanValue.MeanValue(),
          value: 0
        },
        last: {
          id: -1,
          startValue: 0,
          currValue: 0,
          meanValue: null,
          value: 0
        }
      },
      quarter: {
        curr: {
          id: -1,
          startValue: 0,
          currValue: 0,
          meanValue: new import_meanValue.MeanValue(),
          value: 0
        },
        last: {
          id: -1,
          startValue: 0,
          currValue: 0,
          meanValue: null,
          value: 0
        }
      },
      hour: {
        curr: {
          id: -1,
          startValue: 0,
          currValue: 0,
          meanValue: new import_meanValue.MeanValue(),
          value: 0
        },
        last: {
          id: -1,
          startValue: 0,
          currValue: 0,
          meanValue: null,
          value: 0
        }
      },
      day: {
        curr: {
          id: -1,
          startValue: 0,
          currValue: 0,
          meanValue: new import_meanValue.MeanValue(),
          value: 0
        },
        last: {
          id: -1,
          startValue: 0,
          currValue: 0,
          meanValue: null,
          value: 0
        }
      }
    };
  }
}
function switchEntry(historyEntry, id, value) {
  var _a;
  historyEntry.last.id = historyEntry.curr.id;
  historyEntry.last.value = historyEntry.curr.value;
  historyEntry.curr.id = id;
  (_a = historyEntry.curr.meanValue) == null ? void 0 : _a.reset();
  historyEntry.curr.startValue = historyEntry.curr.currValue ? historyEntry.curr.currValue : value;
}
function updateEnergy(historyEntry, id, value) {
  if (historyEntry.curr.id !== id) {
    switchEntry(historyEntry, id, value);
  }
  historyEntry.curr.currValue = value;
  historyEntry.curr.value = value - historyEntry.curr.startValue;
}
function getId(date) {
  return (
    // eslint-disable-next-line
    ((((date.getFullYear() * 100 + date.getMonth() + 1) * 100 + date.getDay()) * 100 + date.getHours()) * 100 + date.getMinutes()) * 100
  );
}
function updateEnergyMinute(date, obisCode, value) {
  const historyEntry = historyCache[obisCode].minute;
  const id = getId(date);
  updateEnergy(historyEntry, id, value);
}
function updateEnergyQuarter(date, obisCode, value) {
  const historyEntry = historyCache[obisCode].quarter;
  const id = Math.trunc(getId(date) / 15 / 100) * 15 * 100;
  updateEnergy(historyEntry, id, value);
}
function updateEnergyHour(date, obisCode, value) {
  const historyEntry = historyCache[obisCode].hour;
  const id = Math.trunc(getId(date) / 100 / 100) * 100 * 100;
  updateEnergy(historyEntry, id, value);
}
function updateEnergyDay(date, obisCode, value) {
  const historyEntry = historyCache[obisCode].day;
  const id = Math.trunc(getId(date) / 100 / 100 / 100) * 100 * 100 * 100;
  updateEnergy(historyEntry, id, value);
}
function updatePower(historyEntry, id, value) {
  var _a;
  if (historyEntry.curr.id !== id) {
    switchEntry(historyEntry, id, 0);
  }
  historyEntry.curr.value = ((_a = historyEntry.curr.meanValue) == null ? void 0 : _a.add(value)) || 0;
}
function updatePowerMinute(date, obisCode, value) {
  const historyEntry = historyCache[obisCode].minute;
  const id = getId(date);
  updatePower(historyEntry, id, value);
}
function updatePowerQuarter(date, obisCode, value) {
  const historyEntry = historyCache[obisCode].quarter;
  const id = Math.trunc(getId(date) / 15 / 100) * 15 * 100;
  updatePower(historyEntry, id, value);
}
function updatePowerHour(date, obisCode, value) {
  const historyEntry = historyCache[obisCode].hour;
  const id = Math.trunc(getId(date) / 100 / 100) * 100 * 100;
  updatePower(historyEntry, id, value);
}
function updatePowerDay(date, obisCode, value) {
  const historyEntry = historyCache[obisCode].day;
  const id = Math.trunc(getId(date) / 100 / 100 / 100) * 100 * 100 * 100;
  updatePower(historyEntry, id, value);
}
function doEnergy(ts, obisCode, value) {
  initCache(obisCode);
  const date = new Date(ts);
  updateEnergyMinute(date, obisCode, value);
  updateEnergyQuarter(date, obisCode, value);
  updateEnergyHour(date, obisCode, value);
  updateEnergyDay(date, obisCode, value);
  return {
    minute: {
      switched: true,
      curr: {
        id: historyCache[obisCode].minute.curr.id,
        startValue: historyCache[obisCode].minute.curr.startValue,
        value: historyCache[obisCode].minute.curr.value
      },
      last: {
        id: historyCache[obisCode].minute.last.id,
        startValue: historyCache[obisCode].minute.last.startValue,
        value: historyCache[obisCode].minute.last.value
      }
    },
    quarter: {
      switched: true,
      curr: {
        id: historyCache[obisCode].quarter.curr.id,
        startValue: historyCache[obisCode].quarter.curr.startValue,
        value: historyCache[obisCode].quarter.curr.value
      },
      last: {
        id: historyCache[obisCode].quarter.last.id,
        startValue: historyCache[obisCode].quarter.last.startValue,
        value: historyCache[obisCode].quarter.last.value
      }
    },
    hour: {
      switched: true,
      curr: {
        id: historyCache[obisCode].hour.curr.id,
        startValue: historyCache[obisCode].hour.curr.startValue,
        value: historyCache[obisCode].hour.curr.value
      },
      last: {
        id: historyCache[obisCode].hour.last.id,
        startValue: historyCache[obisCode].hour.last.startValue,
        value: historyCache[obisCode].hour.last.value
      }
    },
    day: {
      switched: true,
      curr: {
        id: historyCache[obisCode].day.curr.id,
        startValue: historyCache[obisCode].day.curr.startValue,
        value: historyCache[obisCode].day.curr.value
      },
      last: {
        id: historyCache[obisCode].day.last.id,
        startValue: historyCache[obisCode].day.last.startValue,
        value: historyCache[obisCode].day.last.value
      }
    }
  };
}
function doPower(ts, obisCode, value) {
  initCache(obisCode);
  const date = new Date(ts);
  updatePowerMinute(date, obisCode, value);
  updatePowerQuarter(date, obisCode, value);
  updatePowerHour(date, obisCode, value);
  updatePowerDay(date, obisCode, value);
  return {
    minute: {
      switched: true,
      curr: {
        id: historyCache[obisCode].minute.curr.id,
        startValue: historyCache[obisCode].minute.curr.startValue,
        value: historyCache[obisCode].minute.curr.value
      },
      last: {
        id: historyCache[obisCode].minute.last.id,
        startValue: historyCache[obisCode].minute.last.startValue,
        value: historyCache[obisCode].minute.last.value
      }
    },
    quarter: {
      switched: true,
      curr: {
        id: historyCache[obisCode].quarter.curr.id,
        startValue: historyCache[obisCode].quarter.curr.startValue,
        value: historyCache[obisCode].quarter.curr.value
      },
      last: {
        id: historyCache[obisCode].quarter.last.id,
        startValue: historyCache[obisCode].quarter.last.startValue,
        value: historyCache[obisCode].quarter.last.value
      }
    },
    hour: {
      switched: true,
      curr: {
        id: historyCache[obisCode].hour.curr.id,
        startValue: historyCache[obisCode].hour.curr.startValue,
        value: historyCache[obisCode].hour.curr.value
      },
      last: {
        id: historyCache[obisCode].hour.last.id,
        startValue: historyCache[obisCode].hour.last.startValue,
        value: historyCache[obisCode].hour.last.value
      }
    },
    day: {
      switched: true,
      curr: {
        id: historyCache[obisCode].day.curr.id,
        startValue: historyCache[obisCode].day.curr.startValue,
        value: historyCache[obisCode].day.curr.value
      },
      last: {
        id: historyCache[obisCode].day.last.id,
        startValue: historyCache[obisCode].day.last.startValue,
        value: historyCache[obisCode].day.last.value
      }
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  doEnergy,
  doPower
});
//# sourceMappingURL=shrdzmHistory.js.map
