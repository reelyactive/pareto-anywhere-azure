/**
 * Copyright reelyActive 2016-2023
 * We believe in an open Internet of Things
 */


let beaver = (function() {

  // Internal constants
  const SIGNATURE_SEPARATOR = '/';
  const DEFAULT_STREAM_PATH = '/devices';
  const DEFAULT_QUERY_PATH = '/context';
  const DEFAULT_UPDATE_MILLISECONDS = 5000;
  const DEFAULT_STALE_DEVICE_MILLISECONDS = 60000;

  // Internal variables
  let devices = new Map();
  let eventCallbacks = { connect: [], raddec: [], dynamb: [], spatem: [],
                         stats: [], error: [], disconnect: [] };
  let eventCounts = { raddec: 0, dynamb: 0, spatem: 0 };
  let staleDeviceMilliseconds = DEFAULT_STALE_DEVICE_MILLISECONDS;
  let updateMilliseconds = DEFAULT_UPDATE_MILLISECONDS;
  let updateTimeout = null;
  let lastUpdateTime;

  // Determine if the given URL is valid
  function isValidUrl(url) {
    try { new URL(url); }  catch(error) { return false; }  return true;
  }

  // Create the array of nearest devices based on the given raddec & dynamb
  function createNearest(raddec, dynamb) {
    let nearest = [];
    if(raddec && Array.isArray(raddec.rssiSignature)) {
      raddec.rssiSignature.forEach((entry) => {
        let signature = entry.receiverId + SIGNATURE_SEPARATOR +
                        entry.receiverIdType;
        nearest.push({ device: signature, rssi: entry.rssi });
      });
    }
    if(dynamb && Array.isArray(dynamb.nearest)) {
      dynamb.nearest.forEach((entry) => { nearest.push(entry); });
    }
    return nearest.sort((a, b) => b.rssi - a.rssi);
  }

  // Create a copy of the given dynamb, trimmed of its identifier
  function createTrimmedDynamb(dynamb) {
    let trimmedDynamb = Object.assign({}, dynamb);
    delete trimmedDynamb.deviceId;
    delete trimmedDynamb.deviceIdType;
    return trimmedDynamb;
  }

  // Create a copy of the given spatem, trimmed of its identifier
  function createTrimmedSpatem(spatem) {
    let trimmedSpatem = Object.assign({}, spatem);
    delete trimmedSpatem.deviceId;
    delete trimmedSpatem.deviceIdType;
    return trimmedSpatem;
  }

  // Handle the given raddec
  function handleRaddec(raddec) {
    let signature = raddec.transmitterId + SIGNATURE_SEPARATOR +
                    raddec.transmitterIdType;
    let device = devices.get(signature);

    if(device) {
      if(!device.hasOwnProperty('raddec') ||
         (raddec.timestamp > device.raddec.timestamp)) {
        device.raddec = raddec;
        device.nearest = createNearest(device.raddec, device.dynamb);
      }
    }
    else {
      device = { raddec: raddec, nearest: createNearest(raddec) };
      devices.set(signature, device);
    }

    eventCallbacks['raddec'].forEach(callback => callback(raddec));
    eventCounts.raddec++;
  }

  // Handle the given dynamb
  function handleDynamb(dynamb) {
    let signature = dynamb.deviceId + SIGNATURE_SEPARATOR +
                    dynamb.deviceIdType;
    let device = devices.get(signature);

    if(device) {
      if(!device.hasOwnProperty('dynamb') ||
         (dynamb.timestamp > device.dynamb.timestamp)) {
        device.dynamb = createTrimmedDynamb(dynamb);
        device.nearest = createNearest(device.raddec, device.dynamb);
      }
    }
    else {
      device = { dynamb: createTrimmedDynamb(dynamb) };
      if(Array.isArray(dynamb.nearest)) {
        device.nearest = createNearest(device.raddec, device.dynamb);
      }
      devices.set(signature, device);
    }

    eventCallbacks['dynamb'].forEach(callback => callback(dynamb));
    eventCounts.dynamb++;
  }

  // Handle the given spatem
  function handleSpatem(spatem) {
    let signature = spatem.deviceId + SIGNATURE_SEPARATOR +
                    spatem.deviceIdType;
    let device = devices.get(signature);

    if(device) {
      if(!device.hasOwnProperty('spatem') ||
         (spatem.timestamp > device.spatem.timestamp)) {
        device.spatem = createTrimmedSpatem(spatem);
      }
    }
    else {
      device = { spatem: createTrimmedSpatem(spatem) };
      devices.set(signature, device);
    }

    eventCallbacks['spatem'].forEach(callback => callback(spatem));
    eventCounts.spatem++;
  }

  // Handle a context query callback
  function handleContext(data) {
    if(data) {
      for(const signature in data.devices) {
        devices.set(signature, data.devices[signature]); // TODO: merge?
      }
    }
  }

  // Remove stale data/devices from the graph
  function purgeStaleData() {
    let staleCollection = [];
    let nearestCollection = [];
    let staleTimestamp = Date.now() - staleDeviceMilliseconds;

    devices.forEach((device, signature) => {
      let isStale = !((device.raddec &&
                       (device.raddec.timestamp > staleTimestamp)) ||
                      (device.dynamb &&
                       (device.dynamb.timestamp > staleTimestamp)) ||
                      (device.spatem &&
                       (device.spatem.timestamp > staleTimestamp)));
      if(isStale) {
        staleCollection.push(signature);
      }
      else if(Array.isArray(device.nearest)) {
        device.nearest.forEach((entry) => {
          if(entry.device && !nearestCollection.includes(entry.device)) {
            nearestCollection.push(entry.device);
          }
        });
      }
    });

    staleCollection.forEach((signature) => {
      if(!nearestCollection.includes(signature)) {
        devices.delete(signature);
      }
    });
  }

  // Update the hyperlocal context graph and stats, then set next update
  function update() {
    let currentUpdateTime = Date.now();
    purgeStaleData();

    if(lastUpdateTime) {
      let updateIntervalSeconds = (currentUpdateTime - lastUpdateTime) / 1000;
      let stats = {
          numberOfDevices: devices.size,
          eventsPerSecond: {
              raddec: eventCounts.raddec / updateIntervalSeconds,
              dynamb: eventCounts.dynamb / updateIntervalSeconds,
              spatem: eventCounts.spatem / updateIntervalSeconds
          }
      };
      eventCounts.raddec = 0;
      eventCounts.dynamb = 0;
      eventCounts.spatem = 0;

      eventCallbacks['stats'].forEach(callback => callback(stats));
    }

    lastUpdateTime = currentUpdateTime;
    updateTimeout = setTimeout(update, updateMilliseconds);
  }

  // Perform a HTTP GET on the given URL, accepting JSON
  function retrieveJson(url, callback) {
    fetch(url, { headers: { "Accept": "application/json" } })
      .then((response) => {
        if(!response.ok) { throw new Error('GET returned ' + response.status); }
        return response.json();
      })
      .then((result) => { return callback(result); })
      .catch((error) => {
        let helpfulError = new Error('Failed to GET ' + url);
        eventCallbacks['error'].forEach(callback => callback(helpfulError));
        return callback(null);
      });
  }

  // Handle socket.io events
  function handleSocketEvents(socket, url) {
    socket.on('connect', () => {
      console.log('beaver.js connected to Socket.IO on', url);
      eventCallbacks['connect'].forEach(callback => callback());
    });
    socket.on('raddec', handleRaddec);
    socket.on('dynamb', handleDynamb);
    socket.on('spatem', handleSpatem);
    socket.on('connect_error', (error) => {
      let helpfulError = new Error('Socket.IO connect error on ' + url);
      eventCallbacks['error'].forEach(callback => callback(helpfulError));
    });
    socket.on('disconnect', (reason) => {
      console.log('beaver.js disconnected from Socket.IO on', url);
      eventCallbacks['disconnect'].forEach(callback => callback(reason));
    });
  }

  // Handle WebSocket events
  function handleWebSocketEvents(socket) {
    socket.addEventListener('open', () => {
      console.log('beaver.js connected to WebSocket on', socket.url);
      eventCallbacks['connect'].forEach(callback => callback());
    });
    socket.addEventListener('message', (event) => {
      try {
        let message = JSON.parse(event.data);
        switch(message.type) {
          case 'raddec': handleRaddec(message.data); break;
          case 'dynamb': handleDynamb(message.data); break;
          case 'spatem': handleSpatem(message.data); break;
        }
      }
      catch(err) {}
    });
    socket.addEventListener('error', (event) => {
      let helpfulError = new Error('WebSocket error on ' + socket.url);
      eventCallbacks['error'].forEach(callback => callback(helpfulError));
    });
    socket.addEventListener('close', (event) => {
      console.log('beaver.js disconnected from WebSocket on', socket.url);
      eventCallbacks['disconnect'].forEach(callback => callback(event.reason));
    });
  }

  // Stream from the given server
  let stream = function(serverRootUrl, options) {
    options = options || {};
    options.isDebug = options.isDebug || false;
    let streams = {};

    if(isValidUrl(serverRootUrl)) {
      let streamUrl = serverRootUrl + DEFAULT_STREAM_PATH;
      let queryUrl = serverRootUrl + DEFAULT_QUERY_PATH;

      if(options.deviceSignature) {
        streamUrl = serverRootUrl + '/devices/' + options.deviceSignature;
        queryUrl = serverRootUrl + '/context/device/' + options.deviceSignature;
      }

      retrieveJson(queryUrl, handleContext);
      if(options.io) {
        streams.socket = options.io.connect(streamUrl);
        handleSocketEvents(streams.socket, streamUrl);
      }
    }
    else {
      if(options.io && isValidUrl(options.ioUrl)) {
        streams.socket = options.io.connect(options.ioUrl);
        handleSocketEvents(streams.socket, options.ioUrl);
      }
      if(isValidUrl(options.wsUrl)) {
        streams.websocket = new WebSocket(options.wsUrl);
        handleWebSocketEvents(streams.websocket);
      }
    }

    if(!updateTimeout) {
      update(); // Start periodic updates
    }

    return streams;
  };

  // Register a callback for the given event
  let setEventCallback = function(event, callback) {
    let isValidEvent = event && eventCallbacks.hasOwnProperty(event);
    let isValidCallback = callback && (typeof callback === 'function');

    if(isValidEvent && isValidCallback) {
      eventCallbacks[event].push(callback);
    }
  }

  // Expose the following functions and variables
  return {
    stream: stream,
    on: setEventCallback,
    devices: devices
  }

}());
