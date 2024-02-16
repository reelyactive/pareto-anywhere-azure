Redeploy Pareto Anywhere for Azure
==================================

[![Deploy To Azure](https://raw.githubusercontent.com/Azure/azure-quickstart-templates/master/1-CONTRIBUTION-GUIDE/images/deploytoazure.svg?sanitize=true)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Freelyactive%2Fpareto-anywhere-azure%2Fmaster%2Fdeployments%2Fupdate-pareto-anywhere%2F%2Fazuredeploy.json)

This is an Azure Resource Manager (ARM) template that _updates_ an existing Pareto Anywhere for Azure deployment with the latest version of the code from GitHub.  You can run it from the CLI or using the [Azure Portal](https://portal.azure.com).

After Deployment
----------------

Once Pareto Anywhere for Azure is deployed, visit the web dashboard at [https://function-name.azurewebsites.net/app/](https://function-app-name.azurewebsites.net/app/) to observe real-time data received at the IoT Hub.  Replace `function-name` in the URL with the name selected for the Pareto Anywhere for Azure Function.