const functions = require('firebase-functions');
const express  = require('express');
const admin = require('firebase-admin');
var make = require('./lib/lib');
var final_make = require('./lib/final_html');
const sheet = require('./lib/sheet');
const sheet_sample = require('./lib/sheet_sample');
var qs = require('querystring');


var fs = require('fs');
const serviceAccount = require('./app-maker-ton-firebase-adminsdk-mwgr7-4512a2163f.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL : "https://app-maker-ton.firebaseio.com"
});
const db = admin.firestore();
const app = express();
app.use(express.static(('./')));

const bodyParser = require('body-parser');
function getQuote(){
    return new Promise(function(resolve,reject){
        var json_sample = '{"quote" : ".", "author": "010-5891-1231"}';
        resolve(json_sample);
    });
}

/*
getQuote().then(result=>{
    console.log(result);
    const obj = JSON.parse(result);
    console.log(obj.author);
    const quoteData = {
        quote: obj.quote,
        author: obj.author
    };
    return db.collection('sampleData').doc('inspirationd').collection('alpha').doc('beta')
    .set(quoteData).then(()=>{
        console.log('new quote written to database');
    });
});
*/

app.get('/',function(request, response){
    fs.readFile(`./new_app.html`,'utf8',function(err, body){
        if(err) throw err;
     //   console.log(body);
        response.set('Cache-Control','public, max-age=300, s-maxage=600');
        response.send(body);
    });
});
app.get('/init2',function(request, response){
    fs.readFile(`./sample.html`,'utf8',function(err, body){
        if(err) throw err;
        response.set('Cache-Control','public, max-age=300, s-maxage=600');
        response.send(body);
    });
});
app.get('/final',function(request, response){
    fs.readFile(`./final.html`,'utf8',function(err, body){
        if(err) throw err;
        response.set('Cache-Control','public, max-age=300, s-maxage=600');
        response.send(body);
    });
});

app.post('/sample_process',(req,res)=>{
    console.log(req.body)
    sheet_sample.insert_models(req.body);
    var token = ["eW4P53HyCxc:APA91bGy0L7eKLB6qGRhc7kJ-nG3oiec2HlOy3I_pdKqpz5cC6wxtiztaqW0K-msJHT6JnaamPxepYEjKysfeBG6SC31Q01eyEnIhK6auFR884Uz7vXP3WLYzgIb-TsxrfgLnu3weEPb",
    "fYhFu5x-AN4:APA91bF2ZAR-QcSr0_kltLrzKWyeICChZszJkm2qf5Dd2cJt40XHmLlWxJLpWc_TOtvuqqa_6cT2dqrxichSgv1iK4ZgINwYIMb_QxCIqy-V-iowBlevy3-ROrIgJ95M3O71gvOgX5au",
"ctjyy1nJ02I:APA91bHoUzPqIh7wetIFpvGlC8Ysopgd5VIGzRkIQQnYGPi0vbV7l7yvqNvgk92O3EOSe-FZ-1u7YvLu843kSe6aupJzsNa-kXD-YXnLWTUPXeg6ZraWmtstywfpLHYxm-VlWekwroPZ"];
    var payload = {
        notification: {
            title : "새로운 견적 요청이 접수되었습니다!",
            body : "새로운 견적 요청을 확인하고 희망 견적가를 전송해주세요!"
        }
    };
    var options = {
        priority : "high",
        timeToLive : 60 * 60 * 24
    };
    admin.messaging().sendToDevice(token, payload, options)
    .then(function(response) {
        console.log('Successfully sent message:', response);
    })
    .catch(function(error) {
        console.log('Error sending message:', error);
    });    
    res.redirect('/init2');
});

app.post('/customer_process',(req,res)=>{
    sheet.insert_models(req.body);
    res.redirect('/init');
});
app.post('/estimate_process',(req,res)=>{
    console.log(req.params.pageID);
    console.log(req.body);
    sheet_sample.insert_models2(req.body);
    res.redirect('/');
});
app.get('/final/:pageID', function(request, response){
    var html;
    console.log("-------------");
    var models_price = request.query.price.split(',');
    var total_price = 0;
  //  console.log("detail page : " + request.params.pageID);
    let cityRef = db.collection('sampleData').doc(request.params.pageID);
    let getDoc = cityRef.get()
    .then(doc => {
        if (!doc.exists) {
            console.log('No such document!');
        } else {
            var file_name =  Object.values(sort_by_key(doc.data().file_name));
            var file_count =  Object.values(sort_by_key(doc.data().file_count));
            console.log(models_price);
           

            var box ="";
            for(var i = 0 ; i< file_name.length ; i++){
                box += final_make.stl_box_generator(i,models_price[i],file_count[i]);
            }
            for(var i = 0 ; i < models_price.length ; i++){
                total_price+= Number(models_price[i])*file_count[i];
            }
            //console.log(file_name);
            html = final_make.generate_content(doc.id, JSON.stringify(file_name), file_count,
                final_make.form_part_generator(doc.data().name, doc.data().email, doc.data().equipment,box,total_price));
//            JSON.stringify( Object.values(sort_by_key(doc.data().file_count))));
            response.send(html);
            //console.log('Document data:', doc.data());
        }
    })
  .catch(err => {
    console.log('Error getting document', err);
  });
});
app.get('/sheet',(req,res)=>{
    sheet.find_record_sheet();
    res.redirect('/');
});

app.get('/app', function(request, response){
    console.log("come");
    var html = make.make_body_s();
    response.send(html); 
});

app.get('/unprocessed_estimate', function(request, response){
    console.log("unprocessed_estimate");
    var html = make.unprocessed_estimate_1();
    var now = new Date();
    now = Math.floor((now/1000)).toString();
    var before;
    let citiesRef = db.collection('sampleData');
    let query = citiesRef.get()
    .then(snapshot => {
        if (snapshot.empty) {
            console.log('No matching documents.');
            return;
        }
        snapshot.forEach(doc => {
            if(doc.data().checked == "false"){
                before = doc.data().node_time;
                
                console.log(now/1000);
                console.log(before);

                html = html + make.unprocessed_estimate_list(doc.id,doc.data().name,doc.data().email,make.interval_time(before,now));
            }
            // console.log(doc.id, "=>", doc.data().name, " | ", doc.data().age);
        });
        html = html + make.unprocessed_estimate_2();
        response.send(html);
    })
    .catch(err => {
        console.log('Error getting documents', err);
    });
});

app.get('/create', function(request, response){
    console.log("create");
    var html = make.make_body_s();
    let citiesRef = db.collection('sampleData');
    let query = citiesRef.get()
    .then(snapshot => {
        if (snapshot.empty) {
            console.log('No matching documents.');
            return;
        }

        snapshot.forEach(doc => {
            if(doc.data().checked == "false"){
                html = html + make._make_bodyin(doc.id,doc.data());
            }
            //console.log(doc.id, "=>", doc.data().name, " | ", doc.data().age);
        });
        html = html + make.make_body_e();
        response.send(html);
    })
    .catch(err => {
        console.log('Error getting documents', err);
    });

});

function sort_by_key(unordered){
    const ordered = {};
    Object.keys(unordered).sort().forEach(function(key) {
        ordered[key] = unordered[key];
    });
    return ordered;
}
app.get('/unprocessed_estimate_page/:pageID', function(request, response){
    var html;
  //  console.log("detail page : " + request.params.pageID);
    let cityRef = db.collection('sampleData').doc(request.params.pageID);
    let getDoc = cityRef.get()
    .then(doc => {
        if (!doc.exists) {
            console.log('No such document!');
        } else {
            var file_name =  Object.values(sort_by_key(doc.data().file_name));
            console.log(file_name);
            html = make.unprocessed_estimate_detail_1(doc.data().name, doc.data().email, doc.data().equipment);
            for(var i = 0;i< Object.values(doc.data().file_name).length;i++){
                html = html + make.unprocessed_estimate_detail_list(i, file_name[i]);
            }
            html = html + make.unprocessed_estimate_detail_2(doc.id,JSON.stringify( Object.values(sort_by_key(doc.data().file_name))),
            JSON.stringify( Object.values(sort_by_key(doc.data().file_count))));

            response.send(html);
            //console.log('Document data:', doc.data());
        }
    })
  .catch(err => {
    console.log('Error getting document', err);
  });
});
app.get('/paper/:paperID', function(request, response){
    console.log(request.params.paperID);
    let cityRef = db.collection('sampleData').doc(request.params.paperID);
    let getDoc = cityRef.get()
        .then(doc => {
        if (!doc.exists) {
        console.log('No such document!');
        } else {
            var html = make._make_detail_page(doc.data());
            console.log('Document data:', doc.data());
            response.send(html);
            //console.log('Document data:', doc.data());
        }
    })
  .catch(err => {
    console.log('Error getting document', err);
  });
});


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

exports.app = functions.https.onRequest(app);