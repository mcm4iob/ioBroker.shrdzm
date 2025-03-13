import type { ObisCode, Timestamp } from './types';

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
    curr: DataSet;
    last: DataSet;
};

type HistoryBlock = {
    [key: ObisCode]: {
        minute: HistoryEntry;
        quarter: HistoryEntry;
        hour: HistoryEntry;
        day: HistoryEntry;
    };
};

const historyCache: HistoryBlock = {};

function initCache(obisCode: ObisCode): void {
    if (!historyCache[obisCode]) {
        historyCache[obisCode] = {
            minute: {
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

function switchEntry(historyEntry: HistoryEntry, id: number, value: number): void {
    historyEntry.last.id = historyEntry.curr.id;
    historyEntry.last.value = historyEntry.curr.value;
    historyEntry.curr.id = id;

    historyEntry.curr.meanValue?.reset();
    historyEntry.curr.startValue = historyEntry.curr.currValue ? historyEntry.curr.currValue : value;
}

function updateEnergy(historyEntry: HistoryEntry, id: number, value: number): void {
    if (historyEntry.curr.id !== id) {
        switchEntry(historyEntry, id, value);
    }
    historyEntry.curr.currValue = value;
    historyEntry.curr.value = value - historyEntry.curr.startValue;
}

function getId(date: Date): number {
    return (
        // eslint-disable-next-line
        ((((date.getFullYear() * 100 + date.getMonth() + 1) * 100 + date.getDay()) * 100 + date.getHours()) * 100 + date.getMinutes()) * 100 
    );
}

function updateEnergyMinute(date: Date, obisCode: ObisCode, value: number): void {
    const historyEntry = historyCache[obisCode].minute;
    const id = getId(date);
    updateEnergy(historyEntry, id, value);
}

function updateEnergyQuarter(date: Date, obisCode: ObisCode, value: number): void {
    const historyEntry = historyCache[obisCode].quarter;
    const id = Math.trunc(getId(date) / 15 / 100) * 15 * 100;
    updateEnergy(historyEntry, id, value);
}

function updateEnergyHour(date: Date, obisCode: ObisCode, value: number): void {
    const historyEntry = historyCache[obisCode].hour;
    const id = Math.trunc(getId(date) / 100 / 100) * 100 * 100;
    updateEnergy(historyEntry, id, value);
}

function updateEnergyDay(date: Date, obisCode: ObisCode, value: number): void {
    const historyEntry = historyCache[obisCode].day;
    const id = Math.trunc(getId(date) / 100 / 100 / 100) * 100 * 100 * 100;
    updateEnergy(historyEntry, id, value);
}

function updatePower(historyEntry: HistoryEntry, id: number, value: number): void {
    if (historyEntry.curr.id !== id) {
        switchEntry(historyEntry, id, 0);
    }
    historyEntry.curr.value = historyEntry.curr.meanValue?.add(value) || 0;
}

function updatePowerMinute(date: Date, obisCode: ObisCode, value: number): void {
    const historyEntry = historyCache[obisCode].minute;
    const id = getId(date);
    updatePower(historyEntry, id, value);
}

function updatePowerQuarter(date: Date, obisCode: ObisCode, value: number): void {
    const historyEntry = historyCache[obisCode].quarter;
    const id = Math.trunc(getId(date) / 15 / 100) * 15 * 100;
    updatePower(historyEntry, id, value);
}

function updatePowerHour(date: Date, obisCode: ObisCode, value: number): void {
    const historyEntry = historyCache[obisCode].hour;
    const id = Math.trunc(getId(date) / 100 / 100) * 100 * 100;
    updatePower(historyEntry, id, value);
}

function updatePowerDay(date: Date, obisCode: ObisCode, value: number): void {
    const historyEntry = historyCache[obisCode].day;
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
 * @param obisCode obisCode to use
 * @param value new value to store
 */
export function doEnergy(ts: Timestamp, obisCode: ObisCode, value: number): UpdateData {
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
                value: historyCache[obisCode].minute.curr.value,
            },
            last: {
                id: historyCache[obisCode].minute.last.id,
                startValue: historyCache[obisCode].minute.last.startValue,
                value: historyCache[obisCode].minute.last.value,
            },
        },
        quarter: {
            switched: true,
            curr: {
                id: historyCache[obisCode].quarter.curr.id,
                startValue: historyCache[obisCode].quarter.curr.startValue,
                value: historyCache[obisCode].quarter.curr.value,
            },
            last: {
                id: historyCache[obisCode].quarter.last.id,
                startValue: historyCache[obisCode].quarter.last.startValue,
                value: historyCache[obisCode].quarter.last.value,
            },
        },
        hour: {
            switched: true,
            curr: {
                id: historyCache[obisCode].hour.curr.id,
                startValue: historyCache[obisCode].hour.curr.startValue,
                value: historyCache[obisCode].hour.curr.value,
            },
            last: {
                id: historyCache[obisCode].hour.last.id,
                startValue: historyCache[obisCode].hour.last.startValue,
                value: historyCache[obisCode].hour.last.value,
            },
        },
        day: {
            switched: true,
            curr: {
                id: historyCache[obisCode].day.curr.id,
                startValue: historyCache[obisCode].day.curr.startValue,
                value: historyCache[obisCode].day.curr.value,
            },
            last: {
                id: historyCache[obisCode].day.last.id,
                startValue: historyCache[obisCode].day.last.startValue,
                value: historyCache[obisCode].day.last.value,
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
 * @param obisCode obisCode to use
 * @param value new value to store
 */
export function doPower(ts: Timestamp, obisCode: ObisCode, value: number): UpdateData {
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
                value: historyCache[obisCode].minute.curr.value,
            },
            last: {
                id: historyCache[obisCode].minute.last.id,
                startValue: historyCache[obisCode].minute.last.startValue,
                value: historyCache[obisCode].minute.last.value,
            },
        },
        quarter: {
            switched: true,
            curr: {
                id: historyCache[obisCode].quarter.curr.id,
                startValue: historyCache[obisCode].quarter.curr.startValue,
                value: historyCache[obisCode].quarter.curr.value,
            },
            last: {
                id: historyCache[obisCode].quarter.last.id,
                startValue: historyCache[obisCode].quarter.last.startValue,
                value: historyCache[obisCode].quarter.last.value,
            },
        },
        hour: {
            switched: true,
            curr: {
                id: historyCache[obisCode].hour.curr.id,
                startValue: historyCache[obisCode].hour.curr.startValue,
                value: historyCache[obisCode].hour.curr.value,
            },
            last: {
                id: historyCache[obisCode].hour.last.id,
                startValue: historyCache[obisCode].hour.last.startValue,
                value: historyCache[obisCode].hour.last.value,
            },
        },
        day: {
            switched: true,
            curr: {
                id: historyCache[obisCode].day.curr.id,
                startValue: historyCache[obisCode].day.curr.startValue,
                value: historyCache[obisCode].day.curr.value,
            },
            last: {
                id: historyCache[obisCode].day.last.id,
                startValue: historyCache[obisCode].day.last.startValue,
                value: historyCache[obisCode].day.last.value,
            },
        },
    };
}
