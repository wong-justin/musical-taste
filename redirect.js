var state = getState();

function getState() {
  var stateHoldingElement = document.getElementById('state');
  var src = stateHoldingElement.src;
  var queryString = src.replace(/^[^\?]+\??/,'');

  var state = queryString.substring(6);     // cut off 'state='
  console.log(state);
  return state;
}

var params = {
  client_id: 'dac1d6700ec64fd1bf76ca21162db57e',
  response_type: 'code',
  redirect_uri: 'https://wong-justin.glitch.me/musical/callback',
  state: state,
  scope: 'playlist-read-private,user-read-recently-played,user-follow-read,user-library-read,user-top-read',
  show_dialog: 'true'  
}
var endpoint = 'https://accounts.spotify.com/en/authorize';

var url = endpoint + '?' + stringify(params);

function stringify(paramsDict) {
  var str = [];
  for(var param in paramsDict) {
    str.push(param + '=' + paramsDict[param]);
  }
  return str.join('&');
}

window.open(url, '_self', '', false);