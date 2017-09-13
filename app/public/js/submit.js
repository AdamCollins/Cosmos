$("form.submitPanel").on('submit', function(e) {

  e.preventDefault();
  var text = $('#PostTextArea').val().trim();
  if (!text)
    return
  $('#PostTextArea').val('');
  $('#CharCount').text('');

  var firefox = navigator.userAgent.indexOf('Firefox') > -1;
  var chrome = navigator.userAgent.indexOf('Chrome') > -1;
  if (firefox | chrome) {
    OneSignal.push(function() {
      OneSignal.getUserId(function(userId) {
        console.log("OneSignal User ID:", userId);
        var params = {
          'text_content': text,
          'OneSignalUserId': userId
        }
        console.log(2);
        $.ajax({
          method: 'post',
          url: '/api',
          data: params,
          datatype: 'json',
          success: function(post) {
            console.log(3);
            createPost(post, true);
            $('div.post.hidden').hide().removeClass('hidden').fadeIn(800);
            openReply();
          },
          error: function(err) {
            console.log(err.responseText);
            if (err.status == 429) {
              Materialize.toast('You are posting too much. Try agin in a few minutes', 5000);
            } else {
              alert('oops something went wrong')
            }
          }
        });
      });
    });
  } else {
    var params = {
      'text_content': text,
      'OneSignalUserId': null
    }
    $.ajax({
      method: 'post',
      url: '/api',
      data: params,
      datatype: 'json',
      success: function(post) {
        console.log(3);
        createPost(post, true);
        $('div.post.hidden').hide().removeClass('hidden').fadeIn(800);
        openReply();
      },
      error: function(err) {
        alert('oops something went wrong')
      }
    });
  }

  console.log(4);
});
