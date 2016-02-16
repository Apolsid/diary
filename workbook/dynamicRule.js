(function  (w, d) {
	w.DynamicRule = function () {
		var styleTag = d.getElementById(this.nodeId);

		if (!styleTag) {
			var styleTag = d.createElement("style");
			styleTag.id = this.nodeId;
			var _head = d.getElementsByTagName("head")[0];
			_head.appendChild(styleTag);
		}

		var _s = styleTag.sheet ? styleTag.sheet : styleTag.styleSheet;

		if (_s.rules)
			this.curentRuleLength = _s.rules.length;
		else if (_s.cssRules)
			this.curentRuleLength = _s.cssRules.length;
		else
			console.error("Error init styleTag");

		if (_s.insertRule)
			this.fAddRule = function (tag, attr, index) { _s.insertRule(tag + "{" + attr + "}", index); }
		else if (_s.addRule)
			this.fAddRule = function (tag, attr, index) { _s.addRule(tag, attr, index); }
		else
			console.error("Error init styleTag");

		if (_s.removeRule)
			this.fRemoveRule = function (n) { _s.removeRule(n); }
		else if (_s.deleteRule)
			this.fRemoveRule = function (n) { _s.deleteRule(n); }
		else
			console.error("Error init styleTag");
	};
	w.DynamicRule.prototype = {
		nodeId: "dynamicRule",

		newRule: function (tag, _attr) {
			var _base = this;
			var index = this.curentRuleLength++;
			this.fAddRule(tag, typeof _attr != "undefined" ? _attr : "", index);
			return {
				_tag: tag,
				_index: index,
				clear: function () {
					_base.fRemoveRule(this._index);
					_base.fAddRule(this._tag, "", this._index);
				},
				set: function (attr) {
					_base.fRemoveRule(this._index);
					_base.fAddRule(this._tag, attr, this._index);
				}
			};
		}
	};
})(window, document);