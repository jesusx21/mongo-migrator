'use strict';

const fs = require('fs');

const pad = function(str, max) {
  str = str.toString();
  return str.length < max ? pad('0' + str, max) : str;
};

const getDateArgs = function(date) {
  return [
    pad(date.getDate(), 2),
    pad(date.getMonth() + 1, 2),
    pad(date.getFullYear(), 4),
    pad(date.getHours(), 2),
    pad(date.getMinutes(), 2),
    pad(date.getSeconds(), 2),
    pad(date.getMilliseconds(), 2)
  ];
};

const getUniqueId = function() {
  const dateArgs = getDateArgs(new Date());
  const id = dateArgs.join('');
  return id;
}

const createMigrationFile = function (name, fileName, callback) {
  let BODY = `'use strict';

const id = '${name}';

const upgrade = function(done) {
  // use this.db for MongoDB communication, and this.log() for logging
  done();
};

const downgrade = function(done) {
  // use this.db for MongoDB communication, and this.log() for logging
  done();
};

module.exports = {
  id: id,
  upgrade: upgrade,
  downgrade: downgrade
};
`;
  fs.writeFile(fileName, BODY, callback);
}

module.exports = {
  getUniqueId: getUniqueId,
  createMigrationFile: createMigrationFile
}
