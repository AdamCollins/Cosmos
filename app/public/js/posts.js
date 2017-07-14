//Gets JSON posts
$.ajax.getJSON('/api', loadPosts);

function loadPosts(postData) {
  $.ajax.each(postData, function(key, post) {
    createPost(post);
    console.log(post)

  });
  //Fades in posts
  $('div.post.hidden').hide().removeClass('hidden').fadeIn(800);
  $('a.OpenReplyWindowBtn').click(function(e) {
    $("#ReplyArea").fadeIn(300);
  });

}

function createPost(post) {
  createPost(post, false)
}

function createPost(post, prepend){
  console.log(post);
  var postDOM = '';
  var repliesDOM = '';
  $.each(post.replies,function(key,item){
    repliesDOM+=createReply(item);
    console.log(item);
  });


  postDOM += '  <div class="post col s12 m6" post_id="'+post._id+'">';
  postDOM += '    <span class="postDate">' + post.time+((post.username)?'<i class="fa fa-rocket fa-2x" aria-hidden="true"></i>'+post.username
:'')+'</span>';
  postDOM += '    <span class="post_id hidden">'+post._id+'</span>'; //TODO Add post_id
  postDOM += '    <p>' + post.text_content + '</p>';
  postDOM += '    <div class="fixed-action-btn horizontal myButtonGroup">';
  postDOM += '        <a class="btn-floating btn-large"><i class="material-icons">label_outline</i></a>';
  postDOM += '        <ul>';
  postDOM += '            <li><a class="btn-floating"><i class="material-icons">star</i></a></li>';
  postDOM += '            <li><a class="btn-floating blue darken-1 OpenReplyWindowBtn"><i class="material-icons">chat_bubble_outline</i></a></li>';
  postDOM += '            <li><a class="btn-floating green testButton"><i class="material-icons">report_problem</i></a></li>';
  postDOM += '        </ul>';
  postDOM += '    </div>';
  postDOM += repliesDOM;
  postDOM += '</div>';
  //adds
  if(prepend){
    $('#PostsPanel').prepend(postDOM);
  }else{
    $('#PostsPanel').append(postDOM);
  }
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
      $('#CharCount').css('color', '#f34858');
    else
      $('#CharCount').css('color', '#539987');
  } else {
    $('#CharCount').text('');
  }
});



$("form.submitPanel").on('submit', function(e){
  e.preventDefault();
  var text = $('#PostTextArea').val();
  var params = {"text_content": text}
  $('#PostTextArea').val('');
  $('#CharCount').text('')
  $.ajax({
    method: 'post',
    url: '/api',
    data: params,
    datatype: 'json',
    success: function(data){
      console.log('here')
      console.log(data)
      createPost(data, true);
    },
    error: function(){
      alert('oops something went wrong')
    }
  });
});
