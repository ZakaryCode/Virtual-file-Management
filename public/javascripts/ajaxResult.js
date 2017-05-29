var path = require('path');

var STATUS = require( path.join(__dirname, '/setStatusObj') );
var ResourceStorage = require( path.join(__dirname, '/ResourceStorage') );
var Dir = new ResourceStorage();	//	文件资源管理器
/* 检测本地文件，初始化并检测状况 */
if (Dir.init()) {
	/* 每五分钟中执行一次文件存储 */
	Interval = setInterval(function() {
		Dir.Save();
	}, 300000);
}
exports = module.exports = function(ajaxQuery,ajaxBodeReques,callback){
	// 验证回调正确
	if (typeof callback == "function") {
		this.callback = callback;
		this.Result();
	}
	switch(ajaxQuery){
		case "Login":
		case "Folder":
		// console.log(ajaxBodeReques);
			ajaxBodeReques = JSON.parse(ajaxBodeReques);
			if(!isFieldExists(ajaxBodeReques["currentUser"])){
					this.turnBack("902");//未填入当前用户
					return;
			}
			else if(!isFieldExists(ajaxBodeReques["currentOperation"])){
					this.turnBack("905");//未填入当前路径
					return;
			}
			else
					this[ajaxQuery](ajaxBodeReques);
			break;
		default:
			this.turnBack("900");
			return;
	}
}
/*
	var request = {
		currentDirectory:[],	//当前目录
		currentUser:{					//当前用户
			Group:"",				//当前用户所在组
			Name:""					//当前用户名
		},
		currentOperation:{		//当前操作
			OpType:"",			//操作类型
			OpObject:{}			//操作对象
		}
	}
 */
/* 用户操作模块 */
exports.prototype.Login = function(data){
	// console.log(data["currentOperation"].OpType);
	switch(data["currentOperation"].OpType){
		case "checkLogin": 				//查询->A用户->登陆 --名字存在 --密码正确
		case "checkGroups": 			//显示->所有用户组 	//显示->A用户组下->所有用户
		case "newGroup": 					//新建->A用户组
		case "newGroupUser": 			//新建->A用户组下->B用户
		case "deleteGroup": 			//删除->A用户组
		case "deleteGroupUser": 	//删除->A用户组下->B用户
		case "alterGroup": 				//更改->A用户组->名字
		case "alterGroupUser": 		//更改->A用户组->B用户->名字 密码 其他
			this[ data["currentOperation"].OpType ]( data );
			break;
		default:
			this.turnBack("906");
			return;
	}
}
/* 文件操作模块 */
exports.prototype.Folder = function(data){
	// console.log(data["currentOperation"].OpType);
	switch(data["currentOperation"].OpType){
		case "checkFolder": 				//查询->指定路径->正确
		case "checkFolderAll": 			//显示->指定目录下所有文件 --可见 --不可见 //显示->指定目录文件内容
		case "checkFolderDetail": 	//显示->指定目录详情
		case "newFolder": 					//新建->A目录/文件->指定目录
		case "deleteFolder": 				//删除->指定目录下->A目录/文件
		case "alterFolder": 				//修改->A目录/文件->密码 权限 可见性 文件内容--仅文件
			this[ data["currentOperation"].OpType ]( data );
			break;
		default:
			this.turnBack("906");
			return;
	}
}

/* 用户模块 */
//查询->A用户->登陆 --名字存在 --密码正确
exports.prototype.checkLogin = function(data){
	var TempForResponse = {};
	var Group = this.QueryUser( data["currentOperation"].OpObject.UserName );	//获取用户对应用户组
	// 是否找到对应用户
	// console.log("GROUP:"+Group);
	if ( Group && Group != false ) {
		// 判断["Login"]下[Group]用户组对应[登陆]用户是否存在
		if ( isFieldExists(Dir["Login"][Group].UsersIncluded[data["currentOperation"].OpObject.UserName]) ) {
			// 判断[登陆]用户是否加密
			if ( Dir["Login"][Group].UsersIncluded[data["currentOperation"].OpObject.UserName].Encryption == 1 ) {
				// 判断[登陆]用户是否输入密码
				if ( isFieldExists(data["currentOperation"].OpObject.UserPassword) ) {
					// 验证[登陆]用户输入密码正确性
					if ( Dir["Login"][Group].UsersIncluded[data["currentOperation"].OpObject.UserName].Password == data["currentOperation"].OpObject.UserPassword ) {
						// 用户密码验证成功->用户信息-用户组-取出
						TempForResponse.User = Dir["Login"][Group].UsersIncluded[data["currentOperation"].OpObject.UserName];
						TempForResponse.Group = Group;
						// 登陆成功
						this.turnBack("100",TempForResponse);
						return;
					} else {
						// 密码错误
						this.turnBack("802",TempForResponse);
						return;
					}
				} else {
					// 密码未输入
					this.turnBack("801",TempForResponse);
					return;
				}
			} else {
				// [登陆]用户未加密->用户信息-用户组->取出
				TempForResponse.User = Dir["Login"][Group].UsersIncluded[data["currentOperation"].OpObject.UserName];
				TempForResponse.Group = Group;
				// 登陆成功
				this.turnBack("000",TempForResponse);
				return;
			}
		} else {
			// 找不到对应用户
			this.turnBack("800",TempForResponse);
			return;
		}
	} else {
		// 找不到对应用户
		this.turnBack("800",TempForResponse);
		return;
	}
}
//显示->用户组
exports.prototype.checkGroups = function(data){
	var TempForResponse = {};
	// 判断[登陆]用户存在状态
	if( !this.isExisting(data["currentUser"].Group,data["currentUser"].Name) )
		return;
	if ( !isFieldExists(data["currentOperation"].OpObject) ) {
		this.turnBack("999",TempForResponse);
		return;
	}
	// 判断[登陆]用户是否输入用户组名
	if ( !isFieldExists(data["currentOperation"].OpObject.Group) ) {
		// ["Login"]下所有用户组->取出
		TempForResponse.NameList = [];
		TempForResponse.DetailList = [];
		for ( key in Dir["Login"])
			TempForResponse.NameList.push(key);
		// 数据读取成功
		this.turnBack("120",TempForResponse);
		return;
	} else if ( !isFieldExists(data["currentOperation"].OpObject.User) ) {
		if ( !isFieldExists(Dir["Login"][data["currentOperation"].OpObject.Group]) ) {
			// 该用户组不存在
			this.turnBack("811",TempForResponse);
			return;
		}
		// ["Login"]下[Group]用户组所有用户->信息取出
		TempForResponse.NameList = [];
		TempForResponse.DetailList = {};
		TempForResponse.DetailList["Group"] = data["currentOperation"].OpObject.Group;
		for ( key in Dir["Login"][data["currentOperation"].OpObject.Group].UsersIncluded )
			TempForResponse.NameList.push(key);
		for ( key in Dir["Login"][data["currentOperation"].OpObject.Group] )
			if ( key != "UsersIncluded" && typeof Dir["Login"][data["currentOperation"].OpObject.Group][key] != "object" ) {
				TempForResponse.DetailList[key] = Dir["Login"][data["currentOperation"].OpObject.Group][key];
			}
		// 数据读取成功
		this.turnBack("120",TempForResponse);
		return;
	} else {
		if ( !isFieldExists(Dir["Login"][data["currentOperation"].OpObject.Group]) ) {
			// 该用户组不存在
			this.turnBack("811",TempForResponse);
			return;
		}
		if ( !isFieldExists(Dir["Login"][data["currentOperation"].OpObject.Group].UsersIncluded[data["currentOperation"].OpObject.User]) ) {
			// 该用户不存在
			this.turnBack("821",TempForResponse);
			return;
		}
		// ["Login"]下[Group]用户组所下[User]用户->信息取出
		TempForResponse.NameList = [];
		TempForResponse.DetailList = {};
		TempForResponse.DetailList["Group"] = data["currentOperation"].OpObject.Group;
		for ( key in Dir["Login"][data["currentOperation"].OpObject.Group].UsersIncluded[data["currentOperation"].OpObject.User] )
			if ( typeof Dir["Login"][data["currentOperation"].OpObject.Group].UsersIncluded[data["currentOperation"].OpObject.User][key] != "object" )
			TempForResponse.DetailList[key] = Dir["Login"][data["currentOperation"].OpObject.Group].UsersIncluded[data["currentOperation"].OpObject.User][key];
		// 数据读取成功
		this.turnBack("120",TempForResponse);
		return;
	}
}
//新建->A用户组
exports.prototype.newGroup = function(data){
	var TempForResponse = {};
	// 判断[登陆]用户存在状态
	if( !this.isExisting(data["currentUser"].Group,data["currentUser"].Name) )	return;
	// 判断[登陆]用户所在用户组权限
	if ( !this.GroupPrivilegeDetection(data["currentUser"].Group) )	return;
	// 用户组名格式化
	if ( !isFieldExists(data["currentOperation"].OpObject.Name) || data["currentOperation"].OpObject.Name == "" )
		data["currentOperation"].OpObject.Name = "GROUP-" + (Dir.Login.length||0);
	// 用户组存在性验证
	if( isFieldExists(Dir["Login"][data["currentOperation"].OpObject.Name]) ){
		// 该用户组已存在!
		this.turnBack("810",TempForResponse);
		return;
	} else {
		// 创建["Login"]下新用户组 Name:用户组名 Jurisdiction:用户组权限
		var tempFun = Dir.createNew( "Login",data["currentOperation"].OpObject );
		TempForResponse = tempFun.DATA;
		this.turnBack(tempFun["STATUS"].Num,TempForResponse);
		return;
	}
}
//新建->A用户组下->B用户
exports.prototype.newGroupUser = function(data){
	var TempForResponse = {};
	// 判断[登陆]用户存在状态
	if( !this.isExisting(data["currentUser"].Group,data["currentUser"].Name) )	return;
	// 判断[登陆]用户所在用户组权限
	if ( !this.GroupPrivilegeDetection(data["currentUser"].Group) )	return;
	if ( !isFieldExists(data["currentOperation"].OpObject) ) {
		// 请输入正确的创建用户所在的用户组
		this.turnBack("812",TempForResponse);
		return;
	}
	if ( !isFieldExists(Dir["Login"][data["currentOperation"].OpObject.Group]) ) {
		// 请输入正确的创建用户所在的用户组
		this.turnBack("812",TempForResponse);
		return;
	}
	// 用户名格式化
	if ( !isFieldExists(data["currentOperation"].OpObject.Name) || data["currentOperation"].OpObject.Name == "" )
		data["currentOperation"].OpObject.Name = Dir["Login"][data["currentOperation"].OpObject.Group].Name + (Dir["Login"][data["currentOperation"].OpObject.Group].UsersIncluded.length||0);
	// 用户存在性验证
	if( isFieldExists(Dir["Login"][data["currentOperation"].OpObject.Group].UsersIncluded[data.Name]) ){
		// 该用户已存在!
		this.turnBack("820",TempForResponse);
		return;
	}
	// 创建["Login"]下[Group]用户组新用户 Name:用户名 Jurisdiction:用户权限
	var tempFun = Dir["Login"][data["currentOperation"].OpObject.Group].createUser( data["currentOperation"].OpObject );
	console.log(tempFun);
	TempForResponse = tempFun.DATA;
	this.turnBack(tempFun["STATUS"].Num,TempForResponse);
	return;
}
//删除->A用户组
exports.prototype.deleteGroup = function(data){
	var TempForResponse = {};
	// 判断[登陆]用户存在状态
	if( !this.isExisting(data["currentUser"].Group,data["currentUser"].Name) )	return;
	// 判断[登陆]用户所在用户组权限
	if ( !this.GroupPrivilegeDetection(data["currentUser"].Group) )	return;
	if ( !isFieldExists(data["currentOperation"].OpObject) ) {
		// 该用户组不存在
		this.turnBack("811",TempForResponse);
		return;
	}
	if ( !isFieldExists(Dir["Login"][data["currentOperation"].OpObject.Group]) ) {
		// 该用户组不存在
		this.turnBack("811",TempForResponse);
		return;
	}
	// 删除["Login"]下[Group]用户组
	var tempFun = Dir.deleteGroup( data["currentOperation"].OpObject.Group );
	// console.log(tempFun);
	TempForResponse = tempFun.DATA;
	this.turnBack(tempFun["STATUS"].Num,TempForResponse);
	return;
}
//删除->A用户组下->B用户
exports.prototype.deleteGroupUser = function(data){
	var TempForResponse = {};
	// 判断[登陆]用户存在状态
	if( !this.isExisting(data["currentUser"].Group,data["currentUser"].Name) )	return;
	// 判断[登陆]用户所在用户组权限
	if ( !this.GroupPrivilegeDetection(data["currentUser"].Group) )	return;
	if ( !isFieldExists(data["currentOperation"].OpObject) ) {
		// 无指定用户组
		this.turnBack("812",TempForResponse);
		return;
	}
	if ( !isFieldExists(Dir["Login"][data["currentOperation"].OpObject.Group]) ) {
		// 无指定用户组
		this.turnBack("812",TempForResponse);
		return;
	}
	if ( !isFieldExists(data["currentOperation"].OpObject.Name) ) {
		// 该用户不存在
		this.turnBack("821",TempForResponse);
		return;
	}
	if ( !isFieldExists(Dir["Login"][data["currentOperation"].OpObject.Group].UsersIncluded[data["currentOperation"].OpObject.Name]) ) {
		// 该用户不存在
		this.turnBack("821",TempForResponse);
		return;
	}
	// 删除["Login"]下[Group]用户组[Name]用户
	var tempFun = Dir["Login"][data["currentOperation"].OpObject.Group].deleteUser( data["currentOperation"].OpObject );
	// console.log(tempFun);
	TempForResponse = tempFun.DATA;
	this.turnBack(tempFun["STATUS"].Num,TempForResponse);
	return;
}
//更改->A用户组->名字
exports.prototype.alterGroup = function(data){
	var TempForResponse = {};
	// 判断[登陆]用户存在状态
	if( !this.isExisting(data["currentUser"].Group,data["currentUser"].Name) )	return;
	// 判断[登陆]用户所在用户组权限
	if ( !this.GroupPrivilegeDetection(data["currentUser"].Group) )	return;
	if ( !isFieldExists(data["currentOperation"].OpObject) ) {
		// 无指定用户组
		this.turnBack("812",TempForResponse);
		return;
	}
	if ( !isFieldExists(Dir["Login"][data["currentOperation"].OpObject.Name]) ) {
		// 无指定用户组
		this.turnBack("812",TempForResponse);
		return;
	}
	if ( isFieldExists(Dir["Login"][data["currentOperation"].OpObject.alterName]) || data["currentOperation"].OpObject.alterName == "" ) {
		// 用户组已存在
		this.turnBack("810",TempForResponse);
		return;
	}
	// 更改["Login"]下[Group]用户组 Name为alterName
	var tempFun = Dir.setName( data["currentOperation"].OpObject.Name,data["currentOperation"].OpObject.alterName );
	console.log(tempFun);
	TempForResponse = tempFun.DATA;
	this.turnBack(tempFun["STATUS"].Num,TempForResponse);
	return;
}
//更改->A用户组->B用户->用户组 名字 密码 其他
exports.prototype.alterGroupUser = function(data){
	var TempForResponse = {};
	// 判断[登陆]用户存在状态
	if( !this.isExisting(data["currentUser"].Group,data["currentUser"].Name) )	return;
	// 判断[登陆]用户所在用户组权限
	if ( !this.GroupPrivilegeDetection(data["currentUser"].Group) )	return;
	// console.log(JSON.stringify(data));
	for ( key in data["currentOperation"].OpObject.alter ) {
		// console.log(data["currentOperation"].OpObject.former[key]);
		// console.log(data["currentOperation"].OpObject.alter[key]);
		switch( key ) {
			case "Group":
				if(data["currentOperation"].OpObject.alter.Group != data["currentOperation"].OpObject.former.Group && data["currentOperation"].OpObject.alter.Group != "")
					Dir.convertGroup( data["currentOperation"].OpObject.former.Group,data["currentOperation"].OpObject.alter.Group,data["currentOperation"].OpObject.former.Name );
				break;
			case "Name":
				if(data["currentOperation"].OpObject.alter.Name != data["currentOperation"].OpObject.former.Name && data["currentOperation"].OpObject.alter.Name != "")
					Dir["Login"][data["currentOperation"].OpObject.former.Group].renameUser( data["currentOperation"].OpObject.former.Name,data["currentOperation"].OpObject.alter.Name );
				break;
			case "Password":
			case "NickName":
			case "Gender":
			case "Age":
				if(data["currentOperation"].OpObject.alter.Group == data["currentOperation"].OpObject.former.Group)
					if(data["currentOperation"].OpObject.alter.Name == data["currentOperation"].OpObject.former.Name)
						if(data["currentOperation"].OpObject.alter[key] != data["currentOperation"].OpObject.former[key])
							Dir["Login"][data["currentOperation"].OpObject.former.Group].UsersIncluded[data["currentOperation"].OpObject.former.Name]["set"+key]( data["currentOperation"].OpObject.alter[key] );
				break;
			default:
		}
	}
	// 取出当前修改用户的信息
	TempForResponse.DetailList = {};
	// console.log(Dir["Login"][data["currentOperation"].OpObject.alter.Group])
	for ( keyName in Dir["Login"][data["currentOperation"].OpObject.alter.Group].UsersIncluded[data["currentOperation"].OpObject.alter.Name] ) {
		// console.log(keyName+"-")
		TempForResponse.DetailList[keyName] = Dir["Login"][data["currentOperation"].OpObject.alter.Group].UsersIncluded[data["currentOperation"].OpObject.alter.Name][keyName];
	}
	// 数据读取成功
	this.turnBack("120",TempForResponse);//操作成功
	return;
}

/* 文件模块 */
//查询->指定路径->正确
exports.prototype.checkFolder = function(data){
	// console.log(data["currentDirectory"][0]);
	var TempForResponse = {};
	TempForResponse.Path = [];
	// 判断[登陆]用户存在状态
	if( !this.isExisting(data["currentUser"].Group,data["currentUser"].Name) )	return;
	TempForResponse.Path = JSON.stringify(data["currentOperation"].OpObject.Path);
	// 当前目录验证
	var temp = this.QueryDir( Dir, data["currentDirectory"] );
	// console.log(temp);
	if( temp.states ) {
		var tempAlter = this.QueryDir(temp.Dir,data["currentOperation"].OpObject.Path);
		if (tempAlter.states) {	//对应目录正确
			TempForResponse.Path = JSON.parse(TempForResponse.Path);
			// 操作成功
			this.turnBack("130",TempForResponse);
			return;
		} else {
			// 目录读取失败
			this.turnBack("908",TempForResponse);
			return;
		}
	}else{
		// 目录读取失败
		this.turnBack("908",TempForResponse);
		return;
	}
}
//显示->指定目录下所有文件 --可见 --所有 //显示->指定目录文件内容
exports.prototype.checkFolderAll = function(data){
	var TempForResponse = {};
	TempForResponse.NameList = [];
	// 判断[登陆]用户存在状态
	if( !this.isExisting(data["currentUser"].Group,data["currentUser"].Name) )	return;
	// 当前目录验证
	var temp = this.QueryDir( Dir, data["currentDirectory"] );
		// console.log(temp);
	if( temp.states ) {
		// 当前文件夹不为空				/*且填写查找的下一级路径名字*/
		if ( !isEmptyObject(temp.Dir["Contain"]) ) {
			// console.log(temp);
			if(isFieldExists( data["currentOperation"].OpObject.Name )) {
				// console.log(temp);
				// console.log(data["currentOperation"].OpObject.Name);
				if( data["currentOperation"].OpObject.Name == "true" || data["currentOperation"].OpObject.Name == "false" || data["currentOperation"].OpObject.Name == "" ) {
					// 查看文件夹文件
					for( key in temp.Dir["Contain"]){
						console.log(key);
						if( data["currentOperation"].OpObject.Name != false && temp.Dir["Contain"][key].Visibility == 1 )
							TempForResponse.NameList.push(key);
						else if( data["currentOperation"].OpObject.Name == false )
							TempForResponse.NameList.push(key);
					}
					// 操作成功
					this.turnBack("120",TempForResponse);
					return;
				} else {
					//查看文件夹下文件内容
					// console.log(isFieldExists( temp.Dir["Contain"][data["currentOperation"].OpObject.Name] ));
					// 判断是否有该文件是否存在
					if (isFieldExists( temp.Dir["Contain"][data["currentOperation"].OpObject.Name] )) {
						// 判断[登陆]用户是否有该文件查看权限
						if (!this.UserPrivilegeDetection(data["currentUser"].Group, data["currentUser"].Name, temp.Dir["Contain"][data["currentOperation"].OpObject.Name], 2))
							return;
						// 普通文件类型
						// console.log(12);
						TempForResponse.NameList.push(JSON.stringify(temp.Dir["Contain"][data["currentOperation"].OpObject.Name]["Contain"]));
						// 操作成功
						this.turnBack("120", TempForResponse);
						return;
					} else {
						// 查找项目不存在
						this.turnBack("831", TempForResponse);
						return;
					}
				}
			} else {
				// console.log(123);
				// 查看文件夹文件
				for( key in temp.Dir["Contain"]){
					console.log(key);
					if( temp.Dir["Contain"][key].Visibility == 1 )
						TempForResponse.NameList.push(key);
				}
				// 操作成功
				this.turnBack("120",TempForResponse);
				return;
			}
		} else {
			// 文件夹为空
			this.turnBack("834",TempForResponse);
			return;
		}
	} else {
		// 目录读取失败
		this.turnBack("908",TempForResponse);
		return;
	}
}
//显示->指定目录详情
exports.prototype.checkFolderDetail = function(data){
	var TempForResponse = {};
	// 判断[登陆]用户存在状态
	if( !this.isExisting(data["currentUser"].Group,data["currentUser"].Name) )	return;
	// 当前目录验证
	var temp = this.QueryDir( Dir, data["currentDirectory"] );
	if( temp.states ) {
		// console.log(temp.Dir);
		// 当前文件夹不为空且填写查找的下一级路径名字，否则显示当前目录详情
		if ( temp.Dir["Contain"].length != 0 && !isFieldExists(data["currentOperation"].OpObject.Name )) {
			// 判断是否有该文件是否存在
			if (isFieldExists( temp.Dir["Contain"][data["currentOperation"].OpObject.Name] )) {
				temp.Dir = temp.Dir["Contain"][data["currentOperation"].OpObject.Name];
			}
		}
		// console.log(TempForResponse);
		// 判断[登陆]用户是否有该文件查看权限
		if ( !this.UserPrivilegeDetection(data["currentUser"].Group,data["currentUser"].Name,temp.Dir,2) ) return;
		TempForResponse.DetailList = {};
		for( key in temp.Dir ){
			if(key != "Contain"&&typeof temp.Dir[key] != "function"){
				// console.log(temp.Dir[key]);
				TempForResponse.DetailList[key] = temp.Dir[key];
			}
		}
		console.log(TempForResponse);
		// 操作成功
		this.turnBack("120",TempForResponse);
		return;
	} else {
		// 目录读取失败
		this.turnBack("908",TempForResponse);
		return;
	}
}
//新建->A目录/文件->指定目录
exports.prototype.newFolder = function(data){
	var TempForResponse = {};
	// 判断[登陆]用户存在状态
	if( !this.isExisting(data["currentUser"].Group,data["currentUser"].Name) )	return;
	// 当前目录验证
	var temp = this.QueryDir( Dir, data["currentDirectory"] );
	if( temp.states ) {
			console.log(temp);
		// 文件夹判断
		if ( isFolder(temp.Dir.Type) ) {
			// 文件名格式化
			if ( !isFieldExists(data["currentOperation"].OpObject.Name) || data["currentOperation"].OpObject.Name == "" )
				data["currentOperation"].OpObject.Name = "NEW_FILE";
			// 文件存在性验证
			if( isFieldExists(temp.Dir.Contain[data["currentOperation"].OpObject.Name]) ){
				// 文件已存在
				this.turnBack("830",TempForResponse);
				return;
			}
			// 判断[登陆]用户是否有该文件修改权限
			if ( !this.UserPrivilegeDetection(data["currentUser"].Group,data["currentUser"].Name,temp.Dir,4) ) return;
			// console.log(data["currentOperation"].OpObject);
			var tempFun = Dir.createFile(temp.Dir.Contain,data["currentOperation"].OpObject);
			TempForResponse = tempFun.DATA;
			this.turnBack(tempFun["STATUS"].Num,TempForResponse);
			return;
		}else{
			// 文件下无法创建新文件
			this.turnBack("833",TempForResponse);
			return;
		}
	}else{
		// 目录读取失败
		this.turnBack("908",TempForResponse);
		return;
	}
}
//删除->指定目录下->A目录/文件
exports.prototype.deleteFolder = function(data){
	var TempForResponse = {};
	// 判断[登陆]用户存在状态
	if( !this.isExisting(data["currentUser"].Group,data["currentUser"].Name) )	return;
	// 当前目录验证
	var temp = this.QueryDir( Dir, data["currentDirectory"] );
	if( temp.states ) {
		if(!isFieldExists( data["currentOperation"].OpObject.Name )||!isFieldExists(temp.Dir["Contain"][data["currentOperation"].OpObject.Name])) {
			// 请填入正确目录
			this.turnBack("901",TempForResponse);
			return;
		}
		console.log(JSON.stringify(temp.Dir["Contain"])+"--"+data["currentOperation"].OpObject.Name)
		// 判断[登陆]用户是否有该文件修改权限
		if ( !this.UserPrivilegeDetection(data["currentUser"].Group,data["currentUser"].Name,temp.Dir["Contain"][data["currentOperation"].OpObject.Name],4) ) return;
		var tempFun = temp.Dir.deleteFolder(data["currentOperation"].OpObject.Name);
		TempForResponse = tempFun.DATA;
		this.turnBack(tempFun["STATUS"].Num,TempForResponse);
		return;
	}else{
		// 目录读取失败
		this.turnBack("908",TempForResponse);
		return;
	}
}
//修改->A目录/文件->路径 名字 密码 权限 可见性 文件内容--仅文件
exports.prototype.alterFolder = function(data){
	var TempForResponse = {};
	// 判断[登陆]用户存在状态
	if( !this.isExisting(data["currentUser"].Group,data["currentUser"].Name) )	return;
	// 当前目录验证
	var temp = this.QueryDir( Dir, data["currentDirectory"] );
	if( temp.states ) {
		for ( key in data["currentOperation"].OpObject )
			switch( key ) {
				case "Path":
					// 判断[登陆]用户是否有该文件修改权限
					if ( !this.UserPrivilegeDetection(data["currentUser"].Group,data["currentUser"].Name,temp.Dir,4) ) return;
					if(data["currentOperation"].OpObject.alter.Path != data["currentOperation"].OpObject.former.Path)
						if (isFieldExists(temp.Dir["Contain"][data["currentOperation"].OpObject.former.Name])) {
							var tempAlter = this.QueryDir(temp.Dir,data["currentOperation"].OpObject.alter.Path);
							if (tempAlter.states) {	//对应目录正确
								tempAlter.Dir[data["currentOperation"].OpObject.former.Name] = temp.Dir["Contain"][data["currentOperation"].OpObject.former.Name];
								delete temp.Dir["Contain"][data["currentOperation"].OpObject.former.Name];
								// this.turnBack("000",TempForResponse);//操作成功
								// return;
							}
					}
					break;
				case "Name":
					// 判断[登陆]用户是否有该文件修改权限
					if ( !this.UserPrivilegeDetection(data["currentUser"].Group,data["currentUser"].Name,temp.Dir["Contain"][data["currentOperation"].OpObject.former.Name],4) ) return;
					if(data["currentOperation"].OpObject.alter.Name != data["currentOperation"].OpObject.former.Name)
						if (isFieldExists(temp.Dir["Contain"][data["currentOperation"].OpObject.former.Name])) {
							temp.Dir["Contain"][data["currentOperation"].OpObject.former.Name]["set"+key](temp.Dir["Contain"][data["currentOperation"].OpObject.former.Name],data["currentOperation"].OpObject.alter.Name);
							// this.turnBack("000",TempForResponse);//操作成功
							// return;
						}
					break;
				case "Owner":
					// 判断[登陆]用户是否有该文件修改权限
					if ( !this.UserPrivilegeDetection(data["currentUser"].Group,data["currentUser"].Name,temp.Dir["Contain"][data["currentOperation"].OpObject.former.Name],4) ) return;
					if(data["currentOperation"].OpObject.alter.Owner != data["currentOperation"].OpObject.former.Owner)
						if (this.QueryUser(temp.Dir["Contain"][data["currentOperation"].OpObject.former.Owner])) {
							temp.Dir["Contain"][data["currentOperation"].OpObject.former.Name]["set"+key](data["currentOperation"].OpObject.alter[key]);
						}
					break;
				case "Jurisdiction":
					// 判断[登陆]用户所在用户组权限 和 [登陆]用户是否有该文件修改权限
					if ( !this.GroupPrivilegeDetection(data["currentUser"].Group,true) || this.UserPrivilegeDetection(data["currentUser"].Group,data["currentUser"].Name,temp.Dir["Contain"][data["currentOperation"].OpObject.former.Name],4,true) ) {
						if(data["currentOperation"].OpObject.alter.Jurisdiction != data["currentOperation"].OpObject.former.Jurisdiction)
							temp.Dir["Contain"][data["currentOperation"].OpObject.former.Name]["set"+key](data["currentOperation"].OpObject.alter[key]);
					}
					break;
				case "Visibility":
				case "Type":
				case "Contain":
				case "Password":
					// 判断[登陆]用户是否有该文件修改权限
					if ( !this.UserPrivilegeDetection(data["currentUser"].Group,data["currentUser"].Name,temp.Dir["Contain"][data["currentOperation"].OpObject.former.Name],4) ) return;
					if(data["currentOperation"].OpObject.alter[key] != data["currentOperation"].OpObject.former[key])
						temp.Dir["Contain"][data["currentOperation"].OpObject.former.Name]["set"+key](data["currentOperation"].OpObject.alter[key]);
					break;
				default:
			}
		for( key in temp.Dir["Contain"][data["currentOperation"].OpObject.former.Name] )
			if(key != "Contain")
				TempForResponse.DetailList[key] = temp.Dir["Contain"][data["currentOperation"].OpObject.former.alter][key];
	}
	// 操作成功
	this.turnBack("120",TempForResponse);
	return;
}




/*快捷功能渠道*/
	// 用户存在验证--->FALSE状态已POST返回
	exports.prototype.isExisting = function( Group, Name ){	//Group:用户组名;Name:用户名
		// console.log( Group + " " + Name );
		if (!isFieldExists(Group)||!isFieldExists(Dir["Login"][Group])||!isFieldExists(Dir["Login"][Group].UsersIncluded)||Dir["Login"][Group].UsersIncluded.length==0) {
			this.turnBack("903");	//用户组未填写或填写错误
			return false;
		} else if (!isFieldExists(Name)||!isFieldExists(Dir["Login"][Group].UsersIncluded[Name])) {
			this.turnBack("904");	//用户名未填写或填写错误
			return false;
		} else {
			return true;
		}
	}
	// 用户组权限检测--->FALSE状态已POST返回
	exports.prototype.GroupPrivilegeDetection = function( Group, send ){	//Group:用户组名
		if (!isFieldExists(Group)||!isFieldExists(Dir["Login"][Group])) {
			this.turnBack("903");	//用户组未填写或填写错误
			return false;
		} else if (Dir["Login"][Group]["Jurisdiction"]&&Dir["Login"][Group]["Jurisdiction"]==1) {
			return true;
		} else {
			if ( !isFieldExists(send) ) {
				this.turnBack("710");	//用户组权限不足
			}
			return false;
		}
	}
	// 文件授权检测--->FALSE状态已POST返回
	exports.prototype.UserPrivilegeDetection = function( Group, User, data, how, send ){	//User:使用者 data:待授权文件对象;how:实际操作
		// console.log(isFieldExists(send));
		if ( Dir.AuthorizationCheck( Group, User, data, how ) ) {
			return true;
		} else {
			if ( !isFieldExists(send) ) {
				this.turnBack("700");	//用户权限不足
			}
			return false;
		}
	}
	// 快速查找用户所在用户组--->FALSE状态已POST返回
	exports.prototype.QueryUser = function( Name ){	//Name:用户名
		if (!isFieldExists(Name)) {
			this.turnBack("904");	//用户名未填写或填写错误
			return false;
		} else {
			// console.log("GROUP:"+Name);
			for( key in Dir["Login"] ){
				if (isFieldExists(Dir["Login"][key].UsersIncluded[Name])){
					return key;
				}
			}
		}
	}
	// 快速目录检测--->FALSE状态未POST返回
	exports.prototype.QueryDir = function( Dir, Data ){	//Dir:当前位置 Data:待测目录 数组
		var temp = {
			states:false,
			Dir:Dir
		}
		console.log(Data);
		debugger;
		if (Data.length<1){
			return temp;
		}	else if (Data.length == 1 && Data[0] == "FILE"){
			temp.states = true;
			temp.Dir = Dir["Folder"];
			return temp;
		} else if (!isFieldExists(Dir.Contain[Data.splice(0,1)])) {
			return temp;
		} else if (isEmptyObject(Data)) {
			temp.states = true;
			return temp;
		}	else {
			return this.QueryDir( Dir.Contain[Data[0]], Data );
		}
	}

/* POST返回数据方法 */
	// 返回方法
	exports.prototype.turnBack = function( num, data ){
		// console.log(num,data);
		var temp = {};
		if (isFieldExists(data)) {
			this.Response(data);
		}else{
			this.Response(temp);
		}
		this.Status(num);
	}
	// 返回值标记
	exports.prototype.Response = function( data ){
		// console.log(data);
		if ( isFieldExists(data) ) {
			this.RESPONSE = data;
		}
		return this.RESPONSE;
	}
	// 标记量更改和获取
	exports.prototype.Status = function( data ){
		// console.log(data);
		if ( isFieldExists(data) ) {
			this.STATUS = STATUS[data];
		} else if ( !isFieldExists(this.STATUS) ) {
			this.STATUS = STATUS["999"];
		}
		return this.STATUS["Judge"];
	}
	// 响应结果验证
	exports.prototype.Result = function(){
		local = this;
		var ResultInterval = setInterval(function() {
			// console.log(isFieldExists(local.RESPONSE));
			// console.log(isFieldExists(local.STATUS));
		  if ( isFieldExists(local.RESPONSE) && isFieldExists(local.STATUS) ) {
		  	try{
					local.callback();
				}catch(error){
					console.log(error);
				}finally{
					clearInterval(ResultInterval);
				}
			}
		}, 100);
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
