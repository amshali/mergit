#!/usr/bin/env node

var argv = require('optimist')
    .default('port', 9898)
    .string('local')
    .string('remote')
    .string('merged')
    .default('diff', false)
    .demand(['local', 'remote'])
    .argv;
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var fs = require('fs');
var bodyParser = require('body-parser');
var child_process = require('child_process');
const puppeteer = require('puppeteer');
const path = require('path');

app.use(bodyParser.json({limit: '5mb'}));       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  limit: '5mb',
  extended: true
}));

app.use('/diff-match-patch', express.static(__dirname + '/node_modules/diff-match-patch'));
app.use('/codemirror', express.static(__dirname + '/node_modules/codemirror-minified'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/get-local-remote', function(req, res) {
  var data = {
    LocalContent: fs.readFileSync(argv.local, {encoding: 'utf8'}),
    RemoteContent: fs.readFileSync(argv.remote, {encoding: 'utf8'}),
		Filename: path.basename(argv.local),
		DiffOnly: argv.diff
	};
  res.json(data);
});

app.get('/close', function(req, res) {
	process.exit(0);
});

app.post('/save', function(req, res) {
	if (argv.diff) {
    res.json({
      Status: 'OK',
    });
		return;
	}
  try {
    fs.writeFileSync(argv.merged, req.body.Content);
    res.json({
      Status: 'OK',
    });
		return;
  } catch(e) {
		console.log(e);
    res.json({
      Status: 'ERROR',
      Message: e
    });
  }
});

http.listen(argv.port, '127.0.0.1');

(async () => {
  const browser = await puppeteer.launch({
		  headless: false,
		  args: ['--app=http://localhost:9898'],
			executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
		}
  );
  process.on('exit', async () => {
    await browser.close();
  });
})();
