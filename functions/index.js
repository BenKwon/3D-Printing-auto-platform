const functions = require('firebase-functions');
const caculate = require('./lib/caculate.js');
const sheet = require('./lib/sheet.js');
const express = require('express');
const googleSpreadsheet = require("google-spreadsheet");
var request1 = require("request");


const creds = require("./sheet_cred.json");
//const doc = new googleSpreadsheet("1lDzxDo5XJB2TdQlAIERa-6HiK6Fu39amN77H24SvQig");
const doc = new googleSpreadsheet("1c6LUcEotin68Y50vJkcd6n9R-hDelpkr1xfDY-X5tv4");

var fs = require('fs');
const bodyParser = require('body-parser');
const { request } = require('express');
const app = express();
app.use(express.static(('./')));

//사용자에게 받아올 변수
var models_info; //3d모델 정보 객체 배열

app.get('/',function(request, response){
    fs.readFile(`./main.html`,'utf8',function(err, body){
        if(err) throw err;
      //  console.log("★★★★★★★★★"+sheet.find_last_index());
        // response.set('Cache-Control','public, max-age=300, s-maxage=600');
        response.send(body);
       // response.send("Hello");
    });
});

app.get('/sheet_test',function(request,response){
 //   var body = sheet.get_sheet_info();
    sheet.find_last_index();
    response.send("sheet_test");
});

app.get('/script_active',function(request, response){
    
    response.redirect('/');
});

app.post('/process',function(request, response){
    // console.log(request.body);
    if(request.body.models_info == ''){
        console.log("비어있음");
    }
    // models_info = JSON.parse(request.body.models_info);
   sheet.insert_models(request.body);
    response.redirect('/');
});

exports.app = functions.https.onRequest(app);