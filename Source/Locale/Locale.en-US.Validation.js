/*
---

name: Locale.en-US.Validation

description: Localized Validators and error messages for US.

license: MIT-style license

authors:
  - Arian Stolwijk

requires:
  - Locale
  - Validation.Locale

provides: [Locale.en-US.Validation]

...
*/

Locale.define('en-US', 'Validation', {

	errors: {
		isBetween: 'The given value must be between {min} and {max}',
		minLength: 'The given value must have at least {minLength} characters',
		maxLength: 'The given value cannot have more than {maxLength} characters',
		postcode: 'The given ZIP Code is not correct'
	},

	rules: {
		postcode: /^\d{5}(-\d{4})?$/
	}

}).setOptions({
	runFunctions: false
});
