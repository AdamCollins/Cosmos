$('#SubmitReply').on('click',()=>{
  var replypostid = $('#ReplyPanel').attr('replypostid');
  var replyContent = $('#Replytextarea').val();
  var params = {"replypostid":replypostid,"text_content":replyContent}
  $.ajax({
      method: 'post',
      url: '/api/reply',
      data: params,
      datatype: 'json',
      success:
        console.log('reply success'),
      error:
        console.log('reply failed')
  });
})
