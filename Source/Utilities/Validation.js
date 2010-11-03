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
		allowEmpty: false/*
		filters: []*/
	},

	rules: [],
	rulesArgs: [],
	filters: [],

	initialize: function(rules, options){
		this.setOptions(options);
		if (rules) this.addRules(Array.from(rules));
		if (this.options.filters) this.addFilters(this.options.filters);

	},

	addRule: function(rule, args){
		if (Type.isString(rule)) rule = Validation.Rules[rule];
		if (rule && !this.rules.contains(rule)){
			this.rules.push(rule);
			this.rulesArgs.push(args);
		}
	},

	addRules: function(rules){
		for (var i = 0, l = rules.length; i < l; i++)
			this.addRule(rules[i]);
	},

	addFilter: function(filter){
		if (Type.isString(filter)) filter = String.prototype[filter];
		if (filter) this.filters.push(filter);
	},

	addFilters: function(filters){
		for (var i = 0, l = filters.length; i < l; i++)
			this.addFilter(filters[i]);
	},

	validate: function(value, allowEmpty){
		var errors = this.errors = [];

		if (allowEmpty || (allowEmpty == null && this.options.allowEmpty)){
			if (Validation.Rules['empty'](value)) return true;
		}

		for (var i = 0, l = this.filters.length; i < l; i++)
			value = this.filters[i].call(value, value);

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

	getErrors: function(fn){
		if (!fn) fn = function(error){
			return error[0];
		};
		return this.getErrorCodes().map(fn);
	}

});


// Define Validation Rules
Validation.Rules = {};

Validation.defineRule = function(name, fn){
	Validation.Rules[name] = function(){
		return fn.apply(null, arguments) || name;
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
