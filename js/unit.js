/**
 * 系统功能函数
 *
 * 包括：addEvent(事件监听处理)，ajax(ajax处理函数), getCookie(获取cookie值), setCookie(设置cookie值)
 * 
 */

var Unit = (function () {
	
	/**
	 * 事件监听处理
	 * 
	 * @param {string}   element 元素
	 * @param {string}   type 事件类型 
	 * @param {function} callback 回调函数  
	 * 
	 */
	var addEvent = function (element, type, callback, useCapture) {
		var useCapture = useCapture || false;
		if(element.addEventListener){
			element.addEventListener(type, callback, useCapture);
		} else if(element.attachEvent){
			element.attachEvent('on' + type, callback);
		} else {
           element['on' + type] = callback;
        }
	}

	/**
	 * ajax请求
	 * 
	 * @param {object} options 配置项
	 * {type:请求类型 ,data:请求数据, url:请求url, dataType:数据类型, success:成功回调, fail:失败回调 } 
	 * 
	 */
	var ajax = function (options) {
		options = options || {};
        options.type = (options.type || "GET").toUpperCase();
        options.dataType = options.dataType || "json";
        options.success = options.success || function (argument) {
        	console.log('Success');
        };
        options.fail = options.fail || function (status) {
        	console.error(status);
        };
        var params = formatParams(options.data);
        var xhr = null;

        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else {
            xhr = new ActiveXObject('Microsoft.XMLHTTP');
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                var status = xhr.status;
                if (status >= 200 && status < 300) {
                    options.success && options.success(xhr.responseText, xhr.responseXML);
                } else {
                    options.fail && options.fail(status);
                }
            }
        }

        if (options.type == "GET") {
            xhr.open("GET", options.url + "?" + params, true);
            xhr.send(null);
        } else if (options.type == "POST") {
            xhr.open("POST", options.url, true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send(params);
        }
	}

	/**
	 * 获取cookie值
	 * 
	 * @param {string}  key cookie键
	 * 
	 */
	var getCookie = function (key) {
		var myCookie = ""+document.cookie+";"; 
		var searchKey = ""+key+"=";
		var startOfCookie = myCookie.indexOf(searchKey);
		var endOfCookie, result;
		if(startOfCookie != -1){
			startOfCookie += searchKey.length;
			endOfCookie = myCookie.indexOf(";",startOfCookie);
			result = myCookie.substring(startOfCookie,endOfCookie);
		}
		return result;
	}	

	/**
	 * 设置cookie值
	 * 
	 * @param {string}  key   cookie键
	 * @param {string}  value cookie值
	 * 
	 */
	var setCookie = function (key, value, expire) {
		var exdate = new Date();
		exdate.setDate(exdate.getDate() + expire);
		document.cookie = key + "=" + escape(value) + ((expire==null) ? "" : ";expires="+exdate.toGMTString());
	}	


    var formatParams = function (data) {
        var arr = [];
        for (var name in data) {
            arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
        }
        return arr.join("&");
    }


	return {
		addEvent  : addEvent,
		ajax      : ajax,
		getCookie : getCookie,
		setCookie : setCookie, 
	}

})();