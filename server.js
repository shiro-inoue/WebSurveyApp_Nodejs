let accessDB = require('./accessDB.js');

let http = require('http');
let fs = require('fs');
let url = require('url');

let server = http.createServer(function (req, res) {
  let json;
  let jsonStringify;
  let target = '';
  let header = '';
  let url_parse = url.parse(req.url, true);
  console.log("req.url = " + req.url);

  if (req.url == '/' || /survey\?employeeId=/.test(req.url)) {
    target = './survey.html';
    header = 'text/html';
  }
  else if (req.url == '/aggregate') {
    target = './aggregate.html';
    header = 'text/html';
  }
  else if (req.url == '/survey.js') {
    target = './survey.js';
    header = 'text/plain';
  }
  else if (req.url == '/aggregate.js') {
    target = './aggregate.js';
    header = 'text/plain';
  }
  else if (/employeeAnswerDB\?employeeId=/.test(req.url)) {
    let obj = new Object();
    obj.id = url_parse.query.employeeId;
    jsonStringify = JSON.stringify(obj);
    json = accessDB.getEmployeeAnswerDB(jsonStringify);
    console.log(json);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(json);
    res.end();
    return;
  }
  else if (req.url == '/employeeAnswerDB') {
    let data = '';
    req.on('data', function (chunk) { data += chunk })
      .on('end', function () {
        console.log("+++++ data +++++\n" + data);
        accessDB.setEmployeeAnswerDB(data);
      })

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end();
    return;
  }
  else if (req.url == '/answeredRatedataDB') {
    json = accessDB.getAnsweredRatedataDB();
    console.log(json);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(json);
    res.end();
    return;
  }
  else if (/answerDB\?questionId=/.test(req.url)) {
    let obj = new Object();
    obj.questionId = Number(url_parse.query.questionId);
    jsonStringify = JSON.stringify(obj);
    json = accessDB.getAnswerDB(jsonStringify);
    console.log(json);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(json);
    res.end();
    return;
  }
  else {
    console.log("default");
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('bad request');
    return;
  }

  fs.readFile(target, 'utf-8', function (err, data) {
    res.writeHead(200, { 'Content-Type': header });
    res.write(data);
    res.end();
  })
});

server.listen(5501);
console.log('サーバーを起動しました。');