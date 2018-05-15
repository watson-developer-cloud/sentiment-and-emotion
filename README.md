# Sentiment and Emotion Tracker using Natural Language Understanding

Sentiment and Emotion application detect sentiment and emotions from people's digital footprints (e.g., online reviews and social media text) with [IBM Waston](watson) Technology. The application can reveal the overall emotion and sentiment patterns from a text of interest, including the changes and details of positive or negative sentiment and emotions of "anger", "disgust", "sadness", "fear" and "joy".

 ![Sentiment & Emotion Tracker](http://i.imgur.com/kEg5hBi.png)

Give it a try! Click the button below to fork into IBM DevOps Services and deploy your own copy of this application on Bluemix.

## Getting started

1. You need a Bluemix account. If you don't have one, [sign up][sign_up].

2. Download and install the [Cloud-foundry CLI][cloud_foundry] tool if you haven't already.

3. Edit the `manifest.yml` file and change `<application-name>` to something unique. The name you use determines the URL of your application. For example, `<application-name>.mybluemix.net`.

  ```yaml
  applications:
  - services:
    - my-nlu-service
    name: <application-name>
    command: npm start
    path: .
    memory: 512M
  ```

4. Connect to Bluemix with the command line tool.

  ```sh
  cf api https://api.ng.bluemix.net
  cf login
  ```

5. Create and retrieve service keys to access the [Natural Language Understanding][service_url] service:

  ```none
  cf create-service natural-language-understanding free my-nlu-service
  cf create-service-key my-nlu-service myKey
  cf service-key my-nlu-service myKey
  ```

6. Create a `.env` file in the root directory by copying the sample `.env.example` file using the following command:

  ```none
  cp .env.example .env
  ```
  You will update the `.env` with the information you retrieved in steps 5.

  The `.env` file will look something like the following:

  ```none
  NATURAL_LANGUAGE_UNDERSTANDING_USERNAME=<username>
  NATURAL_LANGUAGE_UNDERSTANDING_PASSWORD=<password>
  ```

7. Install the dependencies you application need:

  ```none
  npm install
  ```

8. Start the application locally:

  ```none
  npm start
  ```

9. Point your browser to [http://localhost:3000](http://localhost:3000).

10. **Optional:** Push the application to Bluemix:

  ```none
  cf push
  ```

After completing the steps above, you are ready to test your application. Start a browser and enter the URL of your application.

            <your application name>.mybluemix.net


For more details about developing applications that use Watson Developer Cloud services in Bluemix, see [Getting started with Watson Developer Cloud and Bluemix][getting_started].


## Troubleshooting

* The main source of troubleshooting and recovery information is the Bluemix log. To view the log, run the following command:

  ```sh
  cf logs <application-name> --recent
  ```

* For more details about the service, see the [documentation][docs] for the Speech to Text service.

## License

This sample code is licensed under Apache 2.0. Full license text is available in [LICENSE](LICENSE).
This sample code uses d3 and jQuery, both distributed under MIT license.

## Open Source @ IBM
Find more open source projects on the [IBM Github Page](http://ibm.github.io/)

[service_url]: https://www.ibm.com/watson/services/natural-language-understanding/
[watson]: https://www.ibm.com/watson/developer/
[cloud_foundry]: https://github.com/cloudfoundry/cli
[getting_started]: https://console.bluemix.net/docs/services/watson/index.html
[sign_up]: https://console.ng.bluemix.net/registration?target=%2Fcatalog%2F%3Fcategory%3Dwatson
