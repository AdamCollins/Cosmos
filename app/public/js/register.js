$('#LoginBtn').click(login);

function login() {
  $('#RegProgress').css('visibility', 'visible');
  console.log('attempting login...');
  let username = $('#usernameTF').val().trim();
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
        window.location = "/";
      },
      error: function(data) {
        console.log(data)
        let status = data.status;
        switch (status) {
          case 401:
            invalidLogin();
            break;
          case 403:
            accountUnverified();
            break;
          default:
            console.log(data);

        }
      }
    });
  }
}

function invalidLogin(){
  Materialize.toast('Incorrect username or password 😭', 2000);
  $('#RegProgress').css('visibility', 'hidden');
  makeInvalid($('#usernameTF'));
  makeInvalid($('#passwordTF'));
}

function accountUnverified(){
  Materialize.toast('Please verify your account 📧', 4000);
  $('#RegProgress').css('visibility', 'hidden');
}

function inputsValid() {
  return !($('#passwordTF').hasClass('invalid')) && !($('#passwordTF').hasClass('invalid'));
}


$('#RegisterBtn').click(function(e) {
  e.preventDefault();

  $('#RegProgress').css('visibility', 'visible');
  let username = $('#usernameTF').val().trim();
  let email = $('#emailTF').val().trim();
  if(username.includes(" ")){
    makeInvalid($('#usernameTF'));
    Materialize.toast('Usernames cannot have Spaces',2000);
  }

  if (username.length < 2)
    makeInvalid($('#usernameTF'));

  if(!email.match(/[A-z0-9]+@+[A-z0-9]+.+[A-z]/g)){
    Materialize.toast('Invalid email',2000);
    $('#RegProgress').css('visibility', 'hidden');
    makeInvalid($('#emailTF'));
    return;
  }
  else{
    makeValid($('#emailTF'));
  }
  let tosChecked = $("#ToSCheckbox").is(':checked')

  let password = $('#passwordTF').val();
  let passwordConfig = $('#passwordConfTF').val();
  if (password.length >= 6) {
    if (password === passwordConfig) {
      makeValid($('#passwordTF'));
      makeValid($('#passwordConfTF'));
      //Checks user selected ToS
      if(!tosChecked){
        Materialize.toast('Please agree to terms of service 🏦', 2000);
        $('#RegProgress').css('visibility', 'hidden');
        return;
      }

      $.getJSON('/registraion/availible/' + username, (usernameData) => {
        valid = !usernameData.username_exists;
        if (valid) {
          makeValid($('#usernameTF'));
          $.ajax({
            method: 'post',
            url: '/register',
            data: {
              'username': username,
              'password': password,
              'email':email
            },
            datatype: 'json',
            success: function(data) {
              accountUnverified();
              $("#LoginBtn").removeClass('hidden').fadeIn(500);
            },
            error: function() {
              alert('oops something went wrong')
            }
          });
        } else {
          makeInvalid($('#usernameTF'));
          Materialize.toast('Username not availible', 2000);
          $('#RegProgress').css('visibility', 'hidden');
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
  $.get('/logout', () => {
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
