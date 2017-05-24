var path = require('path');

var STATUS = require( path.join(__dirname, '/setStatusObj') );
var DATE = require( path.join(__dirname, '/setDateObj') );
/*
	用户对象设置
 */
exports = module.exports = function( LeaderDir, data ){	// Group, Name, Password, NickName, Gender, Age
	console.log(LeaderDir,data);
	try{
		// this.Group = ( data.Group && data.Group != "" ? data.Group : LeaderDir ),										//用户组——————————|————ROOT:权限组 USER:非权限组
		this.Name = ( data.Name && data.Name != "" ? data.Name : LeaderDir + LeaderDir.UserTotal ),			//用户名——————————|————自动名称为:组名+Number
		this.Encryption = ( data.Password && data.Password != "" ? 1 : 0 ),															//用户密码设置————|————1-已加密 0-未加密
		this.Password = ( data.Password && data.Password != "" ? data.Password : "" ),									//用户密码————————|
		this.NickName = ( data.NickName && data.NickName != "" ? data.NickName : data.Name ),						//用户昵称————————|————NickName 默认为:Name
		this.setGender( data.Gender );																																	//用户性别————————|————Gender
		this.setAge( data.Age  );																																				//用户年龄————————|————Age
		this.CreationTime = ( data.CreationTime || DATE() );																						//用户创建时间————|————当前时间
		this.Status("000");																																							//状态标识————————|————STATUS

		// this.Number = LeaderDir.Login[( Group ? Group : "USER" )].length,														//用户编号————————|————自动编号
		// this.Jurisdiction = 2,																																				//用户权限————————|————0-ROOT 1-GROUP 2-SELF
		// this.signState = 0																																						//登陆状态————————|————0-注销 1-登陆
	} catch( error ) {
		this.Status("999");																																							//状态标识————————|————STATUS
		console.error( "ERROR:" + error );
	}
}
// 用户密码重设
exports.prototype.setPassword = function( data ){	//Password:新用户密码
	var feedback = {
		DATA:"",
		STATUS:STATUS["999"]	//操作失败
	};
	if ( data && data != "" ) {
		this.Encryption = 1;
		this.Password = data;
		feedback["STATUS"] = STATUS["000"];	//操作成功
	} else {
		this.Encryption = 0;
		this.Password = "";
		feedback["STATUS"] = STATUS["000"];	//操作成功
	}
	return feedback;
}
// 用户昵称重设
exports.prototype.setNickName = function( data ){	//NickName:新用户昵称
	var feedback = {
		DATA:"",
		STATUS:STATUS["999"]	//操作失败
	};
	if ( isFieldExists(data) ) {
		this.NickName = data;
		feedback["STATUS"] = STATUS["000"];	//操作成功
	} else {
		this.NickName = this.Name;
		feedback["STATUS"] = STATUS["000"];	//操作成功
	}
	return feedback;
}
// 用户性别重设
exports.prototype.setGender = function( data ){	//Gender:新用户性别
	var feedback = {
		DATA:"",
		STATUS:STATUS["999"]	//操作失败
	};
	if ( isFieldExists(data) ) {
		this.Gender = data;
		feedback["STATUS"] = STATUS["000"];	//操作成功
	} else {
		this.Gender = "";
		feedback["STATUS"] = STATUS["000"];	//操作成功
	}
	return feedback;
}
// 用户年龄重设
exports.prototype.setAge = function( data ){	//Age:新用户年龄
	var feedback = {
		DATA:"",
		STATUS:STATUS["999"]	//操作失败
	};
	if ( isFieldExists(data) ) {
		this.Age = data;
		feedback["STATUS"] = STATUS["000"];	//操作成功
	} else {
		this.Age = "";
		feedback["STATUS"] = STATUS["000"];	//操作成功
	}
	return feedback;
}
// 信息刷新-用户
exports.prototype.refresh = function(){
	return null;
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