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

// Error handling
Validation.implement('getLocaleErrors', function(fn){
	if (!fn) fn = function(error){
		var args = error.args || {};
		args.value = error.value;
		return Locale.get('Validation.' + error.name, args).substitute(args);
	};
	return (this.errors || []).map(fn);
});


// Localized Rules
var localizedRules = ['postcode'],
	trueFunction = Function.from(true);

var setLocalizedRules = function(){
	var l = localizedRules.length,
		rule;

	while (l--){
		rule = Locale.get('Validation.rules.' + localizedRules[l]);
		if (typeOf(rule) == 'regexp') Validation.defineRegExpRule(localizedRules[l], rule);
		else Validation.defineRule(localizedRules[l], rule || trueFunction);
	}
	return setLocalizedRules;
};

// If Locale.use is called, we need to get the localized rules again
Locale.addEvent('change', setLocalizedRules());

})();
