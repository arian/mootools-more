/*
Script: Validation.js
	Specs for Validation.js

License:
	MIT-style license.
*/

describe('Validation', function(){

	it('should do a simple validation', function(){
		var validation = new Validation('required');
		expect(validation.validate('')).toBeFalsy();
		expect(validation.validate('Moo!!')).toBeTruthy();
	});

	it('should add a rule', function(){
		var validation = new Validation();
		validation.addRule('empty');
		expect(validation.rules.length).toEqual(1);
	});

	it('should define, add and validate a rule with arguments', function(){
		var spy = jasmine.createSpy('MyTestingRuleWithArgs');
		Validation.defineRule('MyTestingRuleWithArgs', spy);

		var value = 'MyTestValue', args = [1, 2, 3];
		var validation = new Validation({
			name: 'MyTestingRuleWithArgs',
			args: args
		});
		validation.validate(value);

		expect(spy).toHaveBeenCalledWith(value, args);
	});

	it('should return a array with the failed rules', function(){
		Validation.defineRules({
			MyErrorNamesTest1: Function.from(false),
			MyErrorNamesTest2: Function.from(false),
			MyErrorNamesTest3: Function.from(false),
			MyErrorNamesTest4: Function.from(false)
		});
		var ruleNames = [
			'MyErrorNamesTest1',
			'MyErrorNamesTest2',
			'MyErrorNamesTest3'
		];

		var validation = new Validation(ruleNames);
		validation.addRule({name: 'MyErrorNamesTest4', args: 'testArgument'});
		ruleNames.push('MyErrorNamesTest4')

		validation.validate('foo');
		var errors = validation.getErrorCodes();

		expect(errors.map(function(error){
			expect(error.value).toEqual('foo');
			return error.name;
		})).toEqual(ruleNames);

		expect(errors[3].args).toEqual('testArgument');
	});

	describe('Default Rules', function(){

		it('should test the between rule', function(){
			var validation = new Validation();
			validation.addRule('between', {min: 1, max: 5});
			expect(validation.validate(3)).toBeTruthy();
			expect(validation.validate(0.5)).toBeFalsy();
			expect(validation.validate(7)).toBeFalsy();
		});

		it('should test the minLength rule', function(){
			var validation = new Validation();
			validation.addRule('minLength', {minLength: 4});
			expect(validation.validate('mooing')).toBeTruthy();
			expect(validation.validate('moo')).toBeFalsy();
		});

		it('should test the maxLength rule', function(){
			var validation = new Validation();
			validation.addRule('maxLength', {maxLength: 4});
			expect(validation.validate('moo')).toBeTruthy();
			expect(validation.validate('mooing')).toBeFalsy();
		});

	});

});
