#!/usr/bin/env node

var argv = require('optimist')
    .default('port', 9898)
    .string('local')
    .string('remote')
    .string('merged')
    .demand(['local', 'remote', 'merged'])
    .argv;
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);

app.use('/diff-match-patch', express.static(__dirname + '/node_modules/diff-match-patch'));
app.use('/codemirror', express.static(__dirname + '/node_modules/codemirror-minified'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));

console.log('Local: ' + argv.local);
console.log('Remote: ' + argv.remote);
console.log('Merged: ' + argv.merged);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

http.listen(argv.port, '0.0.0.0');

