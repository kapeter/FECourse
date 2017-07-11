var catType     = 10; // 筛选类型（10：产品设计；20：编程语言）
var pSize       = 16; // 每页返回数据个数
var designNo    = 1;  // 产品设计当前页码
var proNo       = 1;  // 编程语言当前页码
var designPage  = 1;  // 产品设计页数
var proPage     = 1;  // 产品设计页数

//页面载入函数
function pageLoad() {
	//根据cookie切换关注按钮状态
	if (Unit.getCookie('followSuc') && Unit.getCookie('followSuc') == '1'){
		document.getElementById('follow-btn').style.display = 'none';
		document.querySelector('.follow-cancel').style.display = 'inline';
	}else{
		document.getElementById('follow-btn').style.display = 'inline';
		document.querySelector('.follow-cancel').style.display = 'none';
	}

	//根据cookie切换通知条可见状态
	if (Unit.getCookie('notifyOff') && Unit.getCookie('notifyOff') == '1'){
		document.querySelector('.top-notify').style.display = 'none';
	}else{
		document.querySelector('.top-notify').style.display = 'block';
	}

	//加载最热排行数据
	Unit.ajax({
		type    : 'GET',
		url     : 'http://study.163.com/webDev/hotcouresByCategory.htm',
		success : function(resText){
			var listObj = document.getElementById('hot-list');
			var data  = eval("("+resText+")");
			for(var i = 0; i < data.length; i++){
				var lDom = document.createElement('li');
				lDom.className = 'clearfix';
				lDom.innerHTML = '<div class="hot-img"><img src="' + data[i].smallPhotoUrl + '" alt="'+ data[i].name +'"></div>';
				lDom.innerHTML += '<div class="hot-info"><h5><a href="#">'+ data[i].name +'</a></h5><p><i class="icon icon-person"></i>'+ data[i].learnerCount+'</p></div>';
				listObj.appendChild(lDom);
			}
			document.getElementById('hot-list-reset').innerHTML = document.getElementById('hot-list').innerHTML;
			document.getElementById('hot-list-reset').style.top = 72 * 20 + 'px';
			setTimeout("hotRoll()",5000);
		}
	});

	//加载课程列表
	getCourse();
}

//元素事件注册
function eventListener() {
	//关闭通知条
	var nofClose = document.getElementById('notify-close');
	Unit.addEvent(nofClose,'click',function(){
		Unit.setCookie('notifyOff',1);
		document.querySelector('.top-notify').style.display = 'none';
	});

	//关注按钮
	var followBtn = document.getElementById('follow-btn');
	Unit.addEvent(followBtn,'click',function(){
		//如果已登录，直接关注；如果未登录，调用登录模态框
		if (Unit.getCookie('loginSuc') && Unit.getCookie('loginSuc') == '1'){
			addFollow();
		}else{
			openModal(followBtn);
		}
	});

	//取消关注
	var followCancel = document.getElementById('follow-cancel');
	Unit.addEvent(followCancel,'click',function(){
		cancelFollow();
	});

	//视频模态框
	var vModalBtn = document.getElementById('vmodal-btn');
	Unit.addEvent(vModalBtn,'click',function(){
		openModal(vModalBtn);
	});

	//关闭模态框
	var modalClose = document.querySelectorAll('.modal-close');
	for(var i = 0; i < modalClose.length; i++){
		Unit.addEvent(modalClose[i],'click',function(event){
			var e = window.event || event;
			var element = event.target;
			closeModal(element);
		});
	}

	//登录请求
	var loginBtn = document.getElementById('login-btn');
	Unit.addEvent(loginBtn,'click',function(event){
		var e = window.event || event;
		e.preventDefault();
		var userName = document.getElementById('userName').value;
		var password = document.getElementById('password').value;
		if (userName == '' || password == ''){
			document.getElementById('login-error').innerText = "账户或密码不能为空。";
			return false;
		}
		Unit.ajax({
			type    : 'GET',
			url     : 'http://study.163.com/webDev/login.htm',
			data    : {"userName": md5(userName), 'password': md5(password)},
			success : function(resText){
				if (resText == '0'){
					document.getElementById('login-error').innerText = "账户或密码错误。";
				}else{
					document.getElementById('login-error').innerText = "";
					Unit.setCookie('loginSuc',1);
					console.log(Unit.getCookie('loginSuc'));
					addFollow();
					document.getElementById('login-modal').style.display = 'none';
				}
			}
		});
	});


	//课程列表切换，使用事件代理
	var courseTab = document.getElementById('course-tab');
	var courseBody = document.getElementById('course-body');
	Unit.addEvent(courseTab,'click',function(event){
		var e = window.event || event;
		var element = event.target;
		var liArr = courseTab.getElementsByTagName('li');
		for (var i = 0; i < liArr.length; i++){
			liArr[i].className = '';
		}
		element.parentNode.className = 'active';
		var prefix = element.parentNode.dataset.cat;
		var divArr = courseBody.children;
		for (var i = 0; i < liArr.length; i++){
			divArr[i].className = '';
		}
		document.getElementById(prefix + '-box').className = 'active';

		catType = prefix == 'design' ? 10 : 20;
		var pageNo = prefix == 'design' ? designNo : proNo;
		if (!document.getElementById(prefix + '-page-' + pageNo)){
			getCourse();
		}else{
			setPagination();
		}
	});


	//分页组件点击
	var coursePage = document.getElementById('course-pagination');
	Unit.addEvent(coursePage,'click',function(event){
		var e = window.event || event;
		var element = event.target;
		switch (element.className){
			case 'page-num':
				if (element.parentNode.className == 'active'){
					return false;
				}else{
					changePage(parseInt(element.innerText));
				}
				break;
		}
	});	
}


//打开模态框
function openModal(element){
	if (element.dataset){
		var elName = element.dataset.target;
		if (document.getElementById(elName)){
			var thisModal = document.getElementById(elName);
			thisModal.style.display = 'block';
			var modalBox = thisModal.querySelector('.modal-container');
			var top = (document.documentElement.clientHeight - modalBox.offsetHeight) / 2;
			modalBox.style.marginTop = top + 'px';
		}
	}
}

//关闭模态框
function closeModal(element){
	var thisModal = element.parentNode.parentNode;
	thisModal.style.display = 'none';
	//如果有视频，停止视频播放
	var videoObj = thisModal.querySelector('video');
	if (videoObj){
		videoObj.pause();
	}
}

//添加关注
function addFollow(){
	Unit.ajax({
		type    : 'GET',
		url     : 'http://study.163.com/webDev/attention.htm',
		success : function(resText){
			if (resText == '1'){
				Unit.setCookie('followSuc',1);
			}
		}
	});	
	document.getElementById('follow-btn').style.display = 'none';
	document.querySelector('.follow-cancel').style.display = 'inline';
}

//取消关注
function cancelFollow(){
	Unit.setCookie('followSuc',0);
	document.getElementById('follow-btn').style.display = 'inline';
	document.querySelector('.follow-cancel').style.display = 'none';
}

//最热排行循环滚动
function hotRoll() {
	var listObj = document.getElementById('hot-list');
	//设置一个辅助列，实现循环滚动
	var listObjR = document.getElementById('hot-list-reset');
	//当前列全部消失后，移到队列末，作为下一个队列
	if (listObj.offsetTop == -1440){
		listObj.style.top = 72 * 20 + 'px';
	}
	if (listObjR.offsetTop == -1440){
		listObjR.style.top = 72 * 20 + 'px';
	}
	var top = listObj.offsetTop;
	var topR = listObjR.offsetTop;
	var delta = 0;

	var timer = setInterval(function () {
		if (delta == 72){
			clearInterval(timer);
			return false;
		}
		top -= 4;
		topR -= 4;
		delta += 4;
		listObj.style.top = top + 'px';
		listObjR.style.top = topR + 'px';
	},17);
	setTimeout("hotRoll()",5000);
}

//远程获取课程数据，并加入dom
function getCourse(){
	Unit.ajax({
		type    : 'GET',
		url     : 'http://study.163.com/webDev/couresByCategory.htm',
		data    : {"pageNo": (catType == 10 ? designNo : proNo), 'psize': pSize, 'type': catType},
		success : function(resText){
			var prefix = catType == 10 ? 'design' : 'program';
			var pageNo = catType == 10 ? designNo : proNo;
			var cBox = document.getElementById(prefix + '-box');
			var data  = eval("("+resText+")").list;
			if (catType == 10){
				designPage = eval("("+resText+")").totalPage;
			}else{
				proPage = eval("("+resText+")").totalPage;
			}
			var listObj = document.createElement('ul');
			listObj.className = 'course-list active clearfix';
			listObj.id = prefix + '-page-' + pageNo;

			for(var i = 0; i < data.length; i++){
				var lDom = document.createElement('li');
				lDom.innerHTML = '<div class="box-shadow">'
								+ '<div class="course-img"><img src="'+ data[i].bigPhotoUrl +'" alt="'+ data[i].name +'"></div>'
								+ '<div class="course-info">'
								+ '<h5><a href="#">'+ data[i].name +'</a></h5>'
								+ '<p>'+ data[i].provider +'</p>'
				  				+ '<p><span><i class="icon icon-person"></i>'+ data[i].learnerCount +'</span></p>'
				  				+ '<p class="course-price">' + (data[i].price == 0 ? '免费' : '￥'+ data[i].price) +'</p>'
				  				+ '</div></div>';
				
				listObj.appendChild(lDom);			
			}
			cBox.appendChild(listObj);

			//设置分页
			setPagination();

		}
	});
}


// 设置分页
function setPagination() {
	var pageCount = catType == 10 ? designPage : proPage;
	var pageNo = catType == 10 ? designNo : proNo;
	var pagObj = document.getElementById('course-pagination');
	pagObj.innerHTML = '<li class="prev"><i class="icon icon-prev"></i></li>';
	for (var i = 1; i <= pageCount; i++){
		if (i == pageNo){
			pagObj.innerHTML += '<li class="active"><a href="javascript:;" class="page-num">'+ i +'</a></li>';
		}else{
			pagObj.innerHTML += '<li><a href="javascript:;" class="page-num">'+ i +'</a></li>';
		}
	}
	pagObj.innerHTML += '<li class="next"><i class="icon icon-next"></i></li>';
}

// 改变页码
function changePage(pageNo) {
	var prefix = catType == 10 ? 'design' : 'program';
	if (catType == 10){
		designNo = pageNo;
	}else{
		proNo = pageNo;
	}
	var cBox = document.getElementById(prefix + '-box');
	var listObj = cBox.querySelectorAll('.course-list');
	for (var i = 0; i < listObj.length; i++){
		listObj[i].className = 'course-list clearfix';
	} 
	if (!document.getElementById(prefix + '-page-' + pageNo)){
		getCourse();
	}else{
		listObj[pageNo].className = 'course-list active clearfix';
		setPagination();
	}
}
