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


Validation.defineRegExpRules({

	integer: /^(-?[1-9]\d*|0)$/,
	numeric: /^-?(?:0$0(?=\d*\.)|[1-9]|0)\d*(\.\d+)?$/,
	digits: /^[\d() .:\-\+#]+$/,
	alpha: /^[a-zA-Z]+$/,
	alphanum: /^[a-z0-9]+$/i,

	/*
	var chars = "[a-z0-9!#$%&'*+/=?^_`{|}~-]",
		local = '(?:' + chars + '\\.?){0,63}' + chars,

		label = '[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?',
		hostname = '(?:' + label + '\\.)*' + label;

		octet = '(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)',
		ipv4 = '\\[(?:' + octet + '\\.){3}' + octet + '\\]',

		domain = '(?:' + hostname + '|' + ipv4 + ')';

	var regex = new RegExp('^' + local + '@' + domain + '$', 'i');
	*/
	email: /^(?:[a-z0-9!#$%&'*+\/=?^_`{|}~-]\.?){0,63}[a-z0-9!#$%&'*+\/=?^_`{|}~-]@(?:(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\])$/i,

	url: /^(https?|ftp|rmtp|mms):\/\/(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)(:(\d+))?\/?/i,

	// [$]1[##][,###]+[.##]
	// [$]1###+[.##]
	// [$]0.##
	// [$].##
	currencyDollar: /^\$?\-?([1-9]{1}[0-9]{0,2}(\,[0-9]{3})*(\.[0-9]{0,2})?|[1-9]{1}\d*(\.[0-9]{0,2})?|0(\.[0-9]{0,2})?|(\.[0-9]{1,2})?)$/

});


Validation.defineRule('date', function(value, options){
	if (Date.parse) return Date.parse(value).isValid();

	var regex = (options && options.formatRegex) || /^(\d{2})\/(\d{2})\/(\d{4})$/,
		date;
	if (!regex.test(value)) return false;
	date = new Date(value.replace(regex, '$1/$2/$3'));

	return (
		(parseInt(RegExp.$1) == (1 + date.getMonth()))) &&
		(parseInt(RegExp.$2) == date.getDate()) &&
		(parseInt(RegExp.$3) == date.getFullYear()
	);
});

})();
