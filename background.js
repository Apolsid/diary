var isDebug = true;
var param = null;
var defParam = {
	min_timeIdle: 1,
	max_timeIdle: 30,
	min_timeAlarm: 1,
	max_timeAlarm: 120,

	timeIdle: 5,
	timeAlarm: 30,

	msgHead: chrome.i18n.getMessage("def_msgHead"),
	msgBody: chrome.i18n.getMessage("def_msgBody")
};

var fn_msgDebug = function (msg) {
	if(isDebug){
		var d = new Date();
		console.info(d.getHours() +":"+ d.getMinutes() + ":" + d.getSeconds() +" - " + msg);
	}
}

var settingsAlarm = {
	_time: null,
	_timer: null,
	start: function () {
		if(this._timer == null)
			this._timer = setTimeout(fn_alarm, this._time);
	},
	stop: function () {
		if(this._timer != null){
			clearTimeout(this._timer);
			this._timer = null;
		}
	},
	reset: function () {
		fn_msgDebug("Рестарт таймера сообщения");
		this.stop();
		this.start();
	},
	setTime: function (t) {
		this._time = t * 60 * 1000;
	}
};


function fn_alarm () {
	chrome.notifications.create({
		title: param.msgHead, 
		message: param.msgBody, 
		type:"basic",
		iconUrl:"icon/icon64.png"
	});
	settingsAlarm.reset();
}

function setParam (p) {
	var timeIdle = p.timeIdle || defParam.timeIdle;
	var timeAlarm = p.timeAlarm || defParam.timeAlarm;

	var msgHead = p.msgHead || defParam.msgHead;
	var msgBody = p.msgBody || defParam.msgBody;

	if(timeIdle > defParam.max_timeIdle)
		timeIdle = defParam.max_timeIdle;
	else if (timeIdle < defParam.min_timeIdle)
		timeIdle = defParam.min_timeIdle;

	if(timeAlarm > defParam.max_timeAlarm)
		timeAlarm = defParam.max_timeAlarm;
	else if (timeAlarm < defParam.min_timeAlarm)
		timeAlarm = defParam.min_timeAlarm;

	param = {
		timeIdle: timeIdle,
		timeAlarm: timeAlarm,
		msgHead: msgHead,
		msgBody: msgBody
	};

	chrome.idle.setDetectionInterval(timeIdle * 60);
	settingsAlarm.setTime(timeAlarm);
	settingsAlarm.reset();
	chrome.storage.sync.set({
		"timeAlarm": timeAlarm,
		"timeIdle": timeIdle,
		"msgHead": msgHead,
		"msgBody": msgBody
	});
}

chrome.idle.onStateChanged.addListener(function (state){
	switch(state){
		case "active":
			fn_msgDebug("Пользователь активен");
			settingsAlarm.start();
			break;
		default:
			fn_msgDebug("Пользователь неактивен");
			settingsAlarm.stop();
	}
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.destination == "background") {
		switch (request.query) {
			case "getParam":
				sendResponse({
					min_timeIdle: defParam.min_timeIdle,
					max_timeIdle: defParam.max_timeIdle,
					min_timeAlarm: defParam.min_timeAlarm,
					max_timeAlarm: defParam.max_timeAlarm,
					timeIdle: param.timeIdle || defParam.timeIdle,
					timeAlarm: param.timeAlarm || defParam.timeAlarm,
					msgHead: param.msgHead,
					msgBody: param.msgBody
				});
				break;
			case "setParam":
				setParam(request.data);
				chrome.notifications.create({
					title: chrome.i18n.getMessage("opt_save_msgHead"),
					message: chrome.i18n.getMessage("opt_save_msgBody"),
					type:"basic",
					iconUrl:"icon/icon64.png"
				});
				break;
			case "test":
				chrome.notifications.create({
					title: request.data.msgHead, 
					message: request.data.msgBody, 
					type:"basic",
					iconUrl:"icon/icon64.png"
				});
				break;
		}
	}
});

chrome.storage.local.get(["timeAlarm", "timeIdle", "msgHead", "msgBody"], function(param){
	setParam(param);
});



chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.create({url:"workbook/index.html"});
});