/*
---

name: Locale.nl-NL.Validation

description: Localized Validators and error messages for Dutch.

license: MIT-style license

authors:
  - Arian Stolwijk

requires:
  - Locale
  - Validation.Locale

provides: [Locale.nl-NL.Validation]

...
*/

Locale.define('nl-NL', 'Validation', {

	errors: {
		isBetween: 'De gegeven waarde moet tussen minimaal {min} en maximaal {max} liggen',
		minLength: 'De waarde mag niet korter zijn dan {minLength} tekens',
		maxLength: 'De waarde mag niet langer zijn dan {maxLength} tekens',
		postcode: 'De opgegeven postcode is niet geldig'
	},

	rules: {
		postcode: function(value){
			return (/^[1-9]{1}[0-9]{3}\s?[A-Za-z]{2}$/).test(value) || 'postcode';
		}
	}

}).setOptions({
	runFunctions: false
});
