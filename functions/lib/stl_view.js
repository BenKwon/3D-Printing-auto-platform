window.onload = function(){
    console.log(doc_id);
}
function openNav() {
document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
document.getElementById("mySidenav").style.width = "0";
}

function home(){}
function make_object(cont_id){
    var stl_viewer = new StlViewer
    (
        document.getElementById(cont_id),
        {
            on_model_drop : drop_handler,
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
    dims = `${my_pen.name} 
     <br>x: ${my_pen.dims.x.toFixed(2)} y: ${my_pen.dims.y.toFixed(2)}  z: ${my_pen.dims.z.toFixed(2)}
     <br> 부피 : ${volume.toFixed(2)}`;                
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
    detail_elem.innerHTML = `예상가 <span class="file_price">0원</span><br>
    수량  <input type="text" class="model_nums" width="50%" id=${name} name=${name} oninput="changeNums(name)" value = 1 >`;

    changePrinter(detail_elem);
    // detail_elem.innerHTML = `예상가 <span class="file_price">${numberWithCommas(price[0])}원</span>`;
    // document.getElementById("sla").innerHTML = numberWithCommas(price_sum[0]) + " 원";
    // document.getElementById("sls").innerHTML =numberWithCommas(price_sum[1]) + " 원";
    // document.getElementById("clear").innerHTML =numberWithCommas(price_sum[2]) + " 원"; price_sum[2] + " 원";
        

}
