# mongo-migrator

**Table of Contents**

- [Installation](#installation)
- [Common Usage (CLI)](#common-usage-cli)
  - [Configuration](#configuration)
  - [Creating Migrations](#creating-migrations)
    - [Migration functions](#migration-functions)
  - [Sample migration file](#sample-migration-file)
  - [Running migrations](#running-migrations)
- [Programmatic usage](#programmatic-usage)
  - [Using `Migrator`](#using-migrator-object)

*Note: this library was based on [mongodb-migrations](https://github.com/emirotin/mongodb-migrations)*

## Installation

```bash
$ npm install mongo-migrator -g
```

## Common Usage (CLI)

The package installs a single CLI executable — `mograte`.

When installing locally to your project this executable can be found at
`./node_modules/.bin/mograte`.

When installing globally the executable should
automatically become accessible on your PATH.

### Configuration

```bash
$ mograte init
```
The CLI app will crate a file called configmigrate.json, this file has the default
configuration

```json
{
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
}
```

The configuration object can have the following keys:

* `migration` — Contains the configuration to run migrations,
* `mongo` - Contains the configuration for MongoDB,
* `migration.directory` — the directory (path relative to the current folder)
to store migration files in and read them from,
* `migration.collection` — The name of the MongoDB collection to track
already ran migrations,
* `mongo.database` — MongoDB database where migrations will be applied,
* `mongo.user` _[optional]_ — MongoDB user name when authentication is required,
* `mongo.password` _[optional]_ — MongoDB password when authentication is required,
* `mongo.replicaSet` _[optional]_ — MongoDB replicaSet if database has one,
* `mongo.servers` - MongoDB servers configuration.
* `mongo.servers[@].host` _[localhost by default]_- MongoDB host of server
* `mongo.servers[@].port` _[27017 by default]_- MongoDB port of server

### Creating Migrations

The app simplifies creating migration stubs by providing a command

```bash
$ mograte create 'migration name'
```

This creates automatically numbered file `ddmmyyyyhhmmssms-migration-name.js`
inside of the `directory` defined in the
[configuration](#configuration) file.

The migration file must be a EcmaScript6 module exporting the
following:

* `id` — a string that's used to identify the migration
(filled automatically when creating migrations through `mograte create`).
* `upgrade`  — a function used for forward migration.
* `downgrade` — a function used for backward migration.

See [Configuration](#configuration) if your config file has
non-standard name.

#### Migration functions

The `upgrade` and `downgrade` functions take a single parameter — a Node-style callback:

```javascript
const upgrade = function(done) {
  // call done() when migration is successfully finished
  // call done(error) in case of error
}
```

The `upgrade` and `downgrade` functions are executed with the scope
providing 2 convenient properties:

* `this.db` is an open MongoDB
[native driver](http://mongodb.github.io/node-mongodb-native/)
connection. Useful if you are not using any ODM library.
* `this.log` is a function allowing you to print
informative messages during the progress of your migration.


### Sample migration file

```javascript
'use strict';

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
```

### Running migrations

Run all migrations from the `directory` (specified in
[Configuration](#configuration)) by calling

For Upgrades

```bash
$ mograte upgrade [null|id|name]
```

Where
  - null will run all pending migrations,
  - id is only the numeric on id
  - name is tha part of the name on id

For downgrades

```bash
$ mograte downgrade [null|id|name]
```

Where
  - null will do rollback to all migrations,
  - id is only the numeric on id
  - name is tha part of the name on id

The library only runs migrations that:

1. have `upgrade` function defined,
1. have `downgrade` function defined,
1. were not ran before against this database.
1. were downgraded at any moment

Successfully upgrade migrations are recorded in the `collection`
specified in [Configuration](#configuration) and successfully
downgrade migrations remove the record from the `collection`.

The migration process is stopped instantly if some migration fails
(returns error in its callback).

See [Configuration](#configuration) if your config file has
no standard configuration.

## Programmatic usage

The library also supports programmatic usage.

Start with `require`'ing it:

```javascript
var mograte = require('mongo-migrator');
```

### Using `Migrator`

Next, you can use mograte as was described before:

```javascript
mograte.init();
mograte.create(name);
mograte.upgrade(option);
mograte.downgrade(option);
```

For downgrade and upgrade you have to sent the option in an Array
as the second item([null, option]).
