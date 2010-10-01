/*
---

script: Element.Pin.js

name: Element.Pin

description: Extends the Element native object to include the pin method useful for fixed positioning for elements.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - Core/Element.Event
  - Core/Element.Dimensions
  - Core/Element.Style
  - /MooTools.More

provides: [Element.Pin]

...
*/

(function(){

	var supportsPositionFixed = null,
		pinStore = 'pin:_pinned',
		pinStoreByJS = 'pin:_pinnedByJS';

	var testCssPostionFixed = function(){
		var test = new Element('div').setStyles({
			position: 'fixed',
			top: 0,
			right: 0
		}).inject(document.body);
		var supported = (test.offsetTop === 0);
		test.dispose();
		return supported;			
	};

	var getPositionRelativeToParent = function(el){
		var parent = el.getParent(),
			offsetParent = (parent.getComputedStyle('position') != 'static' ? parent : parent.getOffsetParent());
		return el.getPosition(offsetParent);
	};

	Element.implement({

		pin: function(enable, forceScroll){
			if (this.getStyle('display') == 'none' || this.retrieve(pinStore)) return this;
			if (enable === false) return this.unpin();

			if (supportsPositionFixed == null) supportsPositionFixed = testCssPostionFixed();


			if (supportsPositionFixed && !forceScroll){

				var pinnedPosition = this.getPosition(document.body),
					scroll = window.getScroll();
				var currentPosition = {
					top: pinnedPosition.y - scroll.y,
					left: pinnedPosition.x - scroll.x
				};
				this.setStyle('position', 'fixed').setStyles(currentPosition);

			} else {

				var position = getPositionRelativeToParent(this);

				this.setStyles({
					position: 'absolute',
					top: position.y,
					left: position.x
				});

				var scrollFixer = function(){
					$('foo').set('text', 'scrolling');
					if (!this.retrieve(pinStore)) return;
					var scroll = window.getScroll();
					this.setStyles({
						left: position.x + scroll.x,
						top: position.y + scroll.y
					});
				}.bind(this);

				this.store(pinStoreByJS, scrollFixer);
				window.addEvent('scroll', scrollFixer);
			}

			this.addClass('isPinned').store(pinStore, true);

			return this;
		},

		unpin: function(){
			if (!this.retrieve(pinStore)) return this;

			var jsPin = this.retrieve(pinStoreByJS);
			if (jsPin){
				window.removeEvent('scroll', jsPin);
			} else {
				var position = getPositionRelativeToParent(this),
					scroll = window.getScroll();

				this.setStyles({
					position: 'absolute',
					top: position.y + scroll.y,
					left: position.x + scroll.x
				});
			}

			this.store(pinStore, false).removeClass('isPinned');

			return this;
		},

		togglepin: function(){
			return this[this.retrieve(pinStore) ? 'unpin' : 'pin']();
		}

	});

})();
