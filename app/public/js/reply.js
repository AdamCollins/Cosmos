$('#SubmitReply').on('click',()=>{
  var replypostid = $('#ReplyPanel').attr('replypostid');
  var replyContent = $('#Replytextarea').val();
  console.log('postid:');
  console.log($('#ReplyPanel'))
  var params = {"replypostid":replypostid,"text_content":replyContent}
  $.ajax({
      method: 'post',
      url: '/api/reply',
      data: params,
      datatype: 'json',
      success:(data)=>{
        if(data.status==200)
          window.location = "";
      }
  });
})
