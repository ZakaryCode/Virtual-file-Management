/*
	MAIN操作文件
 */
$(document).ready(function(){
	var bodyHeight = $(window).height() - $("#header").height() * 4;
	$("#body").height(bodyHeight);
	getFocus(true);
	line( "|————欢迎使用文件管理系统!————|" , false );
	var STATUS = $("h1").attr("ResourceStorageStatus");
	STATUS = JSON.parse(STATUS);
	if (STATUS.Judge) {
		line( "|————读取记录文件成功!————|" , false );
	}
});
// 按键监听
document.onkeydown=function(){
	// console.log(JSON.stringify(event.keyCode));
	if (event.keyCode == 13){
		console.log( $("#codeInput>pre>input").val() + '回车键' );
		keyEnter( $("#codeInput>pre>input").val() );
		$("#codeInput>pre>input").val("");
	}else if (event.keyCode == 38){
		keyUpOrDown(true);
	}else if (event.keyCode == 40){
		keyUpOrDown(false);
	}else{
		if( getFocus() == true )
			$("#codeInput>pre>input").focus();
	}
}
