/*
Script: Validation.js
	Specs for Validation.js

License:
	MIT-style license.
*/

// Tests borrowed from https://github.com/dojo/dojox/blob/master/json/tests/schema.js

describe('Validation.JSONSchema', function(){

	var simpleObj = {
		name: 'John Doe',
		age : 30,
		$schema: {
			type: {
				name: {
					type: 'string',
					required: true
				},
				age: {
					type: 'number',
					maximum: 125
				}
			}
		}
	};

	var biggerObj = {
		name: 'John Doe',
		born: '1979-03-23T06:26:07Z',
		gender: 'male',
		tuple: [1, 'a', false],
		address: {
			street: '123 S Main St',
			city: 'Springfield',
			state: 'CA'
		}
	};

	var invalidBiggerObj = {
		name: 'John Doe',
		born: false,
		gender: 'mal',
		address : {
			street: '123 S Main St',
			city: 'Springfield',
			state: 'CA'
		}
	};

	var biggerSchema = {
		readonly: true,
		type: 'object',
		properties: {
			name: {
				type: 'string',
				length: 5,
				optional: false
			},
			tuple: {
				items:[
					{type: 'integer'},
					{type: 'string'},
					{type: 'boolean'}
				]
			},
			born: {
				type: ['number', 'string'], //allow for a numeric year, or a full date
				format: 'date', //format when a string value is used
				minimum: 1900, //min/max for when a number value is used
				maximum: 2010
			},
			gender: {
				type: 'string',
				'enum': ['male', 'female'],
				options: [
					{label: 'Male', value: 'male'},
					{label: 'Female', value: 'female'}
				]
			},
			address: {
				type: 'object',
				properties: {
					street: {type: 'string'},
					city: {type: 'string'},
					state: {type: 'string'}
				}
			}
		}
	};

	var schemaForSchemas = {
		description: 'This is the JSON Schema for JSON Schemas.',
		type: ['object', 'array'],
		items: {
			type: 'object',
			properties: {
				$ref: '$.properties'
			},
			description: "When the schema is an array, it indicates that it is enforcing tuple typing. Each item in the instance array must correspond to the item in the schema array"
		},
		properties: {
			type: {
				type: ['string', 'array'],
				items: {
					$ref: '$.properties.type'
				},
				description: "This is a type definition value. This can be a simple type, or a union type",
				options: [
					{value: 'string'},
					{value: 'object'},
					{value: 'array'},
					{value: 'boolean'},
					{value: 'number'},
					{value: 'integer'},
					{value: 'null'},
					{value: 'any'}
				],
				unconstrained: true,
				optional: true,
				'default': 'any'
			},
			optional: {
				type: 'boolean',
				description: 'This indicates that the instance property in the instance object is not required.',
				optional: true,
				'default': false
			},
			properties: {
				type: 'object',
				additionalProperties: {
					$ref: '$'
				},
				description: 'This is a definition for the properties of an object value',
				optional: true,
				'default': {}
			},
			items: {
				type: 'object',
				properties: {
					$ref: '$.properties'
				},
				description: "When the value is an array, this indicates the schema to use to validate each item in an array",
				optional: true,
				'default': {}
			},
			additionalProperties: {
				type: ['boolean', 'object'],
				properties: {
					$ref: '$.properties'
				},
				description: 'This provides a default property definition for all properties that are not explicitly defined in an object type definition.',
				optional: true,
				'default': {}
			},
			specificity: {
				type: 'number',
				description: 'This indicates an order of specificity of properties. If an instance defines another property with a higher specificity than this one, than this instance property is required.',
				optional: true,
				'default': false
			},
			identity: {
				type: 'boolean',
				description: 'This indicates that the instance property should have unique values. No other property with the same name in the instance object tree should have the same value.',
				optional: true,
				'default': false
			},
			minimum: {
				type: 'number',
				optional: true,
				description: 'This indicates the minimum value for the instance property when the type of the instance value is a number, or it indicates the minimum number of values in an array when an array is the instance value.'
			},
			maximum: {
				type: 'number',
				optional: true,
				description: 'This indicates the maximum value for the instance property when the type of the instance value is a number, or it indicates the maximum number of values in an array when an array is the instance value.'
			},
			pattern: {
				type: 'string',
				format: 'regex',
				description: 'When the instance value is a string, this provides a regular expression that a instance string value should match in order to be valid.',
				optional: true,
				'default': '.*'
			},
			maxLength: {
				type: 'number',
				optional: true,
				description: 'When the instance value is a string, this indicates maximum length of the string.'
			},
			minLength: {
				type: 'number',
				optional: true,
				description: 'When the instance value is a string, this indicates minimum length of the string.'
			},
			maxItems: {
				type: 'number',
				optional: true,
				description: 'When the instance value is an array, this indicates maximum number of items.'
			},
			minItems: {
				type: 'number',
				optional: true,
				description: 'When the instance value is an array, this indicates minimum number of items.'
			},
			'enum': {
				type: 'array',
				optional: true,
				description: 'This provides an enumeration of possible values that are valid for the instance property.'
			},
			options: {
				type: 'array',
				items: {
					properties: {
						label: {
							type: 'string',
							description: 'This is the label for this option',
							optional: true
						},
						value: {
							description: 'This is the value for this option'
						}
					},
					description: 'This is an option for list of possible values'
				},
				optional: true,
				description: 'This provides a list of suggested options for the instance property.'
			},
			readonly: {
				type: 'boolean',
				description: 'This indicates that the instance property should not be changed (this is only for interaction, it has no effect for standalone validation).',
				optional: true,
				'default': false
			},
			description: {
				'type': 'string',
				optional: true,
				description: 'This provides a description of the purpose the instance property. The value can be a string or it can be an object with properties corresponding to various different instance languages (with an optional default property indicating the default description).'
			},
			format: {
				type: 'string',
				optional: true,
				description: 'This indicates what format the data is among some predefined formats which may include:\n\ndate - a string following the ISO format \naddress \nschema - a schema definition object \nperson \npage \nhtml - a string representing HTML'
			},
			'default': {
				type: 'any',
				optional: true,
				description: 'This indicates the default for the instance property.'
			},
			'transient': {
				type: 'boolean',
				optional: true,
				description: 'This indicates that the property will be used for transient/volatile values that should not be persisted.',
				'default': false
			},
			maxDecimal: {
				type: 'integer',
				optional: true,
				description: 'This indicates the maximum number of decimal places in a floating point number.'
			},
			hidden: {
				type: 'boolean',
				optional: true,
				description: 'This indicates whether the property should be hidden in user interfaces.'
			},
			'extends': {
				type: 'object',
				properties: {
					$ref: '$.properties'
				},
				description: 'This indicates the schema extends the given schema. All instances of this schema must be valid to by the extended schema also.',
				optional: true,
				'default': {}
			},
			id: {
				type: ['string', 'number'],
				optional: true,
				format: 'url',
				identity: true
			}
		}
	};

	it('tests a simple self-validating test', function(){
		var validation = new Validation('jsonschema');
		expect(validation.validate(simpleObj)).toBeTruthy();
	});

	it('tests bigger instance and scheme', function(){
		var validation = new Validation({name: 'jsonschema', args: {schema: biggerSchema}})
		expect(validation.validate(biggerObj)).toBeTruthy();
		expect(validation.validate(invalidBiggerObj)).toBeFalsy();
		validation.getErrors(function(error){
			var result = error.result;
			expect(result.length).toEqual(3);
		});
	});

	xit('tests the schema for schemas against it\'s self. Narcissitic testing', function(){
		var validation = new Validation({
			name: 'jsonschema',
			args: {schema: schemaForSchemas}
		});
		expect(validation.validate(schemaForSchemas)).toBeTruthy();
	});

});
