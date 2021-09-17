var make = {
    stl_box_generator: function(i,price,count){
        var box = `
            <div id="wrap_cont${i}" class="wrap_cont">
                <div id="stl_cont${i}" class="stl_cont" style="background: white;">
                    </div><div class="card-body">견적가 <span class="file_price">${price}원 (${count})개</span><br>
                </div>
            </div>
        `;
        return box; 
    },
    form_part_generator: function(name,email,equipment,box,total_price){
        var form_part= `
        <div id="info_input" class="container">
            <input id="models_price" type="hidden" name="models_price">
            <input id="models_weight" type="hidden" name="models_weight">
            <input id="total_time" type="hidden" name="total_time">
            <form action="/sample_process" method="POST">
                <input id="model_ea" type="hidden" name="model_ea">
                <input id="models_info" type="hidden" name="models_info">
                <input id="id" type="hidden" name="id">
                <input type="hidden" name="stl-url" value="https://firebasestorage.googleapis.com/v0/b/app-maker-ton.appspot.com/o/4618373208783%2Fball.stl?alt=media&token=7c75c994-c205-4f10-8cd8-08f239215ec8">
                <h2 id="guide_word">주문하기</h2>
                <div class="row">
                    <div class="col-25">
                        <label for="name">이름</label>
                    </div>
                    <div class="col-75">
                        <input type="text" id="name" name="name" value ="${name}" placeholder="홍길동">
                    </div>
                </div>
                <div class="row">
                    <div class="col-25">
                        <label for="email">e-mail</label>
                    </div>
                    <div class="col-75">
                        <input type="text" id="email" name="email" value="${email}" placeholder="ssak3d@gmail.com">
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-25">
                        <label for="country">장비</label>
                    </div>
                    <div class="col-75">
                        <select id="printer" name="printer" onchange="changePrinter()">
                            <option value="${equipment}">${equipment}</option>
                        </select>
                    </div>
                </div>

                <div class="row">
                    <div class="col-25">
                        <label for="address">주소</label>
                    </div>
                    <div class="col-75">
                        <input type="text" id="address" name="address"  placeholder="경기도 안산시 상록구 0길 203호">
                    </div>
                </div>

                <div class="row">
                    <div class="col-25">
                        <label for="shipment">배송</label>
                    </div>
                    <div class="col-75">
                        <select id="shipment" name="shipment">
                            <option value="delivery">택배</option>
                            <option value="visit">방문수령</option>
                        </select>
                    </div>
                </div>
                <div class="row">
                    <div class="col-25">
                        <label for="shipment">요청 사항</label>
                    </div>
                    <div class="col-75">
                        <textarea></textarea>
                    </div>
                    
                </div>

                <div class="row" style="margin-top: 10px;">
                총 견적가: <span id="total_price" style="color: #FF9100;">${total_price}</span> 원</span></span><input type="submit" value="결제">
                </div>
            </form>
            
            <div id="stl_cont" style="display: none; visibility: hidden;"></div>

            <div id="cont_box">
                ${box}
            </div>
          </div>
        `;
        return form_part;
    },
    generate_content : function(id,filelist,count, content){
        var result = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet"  href="../final.css"/>
                <script src="https://www.gstatic.com/firebasejs/7.18.0/firebase-app.js"></script>
                <script src="https://www.gstatic.com/firebasejs/7.18.0/firebase-storage.js"></script>
            
                <!-- TODO: Add SDKs for Firebase products that you want to use
                    https://firebase.google.com/docs/web/setup#available-libraries -->
                <script src="https://www.gstatic.com/firebasejs/7.18.0/firebase-analytics.js"></script>
                            <script src="../stl_viewer.min.js"></script>
                
                <title>Document</title>
            </head>
            
            <body>
                <div class="topnav" id="myTopnav">
                    <a href="#home" id="logo" class="active"><img src="../logo5.png"></a>
                    <a href="#news" class="nav_elem">AboutUs</a>
                    <a href="#news" class="nav_elem">안내</a>
                    <a href="#news" class="nav_elem">문의</a>
                    <a href="#news" class="nav_elem">견적요청</a>
                    <a href="javascript:void(0);" class="icon" onclick="nav_responsive()">
                    <i class="fa fa-bars"></i>
                    </a>
                </div>
            
                <div class="content">
                    ${content}
                </div>
                <script>
                    var folder = "${id}";
                    var stored_files_num = ${filelist};
                    var models_ea= [${count}];
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
                      //  document.getElementById("file_name").value = JSON.stringify(stored_files_num);
                      //  document.getElementById("file_count").value = JSON.stringify(models_ea);
                      //  document.getElementById("pin").value = folder;
                        
                      //  document.getElementById("link").value = "https://app-maker-ton.web.app/final/" + folder  +\`?price=\${models_price}]\`;
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
    }
}


module.exports = make;