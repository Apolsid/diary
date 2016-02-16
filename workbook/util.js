(function  (w, d) {
	var _u = w.Util = {};
	_u.getNode = function(node) {
		return typeof node == "string" ? d.getElementById(node): node;
	};

	_u.on = function(node, e, f){
		Array.isArray(node) ? node.forEach(function(item){ _u.getNode(item).addEventListener(e, f); }) :
								_u.getNode(node).addEventListener(e, f);
	};
	_u.rem = function(node, e, f){
		Array.isArray(node) ? node.forEach(function(item){ _u.getNode(item).removeEventListener(e, f); }) :
								_u.getNode(node).removeEventListener(e, f);
	};

	_u.create = function(txt, parentNode, t){
		var n = d.createElement("div");
		n.innerHTML = txt;
		var node = n.childNodes[0];
		parentNode && _u.append(node, parentNode, t);
		return node;
	};

	_u.append = function(node, parentNode, t){
		t == "before" ? parentNode.insertBefore(node, parentNode.childNodes[0])
			: parentNode.appendChild(node);
	};

	_u.getRect = function(node){
		return _u.getNode(node).getBoundingClientRect();
	};

	_u.bindAp = function(t, node, target){
		var nodes = _u.getNode(node).querySelectorAll("[" + t + "]");
		for(var i = 0; i < nodes.length; ++i){
			var _node = nodes[i];
			var ap = _node.getAttribute(t);
			target[ap] = _node;
		}
	};

	// YYYY-MM-DD
	_u.dateToStrDate = function(date){
		var month  = (date.getMonth() + 1) + "";
		month.length == 1 && (month = "0" + month);

		return date.getFullYear() + "-" + month + "-" + date.getDate();
	};

	_u.dtAddNullToStr = function (n){
		return (n < 10 ? "0" : "") + n;
	},

	// hh:mm
	_u.dateToStrTime= function(date){
		return date.getHours() + ":" + date.getMinutes();
	};
})(window, document);