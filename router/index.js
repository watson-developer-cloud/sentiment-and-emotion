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

'use strict';
module.exports = function (app) {
  const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
  const nlu = new NaturalLanguageUnderstandingV1({
    'username': process.env.NATURAL_LANGUAGE_UNDERSTANDING_USERNAME,
    'password': process.env.NATURAL_LANGUAGE_UNDERSTANDING_PASSWORD,
    'version_date': '2017-02-27'
  });

  app.use('/', require('./routes/intro'));

  app.use('/about', require('./routes/about'));

  app.use('/tos', require('./routes/tos'));

  app.use('/api/alchemy-analysis', require('./api/alchemy-analysis'));


  app.post('/api/analyze', function(req, res, next) {

    var parameters = {
      text : req.body.text,
      features: {
        sentiment: {},
        emotion: {}
      }
    };
    if (process.env.SHOW_DUMMY_DATA) {
      res.json(require('./payload.json'));
    } else {
      nlu.analyze(parameters, (err, results) => {
        if (err) {
          return next(err);
        } else {
          //console.log(JSON.stringify({ parameters, results }, null, 2));
          res.json({ query: parameters.text, sentimentAnalysis: results.sentiment.document, emotionAnalysis: results.emotion.document.emotion });
        }
      });
    }
  });

};
