ig.module('game.chat-log')

.requires()

.defines(function() {

	ChatLog = ig.Class.extend({

		// ID of element that holds all elements.
		wrapperId: 'ChatLog',

		// ID of element to hold messages.
		htmlLogId: null,

		// Maximum messages to keep in log.
		buffer: 50,

		// Width of log in pixels.
		width: null,

		// Height of log in pixels.
		height: null,

		// Name of player who messaged last.
		lastTellFrom: '',

		// CSS settings for the log element.
		logCSS: {
			
			// No horizontal scrolling.
			"overflow-x": "hidden",

			// Enable vertical scrolling.
			"overflow-y": "auto",

			// Give text a drop shadow.
			"text-shadow": "0.1em 0.1em 0.2em black",

			// Font size.
			"font-size": "10pt",

			// Use width of container.
			"width": "100%",

			// Use height of container.
			"height": "100%"
		},

		// CSS settings for the log container.
		logContainerCSS: {
			
			// Add transparent background.
			"background": "url('media/chat-bubble-fill.png')", 

			// Round the corners.
			"border-radius": "10px",

			// Move away from edge.
			"margin-bottom": "7px",

			// Add spacing around log.
			"padding-top": "10px",
			"padding-bottom": "10px",
			"padding-left": "30px",
			"padding-right": "30px",

			// Set position bottom center.
  			"position": "absolute",
  			"bottom": "0px",
  			"right": "0",
  			"left": "0",
  			"margin-left": "auto",
			"margin-right": "auto",

			// Inner shadow.
			//"-moz-box-shadow":    "inset 0 0 10px red",
   			//"-webkit-box-shadow": "inset 0 0 10px red",
   			//"box-shadow":         "inset 0 0 10px red",

   			// Box shadow.
   			"-moz-box-shadow":    "0 0 15px black",
  			"-webkit-box-shadow": "0 0 15px black",
  			"box-shadow":         "0 0 15px black",
			"pointer-events":	"none"
		},

		init: function(width, height, logId) {

			// Set width in pixels.
			this.width = width;

			// Set height in pixels.
			this.height = height;

			// Set element to hold messages.
			this.htmlLogId = logId;

			/*
			 *  Wrapper element holds everything.
			 */

			// Create wrapper element.
			$('body').append($('<div id="' + this.wrapperId + '"/>'));

			// Position the wrapper over canvas.
			$('#' + this.wrapperId).css("position", "absolute");
			$('#' + this.wrapperId).css("width", $('#canvas').width());
			$('#' + this.wrapperId).css("height", $('#canvas').height());
			$('#' + this.wrapperId).css("left", 0);
			$('#' + this.wrapperId).css("right", 0);
			$('#' + this.wrapperId).css("top", 0);
			$('#' + this.wrapperId).css("bottom", 0);
			$('#' + this.wrapperId).css("margin", "auto");

			/*
			 *  Log container holds log element.
			 *  Used for adjusting backgrounds or spacing.
			 */

			// Create a log container.
			$('#' + this.wrapperId).append($('<div id="' + this.htmlLogId + '-container"/>'));

			// Use the width/height specified in constructor.
			$('#' + this.htmlLogId + '-container').width(this.width);
			$('#' + this.htmlLogId + '-container').height(this.height);

			// Apply CSS settings to log container.
			this.applyCSS(this.logContainerCSS, '#' + this.htmlLogId + '-container');

			/*
			 *  Log element holds messages.
			 */

			// Create log HTML element.
			$('#' + this.htmlLogId + '-container').append($('<div id="' + this.htmlLogId + '"/>'));

			// Apply CSS settings to chat log.
			this.applyCSS(this.logCSS, '#' + this.htmlLogId);					
		},

		/*
		 * Applies one or more CSS settings to an element.
		 *
		 * @param  css     object    Contains CSS properties and their values.
		 * @param  element string    Name of element to alter using jQuery.
		 * @return         undefined
		 */
		applyCSS: function(css, element)
		{

			// Select element using jQuery.
			var elementToUse = $(element);

			// Get CSS settings
			for(var property in css)
			{
				// Apply property.
				elementToUse.css( property, css[property] );
			}
		},

		/*
		 * Adds a new message to the end of the log.
		 *
		 * @param  html string    HTML formatted message.
		 * @return      undefined
		 */
		push: function(html) {

			// Get top of scroll position.
			var scrollTop = $('#' + this.htmlLogId)[0].scrollTop;

			// Get top of scroll position when scrolled to bottom.
			var scrollTopWhenScrolled = $('#' + this.htmlLogId)[0].scrollHeight - $('#' + this.htmlLogId)[0].offsetHeight;

			// Check if div is currently scrolled or not.
			var scroll = (scrollTop==scrollTopWhenScrolled ? true:false);
			
			// Add new content to the log.
			$('#' + this.htmlLogId).append(html);

			// Pruning.
			this.prune();

			// Scroll the log.
			if(scroll) this.scroll();
		},

		/*
		 * Scrolls the chat log to the bottom.
		 *
		 * @return undefined
		 */
		scroll: function()
		{
			// Instantly animate the scroll (not actually animated).
			$('#' + this.htmlLogId).animate({scrollTop:$('#' + this.htmlLogId)[0].scrollHeight}, 0);
		},

		/*
		 * Removes excess messages if there is more than allowed by the buffer.
		 *
		 * @return undefined
		 */
		prune: function() {

			// Get number of messages in log.
			var messageCount = $('#' + this.htmlLogId + ' > div').length;

			// Check if there are too many messages.
			if (messageCount > this.buffer) {
				
				// How many messages to remove.
				var removeCount = messageCount - this.buffer;

				for (var i = 0; i < removeCount; i++) {
					
					// Remove oldest entry.
					$('#' + this.htmlLogId + ' div:first').remove();
					
				}
			}
		}

	});


})