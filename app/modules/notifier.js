module.exports.sendNotification = function(message, userId) {
  var config = require('../data/config');
  var request = require('request');
  var restKey = config.oneSignalRestAPIKey+'';
  var appID = config.oneSignalAppID;
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
        'include_player_ids': [userId]
      }
    },
    function(error, response, body) {
      if (!body.errors) {
      } else {
        console.error('Error:', body.errors);
      }

    }
  );
}
