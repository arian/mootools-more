/*
---

script: Elements.From.js

name: Elements.From

description: Returns a collection of elements from a string of html/array/object/ or Elements instance.

license: MIT-style license

authors:
  - Aaron Newton
  - Arian Stolwijk

requires:
  - Core/String
  - Core/Element
  - /MooTools.More

provides: [Elements.from, Elements.From, Element.from]

...
*/

Element.from = function(object, excludeScripts){
	if (typeOf(object) == 'element') return object;
	object = Elements.from(object, excludeScripts)[0];
	return typeOf(object) == 'element' ? object : null;
};

Elements.from = function(object, excludeScripts){
	if (typeOf(object) == 'elements') return object;

	var type = typeOf(object);	
	if (type == 'string'){
		if (excludeScripts || excludeScripts == null) object = object.stripScripts();
		var container, match = object.match(/^\s*<(t[dhr]|tbody|tfoot|thead)/i);

		if (match){
			container = new Element('table');
			var tag = match[1].toLowerCase();
			if (['td', 'th', 'tr'].contains(tag)){
				container = new Element('tbody').inject(container);
				if (tag != 'tr') container = new Element('tr').inject(container);
			}
		}

		return (container || new Element('div')).set('html', object).getChildren();		
	}

	if (typeof object.toElement == 'function') return new Elements([document.id(object)]);
	if (Type.isEnumerable(object)) return new Elements(object);
	if (type == 'element') return new Elements([object]);
	if (type == 'object') return new Elements(Object.values(object));

	return new Elements;
};
