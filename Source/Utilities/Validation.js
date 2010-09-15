/*
---

name: Validation

description: A Validation System

license: MIT-style license

authors:
  - Arian Stolwijk

requires:
  - Core/Class
  - Core/Object

provides: [Validation]

...
*/

(function(){

var Validation = this.Validation = new Class({

	Implements: Options,

	options: {
		allowEmpty: false
	},

	tests: [],
	testsArgs: [],

	initialize: function(tests, options){
		this.setOptions(options);
		this.addTests(tests);
	},

	addTest: function(test){
		if (Type.isString(test)) test = Validation.Tests[tests];
		if (test && !this.tests.contain(test)){
			this.tests.push(test);
			this.testsArgs.push(Array.slice(arguments, 1));
		}
	},

	addTests: function(tests){
		for (var i = 0, l = tests.length; i < l; i++)
			this.addTest(tests[i]);
	},

	isValid: function(value, allowEmpty){
		var errors = this.errors = [];

		if (allowEmpty || (allowEmpty == null && this.options.allowEmpty)){
			if (Validation.Tests['isEmpty'](value)) return true;
		}

		var tests = this.tests,
			result,
			args;

		for (var i = 0, l = tests.length; i < l; i++){
			args = this.testsArgs[i];
			result = tests[i].call(null, value, args);
			if (result != true) errors.push([result, value, args]);
		}

		this.errors = errors;
		return !errors.length;
	},

	getErrorCodes: function(){
		return this.errors || [];
	},

	getErrors: function(){
		return this.getErrorCodes().map(function(value){
			return getValidationLocale('errors.' + value[0], value[1], value[2]);
		});
	}


});

// Localization
if (this.Locale){

	var getValidationLocale = function(key, value, args){
		if (!args) args = {};
		args.value = value;
		return Locale.get('Validation.' + key, args).substitute(args);
	}

	var localizedTests = ['postcode'],
		trueFunction = Function.from(true);

	Locale.addEvent('change', function(){
		var test,
			l = localizedTests.length;

		while (l--){
			test = Locale.get('Validation.tests.' + localizedTests[l]);
			Validation.Validators[l] = test || trueFunction;
		}
	});

} else {
	var getValidationLocale = function(value){
		return value;
	};
}


// Define Validators
Validation.Tests = {};

Validation.defineTest = function(name, fn){
	Validate.Validators[name] = fn;
};

Validation.defineTest('isEmpty', function(value){
	return (value == null || value == '') || 'isEmpty';
});

Validation.defineTests = Validation.defineTest.overloadSetter();


// Defining default validators (probably only very basic, and provide additional tests in a separate file)
Validation.defineTests({

	isBetween: function(value, args){
		return (value > args.min && value < args.max) || 'isBetween';
	},

	minLength: function(value, args){
		return (value.length >= args.min) || 'minLength';
	},

	maxLength: function(value, args){
		return (value.length <= args.max) || 'maxLength;
	},

	email: function(value){
		return (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i).test(value) || 'email';
	}

});

})();
