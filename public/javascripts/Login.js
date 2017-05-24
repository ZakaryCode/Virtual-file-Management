/*
 */
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
	GLOBAL.Compiler.AJAX( "Login", "newGroup", OpObject, LoginSuc );
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
	GLOBAL.Compiler.AJAX( "Login", "newGroupUser", OpObject, LoginSuc );
};
//删除->A用户组
GLOBAL.Login.deleteGroup = function(data){
	// console.log(data);
	var OpObject = {
		Name:(isFieldExists(data[1])?data[1]:""),
		Group:(isFieldExists(data[2])?data[2]:"USERS"),
	}
	GLOBAL.Compiler.AJAX( "Login", "deleteGroup", OpObject, LoginSuc );
};
//删除->A用户组下->B用户
GLOBAL.Login.deleteGroupUser = function(data){
	// console.log(data);
	var OpObject = {
		Name:(isFieldExists(data[1])?data[1]:""),
		Group:(isFieldExists(data[2])?data[2]:"USERS"),
	}
	GLOBAL.Compiler.AJAX( "Login", "deleteGroupUser", OpObject, LoginSuc );
};
//更改->A用户组->名字
GLOBAL.Login.alterGroup = function(data){
	// console.log(data);
	var OpObject = {
		Name:(isFieldExists(data[1])?data[1]:""),
		alterName:(isFieldExists(data[2])?data[2]:"USERS"),
	}
	GLOBAL.Compiler.AJAX( "Login", "alterGroup", OpObject, LoginSuc );
};
//更改->A用户组->B用户->名字 密码 其他
GLOBAL.Login.alterGroupUser = function(data){
// console.log(data);
var OpObject = {
	// UserName:data[1],
	// UserPassword:(data[2]||"")
}
GLOBAL.Compiler.AJAX( "Login", "alterGroupUser", OpObject, LoginSuc );
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
// 登陆回调接口
function ShowDetail(data){
  if (line( "<b>|----ShowDetail----|<b>" , false )) {
		if (data.status.Judge) {	//成功
			if(line( data.status.Info , false ))
				if (isFieldExists( data.response.NameList )) {
					line( data.response.NameList , false );
					if (line( "<b>|----NameList----|<b>" , false )) {
						funcName += "<blockquote>";
						for(keyName in data.response.NameList){
							funcName += "<p><b>"+keyName+"</b>:"+data.response.NameList[keyName]+"</p>";
						}
						funcName += "</blockquote>";
						if ( line( funcName , false ) ){
							line( "Hope it will help you!" , false );
						}
					}
				}
				if (isFieldExists( data.response.DetailList )) {
					line( data.response.DetailList , false );
					if (line( "<b>|----DetailList----|<b>" , false )) {
						funcName += "<blockquote>";
						for(keyName in data.response.DetailList){
							funcName += "<p><b>"+keyName+"</b>:"+data.response.DetailList[keyName]+"</p>";
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