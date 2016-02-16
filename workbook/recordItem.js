/*var itemData = {
	type: 0, // 0 - обычное, 1 - важное
	msg: "",
	dateTime: "10.00 01.00.2016",
	alarm: {},
	beforeAlarm: []
};*/

(function (w,d) {
	w.RecordItem = function (data){
		this.data = data;
		this.init();
	};
	w.RecordItem.prototype = {
		init:function(){
			var	sp = this.data.dateTime.split(" "),
				sp_time = sp[0].split(":"),
				sp_date = sp[1].split("-");

			this.hour = parseInt(sp_time[0]);
			this.minute = parseInt(sp_time[1]);

			this.year = parseInt(sp_date[0]);
			this.month = parseInt(sp_date[1]);
			this.date = parseInt(sp_date[2]);

			this._Date = new Date(this.year, this.month - 1, this.date, this.hour, this.minute);
		}
	};
})(window, document)