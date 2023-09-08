Pareto Anywhere for Azure
=========================

__Pareto Anywhere for Azure__ is the open source middleware that unlocks the value of the [ambient data](https://www.reelyactive.com/ambient-data/) arriving at your Azure IoT Hub.

![Overview of Pareto Anywhere for Azure](https://reelyactive.github.io/pareto-anywhere-azure/images/overview.png)

__Pareto Anywhere for Azure__ runs efficiently as a stateless [Azure Function](https://azure.microsoft.com/products/functions/), triggered by data forwarded from IoT infrastructure, such as [Aruba APs](https://www.reelyactive.com/pareto/anywhere/infrastructure/aruba/), to [Azure IoT Hub](https://azure.microsoft.com/products/iot-hub/).

__Pareto Anywhere for Azure__ provides a single standard stream of real-time data, regardless of the underlying devices & technologies, which include Bluetooth Low Energy and EnOcean Alliance.  Dynamic ambient (__dynamb__) data is output as JSON to [Azure Event Hub](https://azure.microsoft.com/products/event-hubs) from which it is easily relayed to any store, stream processor and/or application.

Learn more at: [www.reelyactive.com/pareto/anywhere/integrations/azure/](https://www.reelyactive.com/pareto/anywhere/integrations/azure/)


Getting Started
---------------

Follow our step-by-step tutorial to deploy __Pareto Anywhere for Azure__:
- [Run Pareto Anywhere for Azure](https://reelyactive.github.io/diy/pareto-anywhere-azure/)

Learn "owl" about the __dynamb__ JSON data output:
- [Developer's Cheatsheet](https://reelyactive.github.io/diy/cheatsheet/)


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

Then browse to [localhost:7071/app/](http://localhost:7071/app/) to observe data in the web app served by the function.


Running on Azure
----------------

With the Azure CLI installed, push __pareto-anywhere-azure__ to Azure with the following command:

    func azure functionapp publish <APP_NAME>

Initially, and anytime there are changes to local.settings.json, append the flag ```--publish-local-settings -i``` to the above.

Browse to ```<APP_NAME>.azurewebsites.net/app/``` to observe data in the web app served by the function.


Data Structure
--------------

__pareto-anywhere-azure__ outputs events to the Event Hub and to the Web PubSub (for consumption in the web app) using the following structure:

    {
      "type": "dynamb",
      "data": { }
    }

The type is always _dynamb_ (but _raddec_ and _spatem_ can be accommodated in future).  And the data is the _dynamb_ data structure itself: see the [reelyActive Developers Cheatsheet](https://reelyactive.github.io/diy/cheatsheet/) for details.

An example of an event from a temperature & humidity sensor would be as follows:

    {
      "type": "dynamb",
      "data": {
        "deviceId": "ac233f000000",
        "deviceIdType": 2,
        "timestamp": 1645568542222,
        "temperature": 21.77734375,
        "relativeHumidity": 64.90625
      }
    }


Web App
-------

The web app provides an intuitive visualisation of the real-time event stream:

![Pareto Anywhere for Azure web app](https://reelyactive.github.io/pareto-anywhere-azure/images/web-app-screenshot.png)

The web app and all its dependencies are served by the Azure Function itself from the /serveWebApp folder and its subfolders.  Simply edit the index.html file and the dependencies as required, and the changes will appear as soon as the function restarts.

See the [reelyActive Web Style Guide](https://reelyactive.github.io/web-style-guide/) to facilitate customisation, and the [beaver.js](https://github.com/reelyactive/beaver/) and [cuttlefish.js](https://github.com/reelyactive/cuttlefish/) client-side modules which collect and render the real-time dynamic ambient data, respectively.


GitHub Codespaces
-----------------

__pareto-anywhere-azure__ supports [GitHub Codespaces](https://github.com/features/codespaces/) for development/deployment within the browser rather than a local installation.  The project Codespace is configured to include:
- Node.js
- Azure CLI
- Azure Functions Core Tools
- Port forwarding on 7071


GitHub Actions
--------------

__pareto-anywhere-azure__ supports [GitHub Actions](https://github.com/features/actions/) to automate the deployment of Azure resources.  This is currently under development, with experimental workflows available in the .github/workflows subfolder.


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
