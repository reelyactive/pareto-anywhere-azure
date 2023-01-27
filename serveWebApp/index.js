/**
 * Copyright reelyActive 2022-2023
 * We believe in an open Internet of Things
 */


const fs = require('fs').promises;
const path = require('path');


module.exports = async function(context, req) {
  let filePath = path.join(context.executionContext.functionDirectory,
                           'index.html');
  let htmlData = await fs.readFile(filePath, 'utf8');

  context.res = { headers: { "Content-Type": "text/html" }, body: htmlData };
};