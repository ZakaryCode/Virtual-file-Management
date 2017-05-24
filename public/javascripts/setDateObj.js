/*
	时间格式化对象
 */
Date.prototype.Format = function(){
	return this.getFullYear() +"年"
				+ (this.getMonth()+1) +"月"
				+ this.getDate() +"日 "
				+ this.getHours() +":"
				+ this.getMinutes() +":"
				+ this.getSeconds();
}

exports = module.exports = function(){
	var nowDate = new Date();
	return nowDate.Format();
};