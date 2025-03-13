export type Timestamp = number;

export type DeviceId = string;

export type ObisCode = string;

export type ShrdzmMsg = {
    id: DeviceId;
    data: {
        timestamp: string;
        [key: ObisCode]: string;
        uptime: string;
    };
};
