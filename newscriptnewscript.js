// new script for github pages
var http = require('http');
var url = require('url');

var spotifyUrl = 'https://accounts.spotify.com/authorize?client_id=dac1d6700ec64fd1bf76ca21162db57e&response_type=code&redirect_uri=http://localhost:8888&state=lol&scope=&show_dialog=true';

function createServer() {
    http.createServer(function (req, res) {
        res.write('Hello world!');
        res.end();
    }).listen(8888);    
}

function makeServerThen() {
    createServer().then(openLocalhostTab());
}

function openLocalhostTab() {
    window.open('http://localhost:8888', '_blank', '');
}