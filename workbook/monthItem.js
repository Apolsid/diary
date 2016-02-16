(function (w, d) {
	var class_DayItem = "dayItem";
	var class_DayIsrecordItem = "is";
	var class_RecordPaneItem= "paneItem";

	w.DayItem = function (attr) {
		for (var n in attr) this[n] = attr[n];

		this.init();
	};
	w.DayItem.prototype = {
		year: 0,
		date: 0,
		day: 0,
		dayName: "",
		month: 0,
		parentNode: null,
		_recordItems: null,
		_nodeForPane: null,

		init: function () {
			this.dayName = chrome.i18n.getMessage("day_" + this.day);
			this.node = Util.create("<div class='" + class_DayItem + "'>" + this.date + "</div>", this.parentNode);

			this._recordItems = this.baseGetRecordItems(this);
			this._checkState();
		},

		setPos: function (pos) {
			this.node.style.top = pos.y + "px";
			this.node.style.left = pos.x + "px";
		},

		addRecordItem: function(item){
			this._recordItems.push(item);
			this._checkState();
			this.updateAfterAddRecordItem(this);
		},

		_checkState: function(){
			if (this._recordItems.length){
				this._recordItems.sort(function(i0, i1){
					if (i0._Date > i1._Date)
						return 1;
					else if (i0._Date < i1._Date)
						return -1;
					else
						return 0;
				});

				this.node.title = this._recordItems.length + "";
				this.node.classList.add(class_DayIsrecordItem);
			}
			else {
				this.node.title = this.dayName;
				this.node.classList.remove(class_DayIsrecordItem);
			}
			this._nodeForPane = null;
		},

		getRecordItem: function(i){
			return this._recordItems[i];
		},

		getNodesForPane: function(){
			if (this._nodeForPane)
				return this._nodeForPane;
			else {
				return this._nodeForPane = this._recordItems.map(function(recordItem, i) {
					var time = Util.dtAddNullToStr(recordItem.hour) + ":" + Util.dtAddNullToStr(recordItem.minute);
					return Util.create("<div class='" + class_RecordPaneItem + "' ri='" + i + "'>" + time + " " + recordItem.data.msg + "</div>");
				}, this);
			}
		}
	};

	w.MonthItem = function (attr, typeAppend) {
		for (var n in attr) this[n] = attr[n];

		this._dayItems = [];
		this.init(typeAppend);
	};
	w.MonthItem.prototype = {
		year: 0,
		month: 0,
		parentNode: null,	
		onClickItem: function(){},

		_dx: 3,
		_dy: 3,

		init: function (typeAppend) {
			this.node = Util.create("<div class='monthItem'>" +
										"<div class='name'>" + chrome.i18n.getMessage("month_" + this.month) + "</div>" +
										"<div class='list'></div>" +
									"</div>", 
									this.parentNode, typeAppend);

			this.monthNameNode = this.node.querySelector(".name");
			this.listNode = this.node.querySelector(".list");

			var edDate = new Date(this.year, this.month);
			edDate.setMonth(edDate.getMonth() + 1);
			edDate.setDate(edDate.getDate() - 1);

			var st_v = 1,
				ed_v = edDate.getDate(),
				arr = this._dayItems;
			for(var i = st_v; i <= ed_v; ++i ){
				var date = new Date(this.year, this.month, i);
				arr.push(new w.DayItem({
					year: date.getFullYear(),
					month: this.month,
					date: date.getDate(),
					day: date.getDay(),
					parentNode: this.listNode
				}));
			}

			Util.on(this.node, "click", this._click.bind(this));
			this.resize();
		},

		addRecordItem: function(item){
			this._dayItems.some(function(dayItem){
				if(dayItem.date == item.date){
					dayItem.addRecordItem(item);
					return true;
				}
			});
		},

		_click: function(evt){
			var target = evt.target;
			if(target.className.indexOf(class_DayItem) > -1){
				this._dayItems.some(function (item, i) {
					if(item.node == target){
						this.onClickItem(item);
						return true;
					}
				}, this);
			}
		},

		resize: function () {
			var item = this._dayItems[0],
				rect = item.node.getBoundingClientRect(),
				w = rect.width,
				h = rect.height,
				x = y = maxY = maxX = 0;

			this._dayItems.forEach(function (item, i) {
				var day = item.day;
				if (i == 0){
					y = (h + this._dy) * (day == 0 ? 6 : (day - 1));
				}
				else if (day == 1){
					x += w + this._dx;
					y = 0;
				}

				item.setPos({
					x: x,
					y: y
				});

				maxY < y && (maxY = y);
				maxX < x && (maxX = x);

				y += h + this._dy;
			}, this);

			this.listNode.style.height = maxY + h + "px";
			this.listNode.style.width = maxX + w + "px";
		},

		destroy: function () {
			this.node.parentNode.removeChild(this.node);
		}
	};
})(window, document);