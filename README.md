# Sentiment and Emotion Tracker using Natural Language Understanding

Sentiment and Emotion application detect sentiment and emotions from people's digital footprints (e.g., online reviews and social media text) with [IBM Waston](watson) Technology. The application can reveal the overall emotion and sentiment patterns from a text of interest, including the changes and details of positive or negative sentiment and emotions of "anger", "disgust", "sadness", "fear" and "joy".

 ![Sentiment & Emotion Tracker](http://i.imgur.com/kEg5hBi.png)

Give it a try! Click the button below to fork into IBM DevOps Services and deploy your own copy of this application on Bluemix.

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/watson-developer-cloud/sentiment-and-emotion)

## Getting Started

1. Create a Bluemix Account

[Sign up][sign_up] in Bluemix, or use an existing account. Watson Services in Beta are free to use.

2. Download and install the [Cloud-foundry CLI][cloud_foundry] tool

3. Edit the `manifest.yml` file and change the `<application-name>` to something unique.  

```none
applications:
- services:
- alchemy-service
name: <application-name>
command: node app.js
path: .
memory: 256M
```
The name you use will determinate your application url initially, e.g. `<application-name>.mybluemix.net`.

4. Connect to Bluemix in the command line tool
```sh
$ cf api https://api.ng.bluemix.net
$ cf login -u <your user ID>
```

5. Create the `natural-language-understanding` service in Bluemix

```sh
$ cf create-service natural-language-understanding free nlu-test
```

6. Push it live!

```sh
$ cf push
```

See the full [Getting Started][getting_started] documentation for more details, including code snippets and references.

## Running locally
The application uses [Node.js](http://nodejs.org/) and [npm](https://www.npmjs.com/) so you will have to download and install them as part of the steps below.

1. Copy the credentials from your `alchemy-service` service in Bluemix to `credentials.js`, you can see the credentials using:

```sh
$ cf env <application-name>
```
Example output:
```sh
System-Provided:
{
 "VCAP_SERVICES": {
  "natural-language-understanding": [
   {
    "credentials": {
     "password": "<password>",
     "url": "https://gateway.watsonplatform.net/natural-language-understanding/api",
     "username": "<username>"
    },
    "label": "natural-language-understanding",
    "name": "nlu-test",
    "plan": "free",
    "provider": null,
    "syslog_drain_url": null,
    "tags": [
     "watson",
     "ibm_created"
    ]
   }
  ]
 }
}
```

You need to copy `username` and `password`.
Create a `.env` file in the root directory.
You will update the `.env` with the information you retrieved in the previous step.

The `.env` file will look something like the following:

```none
NATURAL_LANGUAGE_UNDERSTANDING_USERNAME=<username>
NATURAL_LANGUAGE_UNDERSTANDING_PASSWORD=<password>

2. Install [Node.js](http://nodejs.org/)
3. Go to the project folder in a terminal and run:
`npm install`
4. Start the application
5.  `node app.js`
6. Go to `http://localhost:3000`

## Troubleshooting

To troubleshoot your Bluemix app the main useful source of information are the logs, to see them, run:

```sh
$ cf logs <application-name> --recent
```

## License

This sample code is licensed under Apache 2.0. Full license text is available in [LICENSE](LICENSE).  
This sample code uses d3 and jQuery, both distributed under MIT license.

## Open Source @ IBM
Find more open source projects on the [IBM Github Page](http://ibm.github.io/)

[service_url]: http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/alchemy-language.html
[watson]:https://www.ibm.com/watson/developercloud
[cloud_foundry]: https://github.com/cloudfoundry/cli
[sentiment_service]:http://www.alchemyapi.com/api/sentiment-analysis
[emotion_service]:http://www.alchemyapi.com/api/emotion-analysis
[getting_started]: https://www.ibm.com/watson/developercloud/doc/common/
[sign_up]: https://console.ng.bluemix.net/registration/
