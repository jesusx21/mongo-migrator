'use strict';

const _ = require('lodash');

class Config {
  constructor(args) {
    this.mongoConfig = {
      user: args.user,
      password: args.password,
      database: args.database,
      replicaSet: args.replicaSet
    };

    this.mongoConfig.servers = _.map(args.servers, (server) => {
      return {host: server.host, port: server.port};
    });
  }

  getMongoConnectionString() {
    let servers = [];
    let uri = 'mongodb://';

    if (this.mongoConfig.user && this.mongoConfig.password) {
      uri += this.mongoConfig.user + ':' + this.mongoConfig.password + '@';
    }

    this.mongoConfig.servers.forEach((server) => {
      let serverString = server.host;

      if (server.port) {
        serverString += ':' + server.port;
      }
      servers.push(serverString);
    });

    uri += [servers.join(), this.mongoConfig.database].join('/');

    this.mongoConfig.replicaSet && (uri += '?replicaSet=' + this.mongoConfig.replicaSet);

    return uri;
  }
}

module.exports = Config;
