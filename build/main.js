"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var utils = __toESM(require("@iobroker/adapter-core"));
var import_node_dgram = __toESM(require("node:dgram"));
const OBIS = {
  "1.6.0": {
    // Viertelstundenmaximum (Bezug) in kW
    name: "lblPeakActivePowerConsumed",
    role: "value.power.consumed",
    unit: "W"
  },
  "2.6.0": {
    // Viertelstundenmaximum (Einspeisung) in kW
    name: "lblPeakActivePowerProduced",
    role: "value.power.produced",
    unit: "Wh"
  },
  "1.7.0": {
    // Momentanleistung (Bezug) in kW
    name: "lblActivePowerConsumed",
    role: "value.power.consumed",
    unit: "W"
  },
  "2.7.0": {
    // Momentanleistung (Einspeisung) in kW
    name: "lblActivePowerProduced",
    role: "value.power.produced",
    unit: "W"
  },
  "3.7.0": {
    // Momentanblindleistung (Bezug) in kVar
    name: "lblReactivePowerConsumed",
    role: "value.power.reactive",
    unit: "Var"
  },
  "4.7.0": {
    // Momentanblindleistung (Einspeisung) in kVar
    name: "lblReactivePowerProduced",
    role: "value.power.reactive",
    unit: "Var"
  },
  "1.8.0": {
    // Summe Energie / Zählerstand (Bezug) in kWh
    name: "lblActiveEnergyConsumed",
    role: "value.energy.consumed",
    unit: "Wh"
  },
  "1.8.1": {
    // Zählerstand (Bezug) T1 (NT) in kWh
    name: "lblActiveEnergyT1Consumed",
    role: "value.energy.consumed",
    unit: "Wh"
  },
  "1.8.2": {
    // Zählerstand (Bezug) T2 (HT) in kWh
    name: "lblActiveEnergyT2Consumed",
    role: "value.energy.consumed",
    unit: "Wh"
  },
  "2.8.0": {
    // Summe Energie Zählerstand (Einspeisung) in kWh
    name: "lblACtiveEnergyProduced",
    role: "value.energy.produced",
    unit: "Wh"
  },
  "2.8.1": {
    // Zählerstand (Einspeisung) T1 (NT) in kWh
    name: "lblActiveEnergyT1Produced",
    role: "value.energy.produced",
    unit: "Wh"
  },
  "2.8.2": {
    // Zählerstand (Einspeisung) T2 (HT) in kWh
    name: "lblActiveEnergyT2Produced",
    role: "value.energy.produced",
    unit: "Wh"
  },
  "3.8.0": {
    // Summe Blindenergie (Bezug) in kVarh
    name: "lblReactiveEnergyConsumed",
    role: "value.energy.reactive",
    unit: "Var"
  },
  "4.8.0": {
    // Summe Blindenergie (Einspeisung) in kVarh
    name: "lblReactiveEnergyProduced",
    role: "value.energy.reactive",
    unit: "Var"
  },
  "16.7.0": {
    // Momentleistung (saldiert) in kW
    name: "lblPower",
    role: "value.power",
    unit: "W"
  }
};
class Shrdzm extends utils.Adapter {
  udp4Srv = null;
  udp4SrvRetry = 10;
  constructor(options = {}) {
    super({
      ...options,
      name: "shrdzm"
    });
    this.on("ready", this.onReady.bind(this));
    this.on("unload", this.onUnload.bind(this));
  }
  /**
   * onReady
   *
   * Is called when databases are connected and adapter received configuration.
   */
  async onReady() {
    this.log.silly(`onReady()`);
    await this.setState("info.connection", false, true);
    await utils.I18n.init(`${__dirname}/..`, this);
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
  onUnload(callback) {
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
  async processUdp4Message(msg, rinfo) {
    this.log.silly(`processUdp4SrvMessage(${msg.toString()}, ${JSON.stringify(rinfo)})`);
    let msgJson;
    try {
      msgJson = await JSON.parse(msg.toString());
    } catch (e) {
      this.log.warn(`invalid packet received - ${e.message}`);
      this.log.warn(`${msg.toString()}`);
      return;
    }
    if (!msgJson.id) {
      this.log.warn("invalid packet received - id is missing");
      this.log.warn(`${msg.toString()}`);
      return;
    }
    const data = msgJson.data;
    if (!data) {
      this.log.warn("invalid packet received - data is missing");
      this.log.warn(`${msg.toString()}`);
      return;
    }
    if (!await this.validateDevice(msgJson.id)) {
      this.log.debug(`ignoreing message from device ${msgJson.id} due to filter setting`);
      return;
    }
    for (const obisCode in msgJson.data) {
      if (!obisCode.match(/\d+\.\d+\.\d+/)) {
        continue;
      }
      await this.validateObis(msgJson.id, obisCode);
      const value = Number(msgJson.data[obisCode]);
      await this.setObis(msgJson.id, obisCode, value);
    }
  }
  /**
   * validateConfig
   *
   * validates the user supplied configuration
   */
  validateConfig() {
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
  async initDevice(id) {
    this.log.silly(`initDevice( ${id} )`);
    await this.extendObject(
      `${id}`,
      {
        type: "device",
        common: {
          name: id
        },
        native: {}
      },
      { preserve: { common: ["name"] } }
    );
    await this.extendObject(
      `${id}.info`,
      {
        type: "channel",
        common: {
          name: utils.I18n.getTranslatedObject(`lblInfo`)
        },
        native: {}
      },
      { preserve: { common: ["name"] } }
    );
    await this.extendObject(
      `${id}.info.online`,
      {
        type: "state",
        common: {
          name: utils.I18n.getTranslatedObject(`lblInfoOnline`),
          type: "boolean",
          role: "indicator.reachable",
          read: true,
          write: false
        },
        native: {}
      },
      { preserve: { common: ["name"] } }
    );
    await this.extendObject(
      `${id}.info.timestamp`,
      {
        type: "state",
        common: {
          name: utils.I18n.getTranslatedObject(`lblInfoTimestamp`),
          type: "number",
          role: "date",
          read: true,
          write: false
        },
        native: {}
      },
      { preserve: { common: ["name"] } }
    );
    await this.extendObject(
      `${id}.info.uptime`,
      {
        type: "state",
        common: {
          name: `lblInfoUptime`,
          type: "string",
          role: "value",
          read: true,
          write: false
        },
        native: {}
      },
      { preserve: { common: ["name"] } }
    );
    await this.extendObject(
      `${id}.live`,
      {
        type: "channel",
        common: {
          name: `lblLive`
        },
        native: {}
      },
      { preserve: { common: ["name"] } }
    );
  }
  /**
   * initObisState
   *
   * initializes OBIS related states
   *
   * @param id shrzdm device id
   * @param obis OBIS code
   */
  async initObisState(id, obis) {
    this.log.silly(`initObisState(${id}, ${obis})`);
    const obisId = obis.replaceAll(".", "_");
    if (OBIS[obis]) {
      await this.extendObject(
        `${id}.live.${obisId}`,
        {
          type: "state",
          common: {
            name: utils.I18n.getTranslatedObject(OBIS[obis].name),
            type: "number",
            role: OBIS[obis].role,
            unit: OBIS[obis].unit
          },
          native: {}
        },
        { preserve: { common: ["name"] } }
      );
    } else {
      await this.extendObject(
        `${id}.live.${obisId}`,
        {
          type: "state",
          common: {
            name: `OBIS-${obisId}`,
            type: "number",
            role: "value",
            unit: ""
          },
          native: {}
        },
        { preserve: { common: ["name"] } }
      );
    }
  }
  /**
   * validateObis
   *
   * validate obis code received
   *
   * @param id shrzdm device id
   * @param obis OBIS code
   */
  obisIds = {};
  async validateObis(id, obisCode) {
    this.log.silly(`validateObis(${id}, ${obisCode})`);
    if (this.obisIds[`${id}-${obisCode}`]) {
      return;
    }
    await this.initObisState(id, obisCode);
    this.obisIds[`${id}-${obisCode}`] = true;
  }
  /**
   * setObis
   *
   * sets state identified by obis code
   *
   * @param id shrzdm device id
   * @param obis OBIS code
   * @param val value to be set
   */
  async setObis(id, obisCode, value) {
    this.log.silly(`setObis(${id}, ${obisCode}, ${value})`);
    const obisId = obisCode.replaceAll(".", "_");
    await this.setState(`${id}.live.${obisId}`, value, true);
  }
  /**
   *
   * validateDevice
   *
   * validates whether device should be processed
   */
  deviceIds = {};
  async validateDevice(id) {
    this.log.silly(`validateDevice(${id})`);
    if (this.deviceIds[id] !== void 0) {
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
  initUdp4Srv() {
    try {
      this.udp4Srv = import_node_dgram.default.createSocket("udp4");
      this.udp4Srv.on("error", this.onUdp4SrvError.bind(this));
      this.udp4Srv.on("message", this.onUdp4SrvMessage.bind(this));
      this.udp4Srv.on("listening", this.onUdp4SrvListening.bind(this));
    } catch (e) {
      console.log(`error initializing udp4Src - ${e.message}`);
      return false;
    }
    try {
      this.udp4Srv && this.udp4Srv.bind(this.config.port);
    } catch (e) {
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
  async onUdp4SrvError(err) {
    this.log.silly(`onUdp4SrvError( err )`);
    this.log.error(`error reported by udp4Srv:
${err.stack}`);
    this.udp4Srv && this.udp4Srv.close();
    await this.setState("info.connection", false, true);
    if (this.udp4SrvRetry--) {
      this.log.info(`trying to restablish udp connection in 5s`);
      this.setTimeout(this.initUdp4Srv, 5 * 1e3);
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
  async onUdp4SrvMessage(msg, rinfo) {
    this.log.debug(`onUdp4SrvMessage(${msg.toString()}, ${rinfo.address}:${rinfo.port})`);
    await this.processUdp4Message(msg, rinfo);
  }
  /**
   * onUdpSrvListening
   *
   * is cllaed as soon as server starts listening
   */
  async onUdp4SrvListening() {
    if (this.udp4Srv) {
      const address = this.udp4Srv.address();
      this.log.info(`server listening ${address.address}:${address.port}`);
      this.udp4SrvRetry = 12 * 60;
      await this.setState("info.connection", true, true);
    }
  }
}
if (require.main !== module) {
  module.exports = (options) => new Shrdzm(options);
} else {
  (() => new Shrdzm())();
}
//# sourceMappingURL=main.js.map
