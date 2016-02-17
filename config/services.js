/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

'use strict';

var credentials   = require('../credentials'),
    extend        = require('util')._extend,
    watson        = require('watson-developer-cloud'),
    bluemix       = require('./bluemix'),
    Promise       = require('bluebird');

function isDefined(v) {
  return !(typeof v === 'undefined' || v === null);
}

/**
 * Initializes services.
 */
module.exports = (function () {

  function asPromise(f, _this) {

    function promiseResolver(resolve, reject) {
      return function(err, data) {
        if (isDefined(err)) {
          reject(err);
        } else {
          resolve(data);
        }
      };
    }

    return function(params) {
      return new Promise(function(resolve, reject) {
        f.apply(_this, [params, promiseResolver(resolve, reject)]);
      });
    };
  }

  function instanceService(serviceName) {
    return watson[serviceName](extend(credentials[serviceName], bluemix.getServiceCredentials(serviceName)));
  }

  function denodeifyService(service) {
    var denodeified = {}
    Object.keys(service.constructor.prototype)
      .filter(function(key) {
        return key.indexOf('_') != 0;
      })
      .forEach(function(apiMethod) {
        denodeified[apiMethod] = asPromise(service[apiMethod], service);
      });
    return denodeified;
  }

  return {
    alchemy_language: denodeifyService(instanceService('alchemy_language'))
  };

})();
