const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);

module.exports = async (root) => {
  const files = await readdir(root);
  const modules = files.filter(filename => filename.endsWith('.js'))
    .map(file => require(path.resolve(root, file)));

  return (dweller) => {
    for (const module of modules)
      module(dweller);
  };
};
