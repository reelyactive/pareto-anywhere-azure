Pareto Anywhere for Azure
=========================

[![Deploy To Azure](https://raw.githubusercontent.com/Azure/azure-quickstart-templates/master/1-CONTRIBUTION-GUIDE/images/deploytoazure.svg?sanitize=true)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Freelyactive%2Fpareto-anywhere-azure%2Fmaster%2Fdeployments%2Fpareto-anywhere-azure%2F%2Fazuredeploy.json)

This is an Azure Resource Manager (ARM) template that installs Pareto Anywhere for Azure within an existing Resource Group that includes an IoT Hub.  You can run it from the CLI or using the [Azure Portal](https://portal.azure.com).

This template provisions [Pareto Anywhere for Azure](https://www.reelyactive.com/pareto/anywhere/integrations/azure/) as a serverless [Azure Function](https://azure.microsoft.com/products/functions/) along with the following supporting resources:
- [Storage Account](https://azure.microsoft.com/products/category/storage/) ([Consumption Plan](https://azure.microsoft.com/pricing/details/functions/))
- [Web PubSub](https://azure.microsoft.com/products/web-pubsub/) ([Free Tier](https://azure.microsoft.com/pricing/details/web-pubsub/))
- [Event Hub & Namespace](https://azure.microsoft.com/products/event-hubs/) ([Basic Tier](https://azure.microsoft.com/pricing/details/event-hubs/))


After Deployment
----------------

Once Pareto Anywhere for Azure is deployed, visit the web dashboard at [https://function-name.azurewebsites.net/app/](https://function-app-name.azurewebsites.net/app/) to observe real-time data received at the IoT Hub.  Replace `function-name` in the URL with the name selected for the Pareto Anywhere for Azure Function.