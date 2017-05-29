/*
	登陆设置
		case "checkLogin": 				//查询->A用户->登陆 --名字存在 --密码正确
		case "checkGroups": 			//显示->所有用户组 	//显示->A用户组下->所有用户
		case "newGroup": 					//新建->A用户组
		case "newGroupUser": 			//新建->A用户组下->B用户
		case "deleteGroup": 			//删除->A用户组
		case "deleteGroupUser": 	//删除->A用户组下->B用户
		case "alterGroup": 				//更改->A用户组->名字
		case "alterGroupUser": 		//更改->A用户组->B用户->名字 密码 其他
*/
//注销
GLOBAL.Login.logout = function(data){
	$("#toolsRight b").html("未登录");
	$("#toolsRight b").attr("Group","ROOT");
	$("#toolsRight b").css("color","#999");
	line( "Function logout it success!" , false );
};
//登陆 查询->A用户->登陆 --名字存在 --密码正确
GLOBAL.Login.login = function(data){
	// console.log(data);
	var OpObject = {
		UserName:(isFieldExists(data[1])?data[1]:""),
		UserPassword:(isFieldExists(data[2])?data[2]:"")
	}
	GLOBAL.Compiler.AJAX( "Login", "checkLogin", OpObject, LoginSuc );
};
// 显示->所有用户组 	// 显示->A用户组下->所有用户
GLOBAL.Login.checkGroups = function(data){
	var OpObject = {
		Group:(isFieldExists(data[1])?data[1]:""),
		User:(isFieldExists(data[2])?data[2]:"")
	}
	GLOBAL.Compiler.AJAX( "Login", "checkGroups", OpObject, ShowDetail );
};
// 新建->A用户组
GLOBAL.Login.newGroup = function(data){
	// console.log(data);
	var OpObject = {
		Name:(isFieldExists(data[1])?data[1]:""),
		// Jurisdiction:(isFieldExists(data[2])?data[2]:"")
	}
	GLOBAL.Compiler.AJAX( "Login", "newGroup", OpObject, getObjectSuc );
};
//注册 新建->A用户组下->B用户
GLOBAL.Login.newGroupUser = function(data){
	// console.log(data);
	var OpObject = {
		Name:(isFieldExists(data[1])?data[1]:""),
		Group:(isFieldExists(data[2])?data[2]:"USERS"),
		Age:(isFieldExists(data[3])?data[3]:""),
		Gender:(isFieldExists(data[4])?data[4]:""),
		NickName:(isFieldExists(data[5])?data[5]:""),
		Password:(isFieldExists(data[6])?data[6]:""),
	}
	GLOBAL.Compiler.AJAX( "Login", "newGroupUser", OpObject, getObjectSuc );
};
//删除->A用户组
GLOBAL.Login.deleteGroup = function(data){
	// console.log(data);
	var OpObject = {
		Name:(isFieldExists(data[1])?data[1]:""),
		Group:(isFieldExists(data[1])?data[1]:""),
	}
	GLOBAL.Compiler.AJAX( "Login", "deleteGroup", OpObject, getObjectSuc );
};
//删除->A用户组下->B用户
GLOBAL.Login.deleteGroupUser = function(data){
	// console.log(data);
	var OpObject = {
		Name:(isFieldExists(data[1])?data[1]:""),
		Group:(isFieldExists(data[2])?data[2]:"USERS"),
	}
	GLOBAL.Compiler.AJAX( "Login", "deleteGroupUser", OpObject, getObjectSuc );
};
//更改->A用户组->名字
GLOBAL.Login.alterGroup = function(data){
	// console.log(data);
	var OpObject = {
		Name:(isFieldExists(data[1])?data[1]:""),
		alterName:(isFieldExists(data[2])?data[2]:""),
	}
	GLOBAL.Compiler.AJAX( "Login", "alterGroup", OpObject, getObjectSuc );
};
//更改->A用户组->B用户
GLOBAL.Login.alterGroupUser = function(data){
// console.log(data);
	if(!isFieldExists(data[1])) {
		line( "请输入要修改用户的用户组" , false )
		return;
	} else if (!isFieldExists(data[2])) {
		line( "请输入要修改用户的用户名" , false )
		return;
	} else{
		var OpObject = {
			Group:data[1],
			User:data[2]
		}
		GLOBAL.Compiler.AJAX( "Login", "checkGroups", OpObject, getWObjectSuc );
	}
};
//更改->A用户组->B用户->名字 密码 其他
function alterGroupUserSubmit(data){
getFocus(true);
// console.log(data.children);
var OpObject = {
	former:{},
	alter:{}
};
for(key in data.children) {
	// console.log(key +"-"+ JSON.stringify(data.children[key].children[1].innerHTML)+"-"+JSON.stringify(data.children[key].children[1].attributes["former"].nodeValue));
	if(typeof data.children[key].children != "undefined"&&data.children[key].children[1]!=undefined) {
		// console.log(key +"-"+ JSON.stringify(data.children[key].children[1])+"-"+JSON.stringify(data.children[key].children[1].attributes["former"].nodeValue));
		OpObject.former[data.children[key].id] = data.children[key].children[1].innerHTML;
		OpObject.alter[data.children[key].id] = data.children[key].children[1].attributes["former"].nodeValue;
	}
}
// console.log(JSON.stringify(OpObject))
GLOBAL.Compiler.AJAX( "Login", "alterGroupUser", OpObject, getObjectSuc );
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

/* 特殊接口回调 */
	// 登陆回调接口
	function LoginSuc(data){
	  if (line( "<b>|----LoginSuc----|<b>" , false )) {
			if (data.status.Judge) {	//成功
				line( data.status.Info , false );
				$("#toolsRight b").html(data.response.User.Name);
				$("#toolsRight b").attr("Group",data.response.Group);
				$("#toolsRight b").css("color","#EEE");
			} else {	//失败
				line( data.status.Info , false );
			}
		}
		line( "Function login it success!" , false );
	}
	// 详情显示接口
	function ShowDetail(data){
	  if (line( "<b>|----ShowDetail----|<b>" , false )) {
			if (data.status.Judge) {	//成功
				if(line( data.status.Info , false )){
					if (isFieldExists( data.response.NameList ) && !isEmptyObject( data.response.NameList )) {
						var funcName = "";
						if (line( "<b>|----NameList----|<b>" , false )) {
							funcName += "<blockquote>";
							for(keyName in data.response.NameList){
								funcName += "<p><b>"+(parseInt(keyName, 10)+1)+"</b>:"+data.response.NameList[keyName]+"</p>";
							}
							funcName += "</blockquote>";
							if ( line( funcName , false ) ){
								line( "Hope it will help you!" , false );
							}
						}
					}
					if (isFieldExists( data.response.DetailList ) && !isEmptyObject( data.response.DetailList )) {
						var funcName = "";
						if (line( "<b>|----DetailList----|<b>" , false )) {
							funcName += "<blockquote>";
							for(keyName in data.response.DetailList){
								funcName += "<p><b>"+(keyName)+"</b>:"+data.response.DetailList[keyName]+"</p>";
							}
							funcName += "</blockquote>";
							if ( line( funcName , false ) ){
								line( "Hope it will help you!" , false );
							}
						}
					}
				}
			} else {	//失败
				line( data.status.Info , false );
			}
		}
		line( "Function login it success!" , false );
	}
	// 对象返回接口
	function getObjectSuc(data){
	  if (line( "<b>|----getObjectSuc----|<b>" , false )) {
			if (data.status.Judge) {	//成功
				if(line( data.status.Info , false )) {
					var funcName = "";
					if (line( "<b>|----ObjectDetailList----|<b>" , false )) {
						funcName += "<blockquote>";
						for(keyName in data.response){
							if(typeof data.response[keyName] != "object")
								funcName += "<p><b>"+(keyName)+"</b>:"+data.response[keyName]+"</p>";
						}
						funcName += "</blockquote>";
						if ( line( funcName , false ) ){
							line( "Hope it will help you!" , false );
						}
					}
				}
			} else {	//失败
				line( data.status.Info , false );
			}
		}
		line( "Function login it success!" , false );
	}
	// 可写对象返回接口
	function getWObjectSuc(data){
		getFocus(false);
		if (line( "<b>|----getWObjectSuc----|<b>" , false )) {
			if (data.status.Judge) {	//成功
				if(line( data.status.Info , false )) {
					var funcName = "";
					if (line( "<b>|----ObjectDetailList----|<b>" , false )) {
						funcName += "<blockquote>";
						for(keyName in data.response.DetailList){
							if(typeof data.response.DetailList[keyName] != "object")
								funcName += "<p id='"+keyName+"'><b>"+(keyName)+"</b>:<span contenteditable='true' former ='"+data.response.DetailList[keyName]+"' >"+data.response.DetailList[keyName]+"</span></p>";
						}
						funcName += "<button style='background-color:#222;color:#999;border:1px solid #EEE;width:100%;float:right;' onclick='alterGroupUserSubmit(this.parentNode)'>提交</button>"
							+"</blockquote>";
						if ( line( funcName , false ) ){
							line( "Hope it will help you!" , false );
						}
					}
				}
			} else {	//失败
				line( data.status.Info , false );
			}
		}
		line( "Function login it success!" , false );
	}
