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

var rules = {};

var Validation = this.Validation = new Class({

	Implements: [Options, Events],

	options: {
		stopOnFail: false
	},

	rules: [],
	failed: [],

	initialize: function(rules){
		if (rules) this.addRules(Array.from(rules));
	},

	addRule: function(rule, options){
		rule = Validation.lookupRule(rule);
		if (rule){
			if (options) Object.merge(rule.options, options);
			this.rules.include(rule);
		}
		return this;
	},

	addRules: function(rules){
		for (var i = 0, l = rules.length; i < l; i++) this.addRule(rules[i]);
		return this;
	},

	validate: function(value, options){

		var old = this.options;
		options = Object.append({stopOnFail: old.stopOnFail}, options);

		var rules = this.rules, length = rules.length,
			passed = [], progressed = [], failed = [],
			self = this;

		var getResult = function(result, rule){
			if (!Type.isObject(result)) result = {passed: result};
			Object.append(result, {rule: rule, name: rule.name, value: value, options: rule.options});
			return result;
		};

		var progress = function(rule){
			return function(result){
				result = getResult(result, rule);
				progressed.push(result);
				(result.passed ? passed : failed).push(result);
				self.fireEvent('progress', [result, progressed, passed, failed, rules]);
				if (passed.length == length){ // all rules passed
					self.fireEvent('success', [passed]);
				} else if (
					(!result && options.stopOnFail) // first one failed
					|| (progressed.length == length) // all failed
				){
					this.failed = failed;
					self.fireEvent('failure', [failed]);
				} else { // validate next rule
					validate(); 
				}
			};
		};

		var validate = function(){
			var rule = rules[progressed.length];
			if (rule.async) rule.rule.call(self, value, rule.options, progress(rule));
			else progress(rule)(rule.rule.call(self, value, rule.options));
		};
		validate();

		return !failed.length;
	},

	getErrors: function(fn){
		return Validation.report(this.failed, fn);
	}

}).extend({

	validate: function(rules, value, success, failure, progress, options){
		var validation =  new Validation(rules, options);
		if (success) validation.addEvent('success', success);
		if (failure) validation.addEvent('failure', failure);
		if (progress) validation.addEvent('progress', progress);
		return validation.validate(value);
	},

	defineRule: function(name, rule, options){
		rules[name] = Object.merge({
			name: name,
			rule: rule,
			options: {}
		}, options);
		return this;
	},

	defineRegExpRule: function(name, regexp, options){
		return Validation.defineRule(name, function(value){
			return regexp.test(value);
		}, options);
	},

	defineAsyncRule: function(name, rule, options){
		options = options || {};
		options.async = true;
		return Validation.defineRule(name, rule, options);
	},

	lookupRule: function(rule){
		var type = typeOf(rule);
		if (type != 'object'){
			switch (typeOf(rule)){
				case 'string': return rules[rule];
				case 'function': return {rule: rule};
			}
			return null;
		}
		return (rule.name && !rule.rule)
			? Object.merge({}, rules[rule.name], rule) : rule;
	},

	report: function(failed, fn){
		return (fn ? failed.map(fn) : failed);
	}

});

// Overload
Validation.extend({
	defineRules: Validation.defineRule.overloadSetter(true),
	defineRegExpRules: Validation.defineRegExpRule.overloadSetter(true),
	defineAsyncRules: Validation.defineAsyncRule.overloadSetter(true)
});

// Defining some default rules
Validation.defineRules({

	empty: function(value){
		return (value == null || value == '');
	},

	required: function(value){
		return (value != null && value != '');
	},

	equals: function(value, options){
		return (value == options.equals);
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
