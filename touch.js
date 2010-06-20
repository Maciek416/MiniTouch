//
// jQuery MiniTouch Plugin
// Copyright (c) 2010 Maciej Adwent
// 
// This software is licensed under an MIT License:
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

(function($) {
	jQuery.fn.touch = function(options) {
		var defaults = {};
		options = $.extend({}, defaults, options);

		var cachedPositions = {};

		// We use webkit transform while dragging, but once done, 
		// we set the "actual" position to the transformed position.
		function convertWebKitTranslationToPagePosition(elem){
			var p = getPosition(elem);
			var id = elem.attr("id");
			elem.css({
				webkitTransform: 'none',
				top: p.top + "px",
				left: p.left + "px"
			});
			cachedPositions[id] = null;
		}

		// Get the "real" position of the element
		function getPosition(elem){
			var id = elem.attr("id");
			return {
				left:(cachedPositions[id].startOffset.left + cachedPositions[id].translateX),
				top:(cachedPositions[id].startOffset.top + cachedPositions[id].translateY)
			};
		}

		function touchstart(event){
			var e = event.originalEvent;
			e.preventDefault();
			var touch = e.targetTouches[0];
			var elem = $(touch.target);
			var id = elem.attr("id");

			// Cache origin of object once
			if(typeof(cachedPositions[id])==='undefined' || cachedPositions[id] == null){
				cachedPositions[id] = {
					startOffset:elem.offset(),
					startX:touch.pageX,
					startY:touch.pageY
				};
			}

			if(typeof(options.start)=='function'){
				options.start(elem);
			}
		}
	
		function touchmove(event){
			var e = event.originalEvent;
			e.preventDefault();
			var touch = e.targetTouches[0];
			var elem = $(touch.target);
			var id = elem.attr("id");
			
			var translateX = (touch.pageX - cachedPositions[id].startX);
			var translateY = (touch.pageY - cachedPositions[id].startY);

			cachedPositions[id].translateX = translateX;
			cachedPositions[id].translateY = translateY;

			// translate the dragged element relative to its cached origin
			elem.css({ webkitTransform:'translate(' + translateX + 'px, ' + translateY + 'px)' });

			if(typeof(options.move)=='function'){
				// note: the reported position will be visually correct, but the 
				// element doesn't actually arrive there until end() is called.
				options.move(elem, getPosition(elem));
			}
		}
	
		function touchend(event){
			event.originalEvent.preventDefault();
			if(typeof(options.end)=='function'){
				var elem = $(this);
				var newPosition = getPosition(elem);
				convertWebKitTranslationToPagePosition(elem);
				options.end(elem, newPosition);
			}
		}
	
		$(this).bind("touchstart",touchstart).bind("touchmove",touchmove).bind("touchend",touchend);
	};
})(jQuery);