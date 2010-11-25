/*
---

name: Validation.Validators

description: All kind of validators

license: MIT-style license

authors:
  - Arian Stolwijk

requires:
  - Validation

provides: [Validation.Validators]

...
*/

(function(){


Validation.defineRules(Object.map({

	integer: /^(-?[1-9]\d*|0)$/,
	numeric: /^-?(?:0$0(?=\d*\.)|[1-9]|0)\d*(\.\d+)?$/,
	digits: /^[\d() .:\-\+#]+$/,
	alpha: /^[a-zA-Z]+$/,
	alphanum: /^[a-z0-9]+$/i,
	email: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
	url: /^(https?|ftp|rmtp|mms):\/\/(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)(:(\d+))?\/?/i,

	// [$]1[##][,###]+[.##]
	// [$]1###+[.##]
	// [$]0.##
	// [$].##
	currencyDollar: /^\$?\-?([1-9]{1}[0-9]{0,2}(\,[0-9]{3})*(\.[0-9]{0,2})?|[1-9]{1}\d*(\.[0-9]{0,2})?|0(\.[0-9]{0,2})?|(\.[0-9]{1,2})?)$/

}, function(regex){
	return function(value){
		return regex.test(value);
	};
}));

Validation.defineRules({

	date: function(value, args){
		var d;
		if (!args) args = {};
		if (Date.parse){
			d = Date.parse(value);
			return d.isValid();
		} else {
			var regex = args.formatRegex || /^(\d{2})\/(\d{2})\/(\d{4})$/;
			if (!regex.test(value)) return false;
			d = new Date(value.replace(regex, '$1/$2/$3'));
			return (
				parseInt(RegExp.$1) == (1 + d.getMonth())) &&
				(parseInt(RegExp.$2) == d.getDate()) &&
				(parseInt(RegExp.$3) == d.getFullYear()
			);
		}
	}

});

})();
