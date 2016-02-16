(function (w, d) {
	w._dialogParam={
		overNode: null,
		_isInit: false,
		_isShow: false,
		_body: null,
		resize: function(){
			if(this._isShow){
				this.overNode.style.height =  d.documentElement.clientHeight + "px";
				this.overNode.style.width = d.documentElement.clientWidth + "px";
				this.overNode.style.left = w.pageXOffset + "px";
				this.overNode.style.top = w.pageYOffset + "px";
			}
		},
		init: function(){
			if(!this._isInit){
				var body = this._body = d.querySelector("body");
				this.overNode = Util.create("<div class='overNode' style='display:none;'></div>", body);
				w.addEventListener("resize", this.resize.bind(this));
				this.isInit = true;
			}
		},
		show: function(){
			if(!this._isShow){
				this.overNode.style.display = "";
				this._body.style.overflow = "hidden";
				this._isShow = true;
				this.resize();
			}
		},
		hide: function(){
			if(this._isShow){
				this.overNode.style.display = "none";
				this._body.style.overflow = "";
				this._isShow = false;
			}
		}
	};


	w.Dialog = function(content, headText){
		w._dialogParam.init();
		this._body = d.querySelector("body");

		var headNode = Util.create("<div class='head'>" + (headText || " asd") + "</div>");
		var contentNode = Util.create("<div class='content'></div>");

		this.node = Util.create("<div class='dialog' style='display:none;left:0;top:0'></div>", 
								this._body);

		contentNode.appendChild(content);
		this.node.appendChild(headNode);
		this.node.appendChild(contentNode);

		Util.on(headNode, "mousedown", this._m_down.bind(this));
	};
	w.Dialog.prototype = {
		_base_X: 0,
		_base_mX: 0,
		_base_Y: 0,
		_base_mY: 0,
		_min_X: 0,
		_min_Y: 0,
		_max_X: 0,
		_max_Y: 0,
		_m_events: null, // []
		_isMove: false,

		_m_down: function(evt){
			if(!this._isMove){
				this._base_mX = evt.clientX;
				this._base_mY = evt.clientY;

				this._m_events = [{ target: d, type: "mousemove", f: this._m_move.bind(this)}, 
									{ target: d, type: "mouseup", f: this._m_up.bind(this)}];

				this._m_events.forEach(function(item){
					Util.on(item.target, item.type, item.f);
				});
				this._isMove = true;
			}
			evt.stopPropagation();
			evt.preventDefault();
		},
		_m_move: function(evt){
			var xy = this._getXY(evt);

			this.node.style.left = xy.x + "px";	
			this.node.style.top = xy.y + "px";
		},
		_m_up: function(evt){
			var xy = this._getXY(evt);

			this._base_X = xy.x;
			this._base_Y = xy.y;
			this._m_events.forEach(function(item){
				Util.rem(item.target, item.type, item.f);
			});
			this._isMove = false;
		},
		_getXY: function(evt){
			var x = this._base_X + (evt.clientX - this._base_mX);
			var y = this._base_Y + (evt.clientY - this._base_mY);

			if(x>this._max_X)
				x = this._max_X;
			else if (x<this._min_X)
				x = this._min_X;

			if(y>this._max_Y)
				y = this._max_Y;
			else if (y<this._min_Y)
				y = this._min_Y;

			return {x:x, y:y};
		},
		show: function (){
			if(!this._isShow){
				this.node.style.display = "";
				this._isShow = true;
				this.resize();

				w._dialogParam.show();
			}
		},
		hide: function(){
			if(this._isShow){
				this.node.style.display = "none";
				this._isShow = false;

				w._dialogParam.hide();
			}
		},
		resize: function(){
			if(this._isShow){
				var rectNode = Util.getRect(this.node),
					d_width = d.documentElement.clientWidth,
					d_height = d.documentElement.clientHeight,
					_x = rectNode.width / 2,
					_y = rectNode.height / 2,
					x = d_width / 2,
					y = d_height / 2;

				this._max_X = d_width - rectNode.width;
				this._max_Y = d_height - rectNode.height;
				this._max_X < 0 && (this._max_X = 0);
				this._max_Y < 0 && (this._max_Y = 0);

				this.node.style.left = (this._base_X = x - _x) + "px";
				this.node.style.top = (this._base_Y = y - _y) + "px";
			}
		}
	};
})(window, document)