exports.sendNotification = function(device, message) {
  var config = require('../data/config');
  var request = require('request');
  var restKey = config.oneSignalAppID;
  var appID = '9f7861b3-e1cc-4fab-85db-8dcbf09fbaab';
  request({
      method: 'POST',
      uri: 'https://onesignal.com/api/v1/notifications',
      headers: {
        "authorization": "Basic " + restKey,
        "content-type": "application/json"
      },
      json: true,
      body: {
        'app_id': appID,
        'contents': {
          en: message
        },
        'include_player_ids': Array.isArray(device) ? device : [device]
      }
    },
    function(error, response, body) {
      if (!body.errors) {
        console.log(body);
      } else {
        console.error('Error:', body.errors);
      }

    }
  );
}
