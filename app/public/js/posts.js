//Gets JSON posts
$.getJSON('api', loadPosts);

function loadPosts(postData){
  var posts = postData.posts;
  $.each(posts,function(key, item){
    createPost(item.textContent,item.dateTime);
  });
  //Fades in posts
  $('div.post.hidden').hide().removeClass('hidden').fadeIn(800);

}

$("#submitButton").click(function(e){
  e.preventDefault();
  createPost('Lorem ipsum blah some text yes yes', new Date());
});

function createPost(content, dt){
  var post = "";
  post+= "  <div class='post col s12 m6'>";
  post+= "    <span class='postDate'>" + dt + "</span>";
  post+= "    <span class='post_id hidden'></span>";//TODO Add post_id
  post+= "    <p>" + content + "</p>";
  post+= "    <div class='fixed-action-btn horizontal myButtonGroup'>";
  post+= "        <a class='btn-floating btn-large'><i class='material-icons'>label_outline</i></a>";
  post+= "        <ul>";
  post+= "            <li><a class='btn-floating'><i class='material-icons'>star</i></a></li>";
  post+= "            <li><a class='btn-floating blue darken-1 OpenReplyWindowBtn'><i class='material-icons'>chat_bubble_outline</i></a></li>";
  post+= "            <li><a class='btn-floating green testButton'><i class='material-icons'>report_problem</i></a></li>";
  post+= "        </ul>";
  post+= "    </div>";
  //TODO Add Comment Gen here
  post+= "</div>";
  //adds
  $("#PostsPanel").append(post);
}
