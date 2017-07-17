//Gets JSON posts
$.getJSON('/api', loadPosts);


function loadPosts(postData) {
  $.each(postData, function(key, post) {
    createPost(post);
  });
  //Fades in posts
  openReply();
  upVote();
}

function openReply(){
  $('div.post.hidden').hide().removeClass('hidden').fadeIn(800);
  $('a.OpenReplyWindowBtn').on('click', ()=> {
    $('#ReplyArea').fadeIn(300);
    var post_id = $(this).parents().eq(3).attr("post_id");
    $('#ReplyPanel').attr('replypostid',post_id);
  });
}

function getLevel(score)
{
  if(score>10){
    return 2;
  }
  return 1;
}

function getScore(username){
   var value= $.ajax({
      url: '/users/score/'+username,
      async: false
   }).responseText;
   return value;
}
function upVote(){
  $('a.starBtn').on('click', function(e) {
    var postId = $(this).parents().eq(3).attr('post_id');
    console.log(postId)
    $.ajax({
      method: 'post',
      url: '/api/like',
      data: {'post_id' : postId},
      datatype: 'json',
      success: ()=>{
        console.log('yes')
      },
      error: (e)=> {
        console.log(e.responseText);
        openLoginMenu();
      }

    })
  });
}

function createPost(post, prepend){
  var postDOM = '';
  var repliesDOM = '';
  var score;
  if(post.username){
    //sync call
    //console.log('poster\'s score:'+getScore(post.username));
    //async call
    // $.getJSON('/users/score/'+post.username,(data)=>{
    //    score = data.score;
    //  });
   }

  //var scoreLevel = getLevel(post)
  $.each(post.replies,function(key,item){
    repliesDOM+=createReply(item);
  });


  postDOM += '  <div class="post col s12 m6 hidden" post_id="'+post._id+'">';
  postDOM += '    <span class="postDate">' + post.time+'</span>';
  postDOM += '    <span class="user">'+((post.username)?'<img src="images/'+getLevel(0)+'.png" width="32px"/>'+post.username:' <i class="fa fa-rocket fa-2x" aria-hidden="true"></i>')+'</span>'
  postDOM += '    <p>' + post.text_content.replace('\n','</br>') + '</p>';
  postDOM += '    <div class="fixed-action-btn horizontal myButtonGroup">';
  postDOM += '        <a class="btn-floating btn-large"><i class="material-icons">label_outline</i></a>';
  postDOM += '        <ul>';
  postDOM += '            <li><a class="btn-floating starBtn"><i class="material-icons">star</i></a></li>';
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


function createReply(reply) {
  var replyDOM = '';
  replyDOM+='<span class="postDate" style="margin-left:50px;">'+reply.time+'</span>';
  replyDOM += '<span class="user">'+((reply.username)?'<img src="images/'+getLevel(0)+'.png" width="32px" style="margin-left:7px; margin-right:3px"/>'+reply.username:' <i class="fa fa-rocket fa-2x" aria-hidden="true"></i>')+'</span>';
  replyDOM+='<p style="border-top:1px solid #52FFB8; margin-left:50px;  margin-bottom:15px;">'+reply.text_content+'</p>';
  return replyDOM;
}

function addReply(replyDOM, postId){

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
  var params = {'text_content': text}
  $('#PostTextArea').val('');
  $('#CharCount').text('')
  $.ajax({
    method: 'post',
    url: '/api',
    data: params,
    datatype: 'json',
    success: function(data){
      createPost(data, true);
      $('div.post.hidden').hide().removeClass('hidden').fadeIn(800);
      upVote();
      openReply();
    },
    error: function(){
      alert('oops something went wrong')
    }
  });
});
