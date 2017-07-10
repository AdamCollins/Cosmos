$('#RegisterBtn').click(function(e) {
  e.preventDefault();
  let username = $('#usernameTF').val();
  if(username.length<0)
    makeInvalid($('#usernameTF'));
  let password = $('#passwordTF').val();
  let passwordConfig = $('#passwordConfTF').val();
  if (password.length >= 6) {
    if (password === passwordConfig) {
      $.post('register',()=>{
        'password':password,
        'username':username
      });
      makeValid($('#passwordTF'));
      makeValid($('#passwordConfTF'));
      makeNeutral($('#usernameTF'));
      //  register  //TODO recheck during post
    } else {
      Materialize.toast('Passwords do not match', 2000);
      $("#passwordTF").removeClass('valid').addClass('invalid');
      $("#passwordConfTF").removeClass('valid').addClass('invalid');
    }
  } else {
    Materialize.toast('Password must be atleast 6 characters', 2000);
    $("#passwordTF").addClass('invalid');
  }
});

$('#LoginBtn').click((e)=>{
  e.preventDefault();
  //TODO login
});

function makeValid(item) {
  $(item).removeClass('invalid').addClass('valid');
}

function makeInvalid(item) {
  $(item).removeClass('valid').addClass('invalid');
}

function makeNeutral(item) {
  $(item).removeClass('invalid').removeClass('valid');
}
