/*
	文件系统
		case "checkFolder": 				//查询->指定路径->正确
		case "checkFolderAll": 			//显示->指定目录下所有文件 --可见 --不可见 //显示->指定目录文件内容
		case "checkFolderDetail": 	//显示->指定目录详情
		case "newFolder": 					//新建->A目录/文件->指定目录
		case "deleteFolder": 				//删除->指定目录下->A目录/文件
		case "alterFolder": 				//修改->A目录/文件->密码 权限 可见性 文件内容--仅文件
*/
//查询->指定路径->正确
GLOBAL.Folder.checkFolder = function(data){
	// console.log(data);
	var OpObject = {
		// UserName:(isFieldExists(data[1])?data[1]:""),
		// UserPassword:(isFieldExists(data[2])?data[2]:"")
	}
	GLOBAL.Compiler.AJAX( "Folder", "checkFolder", OpObject, LoginSuc );
};
//显示->指定目录下所有文件 --可见 --不可见 //显示->指定目录文件内容
GLOBAL.Folder.checkFolderAll = function(data){
	// console.log(data);
	var OpObject = {
		Name:(isFieldExists(data[1])?data[1]:""),
		// UserPassword:(isFieldExists(data[2])?data[2]:"")
	}
	GLOBAL.Compiler.AJAX( "Folder", "checkFolderAll", OpObject, getObjectSuc );
};
//显示->指定目录详情
GLOBAL.Folder.checkFolderDetail = function(data){
	// console.log(data);
	var OpObject = {
		Name:(isFieldExists(data[1])?data[1]:""),
		// UserPassword:(isFieldExists(data[2])?data[2]:"")
	}
	GLOBAL.Compiler.AJAX( "Folder", "checkFolderDetail", OpObject, getObjectSuc );
};
//新建->A目录/文件->指定目录
GLOBAL.Folder.newFolder = function(data){
	// console.log(data);
	var OpObject = {
		Name:(isFieldExists(data[1])?data[1]:""),
		// UserPassword:(isFieldExists(data[2])?data[2]:"")
	}
	GLOBAL.Compiler.AJAX( "Folder", "newFolder", OpObject, getObjectSuc );
};
//删除->指定目录下->A目录/文件
GLOBAL.Folder.deleteFolder = function(data){
	// console.log(data);
	var OpObject = {
		Name:(isFieldExists(data[1])?data[1]:""),
		// UserPassword:(isFieldExists(data[2])?data[2]:"")
	}
	GLOBAL.Compiler.AJAX( "Folder", "deleteFolder", OpObject, getObjectSuc );
};
//修改->A目录/文件->密码 权限 可见性 文件内容--仅文件
GLOBAL.Folder.alterFolder = function(data){
	// console.log(data);
	var OpObject = {
		Name:(isFieldExists(data[1])?data[1]:""),
		// UserPassword:(isFieldExists(data[2])?data[2]:"")
	}
	GLOBAL.Compiler.AJAX( "Folder", "alterFolder", OpObject, getObjectSuc );
};
GLOBAL.Folder.cd = function(data){
	dirData = data[1].split('/');
	console.log(dirData);
	for (var i = 0; i < dirData.length; i++) {
		if(dirData[i] == "..")
			$("#toolsLeft").children("span:last-child").remove();
		else if (dirData[i] == ".")
			;
		else if (dirData[i] != "")
			$("#toolsLeft").append("<span>"+dirData[i]+"<b>/</b></span>");
	}
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
	// 对象返回接口
	function getObjectSuc(data){
	  if (line( "<b>|----getObjectSuc----|<b>" , false )) {
			if (data.status.Judge) {	//成功
				if(line( data.status.Info , false ))
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
			} else {	//失败
				line( data.status.Info , false );
			}
		}
		line( "Function login it success!" , false );
	}