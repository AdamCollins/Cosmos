//Gets JSON posts
$.getJSON('api', loadPosts);

function loadPosts(postData) {
  $.each(postData, function(key, item) {
    console.log(item);
    createPost(item.text_content, item.date, item.replies,item._id);
  });
  //Fades in posts
  $('div.post.hidden').hide().removeClass('hidden').fadeIn(800);
  $('a.OpenReplyWindowBtn').click(function(e) {
    $("#ReplyArea").fadeIn(300);
  });

}



function createPost(content, dt, replies, id) {
  var post = '';
  var repliesDOM = '';
  $.each(replies,function(key,item){
    repliesDOM+=createReply(item);
    console.log(item);
  });
  post += '  <div class="post col s12 m6" post_id="'+id+'">';
  post += '    <span class="postDate">' + dt + '</span>';
  post += '    <span class="post_id hidden"></span>'; //TODO Add post_id
  post += '    <p>' + content + '</p>';
  post += '    <div class="fixed-action-btn horizontal myButtonGroup">';
  post += '        <a class="btn-floating btn-large"><i class="material-icons">label_outline</i></a>';
  post += '        <ul>';
  post += '            <li><a class="btn-floating"><i class="material-icons">star</i></a></li>';
  post += '            <li><a class="btn-floating blue darken-1 OpenReplyWindowBtn"><i class="material-icons">chat_bubble_outline</i></a></li>';
  post += '            <li><a class="btn-floating green testButton"><i class="material-icons">report_problem</i></a></li>';
  post += '        </ul>';
  post += '    </div>';
  post += repliesDOM;
  post += '</div>';
  //adds
  $('#PostsPanel').append(post);
}


function createReply(comment) {
  var reply = '';
  reply+='<span class="postDate" style="margin-left:50px;">'+comment.dateTime+'</span>';
  reply+='<p style="border-top:1px solid #52FFB8; margin-left:50px;  margin-bottom:15px;">'+comment.textContent+'</p>';
  return reply;
}

//Updates word count
$('#PostTextArea').bind('input propertychange', () => {
  let charCount = $('#PostTextArea').val().length;
  if (charCount > 0) {
    $('#CharCount').text('(' + charCount + '/500)');
    if (charCount >= 500)
      $('#CharCount').css('color', 'red');
    else
      $('#CharCount').css('color', '#539987');
  } else {
    $('#CharCount').text('');
  }
});


//Handles post submition
$("form.submitPanel").submit(function(e) {
  e.preventDefault();
  $.post('api', {
    text: $('#PostTextArea').val(),
    poster: null
  }, loadPosts);
  $('#PostTextArea').val('');
  $('#CharCount').text('');
});
