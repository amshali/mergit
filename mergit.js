#!/usr/bin/env node

var argv = require('optimist')
    .default('port', 9898)
    .string('local')
    .string('remote')
    .string('merged')
    .default('diff', false)
    .demand(['local', 'remote'])
    .argv;
var os = require('os');
var express = require('express');
var app = express();
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

var localdata, remotedata;

try {
  localdata = fs.readFileSync(argv.local, {encoding: 'utf8'});
  remotedata = fs.readFileSync(argv.remote, {encoding: 'utf8'});
} catch(e) {
  console.log(e);
  process.exit(1);
}

app.get('/get-local-remote', function(req, res) {
  var data = {
    LocalContent: localdata,
    RemoteContent: remotedata,
    Filename: path.basename(argv.local),
    DiffOnly: argv.diff
  };
  res.json(data);
});

app.get('/close', function(req, res) {
  res.end();
  process.exit(0);
});

app.get('/heartbeat', function(req, res) {
  res.end();
  heartbeatRcv = Date.now();
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

function getChromePath() {
  if (os.type() == 'Linux') {
    return "/usr/bin/google-chrome";
  } else if (os.type() == 'Darwin') {
    return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  }
}

let server = app.listen(0, () => {
  (async () => {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--app=http://localhost:' + server.address().port],
        executablePath: getChromePath()
      }
    );
    process.on('exit', async () => {
      await browser.close();
    });
  })();
});

var heartbeatRcv = Date.now();
setInterval(() => {
  if(Date.now() - heartbeatRcv > 1100) {
    console.log("View process exited. I might as well.");
    process.exit(1);
  }
}, 1800);
