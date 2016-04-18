'use strict';

var chai = require('chai');
var sinonChai = require('sinon-chai');
var paths = require('app-module-path');

chai.use(sinonChai);

paths.addPath(__dirname + '/../lib');
global.expect = chai.expect;
