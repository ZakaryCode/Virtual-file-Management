/*
	文件系统
		case "checkFolder": 				//查询->指定路径->正确
		case "checkFolderAll": 				//显示->指定目录下所有文件 --可见 --不可见 //显示->指定目录文件内容
		case "checkFolderDetail": 			//显示->指定目录详情
		case "newFolder": 					//新建->A目录/文件->指定目录
		case "deleteFolder": 				//删除->指定目录下->A目录/文件
		case "alterFolder": 				//修改->A目录/文件->密码 权限 可见性 文件内容--仅文件
*/
//查询->指定路径->正确
GLOBAL.Folder.cd = function(data){
	dirData = data[1].split('/');
	Path = [];
	console.log(dirData);
	for (var i = 0; i < dirData.length; i++) {
		if(dirData[i] == "..")
			$("#toolsLeft").children("span:last-child").remove();
		else if (dirData[i] == ".")
			;
		else if (dirData[i] != "")
			Path.push(dirData[i]);
		if(!isEmptyObject(Path))
			checkFolder(Path);
		else
			line("操作成功", false);
	}
};
//显示->指定目录下所有文件 --可见 --不可见 //显示->指定目录文件内容
GLOBAL.Folder.checkFolderAll = function(data){
	// console.log(data);
	var OpObject = {
		Name:(isFieldExists(data[1])?data[1]:""),//visible
	}
	GLOBAL.Compiler.AJAX( "Folder", "checkFolderAll", OpObject, ShowDetail );
};
//显示->指定目录详情
GLOBAL.Folder.checkFolderDetail = function(data){
	// console.log(data);
	var OpObject = {
		Name:(isFieldExists(data[1])?data[1]:""),
	}
	GLOBAL.Compiler.AJAX( "Folder", "checkFolderDetail", OpObject, ShowDetail );
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
	if (data[1] == "A"||data[1] == "a"){
		var alterFunc = "checkFolderAll";
	}else if (data[1] == "D"||data[1] == "d"){
		var alterFunc = "checkFolderDetail";
	}else{
		line( "<b>请输入具体修改方式 A-All D-Detail<b>" , false )
		return;
	}
	var OpObject = {
		Name:(isFieldExists(data[2])?data[2]:""),
	}
	GLOBAL.Compiler.AJAX( "Folder", alterFunc, OpObject, getFWObjectSuc );
};
//修改->A目录/文件->密码 权限 可见性 文件内容--仅文件
function alterFolderSubmit(data){
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
	GLOBAL.Compiler.AJAX( "Folder", "alterFolder", OpObject, getObjectSuc );
};
//查询->指定路径->正确
function checkFolder(data){
	// console.log(data);
	var OpObject = {
		Path:data
	}
	GLOBAL.Compiler.AJAX( "Folder", "checkFolder", OpObject, cdSuc );
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
// 移动路径位置
function cdSuc(data){
	if (line( "<b>|----cdSuc----|<b>" , false )) {
		if (data.status.Judge) {	//成功
			line(data.status.Info, false);
			for(i=0;i<data.response.Path.length;i++)
				$("#toolsLeft").append("<span>" + data.response.Path[i] + "<b>/</b></span>");
		} else {	//失败
			line(data.status.Info, false);
		}
	}
}
// 可写对象返回接口
function getFWObjectSuc(data){
	getFocus(false);
	if (line( "<b>|----getWObjectSuc----|<b>" , false )) {
		if (data.status.Judge) {	//成功
			if(line( data.status.Info , false )) {
				if (isFieldExists( data.response.NameList ) && !isEmptyObject( data.response.NameList )) {
					var funcName = "";
					if (line( "<b>|----NameList----|<b>" , false )) {
						funcName += "<blockquote>";
						for(keyName in data.response.NameList){
							if(typeof data.response.NameList[keyName] != "object")
								funcName += "<p id='"+keyName+"'><b>"+(keyName)+"</b>:<span contenteditable='true' former ='"+data.response.NameList[keyName]+"' >"+data.response.NameList[keyName]+"</span></p>";
						}
						funcName += "<button style='background-color:#222;color:#999;border:1px solid #EEE;width:100%;float:right;' onclick='alterFolderSubmit(this.parentNode)'>提交</button>"
							+"</blockquote>";
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
							if(typeof data.response.DetailList[keyName] != "object")
								funcName += "<p id='"+keyName+"'><b>"+(keyName)+"</b>:<span contenteditable='true' former ='"+data.response.DetailList[keyName]+"' >"+data.response.DetailList[keyName]+"</span></p>";
						}
						funcName += "<button style='background-color:#222;color:#999;border:1px solid #EEE;width:100%;float:right;' onclick='alterFolderSubmit(this.parentNode)'>提交</button>"
							+"</blockquote>";
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
};
