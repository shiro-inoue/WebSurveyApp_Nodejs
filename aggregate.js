let total = 0;
let response = 0;
let flag = true;

let QUESTIONTYPE = {
    radio: 1,
    check: 2,
    text: 3
}

window.onload = function () {
    dispResponseRate();
    dispDayTime();
    dispAnswer();
};

// async function dispResponseRate() {
function dispResponseRate() {
    // console.log("dispResponseRate");
    let json;
    let jsonParse;

    {
        var req = new XMLHttpRequest();		  // XMLHttpRequest オブジェクトを生成する
        req.onreadystatechange = function () {		  // XMLHttpRequest オブジェクトの状態が変化した際に呼び出されるイベントハンドラ
            if (req.readyState == 4 && req.status == 200) { // サーバーからのレスポンスが完了し、かつ、通信が正常に終了した場合
                jsonParse = JSON.parse(req.responseText);
                // console.log("jsonParse.total = " + jsonParse.total);
                // console.log("jsonParse.response = " + jsonParse.response);

                let responseRate = 0;
                total = jsonParse.total;
                response = jsonParse.response;
                if (isComputableNumber(response)) {
                    responseRate = calcResponseRate(response);
                }
                // console.log("responseRate = " + responseRate);
                document.getElementById('responseRate').innerHTML = formattingHTMLResponseRate(responseRate.toFixed(1));
            }
        };
        req.open("GET", "http://localhost:5501/answeredRatedataDB", false); // HTTPメソッドとアクセスするサーバーの　URL　を指定
        req.send(null);					    // 実際にサーバーへリクエストを送信
    }
}

function dispDayTime() {
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    let date = now.getDate();
    let hour = now.getHours();
    let min = now.getMinutes();

    month = editDataFormat(month);
    date = editDataFormat(date);
    hour = editDataFormat(hour);
    min = editDataFormat(min);

    let dayTime = year + "/" + month + "/" + date + " " + hour + ":" + min;
    document.getElementById('dateTime').innerHTML = formattingHTMLDayTime(dayTime);
}

// async function dispAnswer() {
function dispAnswer() {
    let obj = new Object();
    let json;
    let jsonParse;
    obj.questionId = 1;

    let html = "";
    let title = "";

    while (flag) {
        // console.log("obj.questionId = " + obj.questionId);
        jsonStringify = JSON.stringify(obj);
        // json = await getAnswerDB(jsonStringify);
        {
            var req = new XMLHttpRequest();		  // XMLHttpRequest オブジェクトを生成する
            req.onreadystatechange = function () {		  // XMLHttpRequest オブジェクトの状態が変化した際に呼び出されるイベントハンドラ
                if (req.readyState == 4 && req.status == 200) { // サーバーからのレスポンスが完了し、かつ、通信が正常に終了した場合
                    jsonParse = JSON.parse(req.responseText);

                    if (jsonParse.title.length != 0) {
                        // console.log("jsonParse.title = " + jsonParse.title);
                        html += "<div>";
                        title = "Q" + obj.questionId + ". " + jsonParse.title;
                        html += "<h4>" + title + "</h4>";
                        html = genAnswerPart(html, jsonParse);
                        html += "</div><br>";

                        ++obj.questionId;
                    }
                    else {
                        // console.log("***** jsonParse.title.length == 0 *****");
                        flag = false;
                    }
                }
            };
            req.open("GET", "http://localhost:5501/answerDB?questionId=" + obj.questionId, false); // HTTPメソッドとアクセスするサーバーの　URL　を指定
            req.send(null);					    // 実際にサーバーへリクエストを送信
        }
    }
    document.getElementById('answer').innerHTML = html;
}

function genAnswerPart(html, jsonParse) {
    let answer = "";
    let unitPercentage = "％";
    let unitNumber = "件";

    // console.log("jsonParse.sub.length = " + jsonParse.sub.length);
    jsonParse.sub.forEach((sub, i) => {
        answer = "";
        // console.log("jsonParse.questiontype = " + jsonParse.questiontype);
        switch (parseInt(jsonParse.questiontype)) {
            case QUESTIONTYPE.radio:
                if (sub.title != undefined && sub.select != undefined) {
                    // console.log("jsonParse.sub[" + i + "].title  = " + sub.title);
                    // console.log("jsonParse.sub[" + i + "].select = " + sub.select);
                    answer = formattingHTMLTitle(sub.title);
                    if (isComputableNumber(response) && isComputableNumber(sub.select)) {
                        responseRate = calcResponseRate(sub.select);
                    }
                    else {
                        responseRate = 0;
                    }
                    // console.log("responseRate = " + responseRate);
                    answer += formattingHTMLSelect(responseRate.toFixed(1) + unitPercentage);
                }
                break;
            case QUESTIONTYPE.check:
                if (sub.title != undefined && sub.select != undefined) {
                    // console.log("jsonParse.sub[" + i + "].title  = " + sub.title);
                    // console.log("jsonParse.sub[" + i + "].select = " + sub.select);
                    answer = formattingHTMLTitle(sub.title);
                    answer += formattingHTMLSelect(sub.select + unitNumber);
                }
                break;
            case QUESTIONTYPE.text:
                if (sub.text != undefined) {
                    if (sub.text.length != 0) {
                        // console.log("jsonParse.sub[" + i + "].text   = " + sub.text);
                        answer = formattingHTMLText(sub.text);
                    }
                }
                break;
            default:
                console.log("default");
        }
        if (answer.length != 0) {
            html += "<p>" + answer + "</p>";
        }
    });
    return html;
}

function formattingHTMLResponseRate(responseRate) {
    return "<span style=\"display: inline-block; font-size:16pt;\">回答率：" + responseRate + "％</span>";
}

function formattingHTMLDayTime(dayTime) {
    return "<span style=\"display: inline-block; width: 500px; font-size:10pt; text-align:right;\">" + dayTime + "現在</span>";
}

function formattingHTMLTitle(title) {
    return "<span style=\"display: inline-block; text-indent:1em; width: 300px;\">" + title + "</span>";
}

function formattingHTMLSelect(select) {
    return "<span style=\"display: inline-block; width: 100px;\">" + select + "</span>";
}

function formattingHTMLText(text) {
    return "<span style=\"display: inline-block; text-indent:1em;\">" + text + "</span>";
}

function isComputableNumber(resp) {
    if (total != 0) {
        if (!(total < 0 || resp < 0)) {
            if (!(total < resp)) {
                return true;
            }
        }
    }
    return false;
}

function calcResponseRate(resp) {
    let responseRate = 0;
    responseRate = resp / total * 100;
    responseRate = Math.floor(responseRate * 10) / 10;
    return responseRate;
}

function editDataFormat(data) {
    // console.log("In  data = " + data);
    // 文字列で扱えたらlengthが使える？
    if (data < "10") {
        data = "0" + data;
    }
    // console.log("Out data = " + data);
    return data;
}
