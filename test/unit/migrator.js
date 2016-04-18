'use strict';

const async = require('async');
const mongo = require('mongodb').MongoClient;

const Config = require('./../../config');
const Migrator = require('migrator');

describe('Migrator', () => {
  let migrator;
  let args = {
    migration: {
      directory: __dirname + '/migrations',
      collection: 'migrations'
    },
    mongo: {
      database: 'test',
      servers: [{
        host: 'localhost',
        port: 27017
      }]
    }
  };

  const connectMongo = function(callback) {
    let config = new Config(args.mongo);
    mongo.connect(config.getMongoConnectionString(), callback);

    /*async.waterfall([
      (next) => {
        mongo.connect(config.getMongoConnectionString(), next);
      },
      (db, next) => {
        db.dropDatabase((error) => {
          next(error, db);
        });
      }
    ], callback);*/
  };

  beforeEach((done) => {
    connectMongo((error, db) => {
      args.migration.db = db;
      migrator = new Migrator(args.migration);
      done();
    });
  });

  describe('#_loadMigrationFiles', () => {
    it('create migrate folder', (done) => {
      migrator._loadMigrationFiles(null, (error, files) => {
        if (error) return done(error);
        done();
      })
    })
  });

  describe('#create', () => {
    it('create migration file', (done) => {
      migrator.create('attach algo', (error, files) => {
        if (error) return done(error);
        done();
      });
    });
  });

  describe('#upgrade', () => {
    it('upgrade migration file', (done) => {
      migrator.upgrade('9697', (error, files) => {
        if (error) return done(error);
        done();
      });
    });
  });

  describe('#Downgrade', () => {
    it('downgrade migration file', (done) => {
      migrator.downgrade('9697', (error, files) => {
        if (error) return done(error);
        done();
      });
    });
  });
});
