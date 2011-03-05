/*
---

name: Validation.JSONSchema

description: A JSON Schema for Validation

license: MIT-style license

authors:
  - Arian Stolwijk

requires:
  - Core/JSON
  - Validation

provides: [Validation.JSONSchema]

...
*/


// Implemented according the http://tools.ietf.org/html/draft-zyp-json-schema-03
// Implementation inspired by dojox.json.validation - https://github.com/dojo/dojox/blob/master/json/schema.js
// and https://github.com/kriszyp/json-schema

(function(){

var validate = function(instance, schema, _changing) {

	var errors = [],
		undefined;

	// validate a value against a property definition
	var checkProp = function(value, schema, path, i){
		var l;
		path += path ? ((typeof i == 'number') ? '[' + i + ']' : ((typeof i == 'undefined') ? '' : '.' + i)) : i;

		var addError = function(message){
			errors.push({
				property: path,
				message: message
			});
		};

		if (
			(typeof schema != 'object' || schema instanceof Array) &&
			(path || typeof schema != 'function') &&
			!(schema && schema.type)
		){
			if (typeof schema == 'function'){
				if (!(value instanceof schema)){
					addError('is not an instance of the class/constructor ' + schema.name);
				}
			} else if (schema){
				addError('Invalid schema/property definition ' + schema);
			}
			return null;
		}

		if (_changing && schema.readonly) addError('is a readonly field, it can not be changed');

		// if it extends another schema, it must pass that schema as well
		if (schema['extends']) checkProp(value,schema['extends'],path,i);

		// validate a value against a type definition
		var checkType = function(type, value){
			if (!type) return [];
			if (
				typeof type == 'string' &&
				type != 'any' &&
				(type == 'null' ? value !== null : typeof value != type) &&
				!(value instanceof Array && type == 'array') &&
				!(value instanceof Date && type == 'date') &&
				!(type == 'integer' && value % 1 === 0)
			){
				return [{
					property: path,
					message: (typeof value) + ' value found, but a ' + type + ' is required'
				}];
			}

			if (type instanceof Array){
				var unionErrors = [];
				for (var j = 0; j < type.length; j++){ // a union type
					if (!(unionErrors = checkType(type[j], value)).length) break;
				}
				if (unionErrors.length) return unionErrors;
			} else if (typeof type == 'object'){
				var priorErrors = errors;
				errors = [];
				checkProp(value, type, path);
				var theseErrors = errors;
				errors = priorErrors;
				return theseErrors;
			}

			return [];
		};
		if (value === undefined){
			if (!schema.optional && !schema.get) addError('is missing and it is not optional');
		} else {
			errors = errors.concat(checkType(schema.type, value));
			if (schema.disallow && !checkType(schema.disallow, value).length){
				addError(' disallowed value was matched');
			}

			if (value !== null){
				if (value instanceof Array){
					if (schema.items){
						if (schema.items instanceof Array){
							for (i = 0, l = value.length; i < l; i++){
								errors.concat(checkProp(value[i], schema.items[i], path, i));
							}
						} else {
							for (i = 0, l = value.length; i < l; i++){
								errors.concat(checkProp(value[i], schema.items, path, i));
							}
						}
					}
					if (schema.minItems && value.length < schema.minItems){
						addError('There must be a minimum of ' + schema.minItems + ' in the array');
					}
					if (schema.maxItems && value.length > schema.maxItems){
						addError('There must be a maximum of ' + schema.maxItems + ' in the array');
					}
				} else if (schema.properties || schema.additionalProperties){
					errors.concat(checkObj(value, schema.properties, path, schema.additionalProperties));
				}
				if (schema.pattern && typeof value == 'string' && !value.match(schema.pattern)){
					addError('does not match the regex pattern ' + schema.pattern);
				}
				if (schema.maxLength && typeof value == 'string' && value.length > schema.maxLength){
					addError('may only be ' + schema.maxLength + ' characters long');
				}
				if (schema.minLength && typeof value == 'string' && value.length < schema.minLength){
					addError('must be at least ' + schema.minLength + ' characters long');
				}
				if (
					typeof schema.minimum !== undefined &&
					typeof value == typeof schema.minimum &&
					schema.minimum > value
				){
					addError('must have a minimum value of ' + schema.minimum);
				}
				if (
					typeof schema.maximum !== undefined &&
					typeof value == typeof schema.maximum &&
					schema.maximum < value
				){
					addError('must have a maximum value of ' + schema.maximum);
				}
				if (schema['enum']){
					var enumer = schema['enum'], found;
					l = enumer.length;
					for (var j = 0; j < l; j++) if (enumer[j] === value){
						found = 1;
						break;
					}
					if (!found) addError('does not have a value in the enumeration ' + enumer.join(', '));
				}
				if (
					typeof schema.maxDecimal == 'number' &&
					(value.toString().match(new RegExp('\\.[0-9]{' + (schema.maxDecimal + 1) + ',}')))
				){
					addError('may only have ' + schema.maxDecimal + ' digits of decimal places');
				}
			}
		}
		return null;
	};


	// validate an object against a schema
	var checkObj = function(instance, objTypeDef, path, additionalProp){

		if (typeof objTypeDef == 'object'){
			if (typeof instance != 'object' || instance instanceof Array){
				errors.push({
					property: path,
					message: 'an object is required'
				});
			}

			for (var i in objTypeDef){
				if (objTypeDef.hasOwnProperty(i) && !(i.charAt(0) == '_' && i.charAt(1) == '_')){
					var value = instance[i];
					var propDef = objTypeDef[i];
					// set default
					if (value === undefined && propDef['default']){
						value = instance[i] = propDef['default'];
					}
					if (propDef.coerce && exports.coerce && i in instance){
						value = instance[i] = exports.coerce(value, propDef);
					}
					checkProp(value, propDef, path, i);
				}
			}
		}

		for (var i in instance){

			if (
				instance.hasOwnProperty(i) &&
				!(i.charAt(0) == '_' && i.charAt(1) == '_') &&
				objTypeDef &&
				!objTypeDef[i] &&
				additionalProp === false
			) errors.push({
				property: path,
				message: (typeof value) + 'The property ' + i + ' is not defined in the schema and the schema does not allow additional properties'
			});

			var requires = (objTypeDef && objTypeDef[i] && objTypeDef[i].requires);
			if (requires && !(requires in instance)) errors.push({
				property: path,
				message: 'the presence of the property ' + i + ' requires that ' + requires + ' also be present'
			});

			value = instance[i];
			if (additionalProp && (!(objTypeDef && typeof objTypeDef == 'object') || !(i in objTypeDef))){
				if (additionalProp.coerce && exports.coerce){
					value = instance[i] = exports.coerce(value, additionalProp);
				}
				checkProp(value, additionalProp, path, i);
			}
			if (!_changing && value && value.$schema){
				errors = errors.concat(checkProp(value, value.$schema, path, i));
			}
		}
		return errors;
	};

	if (schema) checkProp(instance, schema, '', _changing || '');
	if (!_changing && instance && instance.$schema) checkProp(instance, instance.$schema, '', '');

	return {
		passed: !errors.length,
		errors: errors
	};

};


Validation.defineRules({

	jsonschema: function(instance, schema){
		return validate(instance, schema, false);
	}

});

Validation.validateJSON = function(instance, schema, _property){
	return validate(instance, schema, _property).passed;
};


})();
