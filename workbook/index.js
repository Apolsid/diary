var managerMonth = {
	node: Util.getNode("calendar"),
	_ruleDayItem: (new DynamicRule()).newRule(".dayItem", "width: 30px;height: 30px;"),
	_recordItems: [],

	monthItems: [],

	setRectDayItem: function (attr) {
		this._ruleDayItem.set("width:" + attr.w + "px; height:" + attr.h + "px;");
		this.monthItems.forEach(function(item){
			item.resize();
		});
		viewerManager.resize();
	},

	init: function(records){
		this._recordItems = records.map(function(record){
			return new RecordItem({
					dateTime: record[0],
					type: record[1],
					msg: record[2],
				});
		});

		Util.on(this.node, "mousewheel", this._scroll.bind(this));

		this._onClickItem = this.onClickItem.bind(this);
		DayItem.prototype.baseGetRecordItems = this._getRecordItems.bind(this);
		DayItem.prototype.updateAfterAddRecordItem = function(dayItem){
			viewerManager.updateAfterAddRecordItem(dayItem);
		};

		this.monthItems.push(new MonthItem({
			year:2016,
			month:0,
			parentNode: this.node,
			onClickItem: this._onClickItem
		}));
		this.monthItems.push(new MonthItem({
			year:2016,
			month:1,
			parentNode: this.node,
			onClickItem: this._onClickItem
		}));
		this.monthItems.push(new MonthItem({
			year:2016,
			month:2,
			parentNode: this.node,
			onClickItem: this._onClickItem
		}));
		this.monthItems.push(new MonthItem({
			year:2016,
			month:3,
			parentNode: this.node,
			onClickItem: this._onClickItem
		}));
		this.monthItems.push(new MonthItem({
			year:2016,
			month:4,
			parentNode: this.node,
			onClickItem: this._onClickItem
		}));

	},

	_getRecordItems: function(dayItem) {
		return this._recordItems.filter(function(recordItem){
			return recordItem.date == dayItem.date &&
					recordItem.month == dayItem.month &&
					recordItem.year == dayItem.year;
		});
	},

	addRecordItem: function(item){
		this._recordItems.push(item);

		chrome.storage.local.set({"records": this._recordItems.map(function(recordItem){
			var data = recordItem.data;
			return [
				data.dateTime,
				data.type,
				data.msg
			];
		})});

		var month = item.month;
		this.monthItems.some(function(monthItem){
			if(monthItem.month == month){
				monthItem.addRecordItem(item);
				return true;
			}
		});
	},

	onClickItem: function(item){
		viewerManager.setItem(item);
	},

	_scroll: function(evt){
		var arr = this.monthItems;
		if(evt.deltaY > 0){
			var lItem = arr[arr.length - 1];
				d = new Date(lItem.year, lItem.month + 1);
			arr.push(new MonthItem({
				year: d.getFullYear(),
				month: d.getMonth(),
				parentNode: this.node,
				onClickItem: this._onClickItem
			}));
			arr.shift().destroy();
		}
		else{
			var lItem = arr[0];
			var d = new Date(lItem.year, lItem.month - 1);
			arr.unshift(new MonthItem({
				year: d.getFullYear(),
				month: d.getMonth(),
				parentNode: this.node,
				onClickItem: this._onClickItem
			}, "before"));
			arr.pop().destroy();
		}
		evt.preventDefault();
	}
};



var viewerManager = {
	node: null,
	_selectDayItem: null,

	init: function(){
		this.node = Util.getNode("viewer");
		Util.on(this.node, "click", this._click.bind(this));
		this.resize();
	},

	setItem: function(DayItem) {
		this._selectDayItem = DayItem;
		this._update();
	},

	updateAfterAddRecordItem: function(dayItem){
		this._selectDayItem == dayItem && this._update();
	},

	_update: function(){
		this.node.innerHTML = "";
		this._selectDayItem && this._selectDayItem.getNodesForPane().forEach(function(_node){
			this.node.appendChild(_node);
		},this);
	},

	_click: function (evt){
		var ri = evt.target.getAttribute("ri");
		if(ri){
			var recordItem = this._selectDayItem.getRecordItem(ri);
			console.log(recordItem);
		}
	},

	resize: function (){
		var h = managerMonth.node.getBoundingClientRect().height;
		this.node.style.height = h + "px";
	}
};


var newRecordManager = {
	_isInit: false,
	node: null,

	_init: function(){
		if(!this._isInit){
			var node = this.node = Util.create("<div class='newRecord'>" +
					"<div class='t-table'>" +
						"<div class='t-row'>" +
							"<div class='t-cell'>Date</div>" +
							"<div class='t-cell'><input ap='ap_date' type='date' value=''/></div>" +
						"</div>" +
						"<div class='t-row'>" +
							"<div class='t-cell'>Time</div>" +
							"<div class='t-cell'><input ap='ap_time' type='time' value=''/></div>" +
						"</div>" +
						"<div class='t-row'>" +
							"<div class='t-cell'>Text</div>" +
							"<div class='t-cell'><textarea ap='ap_msg'></textarea></div>" +
						"</div>" +
						"<div class='t-row'>" +
							"<div class='t-cell'>Text</div>" +
							"<div class='t-cell'><input type='checkbox' ap='ap_isAlarm' /></div>" +
						"</div>" +
						"<div class='t-row'>" +
							"<div class='t-cell'>Text222</div>" +
							"<div class='t-cell'><input type='number' class='numberInput' ap='ap_before' value='1' max='120' min='1' /></div>" +
						"</div>" +
					"</div>" +
					"<div class='d-control'>" +
						"<div class='btn' ap='ap_add'>add</div >" +
						"<div class='btn' ap='ap_close'>close</div>" +
					"</div>" +
				"</div>");

			Util.bindAp("ap", node, this);

			this.ap_before.disabled = !this.ap_isAlarm.checked;
			Util.on(this.ap_isAlarm, "click", this._setIsAlarm.bind(this));
			
			Util.on(this.ap_add, "click", this._add.bind(this));
			Util.on(this.ap_close, "click", this._close.bind(this));

			this.dialog = new Dialog(node);

			this._isInit = true;
		}
	},

	_setIsAlarm: function(){
		this.ap_before.disabled = !this.ap_isAlarm.checked;
	},

	_add: function(){
		this.ap_date.classList.remove("err");
		this.ap_time.classList.remove("err");

		this.ap_before.value;
		if (this.ap_date.value && this.ap_time.value){
			this.dialog.hide();
			managerMonth.addRecordItem(new RecordItem({
				dateTime: this.ap_time.value + " " + this.ap_date.value,
				type: 0,
				msg: this.ap_msg.value
			}));
		}
		else {
			this.ap_date.value || this.ap_date.classList.add("err");
			this.ap_time.value || this.ap_time.classList.add("err");
		}
	},

	_close: function(){
		this.dialog.hide();
	},

	addItem: function(){
		this._init();

		var date = new Date();
		this.ap_date.value || (this.ap_date.value = Util.dateToStrDate(date));
		this.ap_time.value || (this.ap_time.value = Util.dateToStrTime(date));

		this.dialog.show();
	}
};



Util.on("addRecordItem", "click", function(){
	newRecordManager.addItem();
});

chrome.storage.local.get("records", function (data){
	managerMonth.init(data.records || []);
	viewerManager.init();
});








var lns = document.querySelectorAll("[ln]");
for(var i = 0; i < lns.length; ++i){
	var item = lns[i];
	var _ln = item.getAttribute("ln");
	item.innerText = chrome.i18n.getMessage(_ln);
}

var ap_timeAlarm_v = document.getElementById("timeAlarm_v");
var ap_timeIdle_v = document.getElementById("timeIdle_v");

var ap_txt_msgHead = document.getElementById("txt_msgHead");
var ap_txt_timeIdle = document.getElementById("txt_timeIdle");

var ap_btn_test = document.getElementById("btn_test");
var ap_btn_save = document.getElementById("btn_save");

var param = null;
var RS_alarm = null;
var RS_idle = null;

ap_btn_test.addEventListener("click", function () {
	chrome.runtime.sendMessage({
		destination: "background",
		query: "test",
		data: {
			msgHead: ap_txt_msgHead.value,
			msgBody: ap_txt_timeIdle.value
		}
	});
});

ap_btn_save.addEventListener("click", function () {
	chrome.runtime.sendMessage({
		destination: "background",
		query: "setParam",
		data: {
			timeAlarm: (param.timeAlarm = RS_alarm.value),
			timeIdle: (param.timeIdle = RS_idle.value),
			msgHead: (param.msgHead = ap_txt_msgHead.value),
			msgBody: (param.msgBody = ap_txt_timeIdle.value)
		}
	});
});


chrome.runtime.sendMessage({
	destination: "background",
	query: "getParam"
}, function(p) {
	param = p;
	RS_alarm = new RangeSlider({
		max: p.max_timeAlarm,
		min: p.min_timeAlarm,
		value: p.timeAlarm,
		onChange:function (n) {
			ap_timeAlarm_v.innerText = n + chrome.i18n.getMessage("opt_timeAlarm_v");
		}
	},"sl_timeAlarm");

	RS_idle = new RangeSlider({
		max: p.max_timeIdle,
		min: p.min_timeIdle,
		value: p.timeIdle,
		onChange:function (n) {
			ap_timeIdle_v.innerText = n + chrome.i18n.getMessage("opt_timeIdle_v");
		}
	},"sl_timeIdle");

	ap_timeAlarm_v.innerText = p.timeAlarm + chrome.i18n.getMessage("opt_timeAlarm_v");
	ap_timeIdle_v.innerText = p.timeIdle + chrome.i18n.getMessage("opt_timeIdle_v");

	ap_txt_msgHead.value = p.msgHead;
	ap_txt_timeIdle.value = p.msgBody;
});