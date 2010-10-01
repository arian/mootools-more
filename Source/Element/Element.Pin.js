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

	Element.implement({

		pin: function(enable, forceScroll){
			if (this.getStyle('display') == 'none' || this.retrieve(pinStore)) return this;
			if (enable === false) return this.unpin();

			if (supportsPositionFixed == null) supportsPositionFixed = testCssPostionFixed();

			var scroll = scroll = window.getScroll();

			if (supportsPositionFixed && !forceScroll){

				var position = this.getPosition(document.body);
				var currentPosition = {
					top: position.y - scroll.y,
					left: position.x - scroll.x
				};
				this.setStyle('position', 'fixed').setStyles(currentPosition);

			}/*<ie6>*/ else {

				var parent = this.getOffsetParent(),
					position = this.getPosition(parent),
					styles = this.getStyles('left', 'top');

				if (parent && styles.left == 'auto' || styles.top == 'auto') this.setPosition(position);
				if (this.getStyle('position') == 'static') this.setStyle('position', 'absolute');

				var position = {
					x: styles.left.toInt() - scroll.x,
					y: styles.top.toInt() - scroll.y
				};

				var scrollFixer = function(){
					if (!this.retrieve(pinStore)) return;
					var scroll = window.getScroll();
					this.setStyles({
						left: position.x + scroll.x,
						top: position.y + scroll.y
					});
				}.bind(this);

				this.store(pinStoreByJS, scrollFixer);
				window.addEvent('scroll', scrollFixer);
			}/*</ie6>*/

			this.addClass('isPinned').store(pinStore, true);

			return this;
		},

		unpin: function(){
			if (!this.retrieve(pinStore)) return this;

			var jsPin = this.retrieve(pinStoreByJS);
			if (jsPin){
				window.removeEvent('scroll', jsPin);
			} else {
				var parent = this.getParent(),
					offsetParent = (parent.getComputedStyle('position') != 'static' ? parent : parent.getOffsetParent()),
					position = this.getPosition(offsetParent),
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
