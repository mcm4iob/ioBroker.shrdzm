/*
 * Created with @iobroker/create-adapter v2.6.5
 */

import * as utils from '@iobroker/adapter-core';

import dgram, { type RemoteInfo } from 'node:dgram';

type ShrdzmMsg = {
    id: string;
    data: {
        timestamp: string;
        [key: string]: string;
        uptime: string;
    };
};

type ShrzmDeviceId = string;
type ObisCode = string;

// const OBIS: {
//     [key: ObisCode]: {
//         desc: string;
//     };
// } = {
//     '1.6.0': {
//         // Viertelstundenmaximum (Bezug) in kW
//         desc: 'lblPeakPowerReceived',
//     },
//     '1.7.0': {
//         // Momentableistung (Bezug) in kW
//         desc: 'lblPowerReceived',
//     },
//     '2.7.0': {
//         // Momentableistung (Bezug) in kWh ??
//         desc: 'lblPowerReceived',
//     },
//     '3.7.0': {
//         // Momentableistung (Bezug) in kWh ??
//         desc: 'lblPowerReceived',
//     },
//     '4.7.0': {
//         // Momentableistung (Bezug) in kWh ??
//         desc: 'lblPowerReceived',
//     },
//     '1.8.0': {
//         // Zählerstand (Bezug) in kWh
//         desc: 'lblEnergyReceived',
//     },
//     '1.8.1': {
//         // Zählerstand (Bezug) T1 (NT) in kWh
//         desc: 'lblEnergyT1Received',
//     },
//     '1.8.2': {
//         // Zählerstand (Bezug) T2 (HT) in kWh
//         desc: 'lblEnergyT2Received',
//     },
//     '2.6.0': {
//         // Viertelstundenmaximum (Einspeisung) in kW
//         desc: 'lblPeakPowerReceived',
//     },
//     '2.8.0': {
//         // Zählerstand (Einspeisung) in kWh
//         desc: 'lblPowerProduced',
//     },
//     '2.8.1': {
//         // Zählerstand (Einspeisung) T1 (NT) in kWh
//         desc: 'lblEnergyT1Produced',
//     },
//     '2.8.2': {
//         // Zählerstand (Einspeisung) T2 (HT) in kWh
//         desc: 'lblEnergyT2Produced',
//     },
//     '3.8.0': {
//         // Blindleistung induktiv (Bezug) in kVarh
//         desc: 'lblPowerXxxxReceived',
//     },
//     '4.8.0': {
//         // Blindleistung kapazitiv (Bezug) in kVarh
//         desc: 'lblPowerReceived',
//     },
//     '16.7.0': {
//         // Momentleistung (saldiert) in kW
//         desc: 'lblPower',
//     },
// };

class Shrdzm extends utils.Adapter {
    private udp4Srv: dgram.Socket | null = null;
    private udp4SrvRetry = 10;

    public constructor(options: Partial<utils.AdapterOptions> = {}) {
        super({
            ...options,
            name: 'shrdzm',
        });
        this.on('ready', this.onReady.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    /**
     * onReady
     *
     * Is called when databases are connected and adapter received configuration.
     */
    private async onReady(): Promise<void> {
        this.log.silly(`onReady()`);

        await this.setState('info.connection', false, true);

        if (!this.validateConfig()) {
            this.disable;
            return;
        }

        if (!this.initUdp4Srv()) {
            this.disable;
            return;
        }
    }

    /**
     * onUnload
     *
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     *
     * @param callback standard ioBroker callback
     */
    private onUnload(callback: () => void): void {
        try {
            this.udp4Srv && this.udp4Srv.close();

            callback();
        } catch {
            callback();
        }
    }

    /**
     * processUdp4Message
     *
     * handles a message received via udp4Srv
     *
     * @param msg data pacakte received (should be json)
     * @param rinfo remote infor record
     */
    private async processUdp4Message(msg: Buffer, rinfo: RemoteInfo): Promise<void> {
        this.log.silly(`processUdp4SrvMessage(${msg.toString()}, ${JSON.stringify(rinfo)})`);

        let msgJson: ShrdzmMsg;

        try {
            msgJson = await JSON.parse(msg.toString());
        } catch (e: any) {
            this.log.warn(`invalid packet received - ${e.message}`);
            this.log.warn(`${msg.toString()}`);
            return;
        }

        if (!msgJson.id) {
            this.log.warn('invalid packet received - id is missing');
            this.log.warn(`${msg.toString()}`);
            return;
        }

        const data = msgJson.data;
        if (!data) {
            this.log.warn('invalid packet received - data is missing');
            this.log.warn(`${msg.toString()}`);
            return;
        }

        if (!(await this.validateDevice(msgJson.id))) {
            this.log.debug(`ignoreing message from device ${msgJson.id} due to filter setting`);
            return;
        }

        //const ts = Date.parse(data.timestamp);

        for (const obisCode in msgJson.data) {
            if (!obisCode.match(/\d+\.\d+\.\d+/)) {
                continue;
            }

            await this.validateObis(msgJson.id, obisCode);

            //const value: number = Number(msgJson.data[obisCode]);
            //await this.setObis(msgJson.id, obisCode, value);
        }
    }

    /**
     * validateConfig
     *
     * validates the user supplied configuration
     */
    private validateConfig(): boolean {
        this.log.silly(`validateConfig()`);

        let ok = true;
        if (!this.config.port || this.config.port < 1024 || this.config.port > 65536) {
            this.log.error(`invalid udp port ${this.config.port} specified, must be between 1025 and 65535`);
            ok = false;
        }

        return ok;
    }

    /**
     * initDevice
     *
     * initializes the devoce database and creates states if required
     *
     * @param id shrzdm device id
     */
    private async initDevice(id: ShrzmDeviceId): Promise<void> {
        this.log.silly(`initDevice( ${id} )`);

        await this.extendObject(
            `${id}`,
            {
                type: 'device',
                common: {
                    name: id,
                },
                native: {},
            },
            { preserve: { common: ['name'] } },
        );

        // info channel
        await this.extendObject(
            `${id}.info`,
            {
                type: 'channel',
                common: {
                    name: `lblInfo`,
                },
                native: {},
            },
            { preserve: { common: ['name'] } },
        );

        await this.extendObject(
            `${id}.info.online`,
            {
                type: 'state',
                common: {
                    name: `lblInfoOnline`,
                    type: 'boolean',
                    role: 'indicator.reachable',
                    read: true,
                    write: false,
                },
                native: {},
            },
            { preserve: { common: ['name'] } },
        );

        await this.extendObject(
            `${id}.info.timestamp`,
            {
                type: 'state',
                common: {
                    name: `lblInfoTimestamp`,
                    type: 'number',
                    role: 'date',
                    read: true,
                    write: false,
                },
                native: {},
            },
            { preserve: { common: ['name'] } },
        );

        await this.extendObject(
            `${id}.info.uptime`,
            {
                type: 'state',
                common: {
                    name: `lblInfoUptime`,
                    type: 'string',
                    role: 'value',
                    read: true,
                    write: false,
                },
                native: {},
            },
            { preserve: { common: ['name'] } },
        );

        // live channel
        await this.extendObject(
            `${id}.live`,
            {
                type: 'channel',
                common: {
                    name: `lblLive`,
                },
                native: {},
            },
            { preserve: { common: ['name'] } },
        );
    }

    /**
     * initOnisState
     *
     * initializes OBIS related states
     *
     * @param id shrzdm device id
     * @param obis OBIS code
     */
    private async initObisState(id: ShrzmDeviceId, obis: ObisCode): Promise<void> {
        this.log.silly(`initObisState(${id}, ${obis})`);

        const obisId = obis.replaceAll('.', '_');

        await this.extendObject(
            `${id}.live.${obisId}`,
            {
                type: 'state',
                common: {
                    name: `lblObis${obisId}`,
                    type: 'number',
                },
                native: {},
            },
            { preserve: { common: ['name'] } },
        );
    }

    /**
     * validateObis
     *
     * validate obis code received
     *
     * @param id shrzdm device id
     * @param obis OBIS code
     */
    private obisIds: {
        [key: ObisCode]: boolean;
    } = {};

    private async validateObis(id: ShrzmDeviceId, obisCode: ObisCode): Promise<void> {
        this.log.silly(`validateObis(${id}, ${obisCode})`);

        if (this.obisIds[`${id}-${obisCode}`]) {
            return;
        }

        await this.initObisState(id, obisCode);
        this.obisIds[`${id}-${obisCode}`] = true;
    }

    /**
     *
     * validateDevice
     *
     * validates whether device should be processed
     */
    private deviceIds: {
        [key: ShrzmDeviceId]: boolean;
    } = {};

    private async validateDevice(id: ShrzmDeviceId): Promise<boolean> {
        this.log.silly(`validateDevice(${id})`);

        if (this.deviceIds[id] !== undefined) {
            return this.deviceIds[id];
        }

        if (!id.match(/^[A-Z0-9]{12}$/)) {
            this.log.warn(`message with invalid device id ${id} received, id will be ignored`);
            this.deviceIds[id] = false;
        }

        if (this.config.devices && !this.config.devices.includes(id)) {
            this.log.warn(`message from device with id ${id} received, id will be ignored`);
            this.deviceIds[id] = false;
        }

        this.log.info(`device ${id} is active`);
        await this.initDevice(id);
        this.deviceIds[id] = true;

        return true;
    }

    /**
     * initUdp4Srv
     *
     * initializes the udp4Srv instance
     */
    private initUdp4Srv(): boolean {
        try {
            this.udp4Srv = dgram.createSocket('udp4');
            this.udp4Srv.on('error', this.onUdp4SrvError.bind(this));
            this.udp4Srv.on('message', this.onUdp4SrvMessage.bind(this));
            this.udp4Srv.on('listening', this.onUdp4SrvListening.bind(this));
        } catch (e: any) {
            console.log(`error initializing udp4Src - ${e.message}`);
            return false;
        }

        try {
            this.udp4Srv && this.udp4Srv.bind(this.config.port);
        } catch (e: any) {
            console.log(`error binding udp4Src to port ${this.config.port} - ${e.message}`);
            return false;
        }
        return true;
    }

    /**
     * onUdp4SrvError
     *
     * is called if any error occures at udp4Srv socket
     *
     * @param err standard error object
     */
    private async onUdp4SrvError(err: Error): Promise<void> {
        this.log.silly(`onUdp4SrvError( err )`);

        this.log.error(`error reported by udp4Srv:\n${err.stack}`);
        this.udp4Srv && this.udp4Srv.close();

        await this.setState('info.connection', false, true);

        if (this.udp4SrvRetry--) {
            this.log.info(`trying to restablish udp connection in 5s`);
            this.setTimeout(this.initUdp4Srv, 5 * 1000);
        } else {
            this.log.error(`maximum number of retries exceeded`);
        }
    }

    /**
     * onUdp4SrvMessage
     *
     * is called whenever a new message is received at udp4Srv socket
     *
     * @param msg shrdzm data block received
     * @param rinfo remote information provided by dram service
     */
    private async onUdp4SrvMessage(msg: Buffer, rinfo: RemoteInfo): Promise<void> {
        this.log.debug(`onUdp4SrvMessage(${msg.toString()}, ${rinfo.address}:${rinfo.port})`);

        await this.processUdp4Message(msg, rinfo);
    }

    /**
     * onUdpSrvListening
     *
     * is cllaed as soon as server starts listening
     */
    private async onUdp4SrvListening(): Promise<void> {
        if (this.udp4Srv) {
            const address = this.udp4Srv.address();
            this.log.info(`server listening ${address.address}:${address.port}`);

            this.udp4SrvRetry = 12 * 60; // app. 1h of retries

            await this.setState('info.connection', true, true);
        }
    }
}

if (require.main !== module) {
    // Export the constructor in compact mode
    module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new Shrdzm(options);
} else {
    // otherwise start the instance directly
    (() => new Shrdzm())();
}
