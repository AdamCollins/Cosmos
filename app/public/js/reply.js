$('#SubmitReply').on('click',()=>{
  var replypostid = $('#ReplyPanel').attr('replypostid');
  var replyContent = $('#Replytextarea').val();
  var params = {"replypostid":replypostid,"text_content":replyContent}
  $.ajax({
      method: 'post',
      url: '/api/reply',
      data: params,
      datatype: 'json',
      success:(data)=>{
        if(data.status==200){
          console.log(data)
          addReply(createReply(data.reply),replypostid)
          $("#ReplyArea").fadeOut(300);
        }
      }
  });
})
