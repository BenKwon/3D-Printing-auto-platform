const express = require('express');


var fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
app.use(express.static(('./')));
app.get('/3d',function(request, response){
    fs.readFile(`./index.html`,'utf8',function(err, body){
        if(err) throw err;
        console.log(body);
        response.send(body);
    });
});

app.get('/test', (request, response) => {
    var html = `
    <h1> Title </h1>
    <p> hello </p>
    `;
    response.send(html);
});

app.get('/timestamp', (request, response) => {
    response.send(`${Date.now()}`);
});

app.get('/timestamp-cached', (request, response) => {
    response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    response.send(`${Date.now()}`);
});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.app = functions.https.onRequest(app);
app.listen(3002,function(){
    console.log("info : server on");
});








// app.post('/process', function(request, response){
//     var body = '';
//     request.on('data', function(data){ // 데이터를 끊어주는 방식
//         body = body + data; // 데이터 축적
//     });
//     request.on('end', function(){ // 다음에 들어올게 없을때 실행한다. 이것을 
//         var post = qs.parse(body);
//         var id = post.id; // 이제는 이값도 받아야한다.
//         fs.readFile(`./data/${id}`,'utf8',function(err, init){
//             detail = init;
//             // var html = make.update(id,detail);
//             var html = `
//             <p> submit success!</p>
//             `;
//             response.writeHead(200);
//             response.end(html);
    
//         });
//     });
// });



// {
//   "hosting": {
//     "public": "public",
//     "ignore": [
//       "firebase.json",
//       "**/.*",
//       "**/node_modules/**"
//     ]
//   },
//   "functions": {
//     "predeploy": [
//       "npm --prefix \"$RESOURCE_DIR\" run lint"
//     ]
//   }
// }
