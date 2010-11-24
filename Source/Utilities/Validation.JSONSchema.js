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

(function(){

var validate = function(instance, options){

	if (!options) options = {};
	var schema = options.schema,
		_changing = options._changing,
		errors = [];

	var checkProp = function(value, schema, path, i){
		var l;
		path += path ? ((typeof i == 'number') ? '[' + i + ']' : ((typeof i == 'undefined') ? '' : '.' + i)) : i;
		var addError = function(message){
			errors.push({
				property: path,
				message: message
			});
		};

		if ((typeof schema != 'object' || schema instanceof Array) && (path || typeof schema != 'function')){
			if (typeof schema == 'function'){
				if (!(Object(value) instanceof schema)){
					addError('is not an instance of the class/constructor ' + schema.name);
				}
			} else if (schema){
				addError('Invalid schema/property definition ' + schema);
			}
			return null;
		}
		if (_changing && schema.readonly){
			addError('is a readonly field, it can not be changed');
		}
		if (schema['extends']){ // if it extends another schema, it must pass that schema as well
			checkProp(value,schema['extends'],path,i);
		}
		// validate a value against a type definition
		var checkType = function(type,value){
			if(type){
				if (
					typeof type == 'string' && type != 'any' &&
					(type == 'null' ? value !== null : typeof value != type) &&
					!(value instanceof Array && type == 'array') &&
					!(type == 'integer' && value % 1 === 0)
				){
					return [{
						property: path,
						message: (typeof value) + ' value found, but a ' + type + ' is required'
					}];
				}
				if (type instanceof Array){
					var unionErrors = [];
					for (var j = 0, l = type.length; j < l; j++){ // a union type
						if (!(unionErrors = checkType(type[j], value)).length) break;
					}
					if (unionErrors.length) return unionErrors;
				} else if (typeof type == 'object'){
					var priorErrors = errors;
					errors = [];
					checkProp(value,type,path);
					var theseErrors = errors;
					errors = priorErrors;
					return theseErrors;
				}
			}
			return [];
		}
		if (value === undefined){
			if (!schema.optional){
				addError('is missing and it is not optional');
			}
		} else {
			errors = errors.concat(checkType(schema.type,value));
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
				} else if(schema.properties){
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
				if (typeof schema.minimum !== undefined && typeof value == typeof schema.minimum &&
						schema.minimum > value){
					addError('must have a minimum value of ' + schema.minimum);
				}
				if (typeof schema.maximum !== undefined && typeof value == typeof schema.maximum &&
						schema.maximum < value){
					addError('must have a maximum value of ' + schema.maximum);
				}
				if (schema['enum']){
					var enumer = schema['enum'];
					l = enumer.length;
					var found;
					for (var j = 0; j < l; j++) if(enumer[j]===value){
						found=1;
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
	}

	// validate an object against a schema
	var checkObj = function(instance, objTypeDef, path, additionalProp){

		var i;

		if (typeof objTypeDef =='object'){
			if (typeof instance != 'object' || instance instanceof Array){
				errors.push({
					property: path,
					message: 'an object is required'
				});
			}

			for (i in objTypeDef){
				if(objTypeDef.hasOwnProperty(i) && !(i.charAt(0) == '_' && i.charAt(1) == '_')){
					var value = instance[i];
					var propDef = objTypeDef[i];
					checkProp(value,propDef,path,i);
				}
			}
		}

		for (i in instance){
			if (
				instance.hasOwnProperty(i) &&
				!(i.charAt(0) == '_' &&
				i.charAt(1) == '_') &&
				objTypeDef &&
				!objTypeDef[i] &&
				additionalProp===false
			){
				errors.push({
					property: path,
					message: (typeof value) + 'The property ' + i + ' is not defined in the schema and the schema does not allow additional properties'
				});
			}
			var requires = objTypeDef && objTypeDef[i] && objTypeDef[i].requires;
			if (requires && !(requires in instance)){
				errors.push({
					property: path,
					message:'the presence of the property ' + i + ' requires that ' + requires + ' also be present'
				});
			}
			value = instance[i];
			if (objTypeDef && typeof objTypeDef == 'object' && !(i in objTypeDef)){
				checkProp(value, additionalProp, path, i);
			}
			if (!_changing && value && value.$schema){
				errors = errors.concat(checkProp(value, value.$schema, path, i));
			}
		}
		return errors;
	}

	if (schema) checkProp(instance, schema, '', _changing || '');
	if(!_changing && instance && instance.$schema) checkProp(instance, instance.$schema, '', '');

	return errors.length ? errors : true;

};


Validation.defineRules({

	jsonschema: function(instance, options){
		return validate(instance, options);
	},

	jsonschemapropertychange: function(instance, options){
		if (!options._changing) options._changing = 'property';
		return validate(instance, options);
	}

});


})();
