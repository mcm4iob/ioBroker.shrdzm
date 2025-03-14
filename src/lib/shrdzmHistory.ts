import type { DeviceId, ObisCode, Timestamp } from './types';

import { MeanValue } from './meanValue';

type DataSet = {
    /** identification */
    id: number;
    /** starting value (meter reading) of period for energy values */
    startValue: number;
    /** current value (meter reading) for energy values */
    currValue: number;
    /** instance of meanValue for power values */
    meanValue: MeanValue | null;
    /** value to be set as state */
    value: number;
};

type HistoryEntry = {
    switched: boolean;
    curr: DataSet;
    last: DataSet;
};

type HistoryBlock = {
    [key: DeviceId]: {
        [key: ObisCode]: {
            minute: HistoryEntry;
            quarter: HistoryEntry;
            hour: HistoryEntry;
            day: HistoryEntry;
        };
    };
};

const historyCache: HistoryBlock = {};

function initCache(deviceId: DeviceId, obisCode: ObisCode): void {
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
                    meanValue: new MeanValue(),
                    value: 0,
                },
                last: {
                    id: -1,
                    startValue: 0,
                    currValue: 0,
                    meanValue: null,
                    value: 0,
                },
            },
            quarter: {
                switched: false,
                curr: {
                    id: -1,
                    startValue: 0,
                    currValue: 0,
                    meanValue: new MeanValue(),
                    value: 0,
                },
                last: {
                    id: -1,
                    startValue: 0,
                    currValue: 0,
                    meanValue: null,
                    value: 0,
                },
            },
            hour: {
                switched: false,
                curr: {
                    id: -1,
                    startValue: 0,
                    currValue: 0,
                    meanValue: new MeanValue(),
                    value: 0,
                },
                last: {
                    id: -1,
                    startValue: 0,
                    currValue: 0,
                    meanValue: null,
                    value: 0,
                },
            },
            day: {
                switched: false,
                curr: {
                    id: -1,
                    startValue: 0,
                    currValue: 0,
                    meanValue: new MeanValue(),
                    value: 0,
                },
                last: {
                    id: -1,
                    startValue: 0,
                    currValue: 0,
                    meanValue: null,
                    value: 0,
                },
            },
        };
    }
}

function getId(date: Date): number {
    return (
        // eslint-disable-next-line
        ((((date.getFullYear() * 100 + date.getMonth() + 1) * 100 + date.getUTCDate()) * 100 + date.getUTCHours()) * 100 + date.getUTCMinutes()) * 100 
    );
}

function getId4Quarter(date: Date): number {
    return (
        // eslint-disable-next-line
        ((((date.getFullYear() * 100 + date.getMonth() + 1) * 100 + date.getUTCDate()) * 100 + date.getUTCHours()) * 100 + Math.trunc(date.getUTCMinutes()/15)*15) * 100 
    );
}

function switchEntry(historyEntry: HistoryEntry, id: number, value: number): void {
    historyEntry.last.id = historyEntry.curr.id;
    historyEntry.last.value = historyEntry.curr.value;
    historyEntry.last.startValue = historyEntry.curr.startValue;

    historyEntry.curr.id = id;
    historyEntry.curr.meanValue?.reset();
    historyEntry.curr.startValue = historyEntry.curr.currValue ? historyEntry.curr.currValue : value;

    historyEntry.switched = true;
}

function updateEnergy(historyEntry: HistoryEntry, id: number, value: number): void {
    historyEntry.switched = false;
    if (historyEntry.curr.id !== id) {
        switchEntry(historyEntry, id, value);
    }
    historyEntry.curr.currValue = value;
    historyEntry.curr.value = value - historyEntry.curr.startValue;
}

function updateEnergyMinute(date: Date, deviceId: DeviceId, obisCode: ObisCode, value: number): void {
    const historyEntry = historyCache[deviceId][obisCode].minute;
    const id = getId(date);
    updateEnergy(historyEntry, id, value);
}

function updateEnergyQuarter(date: Date, deviceId: DeviceId, obisCode: ObisCode, value: number): void {
    const historyEntry = historyCache[deviceId][obisCode].quarter;
    const id = getId4Quarter(date);
    updateEnergy(historyEntry, id, value);
}

function updateEnergyHour(date: Date, deviceId: DeviceId, obisCode: ObisCode, value: number): void {
    const historyEntry = historyCache[deviceId][obisCode].hour;
    const id = Math.trunc(getId(date) / 100 / 100) * 100 * 100;
    updateEnergy(historyEntry, id, value);
}

function updateEnergyDay(date: Date, deviceId: DeviceId, obisCode: ObisCode, value: number): void {
    const historyEntry = historyCache[deviceId][obisCode].day;
    const id = Math.trunc(getId(date) / 100 / 100 / 100) * 100 * 100 * 100;
    updateEnergy(historyEntry, id, value);
}

function updatePower(historyEntry: HistoryEntry, id: number, value: number): void {
    historyEntry.switched = false;
    if (historyEntry.curr.id !== id) {
        switchEntry(historyEntry, id, 0);
    }
    historyEntry.curr.value = historyEntry.curr.meanValue?.add(value) || 0;
}

function updatePowerMinute(date: Date, deviceId: DeviceId, obisCode: ObisCode, value: number): void {
    const historyEntry = historyCache[deviceId][obisCode].minute;
    const id = getId(date);
    updatePower(historyEntry, id, value);
}

function updatePowerQuarter(date: Date, deviceId: DeviceId, obisCode: ObisCode, value: number): void {
    const historyEntry = historyCache[deviceId][obisCode].quarter;
    const id = getId4Quarter(date);
    updatePower(historyEntry, id, value);
}

function updatePowerHour(date: Date, deviceId: DeviceId, obisCode: ObisCode, value: number): void {
    const historyEntry = historyCache[deviceId][obisCode].hour;
    const id = Math.trunc(getId(date) / 100 / 100) * 100 * 100;
    updatePower(historyEntry, id, value);
}

function updatePowerDay(date: Date, deviceId: DeviceId, obisCode: ObisCode, value: number): void {
    const historyEntry = historyCache[deviceId][obisCode].day;
    const id = Math.trunc(getId(date) / 100 / 100 / 100) * 100 * 100 * 100;
    updatePower(historyEntry, id, value);
}

type UpdateEntry = {
    id: number;
    value: number;
    startValue: number;
};

type UpdateData = {
    minute: {
        switched: boolean;
        curr: UpdateEntry;
        last: UpdateEntry;
    };
    quarter: {
        switched: boolean;
        curr: UpdateEntry;
        last: UpdateEntry;
    };
    hour: {
        switched: boolean;
        curr: UpdateEntry;
        last: UpdateEntry;
    };

    day: {
        switched: boolean;
        curr: UpdateEntry;
        last: UpdateEntry;
    };
};

/**
 * doEnergy
 *
 * process an energy history entry specified by obisCode
 *
 * @param ts timestamp to use for id calculation
 * @param deviceId deviceId as transmitted by shrdzm Api
 * @param obisCode obisCode to use
 * @param value new value to store
 */
export function doEnergy(ts: Timestamp, deviceId: DeviceId, obisCode: ObisCode, value: number): UpdateData {
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
                value: historyCache[deviceId][obisCode].minute.curr.value,
            },
            last: {
                id: historyCache[deviceId][obisCode].minute.last.id,
                startValue: historyCache[deviceId][obisCode].minute.last.startValue,
                value: historyCache[deviceId][obisCode].minute.last.value,
            },
        },
        quarter: {
            switched: historyCache[deviceId][obisCode].quarter.switched,
            curr: {
                id: historyCache[deviceId][obisCode].quarter.curr.id,
                startValue: historyCache[deviceId][obisCode].quarter.curr.startValue,
                value: historyCache[deviceId][obisCode].quarter.curr.value,
            },
            last: {
                id: historyCache[deviceId][obisCode].quarter.last.id,
                startValue: historyCache[deviceId][obisCode].quarter.last.startValue,
                value: historyCache[deviceId][obisCode].quarter.last.value,
            },
        },
        hour: {
            switched: historyCache[deviceId][obisCode].hour.switched,
            curr: {
                id: historyCache[deviceId][obisCode].hour.curr.id,
                startValue: historyCache[deviceId][obisCode].hour.curr.startValue,
                value: historyCache[deviceId][obisCode].hour.curr.value,
            },
            last: {
                id: historyCache[deviceId][obisCode].hour.last.id,
                startValue: historyCache[deviceId][obisCode].hour.last.startValue,
                value: historyCache[deviceId][obisCode].hour.last.value,
            },
        },
        day: {
            switched: historyCache[deviceId][obisCode].day.switched,
            curr: {
                id: historyCache[deviceId][obisCode].day.curr.id,
                startValue: historyCache[deviceId][obisCode].day.curr.startValue,
                value: historyCache[deviceId][obisCode].day.curr.value,
            },
            last: {
                id: historyCache[deviceId][obisCode].day.last.id,
                startValue: historyCache[deviceId][obisCode].day.last.startValue,
                value: historyCache[deviceId][obisCode].day.last.value,
            },
        },
    };
}

/**
 * doPower
 *
 * process an power history entry specified by obisCode
 *
 * @param ts timestamp to use for id calculation
 * @param deviceId deviceId as transmitted by shrdzm Api
 * @param obisCode obisCode to use
 * @param value new value to store
 */
export function doPower(ts: Timestamp, deviceId: DeviceId, obisCode: ObisCode, value: number): UpdateData {
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
                value: historyCache[deviceId][obisCode].minute.curr.value,
            },
            last: {
                id: historyCache[deviceId][obisCode].minute.last.id,
                startValue: historyCache[deviceId][obisCode].minute.last.startValue,
                value: historyCache[deviceId][obisCode].minute.last.value,
            },
        },
        quarter: {
            switched: historyCache[deviceId][obisCode].quarter.switched,
            curr: {
                id: historyCache[deviceId][obisCode].quarter.curr.id,
                startValue: historyCache[deviceId][obisCode].quarter.curr.startValue,
                value: historyCache[deviceId][obisCode].quarter.curr.value,
            },
            last: {
                id: historyCache[deviceId][obisCode].quarter.last.id,
                startValue: historyCache[deviceId][obisCode].quarter.last.startValue,
                value: historyCache[deviceId][obisCode].quarter.last.value,
            },
        },
        hour: {
            switched: historyCache[deviceId][obisCode].hour.switched,
            curr: {
                id: historyCache[deviceId][obisCode].hour.curr.id,
                startValue: historyCache[deviceId][obisCode].hour.curr.startValue,
                value: historyCache[deviceId][obisCode].hour.curr.value,
            },
            last: {
                id: historyCache[deviceId][obisCode].hour.last.id,
                startValue: historyCache[deviceId][obisCode].hour.last.startValue,
                value: historyCache[deviceId][obisCode].hour.last.value,
            },
        },
        day: {
            switched: historyCache[deviceId][obisCode].day.switched,
            curr: {
                id: historyCache[deviceId][obisCode].day.curr.id,
                startValue: historyCache[deviceId][obisCode].day.curr.startValue,
                value: historyCache[deviceId][obisCode].day.curr.value,
            },
            last: {
                id: historyCache[deviceId][obisCode].day.last.id,
                startValue: historyCache[deviceId][obisCode].day.last.startValue,
                value: historyCache[deviceId][obisCode].day.last.value,
            },
        },
    };
}

/**
 * setCache
 *
 * This function is used to initalize the cache to aspecific value during startup
 *
 * @param deviceId deviceId as transmitted by shrdzm Api
 * @param obisCode obisCode to use
 * @param rangeId specified to select minute / quarter / hour / day range
 * @param stateId specifier to select curr or last state
 * @param value value to store into chacke
 */
export function setCache(deviceId: DeviceId, obisCode: ObisCode, rangeId: string, stateId: string, value: number): boolean {
    initCache(deviceId, obisCode);

    if (!['minute', 'quarter', 'hour', 'day'].includes(rangeId)) {
        return false;
    }

    if (stateId === 'currId') {
        // @ts-expect-error range already checked
        historyCache[deviceId][obisCode][rangeId].curr.id = value;
    } else if (stateId === 'lastId') {
        // @ts-expect-error range already checked
        historyCache[deviceId][obisCode][rangeId].last.id = value;
    } else if (stateId === 'currStart') {
        // @ts-expect-error range already checked
        historyCache[deviceId][obisCode][rangeId].curr.startValue = value;
    } else if (stateId === 'lastStart') {
        // @ts-expect-error range already checked
        historyCache[deviceId][obisCode][rangeId].last.startValue = value;
    } else if (stateId === 'curr') {
        // @ts-expect-error range already checked
        historyCache[deviceId][obisCode][rangeId].curr.value = value;
    } else if (stateId === 'last') {
        // @ts-expect-error range already checked
        historyCache[deviceId][obisCode][rangeId].last.value = value;
    } else {
        return false;
    }
    return true;
}
