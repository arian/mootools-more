describe('Elements.From', {

	'should return a group of elements': function(){
		var str = '<p><b>foo</b></p><i>bar</i>';
		var div = new Element('div');
		value_of(div.adopt(Elements.from(str)).get('html')).should_be(str);
	},
	
	'should return a group of table elements': function(){
		var str = '<tr><td>foo</td></tr>';
		var tbody = new Element('tbody').inject(new Element('table')).adopt(Elements.from(str));
		value_of(tbody.get('html')).should_be(str);
	},
	
	'should convert a class instance into Elements': function(){
		
		var el = new Element('div',{text: 'from Class'});
		
		var classInstance = new (new Class({
			toElement: function(){
				return el;
			}
		}));

		var from = Elements.from(classInstance);

		value_of(from[0]).should_be(el);
		value_of(typeOf(from)).should_be('elements');
		
	},
	
	'should convert an array with elements to Elements': function(){
		
		var els = [new Element('div'), new Element('span')];
		var from = Elements.from(els);
		
		value_of(from[0]).should_be(els[0]); 
		value_of(from[1]).should_be(els[1]); 
		
		value_of(typeOf(from)).should_be('elements');	
	},
	
	'should convert the values of an object to Elements': function(){
		
		var object = {foo: new Element('div'), foo1: new Element('span')};
		
		var from = Elements.from(object);
		
		value_of(from[0]).should_be(object.foo); 
		value_of(from[1]).should_be(object.foo1); 
		
		value_of(typeOf(from)).should_be('elements');	
		
	},
	
	'if the value is an Elements already, it should return it': function(){
		
		var els = new Elements([new Element('div'), new Element('span')]);
		
		value_of(Elements.from(els)).should_be(els);

	},
	
	'Element.from: should return the first value of Elements.from': function(){
		
		value_of(Element.from('<div>foo</div></span>bar</span>').get('tag')).should_be('div');
		
	},
	
	'If the value is an element already, it should return itself': function(){
		
		var el = new Element('div');
		
		value_of(Element.from(el)).should_be(el);
		
	}

});