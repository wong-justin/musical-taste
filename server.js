const express = require("express");
const app = express();
const requests = require('request');

app.use(express.static("public"));

const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});

app.get("/music2.html", function(request, response) {
  // response.sendFile(__dirname + '/views/redirect.html');
  var html = '<!DOCTYPE html>' +
             '<html lang="en">' +
             '  <head>' +
             '    <script id=\'state\' src=/music2/redirect.js?state=' + state + '></script>' +
             '  </head>' +
             '  <body>' +
             '  </body>' +
             '<html>';
  response.send(html);
  console.log('Recieved initial request (homepage)')
});

app.get("/music2/redirect.js", function(request, response) {
  response.sendFile(__dirname + "/music2/redirect.js");
});

app.get("/music2/script.js", function(request, response) {
  response.sendFile(__dirname + "/music2/script.js");
});

app.get("/music2/style.css", function(request, response) {
  response.sendFile(__dirname + "/music2/style.css");
});

// recieve initial response from spotify login
app.get('/musical/callback', function(request, response) {
  var code = request.param('code');
  var stateFromURL = request.param('state');
  var error = request.param('error')
  response.sendFile(__dirname + '/music2/music2.html');
  // res.send('<p>'+code+' '+state+' '+error+'</p>');
  console.log('mystate', state, 'vs: urlstate', stateFromURL);
  firstAccessToken(code);
});

app.get('/music2/access', function(request, response) {
  console.log(access_token);
  response.send(access_token);
});