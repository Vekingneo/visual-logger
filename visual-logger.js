var errorLogger = (function(){
	var overlay, toggle_btn, gaper, orgBodyPosition
	_this = {};

	var logConfig = {
		detail: true, //开启detail console
		remote: false,
		overlay: true //开启overlay console
	}

	_this.setConfig = function(key,value){
		if(typeof key !== 'object'){
			logConfig[key] = value;
		}else{
			Object.keys(key).forEach(function(item,index,array){
				logConfig[item] = key[item]
			})
		}
		return logConfig
	}

	_this.init = function(){
		//implement error lisenters
		window.addEventListener('error', _listener);
		if(logConfig.overlay){
			if(/mob/i.test(window.navigator.userAgent)){ //不是移动端强制不开启overlay console
				_overlayErrors()
				_this.setConfig('detail',false) //移动端不支持开启detail console(overlay上无法打印带格式console)
			}
		}
		replaceOrgConsole();
		console.log('------Log Initialized------')

	};

	function replaceOrgConsole(){
		//替换console
		var orgConsole = {};
		Object.keys(window.console).forEach(function(keyItem, index, arr){
			orgConsole[keyItem] = window.console[keyItem]
			window.console[keyItem] = function(){
				if(arguments.length == 0)return
				_overlayPrint(arguments[0],true)//parameter 2：用于区分是克隆console
				var arrs = []
				Object.keys(arguments).forEach(keyItem => arrs.push(arguments[keyItem]))
				orgConsole[keyItem].apply(null,arrs)
			}
		})
	}

	function _prepareOverLay(){
		//prepare overlay
		overlay = document.createElement('DIV')
		var styles ={
			display:'none',
			position: 'fixed',
		    'box-sizing': 'border-box',
		    left: '0px',
		    top: '0px',
		    right: '0px',
		    bottom: '0px',
		    width: '100vw',
		    height: '100vh',
		    'background-color': 'rgba(0, 0, 0, 0.85)',
		    color: 'rgb(232, 232, 232)',
		    'font-family': 'Menlo, Consolas, monospace',
		    'font-size': 'large',
		    padding: '2rem',
		    'line-height': '1.2',
		    'white-space': 'pre-wrap',
		    overflow: 'auto',
		    'overflow-wrap': 'break-word',
		    'z-index': '1000'
		}

		overlay.id = 'error_logger_overlay'
		for(var i in styles){
			overlay.style[i] = styles[i]
		}

		return overlay
	}

	function _listener(e){
		if(logConfig.detail){
			_detailedErrors(e);
		}

		if(logConfig.remote){

		}

		if(logConfig.overlay){
			//var _e = e.error;
			if(toggle_btn && overlay){ //没有overlay不开启
				_overlayPrint(e)
			}else{
				_overlayErrors();
				_overlayPrint(e);
			}
		}
	}

	function _overlayErrors(){
		if(!toggle_btn){
			_prepareToggleBtn();
			document.documentElement.appendChild(toggle_btn)
		}

		if(!overlay){
			_prepareOverLay()
			document.documentElement.appendChild(overlay)
		}
	}

	function _overlayPrint(e, ifconsole){
		var errorToAppend = !!ifconsole ? _calculatLogFromConsole(e) :_calculatErrorsFromEvent(e)
		if(!gaper){
			gaper = document.createElement('DIV')
			gaper.style.width = '100%'
			gaper.style.border = 'dashed 1px'
			gaper.style.margin = '1vh 0'
		}
		if(!overlay){_overlayErrors()}
		overlay.appendChild(gaper)
		overlay.innerHTML += errorToAppend;
	}

	function _prepareToggleBtn(){
		//prepare toggle btn
		toggle_btn = document.createElement('DIV')
		toggle_btn.id = 'toggle_btn'
		var toggle_styles = {
			position:'fixed',
			top:'0',
			right:'0.2rem',
			display:'inline-block',
		    'font-family': 'Menlo, Consolas, monospace',
		    'font-size': '1.5rem',
		    'background-color': '#b3ffb3',
		    'z-index': '9999',
		    'border-radius': '7%',
		    'padding': '0.1rem 0.4rem',
		    'color': 'green'
		}
		for(var i in toggle_styles){
			toggle_btn.style[i] = toggle_styles[i]
		}
		toggle_btn.innerHTML = 'console'
		toggle_btn.addEventListener('click',function(){
			if(overlay.style.display == 'block'){
				overlay.style.display = 'none'
				_toggleDocumentScroll(true)
			}else{
				overlay.style.display = 'block'
				_toggleDocumentScroll(false)
			}
		})
	}

	function _calculatErrorsFromEvent(e){
		var errorToAppend = '';
		var strObj = _parseErrorData(e)
		var line = "<div><span style='color:#E36049'>{{key}}: </span><span>{{value}}</span></div>"
		Object.keys(strObj).forEach(function(keyItem){
			var s = line.replace(/\{\{[^{}]*\}\}/ig,function(str){
				return str === '{{key}}' ? keyItem : strObj[keyItem]
			})
			errorToAppend += s;
		})
		errorToAppend = "<div><span style='color:#E36049'>Uncatch Error/未处理错误: </span><span></span></div>" + errorToAppend
		return errorToAppend

	}

	function _calculatLogFromConsole(e){
		var errorToAppend = '';
		if(e instanceof Error){
			errorToAppend = ""+e
		}else if(typeof e == 'string' || typeof e == 'number'){
			errorToAppend = ""+e
		}else{
			errorToAppend = "[[Unhandled Console Parameter Type]]: "+e.toString();
		}
		return errorToAppend

	}

	function _calculatErrors(e, ifconsole){
		var errorToAppend = '';
		if(e instanceof Error || (e instanceof Event && !ifconsole)){  //只有当 !ifconsole时才是onerror event，避免对console.log(event)做处理
			var strObj = _parseErrorData(e)
			var line = "<div><span style='color:#E36049'>{{key}}: </span><span>{{value}}</span></div>"
			Object.keys(strObj).forEach(function(keyItem){
				var s = line.replace(/\{\{[^{}]*\}\}/ig,function(str){
					return str === '{{key}}' ? keyItem : strObj[keyItem]
				})
				errorToAppend += s;
			})
			errorToAppend = "<div><span style='color:#E36049'>Uncatch Error/未处理错误: </span><span></span></div>" + errorToAppend
			
		}else if(typeof e == 'string' || typeof e == 'number'){
			errorToAppend = ""+e
		}else{
			errorToAppend = "[[Unhandled Console Parameter Type]]: "+e.toString();
		}
		return errorToAppend

	}

	function _toggleDocumentScroll(flag){
		if(!flag){
			//orgBodyPosition = !!(document.body.style.position) ? document.body.style.position : ''
			document.body.style.position = 'fixed'
			//document.body.style.touchAction = 'none'
		}else{
			document.body.style.position = ''
		}

	}


	function _detailedErrors(e){
		var i = _parseErrorData(e)
		var str = [
	      "%cType: %c" + i.Type,
	      "%cMessage: %c" + i.Message,
	      "%cFile: %c" + i.File,
	      "%cLine: %c" + i.Line,
	      "%cColumn: %c" + i.Column,
	      "%cTimeStamp: %c" + i.TimeStamp,
	      "%cStackTrace: %c" + i.StackTrace,
	      "%cDebug : " + "%c"  + i.File + ':' + i.Line,
	    ].join("\n");
	    if(window.chrome) {
	    	console.log(str, "font-weight: bold;", "color: #e74c3c;", "font-weight: bold;", "font-weight: normal; color: #e74c3c;","font-weight: bold;", "font-weight: normal; color: #e74c3c;", "font-weight: bold;", "font-weight: normal;", "font-weight: bold;", "font-weight: normal;", "font-weight: bold;", "font-weight: normal;", "font-weight: bold;", "font-weight: normal;", "font-weight: bold;", "font-weight: normal;");
	    }else{
	    	// str.replace('/\%c/igm','')
	    	console.log(str.replace(/%c/ig,''))
	    }
	    return str
	}

	function _parseErrorData(e){
		var now = new Date().toString();
		if(e instanceof Event){
			return {
				Type: e.error.name,
				Message: e.error.message,
				StackTrace: e.error.stack,
				File: e.filename,
				Line: e.lineno,
				Column: e.colno,
				TimeStamp: now
			}
		}

	}
	return _this;
})();