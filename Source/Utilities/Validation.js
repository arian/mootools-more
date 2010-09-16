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

	rules: [],
	rulesArgs: [],

	initialize: function(rules, options){
		this.setOptions(options);
		if (rules) this.addRules(rules);
	},

	addRule: function(rule){
		if (Type.isString(rule)) rule = Validation.Rules[rule];
		if (rule && !this.rules.contains(rule)){
			this.rules.push(rule);
			this.rulesArgs.push(Array.slice(arguments, 1));
		}
	},

	addRules: function(rules){
		for (var i = 0, l = rules.length; i < l; i++)
			this.addRule(rules[i]);
	},

	isValid: function(value, allowEmpty){
		var errors = this.errors = [];

		if (allowEmpty || (allowEmpty == null && this.options.allowEmpty)){
			if (Validation.Rules['isEmpty'](value)) return true;
		}

		var rules = this.rules,
			result,
			args;

		for (var i = 0, l = rules.length; i < l; i++){
			args = this.rulesArgs[i];
			result = rules[i].call(null, value, args);
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


// Define Validation Rules
Validation.Rules = {};

Validation.defineRule = function(name, fn){
	Validation.Rules[name] = fn;
};

Validation.defineRule('isEmpty', function(value){
	return (value == null || value == '') || 'isEmpty';
});

Validation.defineRules = Validation.defineRule.overloadSetter();


// Defining default rules (probably only very basic, and provide additional rules in a separate file)
Validation.defineRules({

	isBetween: function(value, args){
		return (value > args.min && value < args.max) || 'isBetween';
	},

	minLength: function(value, args){
		return (value.length >= args.min) || 'minLength';
	},

	maxLength: function(value, args){
		return (value.length <= args.max) || 'maxLength';
	},

	email: function(value){
		return (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i).test(value) || 'email';
	}

});


//Localization
if (this.Locale){

	var getValidationLocale = function(key, value, args){
		if (!args) args = {};
		args.value = value;
		return Locale.get('Validation.' + key, args).substitute(args);
	}

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

	Locale.addEvent('change', setLocalizedRules);

} else {
	var getValidationLocale = function(value){
		return value;
	};
}


})();
