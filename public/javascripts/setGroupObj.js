var path = require('path');

var STATUS = require( path.join(__dirname, '/setStatusObj') );
var DATE = require( path.join(__dirname, '/setDateObj') );
var Login = require( path.join(__dirname, '/setLoginObj') );	//用户管理文件
/*
	用户组对象设置
 */
exports = module.exports = function( LeaderDir, data ){ // Name, Jurisdiction
	// console.log(LeaderDir,data);
	try{
		this.Name = ( data.Name && data.Name != "" ? data.Name: "GROUP" + (LeaderDir.length||0) );		//用户组名————————|
		this.Jurisdiction = ( data.Jurisdiction && data.Jurisdiction != 0 ? 1 : 0 );									//用户组权限——————|————1-PermissionGroup 0-NonPermissionGroup
		this.CreationTime = ( data.CreationTime || DATE() );																					//用户组创建时间——|————当前时间
		this.Size = ( data.Size || 0 );																																//用户组人数——————|
		this.UsersIncluded = {};
		this.Status("000");																																						//状态标识————————|————STATUS
		this.init( data.UsersIncluded );																															//用户组包含用户——|————UsersIncluded(数组)

		// this.Number = LeaderDir.length,																														//用户组编号——————|————自动编号
	} catch( error ) {
		this.Status("999");																																						//状态标识————————|————STATUS
		console.error( "ERROR:" + error );
	}
	if ( LeaderDir == "ROOT" ) {
		var tempData = {
			"ROOT":{
				Name:"ROOT",
				Password:"ROOT"
			}
		};
		if ( !data.UsersIncluded )
			this.createUser( tempData["ROOT"] );
		else if ( isEmptyObject(data.UsersIncluded) )
			this.createUser( tempData["ROOT"] );
		else if ( !isFieldExists(data.UsersIncluded["ROOT"]) )
			this.createUser( tempData["ROOT"] );
	}
}
// 本地用户组初始化
exports.prototype.init = function( data ){
	// console.log("初始化"+data);
	if ( isFieldExists(data) ) {
		for ( key in data ) {
			this.createUser( data[key] );
			if( !this[key].Status() ){
				this.Status( this[key].STATUS[Num] );
				console.error( "ERROR:When we creat user name \"" + key + "\", there is running for a problem !" );
			}
		}
	}
	this.refresh();
	return true;
}
// 新建用户组下用户
exports.prototype.createUser = function( data ){
	var feedback = {
		DATA:"",
		STATUS:STATUS["999"]	//操作失败
	};
	if ( !isFieldExists(data) )
		data = {};
	if ( !isFieldExists(data.Name) || data.Name == "" )
		data.Name = this.Name + (this.UsersIncluded.length||0);
	// if( isFieldExists(this.UsersIncluded[data.Name]) ){
	// 	feedback["STATUS"] = STATUS["999"];	//该用户已存在!
	// 	return feedback;
	// }
	// console.log("新建用户:"+JSON.stringify(data));
	this.UsersIncluded[data.Name] = new Login( this, (data||"") );
	feedback["DATA"] = this.UsersIncluded[data.Name];
	feedback["STATUS"] = STATUS["000"];	//操作成功
	this.refresh();
	// } else {
	// 	feedback["STATUS"] = GOBAL.STATUS["999"];	//用户创建失败
	// }
	return feedback;
}
// 重命名用户组下用户
exports.prototype.renameUser = function( formerName, Name ){
	var feedback = {
		DATA:"",
		STATUS:STATUS["999"]	//操作失败
	};
	if( !isEmptyObject(this.UsersIncluded) && isFieldExists(this.UsersIncluded[Name]) ){
		feedback["STATUS"] = STATUS["999"];	//该文件已存在!
		return feedback;
	}
	this.UsersIncluded[Name] = this.UsersIncluded[formerName];
	feedback["DATA"] = this.UsersIncluded[Name];
	feedback["STATUS"] = STATUS["000"];	//操作成功
	feedback["STATUS"]["Judge"] = delete this.UsersIncluded[formerName];
	this.refresh();
	return feedback;
}
// 删除用户组下用户
exports.prototype.deleteUser = function( data ){
	var feedback = {
		DATA:"",
		STATUS:STATUS["999"]	//操作失败
	};
	if( isEmptyObject(this.UsersIncluded) || !isFieldExists(this.UsersIncluded[data.Name]) ){
		feedback["STATUS"] = STATUS["999"];	//该用户不存在!
		return feedback;
	}
	if ( this.Name != "ROOT" && data != "ROOT" ) {
		feedback["DATA"] = this.UsersIncluded[data];
		feedback["STATUS"] = STATUS["000"];	//操作成功
		feedback["STATUS"]["Judge"] = delete this.UsersIncluded[data];
	} else {
		feedback["STATUS"] = STATUS["999"];	//该用户无法删除
	}
	this.refresh();
	return feedback;
}
// 信息刷新-用户组
exports.prototype.refresh = function(){
	if ( isFieldExists(this.UsersIncluded) ) {
		this.Size = (this.UsersIncluded.length||0);
	}else{
		this.UsersIncluded = [];
	}
	return this.Size;
}
// 标记量更改和获取
exports.prototype.Status = function( data ){
	// console.log(data);
	if ( isFieldExists(data) ) {
		this.STATUS = STATUS[data];
	} else if ( !isFieldExists(this.STATUS) ) {
		this.STATUS = STATUS["000"];
	}
	return this.STATUS["Judge"];
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