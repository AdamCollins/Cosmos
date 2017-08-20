//Changes users badge
$('img.badgeGallery').click((event) => {
  badge = event.target.attributes.badge.value;
  console.log(badge);
  $.ajax({
    method: 'post',
    url: '/users/change-badge',
    data: {
      'badge': badge,
    },
    datatype: 'json',
    success: (textStatus) => {
      window.location = ""
    },
    error: (err) => {
      console.error('failed:'+ err.status);
    }
  });
});
