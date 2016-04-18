'use strict';

const id = '17042016092522941-attach-algo';

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
