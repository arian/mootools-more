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

var ruleObjectOf = function(rule, args){
	var type = typeOf(rule);
	if (type != 'object'){
		if (type == 'string') rule = {name: rule};
		else if (type == 'function') rule = {fn: rule};
		else rule = {};
	}

	if (rule && rule.name && !rule.fn){
		rule = Object.merge(rule, Validation.Rules[rule.name]);
	}

	if (args != null){
		args = Array.from(args);
		if (args.length) rule.args = args;
	}
	return (rule && rule.fn) ? rule : null;
};

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

	addRule: function(rule){
		var rule = ruleObjectOf(rule, Array.slice(arguments, 1));
		if (rule) this.rules.include(rule);
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
			rule,
			valid;

		for (var i = 0, l = rules.length; i < l; i++){
			rule = rules[i];
			valid = result = rule.fn.apply(rule, [value].concat(rule.args));

			if (Type.isObject(result)){
				valid = result.valid;
				result = result.errors;
			}

			if (valid != true){
				result = Array.from(result);
				for (var j = 0, m = result.length; j < m; j++) errors.push({
					name: rule.name,
					error: result[j],
					value: value,
					args: rule.args
				});
			}
		}

		this.errors = errors;
		return !errors.length;
	},

	getErrors: function(fn){
		var errors = this.errors || [];
		if (!fn) return errors;
		return errors.map(fn);
	}

});


// A shortcut if only true/false is needed
Validation.validate = function(rule, value){
	var rule = ruleObjectOf(rule, Array.slice(arguments, 2));
	if (!rule) return false;

	var result = rule.fn.apply(rule, [value].concat(rule.args));
	return !!(result.valid != null) ? result.valid : result;
};


// Define Validation Rules
Validation.Rules = {};

Validation.defineRule = function(name, rule){
	Validation.Rules[name] = {
		name: name,
		fn: rule
	};
	return this;
};
Validation.defineRules = Validation.defineRule.overloadSetter();

// Easy defining regular expressions as rules
Validation.defineRegExpRule = function(name, regex){
	Validation.defineRule(name, function(value){
		return regex.test(value);
	});
};
Validation.defineRegExpRules = Validation.defineRegExpRule.overloadSetter();


// Defining default rules
Validation.defineRules({

	empty: function(value){
		return (value == null || value == '');
	},

	required: function(value){
		return value != null && value != '';
	},

	equals: function(value, options){
		return value == options.equals;
	},

	between: function(value, options){
		return (value > options.min && value < options.max);
	},

	minLength: function(value, options){
		return (value.length >= options.minLength);
	},

	maxLength: function(value, options){
		return (value.length <= options.maxLength);
	}
});

})();
