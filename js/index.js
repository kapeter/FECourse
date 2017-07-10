window.onload = function () {
	//登录模态框
	var followBtn = document.getElementById('follow-btn');
	Unit.addEvent(followBtn,'click',function(){
		console.log(Unit.getCookie('loginSuc'));
		if (Unit.getCookie('loginSuc') == '1'){
			addFollow();
		}else{
			openModal(followBtn);
		}
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
					Unit.setCookie('loginSuc',1);
					addFollow();
					document.getElementById('login-modal').style.display = 'none';
				}
			}
		});
	});
}



/*  功能函数  */ 


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
	element.parentNode.parentNode.style.display = 'none';
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
}