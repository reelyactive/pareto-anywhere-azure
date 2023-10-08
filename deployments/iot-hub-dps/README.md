IoT Hub and Device Provisioning Service
=======================================

[![Deploy To Azure](https://raw.githubusercontent.com/Azure/azure-quickstart-templates/master/1-CONTRIBUTION-GUIDE/images/deploytoazure.svg?sanitize=true)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Freelyactive%2Fpareto-anywhere-azure%2Fmaster%2Fdeployments%2Fiot-hub-dps%2F%2Fazuredeploy.json)

This is an Azure Resource Manager (ARM) template that installs an IoT Hub and IoT Hub Device Provisioning Service within an existing Resource Group.  You can run it from the CLI or using the [Azure Portal](https://portal.azure.com).

This template provisions an [IoT Hub](https://azure.microsoft.com/products/iot-hub/) ([Standard Tier: S1](https://azure.microsoft.com/pricing/details/iot-hub/)) and [IoT Hub Device Provisioning Service](https://learn.microsoft.com/azure/iot-dps/).


After Deployment
----------------

Once the IoT Hub Device Provisioning Service (DPS) is deployed, provision the IoT devices as required.

In the case of HPE Aruba Networking APs, within the Azure Portal, create an Enrollment Group for the DPS using symmetric key attestation.  Retrieve the following two parameters which are used to provision the APs:
- Primary (Symmetric) Key
- ID Scope