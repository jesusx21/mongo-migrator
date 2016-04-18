'use strict';

const mkdirp = require('mkdirp');
const fs = require('fs');
const mongo = require('mongodb').MongoClient;

const Migrator = require('./lib/migrator');
const Config = require('./config');

const bodyConfig = `{
  "migration": {
    "directory": "migrations/",
    "collection": "migrations"
  },
  "mongo": {
    "database": "test",
    "user": "mongo-user",
    "password": "mongo-password",
    "replicaSet": "replicaSet",
    "servers": [{
      "host": "localhost",
      "port": 27017
    }]
  }
}`;

let migrator;
let config;

const cleanArgs = function(args) {
  if (args.mongo.user === 'mongo-user') {
    delete args.mongo.user;
  }

  if (args.mongo.password === 'mongo-password') {
    delete args.mongo.password;
  }

  if (args.mongo.replicaSet === 'replicaSet') {
    delete args.mongo.replicaSet;
  }

  if (args.migration.directory) {
    args.migration.directory = `${args.migration.directory}`;
  }

  return args;
}

const _loadMigrator = function(callback) {
  let args = {};

  try {
    args = require(`${process.cwd()}/configMigrate`);
    args = cleanArgs(args);
  } catch(error) {
    const message = `file configMigrate.js was not found`;
    console.error(message)
    return callback(new Error(message));
  }

  config = new Config(args.mongo);
  mongo.connect(config.getMongoConnectionString(), (error, db) => {
    if (error) return callback(error);

    args.migration.db = db;
    migrator = new Migrator(args.migration);
    callback();
  });
}

const done = function(error, result) {
  if (error) {
    console.log(error);
    return process.exit(1);
  }

  if (result) {
    return process.exit(0);
  }

  process.exit(0);
}

module.exports.init = function(options) {
  if (options[1]) {
    const message = 'command init does not have options';
    return done(new Error(message))
  }

  let path = `${process.cwd()}/configMigrate.json`;
  fs.writeFile(path, bodyConfig, (error) => {
    if (error) return done(error);

    console.log(`config file ${path} created`)
    done();
  });
}

module.exports.create = function(options) {
  _loadMigrator((error) => {
    if (error) return done(error);
    if (!options[1]) {
      const message = 'the name of the script is needed';
      return done(new Error(message))
    }
    migrator.create(options[1], done);
  });
}

module.exports.upgrade = function(options) {
  _loadMigrator((error) => {
    if (error) return done(error);

    migrator.upgrade(options[1], done);
  });
}

module.exports.downgrade = function(options) {
  _loadMigrator((error) => {
    if (error) return done(error);

    migrator.downgrade(options[1], done);
  });
}


