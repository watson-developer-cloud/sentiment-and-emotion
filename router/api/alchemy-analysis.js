/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var express       = require('express'),
  alchemyLanguage = require('../../config/services').alchemy_language,
  logger          = require('winston'),
  Promise         = require('bluebird');

var router = express.Router(),
  isObject = function (x) { return x.constructor === Object; };

function isApiError(error) {
  return error && error.code;
}

function getReportedError(error) {
  var reportedError = { code: 500, error: 'Error processing the request' };
  if (isApiError(error)) {
    reportedError.code = error.code;
    reportedError.error = error.error;
  }
  return reportedError;
}

function apiError(res) {
  return function (error) {
    if (!isApiError(error)) logger.error(error);

    var reportedError = getReportedError(error);
    res.status(reportedError.code)
      .json(reportedError);
  };
}

function processAnalysisData(sentimentData, emotionData) {
  return { sentimentAnalysis: sentimentData.docSentiment, emotionAnalysis: emotionData.docEmotions }
}

function respondWithData(res) {
  return function (sentimentData, emotionData) {
    res.json(processAnalysisData(sentimentData, emotionData));
  };
}

router.post('/', function(req, res, next) {
  var payload = { text: req.body.text };
  alchemyLanguage.sentiment(payload)
    .then(function(sentimentData) {
      alchemyLanguage.emotion(payload)
        .then(function(emotionData) {
          respondWithData(res)(sentimentData, emotionData);
        })
        .catch(apiError(res));
    })
    .catch(apiError(res));
});

module.exports = router;
