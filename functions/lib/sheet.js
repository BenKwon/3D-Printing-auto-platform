const googleSpreadsheet = require("google-spreadsheet");
const creds = require("../sheet_cred.json");
var request =require('request');
const { testLab } = require("firebase-functions");
const doc = new googleSpreadsheet("1Kgw1VfOJA4AC6OUB8HO8btgFO3qeEPtARnMPOVJycSM");
//const doc = new googleSpreadsheet("1c6LUcEotin68Y50vJkcd6n9R-hDelpkr1xfDY-X5tv4");
           // console.log(cells);



/*인덱스 정보*/
var insert_flag = 0;
var sheet_index = 0;
var modeling_empty = 0;
var color_empty = 0;
var empty_check = 0;
var last_index;
function get_pure_name(filename){
    var pure = filename.split('.');
    return pure[0];
}
function get_weight(weight){
    var set_weight = weight * 1.01 * 0.001;
    var quotient = parseInt(set_weight / 5);
    set_weight =  quotient * 5 + 5;
    return set_weight;
}

function check_empty_data(post){
    console.log("color : " + color_empty + " model : " + modeling_empty);
    if(post.modeling_detail ==''&&post.modeling_manager =='' &&post.modeling_duration ==''
    &&post.modeling_price ==''){
        console.log("-----------1");
        console.log(post);
        modeling_empty = 1;
    }
    if(post.color_details ==''&&post.color_nums =='' &&post.color_price ==''){
        console.log("-----------2");
        console.log(post);
        color_empty = 1;
    }
    empty_check = 1;
   
}
function save_last_index(index){
    last_index = index;
}
exports.find_last_index = function(){
    var index = -1;
    var i = 0;
  // return index;
  while(index<0){
    if(i==0){
        i++;
        doc.useServiceAccountAuth(creds, function(err){ 
            doc.getCells(
                1	// 시작할 시트의 인덱스(인덱스는 1부터 시작함)
              , {
                    "min-row" : 1	// Cell의 최소 가로 범위
                  , "min-col" : 1	// Cell의 최소 세로 범위
                  , "max-row" : 1600	// Cell의 최대 가로 범위(필수)
                  , "max-col" : 1     // Cell의 최대 세로 범위(필수)
                  , "return-empty" : true
              }
              , function(err, cells) {
                  var last;
                  if(err) console.log(err);
                //  console.log(cells);
                 for(var num = 0; 1600 > num; num++) {
                       if(cells[num].value == ""){
                           last = num-1;
                           break;
                       }
                 }
                 console.log("-------------------");
                 console.log(last);
                 index = last;
                 return last;
              }
                );
        });
    }
    
      ;
  }
  return index;
}
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
exports.find_record_sheet = function(){
    doc.useServiceAccountAuth(creds, function(err){
        /*   doc.getInfo(function(err, info) {
               console.log("구글 시트의 제목  : " + info.title);
               console.log("구글 시트의 URL  : " + info.id);
             //  return info;
           });*/
           doc.getCells(
               1	// 시작할 시트의 인덱스(인덱스는 1부터 시작함)
             , {
                   "min-row" : 1	// Cell의 최소 가로 범위
                 , "min-col" : 3	// Cell의 최소 세로 범위
                 , "max-row" : 8	// Cell의 최대 가로 범위(필수)
                 , "max-col" : 2     // Cell의 최대 세로 범위(필수)
                 , "return-empty" : true
             }
             , function(err, cells) {
                 return cells;
                 for(var num = 0; cells.length > num; num++) {
                     console.log( cells[num].value );
                 }
             }
         );
   });
}
exports.insert_models = function(post_body){
    console.log(post_body);
    var models_filename = ""; // 파일명 1 / 파일명 2 / 파일명 3
    var models_weight = ""; // 2 . 무게1 / 무게 2 / ...
    var models_num = ""; // 3. 수량1 / 수량 2 / ...
    var detail_info = ""; //4.   모델개수/엑셀번호/제작시간/분류선택/소요일자
    var modeling_info = "";  // 5.    모델링내역/모델링담당자/모델링소요일자/모델링단가
    var color_info = ""; // 6.   도색내역/도색수량/도색단가 
    var delivery_info = ""; // 7.   배송수량/배송가격   
      
    var no_model_flag = 1
    if(post_body.models_info != ''){
        model_objects = JSON.parse(post_body.models_info);
        no_model_flag = 0;
    }
    doc.useServiceAccountAuth(creds, function(err){
        /* 비동기 문제로 해결 방법을 위해 콜백함수 방법으로 */
        find_sheet_index(function(return_index){
            sheet_index = return_index + 1;
            console.log("return : " + sheet_index);
            doc.getCells(sheet_index,
                {
                    "min-row" : 1	    // Cell의 최소 가로 범위
                    , "min-col" : 1	    // Cell의 최소 세로 범위
                    , "max-row" : 10	    // Cell의 최대 세로 범위(필수)
                    , "max-col" : 2      // Cell의 최대 가로 범위(필수)
                    , "return-empty" : true
                },async function(err,cells){
                   // console.log(cells);
                    //모델정보 배열 제작
                   
                    //1, // 2 // 3 완성 시키기 
                    if(!no_model_flag){//모델이 있으면
                        for(var i = 0 ; i < model_objects.length ; i++){
                            if(i == model_objects.length -1){
                                models_filename += model_objects[i].filename.split('.')[0];
                                models_weight += get_weight(model_objects[i].volume);
                                models_num += post_body[`model${i}`];
                            }
                            else{
                                models_filename += model_objects[i].filename.split('.')[0] + "♪";
                                models_weight += get_weight(model_objects[i].volume) +"♪";
                                models_num += post_body[`model${i}`] + "♪";
            
                            }
                        }
                        //모델개수 4번 맨앞에 추가
                        detail_info += `${model_objects.length}♪`;
                    }
                    else{
                        models_filename = "null";
                        models_weight = "null";
                        models_num = "null";
                        detail_info += "0♪"
                    }
                    // 4.   모델개수/엑셀번호/제작시간/분류선택/소요일자 
                    detail_info += post_body.excel_no +  "♪";
                    detail_info += post_body.print_duration +  "♪";
                    detail_info += post_body.distribute +  "♪";
                    detail_info += post_body.distribute_duration;

                    // 5.    모델링내역/모델링담당자/모델링소요일자/모델링단가
                                modeling_info += post_body.modeling_detail + "♪";
                                modeling_info += post_body.modeling_manager + "♪";
                                modeling_info += post_body.modeling_duration + "♪" ;
                                modeling_info += post_body.modeling_price;
                        
                   
                    //6. 도색내역 / 도색수량 / 도색 단가
                
                                color_info += post_body.color_details + "♪";
                                color_info += post_body.color_nums + "♪";
                                color_info += post_body.color_price;
                        
                    //7. 배송수량 / 배송단가
                    delivery_info += post_body.delivery_nums + "♪";
                    delivery_info += post_body.delivery_price;
                    
                    //시트에 전송
                    cells[3]._value = models_filename;
                    cells[5]._value = models_weight;
                    cells[7]._value = models_num;
                    cells[9]._value = detail_info;
                    cells[11]._value = modeling_info;
                    cells[13]._value = color_info;
                    cells[15]._value = delivery_info;
                    //시트에 저장
                    cells[3].save();
                    cells[5].save();
                    cells[7].save();
                    cells[9].save();
                    cells[11].save();
                    cells[13].save();
                    cells[15].save();
                    //1.8초후 구글 스크립트 실행
                    setTimeout(function() {
                        var geturl = 'https://script.google.com/macros/s/AKfycbypeq1tlY8k5Tly1yrbC2BLv8eF8ISeqcBp4FyyXgHFJixeHwA/exec'
                       request(geturl, function(err, res, body) {if(err) console.log(err); });
                       console.log("--------------------get url fininsh-----------------------");
                       console.log("--------------------get url fininsh-----------------------");
                       console.log("--------------------get url fininsh-----------------------");
                       
                      }, 1500);
                  
                    
                    console.log("시트 입력 완료!");
                });
        },post_body);
        
    
    });
    
}