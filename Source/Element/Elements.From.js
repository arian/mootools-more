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

Element.from = function(obj){
	obj = Elements.from(obj)[0];
	if (obj instanceof Element) return obj;
	return null;
};

Elements.from = function(obj, excludeScripts){
	if (obj instanceof Elements) return obj;

	var type = typeOf(obj);	
	if(type == 'string'){
		if (excludeScripts || excludeScripts == null) obj = obj.stripScripts();
		var container, match = obj.match(/^\s*<(t[dhr]|tbody|tfoot|thead)/i);

		if (match){
			container = new Element('table');
			var tag = match[1].toLowerCase();
			if (['td', 'th', 'tr'].contains(tag)){
				container = new Element('tbody').inject(container);
				if (tag != 'tr') container = new Element('tr').inject(container);
			}
		}

		return (container || new Element('div')).set('html', obj).getChildren();		
	}

	if (typeof obj.toElement == 'function') return new Elements([document.id(obj)]);
	if (Type.isEnumerable(obj)) return new Elements(obj);
	if (type == 'element') return new Elements([obj]);
	if (type == 'object') return new Elements(Object.values(obj));

	return new Elements;
};
