var path = require('path');

var STATUS = require( path.join(__dirname, '/setStatusObj') );
var DATE = require( path.join(__dirname, '/setDateObj') );
/*
	文件对象设置
 */
exports = module.exports = function( LeaderDir, data ){ // Type, Name, Password, Directory, Creator, Jurisdiction, Visibility
	// console.log( JSON.stringify(LeaderDir) );
	try{
		if ( !data.Type ) {
			throw "创建文件发生错误!";
		}
		this.Name = ( data.Name && data.Name != "" ? data.Name: "NEW_FILE" );																					//文件名——————————————————|————自动命名为:NEW_FILE
		this.Encryption = ( data.Password && data.Password != "" ? 1 : 0 );																						//文件是否加密————————————|————1-已加密 0-未加密
		this.Password = ( data.Password && data.Password != "" ? data.Password : "" );																//文件密码————————————————|
		this.Creator = ( data.Creator && data.Creator != "" ? data.Creator: "" );																			//文件创建者——————————————|
		this.setOwner( data.Owner || data.Creator || "ROOT" );																												//文件所有者——————————————|————Owner 默认为文件创建者
		this.Jurisdiction = ( data.Jurisdiction && data.Jurisdiction.length == 3 ? data.Jurisdiction : "777");				//文件权限————————————————|————用户-所在组-其他组 READ-4 WRITE-2 FUNCTION-1 NONE-0
		this.Visibility = ( data.Visibility && data.Visibility != 0 ? 1 : 0 );																				//文件可见性——————————————|————用户-所在组-其他组 VISIBLE-1 INVISIBLE-0
		this.CreationTime = ( data.CreationTime || DATE() );																													//文件创建时间————————————|————当前时间
		this.ModificationTime = ( data.ModificationTime || DATE() );																									//文件修改时间————————————|————默认为当前时间
		this.Status("000");																																														//状态标识————————————————|————STATUS
		this.init( data.Type, data.Contain, data.Size );																															//文件初始化——————————————|————Type Contain Size

		// this.Number:"",																																														//文件编号————————————————|————自动编号
		// this.Directory = ( LeaderDir || "FILE" );																																			//所在目录————————————————|
		// this.DirectoryDetailed:( data.Directory && data.Directory != "" ? data.Directory : "" ),										//文件绝对位置————————————|
	} catch( error ) {
		this.Status("999");																																														//状态标识————————————————|————STATUS
		console.error( "ERROR:" + error );
	}
}
// 本地文件目录初始化
exports.prototype.init = function( Type, Contain, Size ){//Type-文件夹类型/[后缀名]类型;Contain-文件内容或包含文件;Size:文件大小或包含文件数
	if ( isFieldExists(Type) ) {
		this.Type = ( Type != "" ? Type : "文件夹" ) + ( Type.indexOf("类型") == -1 ? "类型" : "" );
	}
	if ( isFolder(Type) || Type == "" ) {
		// 文件夹类型
		if( isFieldExists(Contain) )
			for( key in Contain ){
				this.Contain[key] = new exports( this, Contain[key] );
			}
		else
			this.Contain = [];
	} else {
		// 普通文件类型
		this.Contain = ( Contain || "" );
	}
	this.Size = ( Size || 0 );
	// this.refresh();
}
// 文件夹下文件删除
exports.prototype.deleteFolder = function( Name ){
	var feedback = {
		DATA:"",
		STATUS:STATUS["999"]	//操作失败
	};
	if( !isFieldExists(this.Contain[Name]) ){
		feedback["STATUS"] = STATUS["999"];	//文件夹不存在!
		return feedback;
	}
	if ( Name != "Folder" ) {
		delete this.Contain[Name];
		feedback["STATUS"] = STATUS["000"];	//操作成功
	} else {
		feedback["STATUS"] = STATUS["999"];	//该文件夹无法删除!
	}
	this.refresh();
	return feedback;
}
// 文件夹下文件名重设
exports.prototype.setName = function( formerName, Name ){	//Name:新文件名
	var feedback = {
		DATA:"",
		STATUS:STATUS["999"]	//操作失败
	};
	if( isFieldExists(this.Contain[Name]) ){
		feedback["STATUS"] = STATUS["999"];	//该文件已存在!
		return feedback;
	}
	this.Contain[Name] = this.Contain[formerName];
	delete this.Contain[formerName];
	feedback["STATUS"] = STATUS["000"];	//操作成功
	this.refresh();
	return feedback;
}
// 用户密码重设
exports.prototype.setPassword = function( Password ){	//Password:新用户密码
	var feedback = {
		DATA:"",
		STATUS:STATUS["999"]	//操作失败
	};
	if ( Password && Password != "" ) {
		this.Encryption = 1;
		this.Password = Password;
		feedback["STATUS"] = STATUS["000"];	//密码重置成功
	} else {
		this.Encryption = 0;
		this.Password = "";
		feedback["STATUS"] = STATUS["000"];	//密码重置成功
	}
	this.refresh();
	return feedback;
}
// 文件类型重设
exports.prototype.setType = function( Type ){	//Type:新文件类型
	var feedback = {
		DATA:"",
		STATUS:STATUS["999"]	//操作失败
	};
	if ( !isFolder(this.Type) && !isFolder(Type) ) {
		this.Type = Type + "类型";
		feedback["STATUS"] = STATUS["000"];	//操作成功
	} else {
		feedback["STATUS"] = STATUS["999"];	//修改"文件类型"方式发生错误!
	}
	this.refresh();
	return feedback;
}
// 文件所有者重设
exports.prototype.setOwner = function( Owner ){	//Owner:新文件所有者
	var feedback = {
		DATA:"",
		STATUS:STATUS["999"]	//操作失败
	};
	// console.log("文件所有者"+Owner);
	if ( isFieldExists(Owner) ) {
		this.Owner = Owner;
		feedback["STATUS"] = STATUS["000"];	//操作成功
	} else {
		feedback["STATUS"] = STATUS["999"];	//请输入所有者
	}
	this.refresh();
	return feedback;
}
// 文件权限重设
exports.prototype.setJurisdiction = function( Jurisdiction ){	//Jurisdiction:新文件权限
	var feedback = {
		DATA:"",
		STATUS:STATUS["999"]	//操作失败
	};
	if ( Jurisdiction && Jurisdiction.length == 3 ) {
		this.Jurisdiction = Jurisdiction;
		feedback["STATUS"] = STATUS["000"];	//操作成功
	} else {
		feedback["STATUS"] = STATUS["999"];	//权限设置格式错误!
	}
	this.refresh();
	return feedback;
}
// 文件可见性重设
exports.prototype.setVisibility = function( Visibility ){	//Visibility:新文件可见性
	var feedback = {
		DATA:"",
		STATUS:STATUS["999"]	//操作失败
	};
	this.Visibility = ( Visibility && Visibility != 0 ? 1 : 0 );
	feedback["STATUS"] = STATUS["000"];	//操作成功
	this.refresh();
	return feedback;
}
// 文件内容重写
exports.prototype.setContain = function( Contain ){	//Contain:文件内容
	var feedback = {
		DATA:"",
		STATUS:STATUS["999"]	//操作失败
	};
	if ( !isFolder(this.Type) ) {
		this.Contain = Contain;
		feedback["STATUS"] = STATUS["000"];	//操作成功
	} else {
		feedback["STATUS"] = STATUS["999"];	//修改"文件内容"方式发生错误!
	}
	this.refresh();
	return feedback;
}
// 信息刷新-文件修改时间
exports.prototype.refresh = function(){
	if ( isFieldExists(this.Contain) ) {
		this.Size = (this.Contain.length||0);	//文件大小或文件夹内文件数量更新
	}
	this.ModificationTime = DATE();	//文件修改时间更新
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
	// 文件类型判断
	function isFolder(e){
		if (e.indexOf("文件夹")!=-1) {
			return true;
		}else{
			return false;
		}
	}
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