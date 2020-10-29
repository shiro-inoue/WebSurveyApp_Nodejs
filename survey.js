let QUESTIONTYPE = {
    radio: 1,
    check: 2,
    text: 3
}

let employeeNumber = "";
let employeeName = "";
let answersToDisp = [];

let answerDB;


window.onload = function () {
    let urlParam = location.search.substring(1).split('=');
    if (urlParam.length >= 2) {
        if (urlParam[0] == "employeeId") {
            employeeNumber = urlParam[1];
        } else {
            employeeNumber = "";
        }
    } else {
        employeeNumber = "";
    }

    getDbAnswers();
}


function getDbAnswers() {
    // let obj = new Object();
    // let json;
    // obj.id = employeeNumber;
    // let jsonStringify = JSON.stringify(obj);
    // json = await getEmployeeAnswerDB(jsonStringify);

    {
        var req = new XMLHttpRequest();		  // XMLHttpRequest オブジェクトを生成する
        req.onreadystatechange = function () {		  // XMLHttpRequest オブジェクトの状態が変化した際に呼び出されるイベントハンドラ
            // console.log("readyState = " + req.readyState + ", status = " + req.status);
            if (req.readyState == 4 && req.status == 200) { // サーバーからのレスポンスが完了し、かつ、通信が正常に終了した場合
                // console.log("<+><+><+><+><+><+><+><+>\n" + req.responseText);		          // 取得した JSON ファイルの中身を表示

                answerDB = JSON.parse(req.responseText);
                // console.log(answerDB)

                employeeName = answerDB.name;
                if (employeeName == "") {
                    document.getElementById("employeeName").innerHTML = "エラー";
                    return;
                }
                makeAnswersToDisp(answerDB);
                document.getElementById("employeeName").innerHTML = "";
                dispEmployeeName();
                dispEmployeeAnswer();
            }
        };
        req.open("GET", "http://localhost:5501/employeeAnswerDB?employeeId=" + employeeNumber, false);
        req.send(null);
    }

    // answerDB = JSON.parse(req.responseText);
    // console.log(answerDB)

    // employeeName = answerDB.name;
    // if (employeeName == "") {
    //     return false;
    // }

    // return true;
}


function makeAnswersToDisp(answerDB){
    let q;
    let ansId;
    let idAndAns;
    for (i = 0; i < answerDB.question.length; i++) {
        q = answerDB.question[i];
        if (q.questiontype == QUESTIONTYPE.radio) {
            for (j = 0; j < q.sub.length; j++) {
                ansId = "ans" + (i + 1) + "_" + (j + 1);
                idAndAns = { "id": ansId, "type": q.questiontype, "value": q.sub[j].select };
                answersToDisp.push(idAndAns);
            }
        }
        else if (q.questiontype == QUESTIONTYPE.check) {
            for (j = 0; j < q.sub.length; j++) {
                ansId = "ans" + (i + 1) + "_" + (j + 1);
                idAndAns = { "id": ansId, "type": q.questiontype, "value": q.sub[j].select };
                answersToDisp.push(idAndAns);
            }
        }
        else if (q.questiontype == QUESTIONTYPE.text) {
            ansId = "ans" + (i + 1) + "_1";
            idAndAns = { "id": ansId, "type": q.questiontype, "value": q.sub[0].text };
            answersToDisp.push(idAndAns);
        }
    }
}


function dispEmployeeName() {
    document.getElementById("employeeName").innerHTML = employeeName + "さん";
    return;
}


function checkButton(radio, value) {
    if (value == 1) {
        radio.checked = true;
    } else {
        radio.checked = false;
    }
}


function dispEmployeeAnswer() {

    for (i = 0; i < answersToDisp.length; i++) {
        let idElement = document.getElementById(answersToDisp[i].id);
        if (idElement == null) {
            console.log("ID不一致");
            //全クリアする？
            continue;
        }

        if (answersToDisp[i].type == QUESTIONTYPE.radio) {
            checkButton(idElement, answersToDisp[i].value);
        }
        else if (answersToDisp[i].type == QUESTIONTYPE.check) {
            checkButton(idElement, answersToDisp[i].value);
        }
        else if (answersToDisp[i].type == QUESTIONTYPE.text) {
            idElement.value = answersToDisp[i].value;
        }
    }

    setSendButtonState();

    return;
}


function IsAllRadioChecked() {
    let a1 = document.getElementById("qId").ans1;
    let a2 = document.getElementById("qId").ans2;
    let a3 = document.getElementById("qId").ans3;

    if ((a1.value != 0) && (a2.value != 0) && (a3.value != 0)) {
        return true;
    }

    return false;
}


function setSendButtonState() {
    if (IsAllRadioChecked()) {
        document.getElementById("sendSurvey").disabled = false;
    } else {
        document.getElementById("sendSurvey").disabled = true;
    }
}


function setEmployeeAnswer() {
    answerDB.question[0].sub[0].select = Number(document.getElementById("ans1_1").checked);
    answerDB.question[0].sub[1].select = Number(document.getElementById("ans1_2").checked);

    answerDB.question[1].sub[0].select = Number(document.getElementById("ans2_1").checked);
    answerDB.question[1].sub[1].select = Number(document.getElementById("ans2_2").checked);

    answerDB.question[2].sub[0].select = Number(document.getElementById("ans3_1").checked);
    answerDB.question[2].sub[1].select = Number(document.getElementById("ans3_2").checked);
    answerDB.question[2].sub[2].select = Number(document.getElementById("ans3_3").checked);

    answerDB.question[3].sub[0].select = Number(document.getElementById("ans4_1").checked);
    answerDB.question[3].sub[1].select = Number(document.getElementById("ans4_2").checked);
    answerDB.question[3].sub[2].select = Number(document.getElementById("ans4_3").checked);
    answerDB.question[3].sub[3].select = Number(document.getElementById("ans4_4").checked);

    answerDB.question[4].sub[0].text = document.getElementById("ans5_1").value;


    let jsonStringify = JSON.stringify(answerDB);
    // console.log("<<<<< jsonStringify >>>>>\n" + jsonStringify)
    // setEmployeeAnswerDB(jsonStringify);

    {
        let req = new XMLHttpRequest();
        req.open("POST", "http://localhost:5501/employeeAnswerDB");
        req.setRequestHeader("Content-Type", "application/json");
        req.onload = () => {
            console.log(req.status);
            console.log("success!");
        };
        req.onerror = () => {
            console.log(req.status);
            console.log("error!");
        };
        req.send(jsonStringify);
    }

    return;
}


function sendSurvery() {

    setEmployeeAnswer();

    alert("送信しました");
    // console.log("送信しました");

    return;
}