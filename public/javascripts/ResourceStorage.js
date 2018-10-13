var path = require('path');
var fs = require("fs");
var $ = require("./jquery.min");
var GOBAL = {};
var Interval;
GOBAL.STATUS = require( path.join(__dirname, '/setStatusObj') );
GOBAL.Login = require( path.join(__dirname, '/setGroupObj') );	//用户组管理文件
GOBAL.Folder = require( path.join(__dirname, '/setFolderObj') );	//文件资源管理文件
/*
	本地文件控制
 */
exports = module.exports = function(){
	try{
		// this.Folder = {};									//文件管理系统————|————根目录
		this.Login = {};										//用户管理————————|————默认用户组ROOT USERS ; 其中ROOT组下有默认用户ROOT
		this.refresh();											//用户总数量——————|————默认为0 UserTotal
		this.Status("040");									//状态标识————————|————STATUS
	} catch( error ) {
		this.Status("913");									//状态标识————————|————STATUS
		console.error( "ERROR:" + error );
	}
}
/* 本地文件读取并初始化 */
exports.prototype.init = function(){
	var local = this;
	/* 文件初始化模块 */
	// 检查目录下ResourceStorage文件是否存在
	fs.stat( path.join(__dirname, '../ResourceStorage.json'), function ( error, stats ) {
		if (error == null) {
			console.log("ResourceStorage文件状态:"+JSON.stringify(stats));
			// 读取ResourceStorage文件
			fs.readFile( path.join(__dirname, '../ResourceStorage.json'), function ( error, data ) {
			  if (error)
			  	throw error;
			  data = data.toString();
				console.log("ResourceStorage文件内容:"+data);
				if( data == "" || data == {} || data == null )
					local.Save();
				else if ( local.Initialization( data ) ) {
					// console.log('ResourceStorage set already!');
				  // console.log( data.toString() );
					local.Status("040");
					// // 保存文件
					// local.Save();
			  } else {
					// 初始化ResourceStorage文件
					local.Save();
			  }
			});
		} else {
			console.error(error);
			// 初始化ResourceStorage文件
			local.Save();
		}
	});
	return true;
}
// 按数据流初始化数据结构
exports.prototype.Initialization = function( data ){
	// console.log(data);
	if ( typeof data != 'object' )
		data = eval( '(' + data + ')' );
	var initStatus = true,
		local = this;
	if( data.length != 0 )
		for( key in data ){
			if ( isFieldExists(data[key]) ) {
				switch( key ){
					case "Login":
						if( data[key].length != 0 )
							for( keyName in data[key] ){
								this.createNew(key,this[key][keyName]);
							}
						break;
					case "Folder":
						this.createNew(key,this[key]);
						break;
					default:
						this[key] = data[key];
						break;
				}
			} else {
				initStatus = false;
			}
		}
	var tempData = {
		"ROOT":{
			"Name":"ROOT",
			"Jurisdiction":1
		},
		"USERS":{
			"Name":"USERS",
			"Jurisdiction":0
		},
		"Folder":{
			"Name":"Folder",
			"Type":"文件夹"
		}
	};
	do{
		// console.log(JSON.stringify(this.Folder));
		if ( !isFieldExists(data["Login"]["ROOT"]) && !isFieldExists(this["Login"]["ROOT"]) ) {
			this.createNew("Login",tempData["ROOT"]);
		}else	if ( !isFieldExists(data["Login"]["USERS"]) && !isFieldExists(this["Login"]["USERS"]) ) {
			this.createNew("Login",tempData["USERS"])
		}else	if ( !isFieldExists(data) && !isFieldExists(this["Folder"]) ) {
			this["Folder"] = {};
			this.createFile(this["Folder"],tempData["Folder"])
		}else{
			var setTimeTri = setTimeout(function() {
				local.Save();
			}, 3000);
			break;
		}
	}while(true);
	return initStatus;
}
// 创建新的用户组
exports.prototype.createNew = function( key, data ){	//	key:创建对象类型;data:对象详情
	var feedback = {
		DATA:"",
		STATUS:GOBAL.STATUS["999"]	//操作失败
	};
	// console.log(feedback);
	if ( isFieldExists(data) ) {
		if ( !isFieldExists(data.Name) || data.Name == "" )
			data.Name = "GROUP-" + (this.Login.length||0);
		// if( isFieldExists(this[key][data.Name]) ){
		// 	feedback["STATUS"] = STATUS["810"];	//该用户组已存在!
		// 	return feedback;
		// }
		this[key][data.Name] = new GOBAL[key]( data.Name, data );
		feedback["DATA"] = this[key][data.Name];
		feedback["STATUS"] = GOBAL.STATUS["020"];	//操作成功
	} else {
		feedback["STATUS"] = GOBAL.STATUS["999"];	//用户组创建失败
	}
	return feedback;
}
// 用户组删除
exports.prototype.deleteGroup = function( Name ){
	var feedback = {
		DATA:"",
		STATUS:GOBAL.STATUS["999"]	//操作失败
	};
	// console.log( (!isFieldExists(this.Login[Name]) || Name == "") );
	if( !isFieldExists(this.Login[Name]) || Name == "" ){
		feedback["STATUS"] = STATUS["811"];	//该用户组不存在!
		return feedback;
	}
	// console.log(Name+":"+(Name != "ROOT" && Name != "USERS" && isEmptyObject(this.Login[Name].UsersIncluded)));
	if ( Name != "ROOT" && Name != "USERS" && isEmptyObject(this.Login[Name].UsersIncluded) ) {
		// console.log(this.Login[Name]);
		feedback["DATA"] = this.Login[Name];
		feedback["STATUS"] = GOBAL.STATUS["000"];	//操作成功
		feedback["STATUS"]["Judge"] = delete this.Login[Name];
	} else {
		feedback["STATUS"] = GOBAL.STATUS["999"];	//该用户组无法删除
	}
	return feedback;
}
// 用户组名重设
exports.prototype.setName = function( formerName, Name ){	//Name:新用户组名
	var feedback = {
		DATA:"",
		STATUS:GOBAL.STATUS["999"]	//操作失败
	};
	if( !isFieldExists(this.Login[formerName]) || formerName == "" ){
		feedback["STATUS"] = STATUS["811"];	//该用户组不存在!
		return feedback;
	}
	console.log(feedback);
	if ( !isFieldExists(Name) || Name == "" )
		data.Name = "GROUP-" + (this.Login.length||0);
	if( isFieldExists(this.Login[Name]) ){
		feedback["STATUS"] = STATUS["810"];	//该用户组已存在!
		return feedback;
	}
	this.Login[formerName].Name = Name;	//更改用户组名
	this.Login[Name] = this.Login[formerName];	//更改用户组路径
	feedback["DATA"] = this.Login[Name];
	feedback["STATUS"] = GOBAL.STATUS["000"];	//操作成功
	feedback["STATUS"]["Judge"] = delete this.Login[formerName];	//删除原用户组路径
	return feedback;
}
// 当前组用户更改用户组
exports.prototype.convertGroup = function( formerGroup, LatterGroup, Name ){	//Name:用户名 LatterGroup:转换组
	var feedback = {
		DATA:"",
		STATUS:GOBAL.STATUS["999"]	//操作失败
	};
	if( isFieldExists(this.Login[LatterGroup].UsersIncluded[Name]) ){
		feedback["STATUS"] = STATUS["820"];	//该用户已存在!
		return feedback;
	}
	this.Login[LatterGroup].UsersIncluded[Name] = this.Login[formerGroup].UsersIncluded[Name];
	feedback["DATA"] = this.Login[LatterGroup].UsersIncluded[Name];
	feedback["STATUS"] = GOBAL.STATUS["000"];	//操作成功
	feedback["STATUS"]["Judge"] = delete this.Login[formerGroup].UsersIncluded[Name];
	return feedback;
}
// 创建新的目录
exports.prototype.createFile = function( key, data ){	//	key:创建对象所在目录对象;data:对象详情
	var feedback = {
		DATA:"",
		STATUS:GOBAL.STATUS["999"]	//操作失败
	};
	// console.log(JSON.stringify(this.Folder));
	if ( isFieldExists(data) ) {
		if ( !isFieldExists(data.Name) || data.Name == "" )  {
			data.Name = "NEW_FILE";
		}
		if( !isFieldExists(key[data.Type]) ){
			data.Type = "文件夹";
		}
		if ( !isFieldExists(key) || key == "" ){
			key = {};
			key[data.Name] = {};
		}
		key[data.Name] = new GOBAL.Folder( key, data );
		feedback["DATA"] = key[data.Name];
		// feedback["STATUS"] = GOBAL.STATUS["000"];	//操作成功
		feedback["STATUS"] = key[data.Name].STATUS;	//操作状态继承
	} else {
		feedback["STATUS"] = GOBAL.STATUS["999"];	//文件创建失败
	}
	return feedback;
}
// 刷新信息-用户数量更新
exports.prototype.refresh = function(){
	var total = 0;
	if (this.Login.length) {
		for( key in this.Login ){
			total += ( this.Login[key].length || 0 );
		}
		this.UserTotal = total;
	}
	return total;
}
// 标记量更改和获取
exports.prototype.Status = function( data ){
	// console.log(data);
	if ( isFieldExists(data) ) {
		this.STATUS = GOBAL.STATUS[data];
	} else if ( !isFieldExists(this.STATUS) ) {
		this.STATUS = GOBAL.STATUS["999"];
	}
	// console.log(this.STATUS);
	return this.STATUS["Judge"];
}
// 对象保存到本地
exports.prototype.Save = function(){
	var local = this;
	var tempData = {
		"ROOT":{
			"Name":"ROOT",
			"Jurisdiction":1
		},
		"USERS":{
			"Name":"USERS",
			"Jurisdiction":0
		},
		"Folder":{
			"Name":"Folder",
			"Type":"文件夹"
		}
	};
	do{
		// console.log(JSON.stringify(this.Folder));
		if ( !isFieldExists(this["Login"]["ROOT"]) ) {
			this.createNew("Login",tempData["ROOT"]);
		}else	if ( !isFieldExists(this["Login"]["USERS"]) ) {
			this.createNew("Login",tempData["USERS"])
		}else	if ( !isFieldExists(this["Folder"]) ) {
			this["Folder"] = {};
			this.createFile(this,tempData["Folder"])
		}else{
			console.log("ResourceStorage文件存储:"+JSON.stringify(local));
			// 本地保存ResourceStorage文件
			fs.writeFile( path.join(__dirname, '../ResourceStorage.json'), JSON.stringify(local) , function ( error ) {
			  if (error) 
			  	throw error;
			  console.log('ResourceStorage set already!');
			  local.Status("050");
			});
			break;
		}
	}while(true);
	// /* 每五分钟中执行一次文件存储 */
	// if (!isFieldExists(Interval)) {
	// 	Interval = setInterval(function() {
	// 	  local.Save();
	// 	}, 3000);
	// }
}
// 权限校验
exports.prototype.AuthorizationCheck = function( Group, User, data, how ){	//User:使用者 data:待授权文件对象;how:实际操作
	var RIGHT = false;
	console.log(Group+"-"+ User+"-"+ data.Owner+"-"+ how);
	if ( User == data.Owner ) {
		RIGHT = this.isFeasible( data.Jurisdiction[0], how );
	} else if ( isFieldExists(data[Group][User]) ) {
		RIGHT = this.isFeasible( data.Jurisdiction[1], how );
	} else if ( this.Login.SelectTokens("$.."+data.Owner) ) {
		RIGHT = this.isFeasible( data.Jurisdiction[2], how );
	} else {
		console.error("文件授权出现未知错误!");
	}
	// console.log(RIGHT);
	return RIGHT;
}
// 权限校验-D
exports.prototype.isFeasible = function( Actual, Needed ){	//Actual:实际权限;Needed:所需权限
	feasible = false;
	// console.log(Actual+"-"+Needed);
	switch( Needed ){
		case 0:
			feasible = true;
			break;
		case 1:
			if ( Actual%2 == 1 )
				feasible =true;
			break;
		case 2:
			if ( parseInt(Actual/2)%2 == 1 )
				feasible =true;
			break;
		case 4:
			if ( parseInt(parseInt(Actual/2)/2) == 1 )
				feasible =true;
			break;
		default:
			console.error("权限查询出现错误!");
	}
	return feasible;
}

/* 快捷工具函数 */
	// 字段存在性验证
	function isFieldExists(e){
		if (e&&e!=undefined) {
			return true;
		}else{
			return false;
		}
	}
	//判断对象是否为空
	function isEmptyObject(e){
	    var t;
	    for (t in e)
	        return !1;
	    return !0;
	};
