Pareto Anywhere for Azure
=========================

[Pareto Anywhere for Azure](https://www.reelyactive.com/pareto/anywhere/integrations/azure/) is the open source middleware that unlocks the value of the [ambient data](https://www.reelyactive.com/ambient-data/) arriving at your Azure IoT Hub.

__Pareto Anywhere for Azure__ runs efficiently as a stateless [Azure Function](https://azure.microsoft.com/products/functions/), triggered by data forwarded from IoT infrastructure, such as [Aruba APs](https://www.reelyactive.com/pareto/anywhere/infrastructure/aruba/), to [Azure IoT Hub](https://azure.microsoft.com/products/iot-hub/).

__Pareto Anywhere for Azure__ provides a single standard stream of real-time data, regardless of the underlying devices & technologies, which include Bluetooth Low Energy and EnOcean Alliance.  Dynamic ambient (__dynamb__) data is output as JSON to [Azure Event Hub](https://azure.microsoft.com/products/event-hubs) from which it is easily relayed to any store, stream processor and/or application.

_Where to start?_
- [Pareto Anywhere for Azure](https://www.reelyactive.com/pareto/anywhere/integrations/azure/) overview on reelyActive
- [Run Pareto Anywhere for Azure](https://reelyactive.github.io/diy/pareto-anywhere-azure/) by following a step-by-step tutorial
- [Developer's Cheatsheet](https://reelyactive.github.io/diy/cheatsheet/) for details on the __dynamb__ data structure


Installation
------------

Clone this repository and, from the root of the __pareto-anywhere-azure__ folder, install the package dependencies with the following command:

    npm install

Then, in that same folder, create a file called local.settings.json, and paste in the following contents:


    {
      "IsEncrypted": false,
      "Values": {
        "FUNCTIONS_WORKER_RUNTIME": "node",
        "AzureWebJobsStorage": "...",
        "EventHubConnectionString": "...",
        "WebPubSubConnectionString": "...",
        "iot_hub_name": "...",
        "event_hub_name": "...",
        "web_pub_sub_hub_name": "..."
      }
    }

Replace the ```"..."``` values with the appropriate strings from the Azure Portal, as explained in our [Run Pareto Anywhere for Azure](https://reelyactive.github.io/diy/pareto-anywhere-azure/) tutorial.


Running locally
---------------

With the Azure CLI installed, run __pareto-anywhere-azure__ locally from its root folder with the following command:

    func start


Running on Azure
----------------

With the Azure CLI installed, push __pareto-anywhere-azure__ to Azure with the following command:

    func azure functionapp publish <APP_NAME>

Initially, and anytime there are changes to local.settings.json, append the flag ```--publish-local-settings -i``` to the above.


Project History
---------------

__Pareto Anywhere for Azure__ evolved from [pareto-anywhere](https://github.com/reelyactive/pareto-anywhere/), retaining the stateless processing modules such as the [advlib](https://github.com/reelyactive/advlib) libraries, facilitating efficient operation as a stateless Azure Function.

__pareto-anywhere-azure__ was initially prototyped as [aruba-iot-advlib-azure-function](https://github.com/reelyactive/aruba-iot-advlib-azure-function).


Contributing
------------

Discover [how to contribute](CONTRIBUTING.md) to this open source project which upholds a standard [code of conduct](CODE_OF_CONDUCT.md).


Security
--------

Consult our [security policy](SECURITY.md) for best practices using this open source software and to report vulnerabilities.

[![Known Vulnerabilities](https://snyk.io/test/github/reelyactive/pareto-anywhere-azure/badge.svg)](https://snyk.io/test/github/reelyactive/pareto-anywhere-azure)


License
-------

MIT License

Copyright (c) 2022-2023 [reelyActive](https://www.reelyactive.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
THE SOFTWARE.
