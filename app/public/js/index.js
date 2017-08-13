//onLoad
$('#RegProgress').css('visibility','hidden');
$('div.post').hide().removeClass("hidden");
$("#ReplyArea").hide().removeClass("hidden");
$(".loginmenu.dropdown").hide().removeClass("hidden");
$("#RegisterMenu").hide().removeClass("hidden");
$('#BadgesMenu').hide().removeClass('hidden')
$('.carousel').carousel();


// $(document).ready(function() {
//     $(".loading").fadeOut(800);
// });
document.onLoad = $('div.post').fadeIn(1200);

$('.exit-btn').click(function() {
  $("#ReplyArea").fadeOut(300);
  $("#RegisterMenu").fadeOut(300);
  $('#BadgesMenu').fadeOut(300);
});

$("div.loginmenu").click(function() {
  $(".loginmenu.dropdown").slideToggle(100)
});
function openLoginMenu(){
  $("#RegisterMenu").fadeIn(300);
}

$('.badge-tile').hover(
  function() {
    $( this ).addClass('badge-hover')
  }, function() {
    $( this ).removeClass('badge-hover')
  }
);

$("#loginMenuBtn, #registerMenuBtn").click(openLoginMenu);
$('#BadgesBtn').click(openBageMenu);

function openBageMenu(){
  $('#BadgesMenu').fadeIn(300)
}
