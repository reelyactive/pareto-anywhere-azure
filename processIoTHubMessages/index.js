/**
 * Copyright reelyActive 2022-2024
 * We believe in an open Internet of Things
 */


// advlib dependencies (from npm) and protocol-specific settings
// See: https://github.com/reelyactive/advlib
const advlib = require('advlib');
const BLE_PROCESSORS = [
    { processor: require('advlib-ble'),
      libraries: [ require('advlib-ble-services'),
                   require('advlib-ble-manufacturers') ],
      options: { isPayloadOnly: true,
                 indices: [ require('sniffypedia') ] } }
];
const ENOCEAN_PROCESSOR = {
    processor: require('advlib-esp'),
    libraries: [ require('advlib-eep-vld'),
                 require('advlib-eep-4bs'),
                 require('advlib-eep-rps'),
                 require('advlib-eep-msc') ],
    options: { ignoreProtocolOverhead: true,
               indices: [ require('sniffypedia') ] }
};
const INTERPRETERS = [ require('advlib-interoperable') ];


// Default dynamic ambient (dynamb) properties to include in output messages
const DEFAULT_DYNAMB_PROPERTIES = [
    'acceleration',
    'angleOfRotation',
    'batteryPercentage',
    'batteryVoltage',
    'carbonDioxideConcentration',
    'distance',
    'elevation',
    'heading',
    'heartRate',
    'illuminance',
    'interactionDigest',
    'isButtonPressed',
    'isContactDetected',
    'isLiquidDetected',
    'isMotionDetected',
    'levelPercentage',
    'magneticField',
    'nearest',
    'numberOfOccupants',
    'passageCounts',
    'position',
    'pressure',
    'relativeHumidity',
    'soundPressure',
    'speed',
    'temperature',
    'txCount',
    'unicodeCodePoints',
    'uptime'
];


/**
 * Process Azure IoT Hub messages.
 * @param {Object} context The Azure Function context.
 * @param {Array} iotHubMessages The array of messages from the IoT Hub.
 */
module.exports = function(context, iotHubMessages) {
  iotHubMessages.forEach((messageString, index) => {
    let message = JSON.parse(messageString);
    let messageDate = context.bindingData.enqueuedTimeUtcArray[index];
    let properties = context.bindingData.propertiesArray[index];
    let timestamp = Date.parse(messageDate);
    let dynambs = [];

    // Handle Aruba bleData (AOS 8)
    if(Array.isArray(message.bleData)) {
      dynambs = processBleData(message.bleData, properties, timestamp);
    }

    // Handle Aruba serialData (AOS 8)
    else if(Array.isArray(message.serialData)) {

      // EnOcean USB dongle (TODO: differentiate serialDataNb & actionResults)
      if(properties.deviceIdentifier.startsWith('ENOCEAN_USB')) {
        dynambs = processEnOceanSerialData(message.serialData, properties,
                             timestamp, context.bindings.deviceProfilesEnOcean);
      }

    }

    // Handle Aruba result (AOS 10)
    else if(message.hasOwnProperty('result') &&
            message.result.hasOwnProperty('mac') &&
            message.result.hasOwnProperty('payload')) {
      dynambs = processResult(message.result, properties, timestamp);
    }

    // Output the DYNamic AMBient data message(s)
    dynambs.forEach(dynamb => {
      let event = { type: "dynamb", data: dynamb };
      let eventString = JSON.stringify(event);

      // Output only valid dynambs to the Event Hub
      if(isDynambPropertyPresent(dynamb)) {
        context.bindings.eventHubMessage = eventString;
      }
      // Output everything to the WebPubSub to facilitate device monitoring
      context.bindings.actions = { actionName: "sendToAll",
                                   data: eventString };
    });

  });

  context.done();
};


/**
 * Process the given BLE data.
 * @param {Array} packets The raw BLE packets.
 * @param {Object} properties The Aruba IoT transport properties.
 * @param {Number} timestamp The timestamp of the radio packet reception.
 * @return {Array} The compiled dynamb objects.
 */
function processBleData(packets, properties, timestamp) {
  let dynambs = [];
  let deviceId = properties.deviceIdentifier.replaceAll(':', '');
  let deviceIdType = 2;
  let payloads = [];

  packets.forEach(packet => {
    deviceIdType = ((packet.macAddrType === 'public') ? 2 : 3);
    payloads.push(Buffer.from(packet.data, 'base64'));
  });

  let processedPayloads = advlib.process(payloads, BLE_PROCESSORS,
                                         INTERPRETERS);
  let dynamb = compileDynamb(deviceId, deviceIdType, processedPayloads,
                             timestamp);
  if(dynamb) {
    dynambs.push(dynamb);
  }

  return dynambs;
}


/**
 * Process the given EnOcean serial data.
 * @param {Array} packets The raw serial packets.
 * @param {Object} properties The Aruba IoT transport properties.
 * @param {Number} timestamp The timestamp of the radio packet reception.
 * @param {Object} deviceProfiles The EnOcean device profiles with EEP types.
 * @return {Array} The compiled dynamb objects.
 */
function processEnOceanSerialData(packets, properties, timestamp,
                                  deviceProfiles) {
  let dynambs = [];
  let processor = Object.assign({}, ENOCEAN_PROCESSOR);
  processor.options.deviceProfiles = deviceProfiles;

  packets.forEach(packet => {
    let payload = Buffer.from(packet.data, 'base64');
    let processedPayload = advlib.process(payload, [ processor ]);

    if(Array.isArray(processedPayload.deviceIds)) {
      let deviceIdElements = processedPayload.deviceIds[0].split('/');
      let deviceId = deviceIdElements[0];
      let deviceIdType = parseInt(deviceIdElements[1]);

      // TODO: update deviceProfiles when eepType is received in UTE telegram

      let dynamb = compileDynamb(deviceId, deviceIdType, processedPayload,
                                 timestamp);

      if(dynamb) {
        dynambs.push(dynamb);
      }
    }
  });

  return dynambs;
}


/**
 * Process the given result data.
 * @param {Object} result The result data.
 * @param {Object} properties The Aruba IoT transport properties.
 * @param {Number} timestamp The timestamp of the radio packet reception.
 * @return {Array} The compiled dynamb objects.
 */
function processResult(result, properties, timestamp) {
  let dynambs = [];
  let deviceId = result.mac.replaceAll(':', '');
  let deviceIdType = 2; // TODO: distinguish between EUI-48 and RND-48
  let payload = Buffer.from(result.payload, 'base64');
  let processedPayload = advlib.process(payload, BLE_PROCESSORS,
                                        INTERPRETERS);
  let dynamb = compileDynamb(deviceId, deviceIdType, processedPayload,
                             timestamp);
  if(dynamb) {
    dynambs.push(dynamb);
  }

  return dynambs;
}


/**
 * Verify if the given dynamb has at least one dynamb-specific property.
 * @param {Object} dynamb The dynamb to verify.
 * @return {boolean} True if at least one dynamb-specific property is present.
 */
function isDynambPropertyPresent(dynamb) {
  for(const property in dynamb) {
    if(DEFAULT_DYNAMB_PROPERTIES.includes(property)) {
      return true;
    }
  }

  return false;
}


/**
 * Compile dynamic ambient (dynamb) data object from device id & data.
 * @param {String} deviceId The device identifier.
 * @param {Number} deviceIdType The type of device identifier (see raddec).
 * @param {Object} data The processed payload data of the device.
 * @param {Number} timestamp The timestamp of the radio packet reception.
 * @return {Object} The compiled dynamb object.
 */
function compileDynamb(deviceId, deviceIdType, data, timestamp) {
  let dynamb = { deviceId: deviceId,
                 deviceIdType: deviceIdType,
                 timestamp: timestamp };

  for(const property in data) {
    if(DEFAULT_DYNAMB_PROPERTIES.includes(property)) {
      dynamb[property] = data[property];
    }
  }

  return dynamb;
}
