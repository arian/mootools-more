/*
Script: Validation.js
	Specs for Validation.Validators.js

License:
	MIT-style license.
*/

describe('Validation.Validators', function(){

	it('validate a integer', function(){
		var validation = new Validation('integer');
		expect(validation.validate('a')).toBeFalsy();
		expect(validation.validate('1.5')).toBeFalsy();
		expect(validation.validate('1')).toBeTruthy();
		expect(validation.validate('100')).toBeTruthy();
	});

	it('validates a numeric value', function(){
		var val = new Validation('numeric');
		expect(val.validate('a')).toBeFalsy();
		expect(val.validate('1.3')).toBeTruthy();
		expect(val.validate('4')).toBeTruthy();
		expect(val.validate('401')).toBeTruthy();
	});

	it('validates digits', function(){
		var val = new Validation('digits');
		expect(val.validate('a')).toBeFalsy();
		expect(val.validate('5')).toBeTruthy();
		expect(val.validate('1.3')).toBeTruthy();
		expect(val.validate('4:5')).toBeTruthy();
		expect(val.validate('401 50')).toBeTruthy();
		expect(val.validate('401-50')).toBeTruthy();
		expect(val.validate('#401+50')).toBeTruthy();
	});

	it('validates alpha chars', function(){
		var val = new Validation('alpha');
		expect(val.validate('Moo')).toBeTruthy();
		expect(val.validate('Hello Moo')).toBeFalsy();
		expect(val.validate('Moo!!')).toBeFalsy();
		expect(val.validate('100')).toBeFalsy();
	});

	it('validates alphanum values', function(){
		var val = new Validation('alphanum');
		expect(val.validate('Moo')).toBeTruthy();
		expect(val.validate('Moo1234')).toBeTruthy();
		expect(val.validate('123')).toBeTruthy();
		expect(val.validate('Hi Moo')).toBeFalsy();
		expect(val.validate('Hi!')).toBeFalsy();
	});

	it('validates an email', function(){
		var val = new Validation('email');
		expect(val.validate('mootools@domain.net')).toBeTruthy();
		expect(val.validate('moo.tools@do-main.net')).toBeTruthy();
		expect(val.validate('moo.net')).toBeFalsy();
	});

	it('validates a url', function(){
		var val = new Validation('url');
		expect(val.validate('http://www.mootools.net')).toBeTruthy();
		expect(val.validate('meh')).toBeFalsy();
	});

	it('validates a dollar currency', function(){
		var val = new Validation('currencyDollar');
		expect(val.validate('$104,643.00')).toBeTruthy();
		expect(val.validate('$104.00')).toBeTruthy();
		expect(val.validate('$104')).toBeTruthy();
	});

	it('validates a date', function(){
		var val = new Validation('date');
		expect(val.validate('03/20/2010')).toBeTruthy();
		expect(val.validate('validating')).toBeFalsy();
	});

});
