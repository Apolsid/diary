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

		this.node = Util.create("<div class='dialog' style='display:none;'></div>", 
								this._body);

		contentNode.appendChild(content);
		this.node.appendChild(headNode);
		this.node.appendChild(contentNode);
	};
	w.Dialog.prototype = {
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
					_x = rectNode.width / 2,
					_y = rectNode.height / 2,
					x = d.documentElement.clientWidth / 2,
					y = d.documentElement.clientHeight /2 ;

				this.node.style.left = x - _x + "px";
				this.node.style.top = y - _y + "px";
			}
		}
	};
})(window, document)