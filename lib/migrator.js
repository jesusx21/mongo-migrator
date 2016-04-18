'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const async = require('async');
const mkdirp = require('mkdirp');

const utils = require('./utils');

const isLastItem = function(item) {
  return !item;
};

const UPGRADE = 'upgrade';
const DOWNGRADE = 'downgrade';

class Migrator {
  constructor(args) {
    this.directory = args.directory;
    this.db = args.db;
    this.collection = this.db.collection(args.collection);
  }

  log(msg) {
    var pad;
    pad = Array(4).join(' ');
    return console.log(pad + msg);
  }

  create(name, callback) {
    name = name.toLowerCase();
    name = name.replace(/\s+/g, '-');

    let id = `${utils.getUniqueId()}-${name}`;
    let fileName = path.join(this.directory, `${id}.js`);
    mkdirp(this.directory, (error) => {
      utils.createMigrationFile(`${id}`, fileName, (error) => {
        if (error) return callback(error);

        this.log(`Migration File ${id}.js ceated!!`);
        let migrationData = {
          id: id,
          status: 'created',
          createdAt: new Date()
        };
        callback();
      });
    });
  }

  upgrade(option, callback)  {
    this.direction = UPGRADE;
    this.option = option;

    let query = {};
    async.waterfall([
      this._loadMigrationFiles.bind(this),
      this._findMigrations.bind(this),
      (cursor, next) => {
        cursor.each((error, migrationData) => {
          if (isLastItem(migrationData)) return next();
          if (_.has(this.migrationFiles, migrationData.id)) {
            delete this.migrationFiles[migrationData.id]
          }
        });
      },
      (next) => {
        async.map(this.migrationFiles, (migrationFile, next) => {
           next(null, function(callback) {
            let migrationData = {
              id: migrationFile.id,
              createdAt: new Date()
            };
            this._run(migrationData, callback);
          }.bind(this));
        }, next);
      },
      (migrations, next) => {
        async.series(migrations, next);
      }
    ], callback);
  }

  downgrade(option, callback) {
    this.direction = DOWNGRADE;
    this.option = option;

    let query = {};
    async.waterfall([
      this._loadMigrationFiles.bind(this),
      this._findMigrations.bind(this),
      (cursor, next) => {
        let migrations = [];
        cursor.each((error, migrationData) => {
          if (isLastItem(migrationData)) return next(null, migrations);
          migrations.push((callback) => {
            this._run(migrationData, callback);
          });
        });
      },
      (migrations, next) => {
        async.series(migrations, next);
      }
    ], callback);
  }

  _findMigrations(callback) {
    let query = {
      id: {
        $in: Object.keys(this.migrationFiles)
      }
    };
    this.collection.find(query, callback);
  }

  _run(migrationData, callback) {
    let fileName = migrationData.id;
    const migrateFunction = this._getMigrateFunction(fileName)
    migrateFunction(() => {
      this.log(`Migration File ${fileName}.js was ${this.direction}d`);
      if (this.direction === UPGRADE) {
        migrationData.createdAt = new Date();
        this.collection.insert(migrationData, callback);
      } else {
        this.collection.remove({id: migrationData.id}, callback);
      }
    });
  }

  _getMigrateFunction(id) {
    return this.migrationFiles[id][this.direction].bind(this);
  }

  _loadMigrationFiles(callback) {
    mkdirp(this.directory, (error) => {
      if (error) return callback(error);

      fs.readdir(this.directory, (error, files) => {
        if (error) return callback(error);

        let migrationFiles = {}
        files.map((file) => {
          let fileName = path.join(this.directory, file);

          if (!this.option || file.startsWith(this.option) || file.endsWith(`${this.option}.js`)) {
            migrationFiles[file.split('.js')[0]] = require(fileName);
          }
        });
        this.migrationFiles = migrationFiles;
        callback();
      });
    });
  }
};

module.exports = Migrator;
