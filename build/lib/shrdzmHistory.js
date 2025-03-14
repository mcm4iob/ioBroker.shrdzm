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
  doPower: () => doPower,
  setCache: () => setCache
});
module.exports = __toCommonJS(shrdzmHistory_exports);
var import_meanValue = require("./meanValue");
const historyCache = {};
function initCache(deviceId, obisCode) {
  if (!historyCache[deviceId]) {
    historyCache[deviceId] = {};
  }
  if (!historyCache[deviceId][obisCode]) {
    historyCache[deviceId][obisCode] = {
      minute: {
        switched: false,
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
        switched: false,
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
        switched: false,
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
        switched: false,
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
function getId(date) {
  return (
    // eslint-disable-next-line
    ((((date.getFullYear() * 100 + date.getMonth() + 1) * 100 + date.getUTCDate()) * 100 + date.getUTCHours()) * 100 + date.getUTCMinutes()) * 100
  );
}
function getId4Quarter(date) {
  return (
    // eslint-disable-next-line
    ((((date.getFullYear() * 100 + date.getMonth() + 1) * 100 + date.getUTCDate()) * 100 + date.getUTCHours()) * 100 + Math.trunc(date.getUTCMinutes() / 15) * 15) * 100
  );
}
function switchEntry(historyEntry, id, value) {
  var _a;
  historyEntry.last.id = historyEntry.curr.id;
  historyEntry.last.value = historyEntry.curr.value;
  historyEntry.last.startValue = historyEntry.curr.startValue;
  historyEntry.curr.id = id;
  (_a = historyEntry.curr.meanValue) == null ? void 0 : _a.reset();
  historyEntry.curr.startValue = historyEntry.curr.currValue ? historyEntry.curr.currValue : value;
  historyEntry.switched = true;
}
function updateEnergy(historyEntry, id, value) {
  historyEntry.switched = false;
  if (historyEntry.curr.id !== id) {
    switchEntry(historyEntry, id, value);
  }
  historyEntry.curr.currValue = value;
  historyEntry.curr.value = value - historyEntry.curr.startValue;
}
function updateEnergyMinute(date, deviceId, obisCode, value) {
  const historyEntry = historyCache[deviceId][obisCode].minute;
  const id = getId(date);
  updateEnergy(historyEntry, id, value);
}
function updateEnergyQuarter(date, deviceId, obisCode, value) {
  const historyEntry = historyCache[deviceId][obisCode].quarter;
  const id = getId4Quarter(date);
  updateEnergy(historyEntry, id, value);
}
function updateEnergyHour(date, deviceId, obisCode, value) {
  const historyEntry = historyCache[deviceId][obisCode].hour;
  const id = Math.trunc(getId(date) / 100 / 100) * 100 * 100;
  updateEnergy(historyEntry, id, value);
}
function updateEnergyDay(date, deviceId, obisCode, value) {
  const historyEntry = historyCache[deviceId][obisCode].day;
  const id = Math.trunc(getId(date) / 100 / 100 / 100) * 100 * 100 * 100;
  updateEnergy(historyEntry, id, value);
}
function updatePower(historyEntry, id, value) {
  var _a;
  historyEntry.switched = false;
  if (historyEntry.curr.id !== id) {
    switchEntry(historyEntry, id, 0);
  }
  historyEntry.curr.value = ((_a = historyEntry.curr.meanValue) == null ? void 0 : _a.add(value)) || 0;
}
function updatePowerMinute(date, deviceId, obisCode, value) {
  const historyEntry = historyCache[deviceId][obisCode].minute;
  const id = getId(date);
  updatePower(historyEntry, id, value);
}
function updatePowerQuarter(date, deviceId, obisCode, value) {
  const historyEntry = historyCache[deviceId][obisCode].quarter;
  const id = getId4Quarter(date);
  updatePower(historyEntry, id, value);
}
function updatePowerHour(date, deviceId, obisCode, value) {
  const historyEntry = historyCache[deviceId][obisCode].hour;
  const id = Math.trunc(getId(date) / 100 / 100) * 100 * 100;
  updatePower(historyEntry, id, value);
}
function updatePowerDay(date, deviceId, obisCode, value) {
  const historyEntry = historyCache[deviceId][obisCode].day;
  const id = Math.trunc(getId(date) / 100 / 100 / 100) * 100 * 100 * 100;
  updatePower(historyEntry, id, value);
}
function doEnergy(ts, deviceId, obisCode, value) {
  initCache(deviceId, obisCode);
  const date = new Date(ts);
  updateEnergyMinute(date, deviceId, obisCode, value);
  updateEnergyQuarter(date, deviceId, obisCode, value);
  updateEnergyHour(date, deviceId, obisCode, value);
  updateEnergyDay(date, deviceId, obisCode, value);
  return {
    minute: {
      switched: historyCache[deviceId][obisCode].minute.switched,
      curr: {
        id: historyCache[deviceId][obisCode].minute.curr.id,
        startValue: historyCache[deviceId][obisCode].minute.curr.startValue,
        value: historyCache[deviceId][obisCode].minute.curr.value
      },
      last: {
        id: historyCache[deviceId][obisCode].minute.last.id,
        startValue: historyCache[deviceId][obisCode].minute.last.startValue,
        value: historyCache[deviceId][obisCode].minute.last.value
      }
    },
    quarter: {
      switched: historyCache[deviceId][obisCode].quarter.switched,
      curr: {
        id: historyCache[deviceId][obisCode].quarter.curr.id,
        startValue: historyCache[deviceId][obisCode].quarter.curr.startValue,
        value: historyCache[deviceId][obisCode].quarter.curr.value
      },
      last: {
        id: historyCache[deviceId][obisCode].quarter.last.id,
        startValue: historyCache[deviceId][obisCode].quarter.last.startValue,
        value: historyCache[deviceId][obisCode].quarter.last.value
      }
    },
    hour: {
      switched: historyCache[deviceId][obisCode].hour.switched,
      curr: {
        id: historyCache[deviceId][obisCode].hour.curr.id,
        startValue: historyCache[deviceId][obisCode].hour.curr.startValue,
        value: historyCache[deviceId][obisCode].hour.curr.value
      },
      last: {
        id: historyCache[deviceId][obisCode].hour.last.id,
        startValue: historyCache[deviceId][obisCode].hour.last.startValue,
        value: historyCache[deviceId][obisCode].hour.last.value
      }
    },
    day: {
      switched: historyCache[deviceId][obisCode].day.switched,
      curr: {
        id: historyCache[deviceId][obisCode].day.curr.id,
        startValue: historyCache[deviceId][obisCode].day.curr.startValue,
        value: historyCache[deviceId][obisCode].day.curr.value
      },
      last: {
        id: historyCache[deviceId][obisCode].day.last.id,
        startValue: historyCache[deviceId][obisCode].day.last.startValue,
        value: historyCache[deviceId][obisCode].day.last.value
      }
    }
  };
}
function doPower(ts, deviceId, obisCode, value) {
  initCache(deviceId, obisCode);
  const date = new Date(ts);
  updatePowerMinute(date, deviceId, obisCode, value);
  updatePowerQuarter(date, deviceId, obisCode, value);
  updatePowerHour(date, deviceId, obisCode, value);
  updatePowerDay(date, deviceId, obisCode, value);
  return {
    minute: {
      switched: historyCache[deviceId][obisCode].minute.switched,
      curr: {
        id: historyCache[deviceId][obisCode].minute.curr.id,
        startValue: historyCache[deviceId][obisCode].minute.curr.startValue,
        value: historyCache[deviceId][obisCode].minute.curr.value
      },
      last: {
        id: historyCache[deviceId][obisCode].minute.last.id,
        startValue: historyCache[deviceId][obisCode].minute.last.startValue,
        value: historyCache[deviceId][obisCode].minute.last.value
      }
    },
    quarter: {
      switched: historyCache[deviceId][obisCode].quarter.switched,
      curr: {
        id: historyCache[deviceId][obisCode].quarter.curr.id,
        startValue: historyCache[deviceId][obisCode].quarter.curr.startValue,
        value: historyCache[deviceId][obisCode].quarter.curr.value
      },
      last: {
        id: historyCache[deviceId][obisCode].quarter.last.id,
        startValue: historyCache[deviceId][obisCode].quarter.last.startValue,
        value: historyCache[deviceId][obisCode].quarter.last.value
      }
    },
    hour: {
      switched: historyCache[deviceId][obisCode].hour.switched,
      curr: {
        id: historyCache[deviceId][obisCode].hour.curr.id,
        startValue: historyCache[deviceId][obisCode].hour.curr.startValue,
        value: historyCache[deviceId][obisCode].hour.curr.value
      },
      last: {
        id: historyCache[deviceId][obisCode].hour.last.id,
        startValue: historyCache[deviceId][obisCode].hour.last.startValue,
        value: historyCache[deviceId][obisCode].hour.last.value
      }
    },
    day: {
      switched: historyCache[deviceId][obisCode].day.switched,
      curr: {
        id: historyCache[deviceId][obisCode].day.curr.id,
        startValue: historyCache[deviceId][obisCode].day.curr.startValue,
        value: historyCache[deviceId][obisCode].day.curr.value
      },
      last: {
        id: historyCache[deviceId][obisCode].day.last.id,
        startValue: historyCache[deviceId][obisCode].day.last.startValue,
        value: historyCache[deviceId][obisCode].day.last.value
      }
    }
  };
}
function setCache(deviceId, obisCode, rangeId, stateId, value) {
  initCache(deviceId, obisCode);
  if (!["minute", "quarter", "hour", "day"].includes(rangeId)) {
    return false;
  }
  if (stateId === "currId") {
    historyCache[deviceId][obisCode][rangeId].curr.id = value;
  } else if (stateId === "lastId") {
    historyCache[deviceId][obisCode][rangeId].last.id = value;
  } else if (stateId === "currStart") {
    historyCache[deviceId][obisCode][rangeId].curr.startValue = value;
  } else if (stateId === "lastStart") {
    historyCache[deviceId][obisCode][rangeId].last.startValue = value;
  } else if (stateId === "curr") {
    historyCache[deviceId][obisCode][rangeId].curr.value = value;
  } else if (stateId === "last") {
    historyCache[deviceId][obisCode][rangeId].last.value = value;
  } else {
    return false;
  }
  return true;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  doEnergy,
  doPower,
  setCache
});
//# sourceMappingURL=shrdzmHistory.js.map
