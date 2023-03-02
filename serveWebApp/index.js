/**
 * Copyright reelyActive 2022-2023
 * We believe in an open Internet of Things
 */


const fs = require('fs').promises;
const path = require('path');
const mime = require('mime-types');


module.exports = async function(context, req) {
  let folder = context.bindingData.folder || '';
  let filename = context.bindingData.filename || 'index.html';
  let type = mime.lookup(filename);
  let filePath = path.join(context.executionContext.functionDirectory, folder,
                           filename);

  try {
    let fileData = await fs.readFile(filePath);
    context.res = { headers: { "Content-Type": type }, body: fileData };
  }
  catch(error) {
    context.res = { status: 404 };
  }
};