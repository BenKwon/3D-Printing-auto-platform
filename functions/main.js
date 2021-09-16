
var fs = require('fs');
var express = require('express');
const bodyParser = require('body-parser');
const { request } = require('express');
const port = 3001;


var app = express();

app.use(express.static(('./')));
app.get('/',function(request, response){
    fs.readFile(`./ssindex.html`,'utf8',function(err, body){
        if(err) throw err;
        console.log(body);
        response.send(body);
    });
});

app.post('/process', function(request, response){
    var body = '';
    request.on('data', function(data){ // 데이터를 끊어주는 방식
        body = body + data; // 데이터 축적
    });
    request.on('end', function(){ // 다음에 들어올게 없을때 실행한다. 이것을 
        var post = qs.parse(body);
        var id = post.id; // 이제는 이값도 받아야한다.
        fs.readFile(`./data/${id}`,'utf8',function(err, init){
            detail = init;
            // var html = make.update(id,detail);
            var html = `
            <p> submit success!</p>
            `;
            response.writeHead(200);
            response.end(html);
    
        });
    });
});

app.listen(3002,function(){
    console.log("info : server on");
});