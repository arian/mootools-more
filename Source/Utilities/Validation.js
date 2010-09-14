/*
---

name: Validate

description: A Validation System

license: MIT-style license

authors:
  - Arian Stolwijk

requires:
  - Core/Class
  - Core/Object

provides: [Validate]

...
*/

(function(){

var Validate = this.Validate = new Class({

	Implements: Options,

	options: {
		allowEmpty: false
	},

	validators: {},

	initialize: function(value, validators, options){
		this.setOptions(options);
		this.addValidators(Array.from(validators));
	},

	addValidator: function(validator){
		var type = typeOf(validator);
		if (type == 'function'){
			validator = {
				name: String.generateUID(),
				test: validator
			};
		} else if (type == 'string' && Validate.Validators[validator]){
			validator = Validate.Validators[validator];
		} else if (arguments.length > 1){
			validator = Array.associate(arguments, ['name', 'test', 'error']);
		}
		if (!validator.error) validator.error = getMsg(validator.name);

		this.validators[validator.name] = validator;
	},

	addValidators: function(validators){
		Object.each(validators, this.addValidator.bind(this));
	},

	getValidatorError: function(name, args){
		return Function.from(this.validators[name].error).apply(null, args);
	};

	isValid: function(value){
		var args = Array.slice(arguments, 1);

		var errors = {};
		Object.each(this.validators, function(validator, name){

			var testArgs = [value].concat(args);
			if ((this.options.allowEmpty && Validate.Validators.IsEmpty(value)) || !validator.test.apply(null, testArgs))
				errors[name] = this.getValidateError(name, testArgs);

		}, this);

		this.errors = errors;
		return Object.getLength(errors);
	},

	getErrors: function(){
		return this.errors;
	}

});


// Localization
var locale = Validate.Locale = 'Validator';
var getMsg = Validate.getMsg = function(name){
	if (Locale) return Locale.get(locale + '.' + name);
	return 'Could not validate with ' + name;
};


// Define Validators
Validate.Validators = {};

Validate.defineValidator = function(name, fn, error){
	Validate.Validators[name] = {
		name: name,
		test: fn,
		error: error
	};
};

Validate.defineValidator('IsEmpty', function(value){
	return value == null || value == '';
});

Validate.defineValidators = function(validators){
	Object.each(validators, function(args, name){
		Validate.defineValidator.apply(null, [name].concat(Array.from(args)));
};

Validate.defineValidators({

	isBetween: function(value, min, max){
		return value > min && value < max;
	},

	minLength: function(value, min){
		return value.length >= min;
	},

	maxLength: function(value, max){
		return value.length <= max;
	},

	email: function(value){
		return (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i).test(value);
	}

});

})();
