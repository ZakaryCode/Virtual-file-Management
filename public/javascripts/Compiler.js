var GLOBAL = {
	Compiler:{},
	Folder:{},
	Login:{},
	countLine:0
};
// 按键回车
function keyEnter(data){
if( line( data , true ) ){
	data = data.split(' ');
	if ( !isFunction(data) ) {
		line( "\""+data[0]+"\"is not a function!" , false );
	}
}
};

// 按键向上或向下
function keyUpOrDown(data){//向上:TRUE;向下:FALSE
if( $("#CodeEditing").find(".codeText").length != 0 ){
	if(data){
		$("#codeInput>pre>input").val( $(".codeText")[GLOBAL.countLine].innerText );
		GLOBAL.countLine--;
	}else{
		$("#codeInput>pre>input").val( $(".codeText")[GLOBAL.countLine].innerText );
		GLOBAL.countLine++;
	}
	if(GLOBAL.countLine<0){
		GLOBAL.countLine = 0;
	}else if(GLOBAL.countLine>=$("#CodeEditing").find(".codeText").length){
		GLOBAL.countLine = ($("#CodeEditing").find(".codeText").length-1);
	}
	// console.log(GLOBAL.countLine);
}
};

//输入或输出
function line( data , streamDirection ){
if (streamDirection) {//记录当前输入语句
	GLOBAL.countLine = ($("#CodeEditing").find(".codeText").length);
}
// num = '<pre class="CodeEditing-text">'+ ($("#CodeEditing").children().length+0) +'</pre>';
num = '';
streamD = '<pre class="CodeEditing-text">'+(streamDirection?'>':'<')+'</pre>';// >:输入流; <:输出流
showData = '<pre class="CodeEditing-text"><span'+(streamDirection?' class="codeText"':'')+'>'+data+'</span></pre>';
$("#codeInput").before("<div id="+($("#CodeEditing").children().length)+" class='codeLine'>"+num+streamD+showData+"</div>");
location.href = "#codeInput";
return true;
}

//判断指令是否为function
function isFunction(data){
	for(key in GLOBAL){
		if(typeof GLOBAL[key][data[0]] === "function"){
			GLOBAL[key][data[0]](data);
			return true;
		}
	}
	return false;
}


// 清屏
GLOBAL.Compiler.clear = function(){
	inputCode = $("#codeInput");
	$("#CodeEditing").html(inputCode);
	$("#codeInput>pre>input").focus();
	GLOBAL.countLine = 0;
	if ( line( "<b>|----CLEAR----|<b>" , false ) ) {
		line( "Compiler was cleared!" , false );
	}
};

// 帮助
GLOBAL.Compiler.help = function(){
	funcName = "";
	if (line( "<b>|----HELP----|<b>" , false )) {
		funcName += "<blockquote>";
		for(keyName in GLOBAL){
			if(typeof GLOBAL[keyName] == "object")
				funcName += "<p><b>"+keyName+"</b></p>";
			for(key in GLOBAL[keyName]){
				funcName += "<p>"+key+"</p>";
			}
		}
		funcName += "</blockquote>";
		if ( line( funcName , false ) ){
			line( "Hope it will help you!" , false );
		}
	}
};
// 重载
GLOBAL.Compiler.reload = function(){
	location.reload([false]);
};
GLOBAL.Compiler.AJAX = function( TYPE, OpType, OpObject, _success ){
	var bodyInput = {
		"currentDirectory":getDir(),																	//当前目录
		"currentUser":{																								//当前用户
			Group:$("#toolsRight b").attr("Group"),										//当前用户所在组
			Name:$("#toolsRight b").html().replace("未登录","")				//当前用户名
		},
		"currentOperation":{					//当前操作
			OpType:OpType,						//操作类型
			OpObject:OpObject					//操作对象
		}
	};
	var URL = "http://127.0.0.1:3000/users?TYPE="+TYPE;
  console.log("Input-:"+JSON.stringify(bodyInput));
  // GLOBAL.Ajax.post( TYPE, bodyInput, _success );
	$.ajax({
	  "async": true,
	  "crossDomain": true,
		"url":URL,
    "type":"POST",
    "Content-Type":"application/json",
    "Authorization":"Basic Og==",
    "dataType":"json",
    "data":{
			"input":JSON.stringify(bodyInput)
		},
		success:function(result){
      console.log("RESULT:"+JSON.stringify(result));
		  if (line( "<b>|----"+OpType+"----|<b>" , false )) {
				if (typeof _success == "function") {
					_success(result);
				} else if (result.status.Judge) {	//成功
					line( result.status.Info , false );
				} else {	//失败
					line( result.status.Info , false );
				}
			}
			// line( "" , false );
		},
		error:function(xhr,status,statusText){
      line( "ERROR_CODE: " + xhr.status , false );
      console.error("ERROR:xhr-"+xhr);
      console.error("ERROR:status-"+status);
      console.error("ERROR:statusText-"+statusText);
    }
	});
};

/* 快捷方法渠道 */
// 获取当前地址
function getDir(){
	var DIR = [];
	for (var i = 0; i < $("#toolsLeft").children().length; i++) {
		DIR.push($("#toolsLeft").children().eq(i).text().replace("/",""));
	}
	DIR[0] = "FILE";
	console.log(DIR);
	return DIR;
}
// 字段存在性验证
function isFieldExists(e){
	if (!e||e==undefined||e=="") {
		return false;
	}else{
		return true;
	}
}
//判断对象是否为空
function isEmptyObject(e){
    var t;
    for (t in e)
        return !1;
    return !0;
};
// AJAX 请求对象
// GLOBAL.Ajax={
//   post: function (TYPE, data, fn) {
//       var obj = new XMLHttpRequest();
// 			var URL = window.location.origin+"/users?TYPE="+TYPE;
//   console.log("-Input-:"+JSON.stringify(data));
//       obj.open("POST", URL, true);
//       obj.setRequestHeader("Content-Type", "application/json"); // 发送信息至服务器时内容编码类型
//       obj.onreadystatechange = function () {
//           if (obj.readyState == 4 && (obj.status == 200 || obj.status == 304)) {  // 304未修改
//               fn.call(this, obj.responseText);
//           }
//       };
//       obj.send(data);
//   }
// }