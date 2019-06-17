///*global window */
//var scripts = document.getElementsByTagName('script');
//var myScript = scripts[scripts.length - 1]
var myScript = document.getElementById('target');

var scriptSrc = myScript.src;
console.log(scriptSrc);

var queryString = myScript.src.replace(/^[^\?]+\??/,'');

var url = queryString.substring(4);     // cut off 'url='
console.log(url);

function timedWindow() {
    var w = window.open(url, '_blank', ''); 
    setTimeout(function(){ w.close(); }, 8000);
}


//<!DOCTYPE html>
//<html>
//    <head>
//        <title>Spotify app</title>
//        <script src="myscript.js?{url}https://google.com" id="target"></script>
//    </head>
//    <body onload="timedWindow()">
//        <h1>Index</h1>
//        <p>Congratulations! The HTTP Server is working!</p>
//    </body>
//</html>