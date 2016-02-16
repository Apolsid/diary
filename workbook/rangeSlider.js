var RangeSlider = function (attr, node) {
	for (var n in attr) 
		this[n] = attr[n];

	this.max = attr.max || 0;
	this.min = attr.min || 0;
	this.onChange = attr.onChange || function () {};

	this._moveParam = {
		start_x: 0,
		temp_dx: 0,
		current_dx: 0
	};

	Object.defineProperty(this, "value", {
		get: function () {
			return this._value;
		},
		set: function (v) {
			this._value === v || this._setValue(v);
		}
	});

	this.init(node);

	var value = attr.value || 0;
	if(value > this.max)
		value = this.max;
	else if (value < this.min)
		value = this.min;

	this._setValue(value, true);
};
RangeSlider.prototype = {
	_value: null,
	_barWidth: 0,
	_portionWidth:0,
	_countPortion:0,

	init: function (node) {
		if (node instanceof HTMLElement)
			this.node = node;
		else if (typeof node == "string")
			this.node = document.getElementById(node);
		else {
			console.error("node not type");
			return;
		}

		this.node.setAttribute("class", "slider");

		(this.ap_bar = document.createElement("div")).setAttribute("class", "bar");
		(this.ap_progress = document.createElement("div")).setAttribute("class", "progress");
		(this.ap_jack = document.createElement("div")).setAttribute("class", "jack");


		this._fn_mousemove = (function (evt) {
			this._sliderMove(evt);
			evt.preventDefault();
		}).bind(this);

		this._fn_mouseup = (function () {
			this._sliderStop();
		}).bind(this);

		this.ap_jack.addEventListener("mousedown", (function (evt) {
			this._sliderStart(evt);
		}).bind(this));

		this.node.appendChild(this.ap_bar);
		this.node.appendChild(this.ap_progress);
		this.node.appendChild(this.ap_jack);

		this._barWidth = this.ap_bar.getBoundingClientRect().width - 10; // Учитываем ползунок
		this._countPortion = (this.max - this.min) || 1;
		this._portionWidth = this._barWidth / this._countPortion;
	},

	_setValue: function  (v, isNotChange) {
		this._value = v;
		var n = v - this.min;
		var dx = this._portionWidth * n;
		this._moveParam.current_dx = dx;
		this._setDX(dx);
		isNotChange || this.onChange(v);
	},

	_sliderStart: function (evt){
		document.addEventListener("mousemove", this._fn_mousemove);
		document.addEventListener("mouseup", this._fn_mouseup);
		this._moveParam.start_x = evt.clientX;
		this._sliderMove(evt);
	},

	_sliderStop: function (){
		document.removeEventListener("mousemove", this._fn_mousemove);
		document.removeEventListener("mouseup", this._fn_mouseup);
		this._moveParam.current_dx = this._getMoveData().dx;
		this._moveParam.temp_dx = null;
	},

	_sliderMove: function (evt){
		var dx = evt.clientX - this._moveParam.start_x;
		dx  = this._moveParam.current_dx + dx;

		dx < 0 && (dx = 0);
		dx > this._barWidth && (dx = this._barWidth);

		this._moveParam.temp_dx = dx;
		this._onChange();
	},

	_getMoveData: function () {
		var n = this._moveParam.temp_dx / this._barWidth;
		var portions = Math.round(this._countPortion * n);
		return {
			portions: portions,
			dx: this._portionWidth * portions,
			value: this.min + portions
		};
	},

	_onChange: function () {
		var data = this._getMoveData();
		if(this._value != data.value){
			this._setDX(data.dx);
			this.onChange(this._value = data.value);
		}
	},

	_setDX: function (dx) {
		this.ap_jack.style.left = dx + 5 + "px"; // Учитываем ползунок
		this.ap_progress.style.width = dx + "px";
	}
};