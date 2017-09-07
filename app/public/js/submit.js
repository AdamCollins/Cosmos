$("form.submitPanel").on('submit', function(e) {
  e.preventDefault();
  var text = $('#PostTextArea').val().trim();
    if(!text)
      return
  $('#PostTextArea').val('');
  $('#CharCount').text('');
  OneSignal.push(function() {
    OneSignal.getUserId(function(userId) {
      console.log("OneSignal User ID:", userId);
      var params = {
        'text_content': text,
        'OneSignalUserId':userId
      }
      $.ajax({
        method: 'post',
        url: '/api',
        data: params,
        datatype: 'json',
        success: function(post) {
          createPost(post, true);
          $('div.post.hidden').hide().removeClass('hidden').fadeIn(800);
          openReply();
        },
        error: function() {
          alert('oops something went wrong')
        }
      });
    });
  });
});
