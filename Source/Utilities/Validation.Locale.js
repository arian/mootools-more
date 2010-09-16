/*
---

name: Validation.Locale

description: Localization for Validation

license: MIT-style license

authors:
  - Arian Stolwijk

requires:
  - Locale
  - Validation

provides: [Validation.Locale]

...
*/

(function(){

// Errors
Validation.implement('getErrors', function(fn){
	if (!fn) fn = function(error){
		var args = error[2] || {};
		args.value = error[1];
		return Locale.get('Validation.' + error[0], args).substitute(args);
	};
	return this.getErrorCodes().map(fn);
});


// Localized Rules
var localizedRules = ['postcode'],
	trueFunction = Function.from(true);

var setLocalizedRules = function(){
	var rule,
		l = localizedRules.length;

	while (l--){
		rule = Locale.get('Validation.rules.' + localizedRules[l]);
		Validation.Rules[localizedRules[l]] = rule || trueFunction;
	}
};

setLocalizedRules();

// If Locale.use is called, we need to get the localized rules again
Locale.addEvent('change', setLocalizedRules);

})();
