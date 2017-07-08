//onLoad
$('div.post').hide().removeClass("hidden");
$("#ReplyArea").hide().removeClass("hidden");
$(".loginmenu.dropdown").hide().removeClass("hidden");
$("#RegisterMenu").hide().removeClass("hidden");

document.onLoad = $(".loading").fadeOut(800);
document.onLoad = $('div.post').fadeIn(1200);

$('.exit-btn').click(function() {
  $("#ReplyArea").fadeOut(300);
  $("#RegisterMenu").fadeOut(300);
});

$("div.loginmenu").click(function() {
  $(".loginmenu.dropdown").toggle(100);
});
$("#loginMenuBtn").click(function(e) {
  $("#RegisterMenu").fadeIn(300);
});
