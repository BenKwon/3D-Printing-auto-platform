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
    var string ="";
    var length = models_info.length
    for(var i = 0 ; i<length ; i++){
        if(i < length-1 ){
            string += models_info[i].filename + '♪';
        }
        else{
            string += models_info[i].filename;
        }
    }
    return string;
}
function generate_file_weight_string(models_weight){
    var string ="";
    var length = models_weight.length
    for(var i = 0 ; i<length ; i++){
        if(i < length-1 ){
            string += models_weight[i] + '♪';
        }
        else{
            string += models_weight[i];
        }
    }
    return string;
}
function generate_file_ea_string(models_ea){
    var string ="";
    var length = models_ea.length
    for(var i = 0 ; i<length ; i++){
        if(i < length-1 ){
            string += models_ea[i] + '♪';
        }
        else{
            string += models_ea[i];
        }
    }
    return string;
}
exports.find_record_sheet = function(){
    doc.useServiceAccountAuth(creds, function(err){
           doc.getInfo(function(err, info) {
               console.log("구글 시트의 제목  : " + info.title);
               console.log("구글 시트의 URL  : " + info.id);
             //  return info;
           });
        });
}
exports.insert_models = function(body){
    console.log(body);
    var models_info = JSON.parse(body.models_info);
    var models_price = JSON.parse(body.models_price);
    var models_weight = JSON.parse(body.models_weight);
    var models_ea = JSON.parse(body.model_ea);
    var info = `${body.company}♪${body.name}♪${body.phone}♪${body.email}♪${body.item}♪${body.detail}♪${body.printer}♪${models_info.length}♪${body.total_time}♪${0}♪택배♪${body.address}`;
    var file_names = generate_file_name_string(models_info);
    var file_weights = generate_file_weight_string(models_weight);
    var file_nums = generate_file_ea_string(models_ea);
    // console.log(info);
    // console.log(file_names);
    // console.log(file_weights);
    console.log(file_nums);
    doc.useServiceAccountAuth(creds, function(err){
        doc.getCells(4,
            {
                "min-row" : 1	    // Cell의 최소 가로 범위
                , "min-col" : 1	    // Cell의 최소 세로 범위
                , "max-row" : 10	    // Cell의 최대 세로 범위(필수)
                , "max-col" : 2      // Cell의 최대 가로 범위(필수)
                , "return-empty" : true
            },async function(err,cells){
              //  console.log(cells);
                cells[3]._value = info;
                cells[5]._value = file_names;
                cells[7]._value = file_weights;
                cells[9]._value = file_nums;
                cells[3].save();
                cells[5].save();
                cells[7].save();
                cells[9].save();
                setTimeout(function() {
                    var geturl ={ 
                        url:"https://script.google.com/macros/s/AKfycbxOhpgZvFoEoRxqJ803lX_WwHPvBsvdTr1PilTcjvwmkVRYQNc/exec",
                        qs:{
                            way:"new",
                        }
                    };
                   request(geturl, function(err, res, body) {if(err) console.log(err); });
                   console.log("--------------------get url fininsh-----------------------");
                  }, 1000);
              
            });
    });
}