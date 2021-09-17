var fs = require('fs');
var make = {
    interval_time : function(before, now){
        before = parseInt(before,10);
        now = parseInt(now,10);
        var interval = now - before;
        var result;

        if(interval < 60){
            result = interval.toString() + "초 전";
        }
        else if(interval < 3600){
            interval = parseInt(interval/60,10);
            result = (interval).toString() + "분 전";
        }
        else if(interval < 86400){
            interval = parseInt(interval/3600,10);
            result = (interval).toString() + "시간 전";
        }
        else{
            interval = parseInt(interval/86400,10);
            result = (interval).toString() + "일 전";
        }


        return result;
    },
    unprocessed_estimate_detail_1 : function(name, email, equip){
        var result = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0,
            maximum-scale=2.0">
            <link rel="stylesheet" href="../new_app3.css">
            <link href="https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@700&display=swap" rel="stylesheet">    <title>Document</title>
            <script src="../stl_viewer.min.js"></script>
                <script src="https://www.gstatic.com/firebasejs/7.18.0/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/7.18.0/firebase-storage.js"></script>

    <!-- TODO: Add SDKs for Firebase products that you want to use
        https://firebase.google.com/docs/web/setup#available-libraries -->
    <script src="https://www.gstatic.com/firebasejs/7.18.0/firebase-analytics.js"></script>

        </head>
        <body>
                
            <header>
                <div>
                <span id="nav" style="font-size:30px;cursor:pointer;float:left"  onclick="openNav()">&#9776;</span>
                <!-- <h1><a href="02.html">SSAK<span style="color: #29a15f;">3</span>D</a></h1> -->
                <span class="title">미처리 견적</span>
                <img src="../notification.png" style="">
                </div>
            </header> 
        
        <div id="mySidenav" class="sidenav">
            <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>
            <a href="/">HOME</a>
            <a href="/unprocessed_estimate">미처리 견적</a>
            <a href="#">처리 견적</a>
            <hr>
            <a href="#">고객</a>
        </div>
        <div class="not_yet_list" id="not_yet_01" style="cursor: pointer";>
                <div class="yet_item">
                    <h3>${name}</h3>
                    <span style="color:#FF9100;"> </span>
                </div>
                <div class="yet_customer">
                    <p>이메일 : ${email}</p>
                    <p>장비 : ${equip}</p>
                </div>
        </div>
                
        <div class="wrapper">
            <div style="height: 80px;"></div>        
        `;
        return result;
    },
    unprocessed_estimate_detail_list : function(i,filename){
        var result = "";
        if(i==0){
            result+=` 
                <form name="estimate_detail_form" id="estimate_detail_form" action="/estimate_process" method="POST">
                    <input id="partner" type="hidden" name="partner" value="B업체">
                    <input id="term" type="hidden" name="term" value="5">
                    <input id="file_name" type="hidden" name="file_name">
                    <input id="file_count" type="hidden" name="file_count">
                    <input id="file_price" type="hidden" name="file_price">
                    <input id="link" type="hidden" name="link" value="www.naver.com">
                    <input id="pin" type="hidden" name="pin">
            `;
        }
        result += `
            <div class="wrap_cont" id="wrap_cont${i}">
                <div class="stl_cont" id="stl_cont${i}">
                </div>
                <div class="model_info">
                    <p>${filename}</p>
                    <p>x:<span id="x_value${i}">0</span> y:<span id="y_value${i}">0</span> z:<span id="z_value${i}">0</span> 부피:<span id="volume${i}">0</span></p>
                    견적가 : <input type="text" id="model${i}" name="model${i}" onchange="price_array()">원
                </div>
            </div>
        `;
        return result;
    },
    unprocessed_estimate_detail_2 : function(id, filelist, count){
        var result = `
        </div>
        <input type="submit" class="request_btn" value="견적서 전송">
        </form>
        <div id="stl_cont" style="display: none; visibility: hidden;"></div>
        <script src="../stl_viewer.min.js"></script>

        <script>
        var folder = "${id}";
        var stored_files_num = ${filelist};
        var models_ea= ${count};
        var stl_viewer=new StlViewer ( document.getElementById("stl_cont") );
        //stl_viewer객체 를 담는 배열
        var object_array = [];
        //각 stl_viewer객체에서 지워야할 models의 인덱스를 담는 배열
        var rm_id_array = [];
        //stl_cont의 수
        var count = 0;
        //drops플래그
        var drop_flag = 0;
        //각 stl viwer객체에 담긴 3d model의 정보를 담는 배열
        var info_array = [];
        var price_store = [];
        var price_send  = [];
        var price_sum = [0,0,0]; //[sla, sls ,sla(clear)]
        var total_time = 0;
        var models_weight = [];
        var models_price = [];
        var firebaseConfig = {
            apiKey: "AIzaSyCNSpfT3ouTPvEIj3nBXLOMavYW6LcjT8s",
            authDomain: "app-maker-ton.firebaseapp.com",
            databaseURL: "https://app-maker-ton.firebaseio.com",
            projectId: "app-maker-ton",
            storageBucket: "app-maker-ton.appspot.com",
            messagingSenderId: "785518118903",
            appId: "1:785518118903:web:6476aee171e8704e1e10f2",
            measurementId: "G-8B6824DD8T"
        }
        
        firebase.initializeApp(firebaseConfig);

        window.onload = function(){
            console.log("loading");
            console.log( );
            document.getElementById("file_name").value = JSON.stringify(stored_files_num);
            document.getElementById("file_count").value = JSON.stringify(models_ea);
            document.getElementById("pin").value = folder;
            
            document.getElementById("link").value = "https://app-maker-ton.web.app/final/" + folder  +\`?price=\${models_price}]\`;
         //   document.estimate_detail_form.action = "/estimate_process/" + folder ;
            import_files(folder,stored_files_num);
            
        }
        function price_array(){
            for(var i = 0 ; stored_files_num.length ; i++){
                models_price[i] = document.getElementById("model"+i).value;
                document.getElementById("file_price").value = \`[\${models_price}]\`;
                document.getElementById("link").value = "https://app-maker-ton.web.app/final/" + folder  +\`?price=\${models_price}\`;
            }
           
        }
        function import_files(id,filelist){
            var file_ary = [];
            var length = filelist.length;
            var tmp = 0;
            for(var i = 0; i< filelist.length; i++){
                console.log(i);
                var imgRef = firebase.storage().ref().child(\`\${id}/\${filelist[i]}\`); 
                imgRef.getDownloadURL().then(async function(url){
                    console.log(i);
                    let blob = await fetch(url).then(r => r.blob());
                    let file = new File([blob], \`\${filelist[0]}\`);
                    
                   make_object("stl_cont" + tmp++).add_model({local_file: file});
                });
            }
            console.log(file_ary);
           
            return file_ary;
        }
        function openNav() {
            document.getElementById("mySidenav").style.width = "250px";
    
        };
    
            
            function closeNav() {
            document.getElementById("mySidenav").style.width = "0";
            }
            
            function home(){
            }
            
function make_object(cont_id){
    var stl_viewer = new StlViewer
    (
        document.getElementById(cont_id),
        {
            model_loaded_callback:stl_loaded,
            allow_drag_and_drop : false,
            bgcolor:"#ffffff",
            canvas_width:"30%",
            canvas_height:"30%",
            auto_resize:false,
        }
    );
  //  stl_viewer.rotate(2, 0.5, 0, 0);
    
    object_array.push(stl_viewer);
    if(rm_id_array[count-1] == undefined){
        //rm_id_array에 1을 넣어줌 
        rm_id_array.push(1);
        //info_array에 3d모델의 정보를 넣기위한 객체를 넣어줌
        info_array.push({});
    }
/*     else{
        rm_id_array[count-1]++;
    }
*/
    return stl_viewer;
}


function stl_loaded()

{   
    //현재 로드되는 모델의 id
    var model_id = this.models[0].id;
    this.set_color(model_id,"#a6a6a6");
    this.rotate(model_id,80,0,0);
    //모델의 설정값 세팅
   this.set_display(model_id, "smooth");
    this.set_scale(model_id, 0.7);
    //현재 모델링이 출력되는 상자의 자매 노드 (x,y,z,부피가 표시되는 노드)
    var detail_elem = document.getElementById(this.parent_element.id).nextSibling;
    var input_models_info = document.getElementById("models_info");
    //현재 업로드된 3D모델 정보 로드
    pen_json = JSON.stringify(this.get_model_info(this.models.length));
    my_pen = JSON.parse(pen_json);
    volume = my_pen.volume * 2.9154489769321;
    console.log(my_pen);
    //dims : 사용자에게 보여질 3D모델 정보 스트링 
    dims = \`\${my_pen.name} 
     <br>x: \${my_pen.dims.x.toFixed(2)} y: \${my_pen.dims.y.toFixed(2)}  z: \${my_pen.dims.z.toFixed(2)}
     <br> 부피 : \${volume.toFixed(2)}\`;                
    //3D 모델 정보(X,Y,Z 부피 값을 HTML로 보냄)
   // detail_elem.innerHTML = my_pen.name;
    var dims_array = [my_pen.dims.x.toFixed(2),my_pen.dims.y.toFixed(2),my_pen.dims.z.toFixed(2),volume.toFixed(2)];
    
    //stl_cont숫자 < 숫자부분을 빼내서 index에 저장
    var index = this.parent_element.id.substr(8,100);
    index  = Number(index);

    info_array[index] = {
        filename: my_pen.name, 
        x: my_pen.dims.x.toFixed(2),
        y: my_pen.dims.y.toFixed(2),
        z: my_pen.dims.z.toFixed(2),
        volume : volume.toFixed(2)
    };
    document.getElementById("x_value"+index).innerHTML = info_array[index].x;
    document.getElementById("y_value"+index).innerHTML = info_array[index].y;
    document.getElementById("z_value"+index).innerHTML = info_array[index].z;
    console.log(info_array[index].volume);
    document.getElementById("volume"+index).innerHTML = info_array[index].volume;

    console.log(detail_elem);
    input_models_info.value = JSON.stringify(info_array);
    // console.log(info_array.toString());
    //drop 이벤트가 발생했다면 이전 모델을 제거
    if(drop_flag == 1){
        this.remove_model(rm_id_array[index]++);
        drop_flag = 0;
    }
    var weight = get_weight(volume.toFixed(2),index);
    var price = get_price(dims_array,weight)
    price_store[index] = price;

    for(var i = 0 ; i < 3 ; i ++){
        price_sum[i] += price[i];
    }
    // console.log(price);
    var name = 'model'
    name = name + index;
    detail_elem.innerHTML = \`예상가 <span class="file_price">0원</span><br>
    수량  <input type="text" class="model_nums" width="50%" id=\${name} name=\${name} oninput="changeNums(name)" value = 1 >\`;

    changePrinter(detail_elem);
    // detail_elem.innerHTML = \`예상가 <span class="file_price">\${numberWithCommas(price[0])}원</span>\`;
    // document.getElementById("sla").innerHTML = numberWithCommas(price_sum[0]) + " 원";
    // document.getElementById("sls").innerHTML =numberWithCommas(price_sum[1]) + " 원";
    // document.getElementById("clear").innerHTML =numberWithCommas(price_sum[2]) + " 원"; price_sum[2] + " 원";
        

}

            
            </script>
       
                
        </body>
        </html>
        `;
        return result;
    },
    unprocessed_estimate_1 : function(){
        var result = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0,
            maximum-scale=2.0">
            <link rel="stylesheet" href="new_app2.css">
            <link href="https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@700&display=swap" rel="stylesheet">    <title>Document</title>
        </head>
        <body>
            <header>
                <div>
                <span id="nav" style="font-size:30px;cursor:pointer;float:left"  onclick="openNav()">&#9776;</span>
                <!-- <h1><a href="02.html">SSAK<span style="color: #29a15f;">3</span>D</a></h1> -->
                <span class="title">미처리 견적</span>
                <img src="notification.png" style="">
                </div>
                
            </header> 
        <div id="mySidenav" class="sidenav">
            <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>
            <a href="/">HOME</a>
            <a href="/unprocessed_estimate">미처리 견적</a>
            <a href="#">처리 견적</a>
            <hr>
            <a href="#">고객</a>
        </div>
        <div class="wrapper">
            <section style="text-align: center;">
            <img src="just.png" style="width: 90%; padding-top: 11px;">
            </section>
            <hr style="width: 94%; color: rgb(112, 112, 112,0.5);">
            <section>
        `;
        return result;
    },
    unprocessed_estimate_2 : function(){
        var result = `
        </section>
        </div>
            <script>
                function openNav() {
                document.getElementById("mySidenav").style.width = "250px";
                }
                
                function closeNav() {
                document.getElementById("mySidenav").style.width = "0";
                }
              
                function home(){}
            </script>
        </body>
        </html>
        `;
        return result;
    },


    unprocessed_estimate_list : function(pin, name, email, now){
        var result = `
        <div class="not_yet_list" id="not_yet_01" style="cursor: pointer;" OnClick="location.href='/unprocessed_estimate_page/${pin}';">
            <div class="yet_item">
                <h3>${name}</h3>
                <span style="color:#FF9100;">${now}</span>
            </div>
            <div class="yet_customer">
                <p>이메일 : ${email}</p>
            </div>
        </div>
        `;
        return result;
    },
    _main_page : function(){
        var result = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0,
            maximum-scale=2.0">
            <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3pro.css">
            <link rel="stylesheet" href="style2.css">
            <title>Document</title>
        </head>
        <body>
                
            <header>
                <span id="nav" style="font-size:30px;cursor:pointer;float:left"  onclick="openNav()">&#9776;</span>
                <h1><a href="/">ssak<span style="color: #29a15f;">3</span>D</a></h1>
            </header>
        <div id="mySidenav" class="sidenav">
            <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>
            <a href="/">HOME</a>
            <a href="/unprocessed_estimate">미처리 견적</a>
            <a href="#">처리 견적</a>
            <hr>
            <a href="#">고객</a>
        </div>
        
        <div class="box not_yet" style="cursor: pointer;" OnClick="location.href='/create';">
            <h2>미처리 견적 목록</h2>
        </div>
        <div class="box completed">
            <h2>처리 견적 목록</h2>
        </div>
        
            <script>
                function openNav() {
                document.getElementById("mySidenav").style.width = "250px";
                }
                
                function closeNav() {
                document.getElementById("mySidenav").style.width = "0";
                }
               
                function home(){}
            </script>
                
        </body>
        </html>
        `;
        return result;
    },
    make_detail_page : function(id,dump){
        var result = `
        <!doctype html>
        <html>
            <head>
                <title>NODE JS TEST</title>
                <meta charset="utf-8">
            </head>
            <body>
                <h1><a href="/">${id}</a></h1>
                <p> 기업명 : ${dump.company}</p>
                <p> 성 명 : ${dump.name}</p>
                <p> 날짜 : ${dump.date}</p>
                <p> 요청사항 : ${dump.detail}</p>
                <p> 이메일 : ${dump.email}</p>
                <p> 배송방법 : ${dump.delivery}</p>
                <p> 장비 : ${dump.equipment}</p>
            </body>
        </html>
        `;
        return result;
    },

    make_p : function(id,detail){
        var result = `
            <div class = "paper" OnClick="location.href='/paper/${id}'" style="cursor:pointer;">
                <h2>${id}</h2>

                <p> 주문자 이름 : ${detail.name}</p>
                <p> 주문자 나이 : ${detail.age}</p>
            </div>
            </br>

        `;
        return result;
    },

    make_body_s : function(){
        var result = `
        <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0,
                maximum-scale=2.0">
                <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3pro.css">
                <link rel="stylesheet" href="style2.css">
                <title>Document</title>
            </head>
            <body>
                <header>
                    <span id="nav" style="font-size:30px;cursor:pointer;float:left"  onclick="openNav()">&#9776;</span>
                    <h1><a href="/">SSAK<span style="color: #29a15f;">3</span>D</a></h1>
                </header>
            <div id="mySidenav" class="sidenav">
                <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>
                <a href="/unprocessed_estimate">미처리 견적</a>
                <br>
                <a href="#">처리 견적</a>
                <a href="#">Clients</a>
                <a href="#">Contact</a>
            </div>
        <section class="list_box">
        `;
        return result;},
    make_body_e : function(){
        var result = `
        </section>

        <script>
            function openNav() {
            document.getElementById("mySidenav").style.width = "250px";
            }
            
            function closeNav() {
            document.getElementById("mySidenav").style.width = "0";
            }
        </script>
                
        </body>
        </html>
        `;
        return result;
    },
    _make_bodyin : function(id,doc){
        var result = `
        <div class="not_yet_list" id="not_yet_01" style="cursor: pointer;" OnClick="location.href='/paper/${id}';">
        <div class="yet_item">
            <h3>${doc.item}</h3>
            <span>20${doc.date[0]}${doc.date[1]}년 ${doc.date[2]}${doc.date[3]}월 ${doc.date[4]}${doc.date[5]}일 ${doc.time}</span>
        </div>
        <div class="yet_customer">
            <p>업체 : ${doc.company}</p>
            <p>성명 : ${doc.name}</p>

        </div>
    </div>
        `;
        return result;
    },

    _make_detail_page : function(doc){
        var result = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0,
            maximum-scale=2.0">
            <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3pro.css">
            <link rel="stylesheet" href="../style2.css">
            <title>Document</title>
        </head>
        <body>
                
            <header>
              <span id="nav" style="font-size:30px;cursor:pointer;float:left"  onclick="openNav()">&#9776;</span>
              <h1><a href="/">SSAK<span style="color: #29a15f;">3</span>D</a></h1>
            </header>
          <div id="mySidenav" class="sidenav">
            <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>
            <a href="/unprocessed_estimate">미처리 견적</a>
            <br>
            <a href="#">처리 견적</a>
            <a href="#">Clients</a>
            <a href="#">Contact</a>
          </div>
          <div class="wrapper">
            <section class="request_info" >
              <h3>${doc.item}</h3>
              <section class="customer_info">
                  <div>주문자명</div> <span>${doc.name}</span><br>
                  <div>소속</div> <span>${doc.company}</span><br>
                  <div>요청사항</div> <span>${doc.detail}</span><br>
                  <div>사용장비</div> <span>${doc.equipment}</span><br>
                  <div>전화번호</div> <span>${doc.tel}</span><br>
                  <div>이메일</div> <span>${doc.email}</span><br>
                  <div>수령방법</div> <span>${doc.delivery}</span><br>
                  <div>주소</div> <span>${doc.address}</span><br>
                  <div>견적서 파일명</div> <span>${doc.pdfname}.pdf</span><br>
                  <div>견적가</div> <span>90,000원</span><br>
              
              </section>
              <div class="file_list">
                
              </div>
            </section>
            <input type="submit" class="request_btn send">견적서 전송</div>
            </form>
            <div class="request_btn edit">견적서 수정</div>
          </div>
            <script>
                function openNav() {
                  document.getElementById("mySidenav").style.width = "250px";
                }
                
                function closeNav() {
                  document.getElementById("mySidenav").style.width = "0";
                }
            </script>
                   
        </body>
        </html>
        `;
        return result;
    },
}

module.exports = make;

// module.exports = {}
// 맨 위를 위와같이해도 상관없다