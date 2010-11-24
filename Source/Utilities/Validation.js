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

	initialize: function(rules, options){
		this.setOptions(options);
		if (rules) this.addRules(Array.from(rules));
	},

	addRule: function(rule, args){
		if (Type.isString(rule)) rule = Validation.Rules[rule];
		if (Type.isFunction(rule)) rule = {
			name: null,
			fn: rule
		};
		if (rule && rule.fn){
			rule.args = args;
			this.rules.include(rule);
		}
		return this;
	},

	addRules: function(rules){
		for (var i = 0, l = rules.length; i < l; i++) this.addRule(rules[i]);
		return this;
	},

	validate: function(value, allowEmpty){
		var errors = this.errors = [];

		if (allowEmpty || (allowEmpty == null && this.options.allowEmpty)){
			if (Validation.Rules['empty'](value)) return true;
		}

		var rules = this.rules,
			result,
			rule;

		for (var i = 0, l = rules.length; i < l; i++){
			rule = rules[i];
			result = rule.fn(value, rule.args);
			if (result != true) errors.push({
				name: rule.name,
				result: result,
				value: value,
				args: rule.args
			});
		}

		this.errors = errors;
		return !errors.length;
	},

	getErrorCodes: function(){
		return this.errors || [];
	},

	getErrors: function(fn){
		if (!fn) fn = function(error){
			return error.name;
		};
		return this.getErrorCodes().map(fn);
	}

});


// Define Validation Rules
Validation.Rules = {};

Validation.defineRule = function(name, fn){
	Validation.Rules[name] = {
		name: name,
		fn: fn
	};
};

Validation.defineRule('empty', function(value){
	return (value == null || value == '');
});

Validation.defineRules = Validation.defineRule.overloadSetter();


// Defining default rules (probably only very basic, and provide additional rules in a separate file)
Validation.defineRules({

	required: function(value){
		return value != null && value != '';
	},

	between: function(value, args){
		return (value > args.min && value < args.max);
	},

	minLength: function(value, args){
		return (value.length >= args.minLength);
	},

	maxLength: function(value, args){
		return (value.length <= args.maxLength);
	}
});

})();
