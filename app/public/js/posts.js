//Gets JSON posts
$.getJSON('/api', loadPosts);


function loadPosts(postData) {
  $.each(postData, function(key, post) {
    createPost(post);
  });
  //Fades in posts
  openReply();
  upVote();
  $(".loading").fadeOut(800);
}

function openReply() {
  $('div.post.hidden').hide().removeClass('hidden').fadeIn(800);
  $('a.OpenReplyWindowBtn').click((e) => {
    $('#ReplyArea').fadeIn(300);
    var post_id = $(e.target).parents().eq(2).attr("post_id");
    $('#ReplyPanel').attr('replypostid', post_id);
  });
}

function getLevel(score) {
  if (score > 10) {
    return 2;
  }
  return "badge-icons/orions-belt";
}

function getScore(username) {
  $.ajax({
    method: 'get',
    url: '/users/score/'+username,
    success(userScore){
      return userScore;
    },
    error(){
      console.log('oops, something went wrong')
    }
  })
}



function upVote() {
  $('body').on('click', '.myButtonGroup .starBtn', function() {
    var postId = $(this).parents().eq(1).attr('post_id');

    if ($(this).children('i').is('.unColoredStar')) {
      $(this).find(".unColoredStar").css('color', '#52FFB8').removeClass("unColoredStar").addClass('coloredStar');
      var starStatus = 1
      var addOrSubtract = 1
    } else {
      $(this).children('i').is('.coloredStar')
      $(this).find(".coloredStar").css('color', 'white').removeClass("coloredStar").addClass('unColoredStar');
      var starStatus = 0
      var addOrSubtract = 0
    }

    $.ajax({
      method: 'post',
      url: '/api/like',
      data: {
        'post_id': postId,
        'starStatus': starStatus
      },
      datatype: 'json',
      success: (textStatus) => {
        updateHours(addOrSubtract, $(this))
      },
      error: (xhr, textStatus) => {
        //if (xhr.status == 401) {
        $(this).find("i.coloredStar").css('color', 'white')
        $(this).parents().eq(1).find('.stars').text("");
        openLoginMenu();
        //}
      }
    });
  });
}

function updateHours(addOrSubtract, clickButton){
  if(addOrSubtract == 0){
    var addedTimeString = clickButton.parents().eq(1).find('.stars').text();
    var addedTimeInt = addedTimeString.replace(/\D/g,'');
    var timeAdded = (parseInt(addedTimeInt) === 0) ? 0 :parseInt(addedTimeInt) - 1;
    var addedTimeText = (timeAdded === 0 )? '' :'ADDED '+ timeAdded + ' HOUR' + ((timeAdded != 1)? 'S': '');
    clickButton.parents().eq(1).find('.stars').text(addedTimeText);

  }else{
    var addedTimeString = clickButton.parents().eq(1).find('.stars').text();
    var addedTimeInt = addedTimeString.replace(/\D/g,'');
    var timeAdded = isNaN(parseInt(addedTimeInt))? 1 :parseInt(addedTimeInt) + 1;
    clickButton.parents().eq(1).find('.stars').text('ADDED '+ timeAdded + ' HOUR' + ((timeAdded != 1)? 'S': '')).hide().fadeIn(300);
  }
}


function createPost(post, prepend) {
  var postDOM = '';
  var repliesDOM = '';
  var userScore = post.score;
  if (post.username) {
    //sync call
    //async call
    // $.getJSON('/users/score/'+post.username,(data)=>{
    //    score = data.score;
    //  });
  }

  //var scoreLevel = getLevel(post)
  $.each(post.replies, function(key, item) {
    repliesDOM += createReply(item);
  });
  //<a class="btn tooltipped" data-position="bottom" data-delay="50" data-tooltip="I am a tooltip ">Hover me!</a>
  var usernameDOM = '<img src="'+((post.userBadge!=null)?post.userBadge.icon:'')+'" width="32px"/><span class="username tooltipped" data-position="top" data-delay="50" data-tooltip="'+post.score+' ">' + post.username + '</span>';
  var anonUserDOM = ' <i class="fa fa-rocket fa-2x" aria-hidden="true"></i><span class="username"><i>Unknown Cosmonaut</i></span>';

  var colorStar = (post.currentUserStarPost == 1) ? "coloredStar" : "unColoredStar";
  postDOM += '  <div class="post col s12 m6 hidden z-depth-2" post_id="' + post._id + '">';
  postDOM += '    <span class="post postDate">' + post.time + '</span>';
  postDOM += '    <div class="user post">' + ((post.username) ? usernameDOM : anonUserDOM) + '</div>'
  postDOM += '    <p>' + post.text_content.replace('\n', '</br>') + '</p>';
  postDOM += '    <div class="fixed-action-btn horizontal myButtonGroup">';
  if (post.likes > 0)
    postDOM += '    <span class="stars">ADDED ' + post.likes + ' HOUR' + ((post.likes != 1) ? 'S' : '') + '</span>';
  else
    postDOM += '    <span class="stars"></span>';
  postDOM += '        <a class="btn-floating btn-large waves-effect green waves-light hoverable"><i class="material-icons">report_problem</i></a>';
  postDOM += '        <a class="btn-floating btn-large waves-effect blue darken-1 hoverable OpenReplyWindowBtn waves-light"><i class="material-icons">chat_bubble_outline</i></a>';
  postDOM += '        <a class="btn-floating btn-large waves-effect starBtn waves-light hoverable"><i class="material-icons ' + colorStar + '">star</i></a>';
  postDOM += '    </div>';
  postDOM += ' <div class="reply-container">';
  postDOM += repliesDOM;
  postDOM += '  </div>';
  postDOM += '</div>';

  //adds
  if (prepend) {
    $('#PostsPanel').prepend(postDOM);
  } else {
    $('#PostsPanel').append(postDOM);
  }

  $('.coloredStar').css('color', '#52FFB8');

  $(document).ready(function(){
    $('.tooltipped').tooltip({delay: 50});
  });
}


function createReply(reply) {
  var replyDOM = '';
  var time = reply.time;
  if(!time ||time<0 ){
    time = 'now'
  }
  replyDOM += '<span class="user reply">' + ((reply.username) ? '<img src="images/' + getLevel(0) + '.svg" width="32px" style="margin-left:-5px; margin-right:3px"/>' + reply.username : ' <i class="fa fa-rocket fa-2x" aria-hidden="true"></i><span class="username"><i>Unknown Cosmonaut</i></span>') + '</span>';
  replyDOM += '<span class="reply postDate" style="margin-left:50px;">' + time + '</span>';
  replyDOM += '<p style="border-top:1px solid #52FFB8; margin-left:50px;  margin-bottom:15px;">' + reply.text_content + '</p>';
  return replyDOM;
}



function addReply(replyDOM, postId) {
  $('[post_id="' + postId + '"]').append(replyDOM);
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
