const googleSpreadsheet = require("google-spreadsheet");
const creds = require("../sheet_cred.json");
var request =require('request');
const { testLab } = require("firebase-functions");
const doc = new googleSpreadsheet("1jfPVhVnBEh5s0vnrbOCIj5B3hlIVZzToEYXtec3KQDE");
//const doc = new googleSpreadsheet("1c6LUcEotin68Y50vJkcd6n9R-hDelpkr1xfDY-X5tv4");
           // console.log(cells);

function find_sheet_index(callback_func,post_body){
    doc.useServiceAccountAuth(creds, function(err){
            doc.getInfo(function(err, info) {
                console.log(info.worksheets[0].title); 
                console.log(post_body);             
                for(var i = 0; info.worksheets.length ; i++){
                    if(info.worksheets[i].title === "temp"){
                        /* 모델링 도색 empty 여부 플래그(전역변수) 설정 */
                        
                        /* 시트에 보낼 변수 채우고 시트에 저장 하는 함수 실행*/
                        callback_func(i);
                        
                        break;
                    }
                }
            });
    });
}
function generate_file_name_string(models_info){
    var file_names =[];
    var length = models_info.length
    for(var i = 0 ; i<length ; i++){
        file_names.push(models_info[i].filename);
    }
    return file_names;
}
find_record_sheet = function(){
    doc.useServiceAccountAuth(creds, function(err){
           doc.getInfo(function(err, info) {
               console.log("구글 시트의 제목  : " + info.title);
               console.log("구글 시트의 URL  : " + info.id);
             //  return info;
           });
        });
}
exports.insert_models = function(body){
    var file_names =generate_file_name_string(JSON.parse(body.models_info));
    console.log(body);
    console.log(`${file_names} 입니다`);

    // console.log(info);
    // console.log(file_names);
    // console.log(file_weights);
    doc.useServiceAccountAuth(creds, function(err){
        doc.getCells(5,
            {
                "min-row" : 1	    // Cell의 최소 가로 범위
                , "min-col" : 1	    // Cell의 최소 세로 범위
                , "max-row" : 3	    // Cell의 최대 세로 범위(필수)
                , "max-col" : 2      // Cell의 최대 가로 범위(필수)
                , "return-empty" : true
            },async function(err,cells){
              //  console.log(cells);
                // cells[3]._value = info;
                // cells[3].save();
                setTimeout(function() {
                    var geturl ={ 
                        url:"https://script.google.com/macros/s/AKfycbxOhpgZvFoEoRxqJ803lX_WwHPvBsvdTr1PilTcjvwmkVRYQNc/exec",
                        qs:{
                            way:"init",
                            name:`${body.name}`,
                            email:`${body.email}`,
                            equip:`${body.printer}`,
                            pin:`${body.id}`,
                            file_name:JSON.stringify(file_names),
                            file_count:body.model_ea
                        }
                    };
                   request(geturl, function(err, res, body) {if(err) console.log(err); });
                   console.log("--------------------get url fininsh-----------------------");
                  }, 1000);
              
            });
    });
}

exports.insert_models2 = function(body){
    // var file_names =generate_file_name_string(JSON.parse(body.models_info));
    console.log(body);
    // console.log(`${file_names} 입니다`);

    // console.log(info);
    // console.log(file_names);
    // console.log(file_weights);
    doc.useServiceAccountAuth(creds, function(err){
        doc.getCells(5,
            {
                "min-row" : 1	    // Cell의 최소 가로 범위
                , "min-col" : 1	    // Cell의 최소 세로 범위
                , "max-row" : 3	    // Cell의 최대 세로 범위(필수)
                , "max-col" : 2      // Cell의 최대 가로 범위(필수)
                , "return-empty" : true
            },async function(err,cells){
              //  console.log(cells);
                // cells[3]._value = info;
                // cells[3].save();
                setTimeout(function() {
                    var geturl ={ 
                        url:"https://script.google.com/macros/s/AKfycbxOhpgZvFoEoRxqJ803lX_WwHPvBsvdTr1PilTcjvwmkVRYQNc/exec",
                        qs:{
                            partner:`${body.partner}`,
                            term:`${body.term}`,
                            file_price: body.file_price,
                            link:`${body.link}`,
                            way:"send",
                            file_name: body.file_name,
                            file_count: body.file_count,
                            pin: body.pin
                        }
                    };
                   request(geturl, function(err, res, body) {if(err) console.log(err); });
                   console.log("--------------------get url fininsh-----------------------");
                  }, 1000);
              
            });
    });
}