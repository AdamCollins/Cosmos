$("form.submitPanel").on('submit', function(e) {

  e.preventDefault();
  var text = $('#PostTextArea').val().trim();
    if(!text)
      return
  $('#PostTextArea').val('');
  $('#CharCount').text('');
  console.log(1);
  OneSignal.push(function() {
    console.log(1.5);
    OneSignal.getUserId(function(userId) {
      console.log(1.6);
      console.log("OneSignal User ID:", userId);
      var params = {
        'text_content': text,
        'OneSignalUserId':userId
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
          alert('oops something went wrong')
        }
      });
    });
  });
  console.log(4);
});
