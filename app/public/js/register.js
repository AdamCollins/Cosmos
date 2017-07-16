$('#LoginBtn').click(login);

function login() {
  $('#RegProgress').css('visibility','visible');
  console.log('attempting login...');
  let username = $('#usernameTF').val();
  let password = $('#passwordTF').val();

  if (username.length > 0 && password.length > 0) {
    $.ajax({
      method: 'post',
      url: '/login',
      data: {
        'username': username,
        'password': password
      },
      datatype: 'json',
      success: function(data) {
        if (data.status == 200) {
          window.location = "";
        } else if(data.status == 401){
          Materialize.toast('Incorrect username or password 😭', 2000);
          $('#RegProgress').css('visibility','hidden');
          makeInvalid($('#usernameTF'));
          makeInvalid($('#passwordTF'));
        }
      }
    });
  }
}

function inputsValid() {
  return !($('#passwordTF').hasClass('invalid')) && !($('#passwordTF').hasClass('invalid'));
}

$('#RegisterBtn').click(function(e) {
  e.preventDefault();
  $('#RegProgress').css('visibility','visible');
  let username = $('#usernameTF').val();
  if (username.length < 0)
    makeInvalid($('#usernameTF'));
  let password = $('#passwordTF').val();
  let passwordConfig = $('#passwordConfTF').val();
  if (password.length >= 6) {
    if (password === passwordConfig) {
      makeValid($('#passwordTF'));
      makeValid($('#passwordConfTF'));
      $.getJSON('/registraion/availible/' + username, (usernameData) => {
        valid = !usernameData.username_exists;
        if (valid) {
          makeValid($('#usernameTF'));
          $.ajax({
            method: 'post',
            url: '/register',
            data: {
              'username': username,
              'password': password
            },
            datatype: 'json',
            success: function(data) {
              login();
            },
            error: function() {
              alert('oops something went wrong')
            }
          });
        } else {
          makeInvalid($('#usernameTF'));
          Materialize.toast('Username not availible', 2000);
        }
      });
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

$('#LogoutBtn').click((e) => {
  e.preventDefault();
  $.get('/logout',()=>{
    window.location = "";
  })
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

$('#passwordTF').blur(() => {
  isUsernameAvailable($('#usernameTF').val())
});

function isUsernameAvailable(username) {

}
