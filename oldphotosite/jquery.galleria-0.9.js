/**
 * Galleria (http://monc.se/kitchen)
 *
 * Galleria is a javascript image gallery written in jQuery.
 * It loads the images one by one from an unordered list and displays thumbnails when each image is loaded
 * It will create thumbnails for you, scaled or unscaled, and center them in a fixed thumbnail box
 * You can also use custom thumbnails like a regular html gallery
 * A caption can be extracted from the title attribute
 *
 * MAIN FEATURES
 * - Unobtrusive javascript
 * - Lightweight (2.5k)
 * - Displays the thumbnail when the actual image is loaded
 * - Unstyled - create your own gallery style using CSS
 * - Superfast image browsing since the images are preloaded one at a time in the background
 * - Can scale thumbnails to fit in thumbnail container
 * - Can be used with custom thumbnails
 * - Options are extracted from exisiting markup
 * - Clicking the main image will display the next in line
 * - Stylable caption from image or anchor title
 * - jQuery plugin - takes one line to implement
 * - Browserproof
 *
 * Tested in Safari 3, Firefox 2, MSIE 6, MSIE 7, Opera 9
 * 
 * Version 0.9
 * Februari 13, 2008
 *
 * Copyright (c) 2008 David Hellsing (http://monc.se)
 * Dual licensed under the MIT and GPL licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/gpl-license.php
 **/

;(function(){

var $$;

/**
 * 
 * @desc Convert images from a simple html <ul> into a thumbnail gallery
 * @author David Hellsing
 * @version 1.0
 *
 * @name Galleria
 * @type jQuery
 *
 * @cat plugins/Media
 * 
 * @example jQuery('ul.gallery').galleria({ nextText:'Next image', fadeIn: true });
 * @desc Create the gallery from an unordered list of images with thumbnails faded in and a custom title
 *
 * @options nextText:String fadeIn:Boolean
 *
**/

$$ = jQuery.fn.galleria = function(options) {
	
	// set default options
	var defaults = { 
		nextText : 'Click to view the next image',
		fadeIn : true
	};
	var opts = jQuery.extend(defaults, options);
	
	// check for basic CSS support
	if (!$$.hasCSS()) {
		return false;
	}
	
	return this.each(function(){
		
		// add the Galleria class
		jQuery(this).addClass('galleria')
		
		// loop through list
		jQuery(this).children('li').each(function(i) {
			
			// bring the scope
			var _container = jQuery(this);
			                
			// build element specific options
			var _o = jQuery.meta ? jQuery.extend({}, opts, _container.data()) : opts;
			
			// reference the original image as a variable and hide it
			var _img = jQuery(this).children('img').css('display','none');
			
			// extract the original source
			var _src = _img.is('img') ? _img.attr('src') : jQuery(this).children('a').attr('href');
			
			// create loader image            
			var _loader = new Image();
			
			// begin loader
			jQuery(_loader).load(function () {

				// add the nextClick functionality for our main img
				$(this).click(function() {
					_container.removeClass('active');
					jQuery($$.nextLi(_container)).addClass('active');
				});

				// add a title text to our main image
				$(this).attr('title',_o.nextText);
				
				// Create caption span
				var _span = jQuery(document.createElement('span'));
				_span.addClass('caption').text(_img.attr('title'));
				
				// grab the alt
				jQuery(this).attr('alt',_img.attr('alt'));

				//-----------------------------------------------------------------
				// the image is loaded, let's create the thumbnail
				
				var _thumb = _img.clone(true).addClass('thumb cloned').css('display','none');

				if (!_thumb.hasClass('noscale') && _thumb.hasClass('cloned')) { // scaled thumbnails
					
					var w = Math.ceil( _img.width() / _img.height() * _container.height() );
					var h = Math.ceil( _img.height() / _img.width() * _container.width() );
					if (w < h) {
						_thumb.css({ height: 'auto', width: _container.width(), marginTop: -(h-_container.height())/2 });
					} else {
						_thumb.css({ width: 'auto', height: _container.height(), marginLeft: -(w-_container.width())/2 });
					}
					
				} else if (_thumb.hasClass('cloned')) { // non-scaled thumbnails
					
					_thumb.css({
						marginLeft: -( _img.width() - _container.width() )/2, 
						marginTop:  -( _img.height() - _container.height() )/2
					});
					
				} else { // There must be a custom thumbnail inside the anchor

					_thumb = _container.children('a').children('img')
							 .addClass('thumb noscale').css('display','none')
							 .attr('title', _container.children('a').attr('title'));
							
					_span.text(_container.children('a').attr('title'));
					_container.children('a').replaceWith(_thumb);
					
					if (!jQuery.browser.opera) { // opera does this wrong, sorry
						_thumb.css({
							marginLeft: -( _thumb.width() - _container.width() )/2, 
							marginTop:  -( _thumb.height() - _container.height() )/2
						});
					}
				}
				
				// add the click functionality to the _thumb and apply the active class to the <li>
				_thumb.click(function() {
					_container.siblings('.active').removeClass('active');
					_container.addClass('active');
				});
				
				// hover class for IE6
				_thumb.hover(
					function() { jQuery(this).addClass('hover'); },
					function() { jQuery(this).removeClass('hover'); }
				);
				
				// create a wrapping div for the big image and caption
				var _div = jQuery(document.createElement('div'));
				_div.prepend(_span).prepend(this);

				// prepend the wrapper & thumb
				_container.prepend(_div).prepend(_thumb);
				
				// and fade in, if you like  <-- yey!
				if (_o.fadeIn) { _thumb.fadeIn(); }
				else { _thumb.css('display','block'); }
				
				//-----------------------------------------------------------------
				
				// finally delete the original image
				_img.remove();
				
			}).error(function () {
				
				// Error handling
			    _container.html('<span class="error" style="color:red">Error loading image: '+_src+'</span>');
			
			}).attr('src', _src);
		});
	});
};

/**
 *
 * @name gallery.nextLi
 * @desc Return the next list container
 * @type Element
 * 
 * @example $$.nextLi(container)
 *
**/

$$.nextLi = function(li) {
	return jQuery(li).next().is('li') ? 
    	   jQuery(li).next() : 
    	   jQuery(li).siblings(':first-child');
};

/**
 *
 * @name gallery.hasCSS
 * @desc Checks if basic CSS is supported and return boolean value
 * @type Boolean
 * 
 * @example $$.hasCSS()
 *
**/

$$.hasCSS = function()  {
	$('body').append(
		jQuery(document.createElement('div')).attr('id','css_test')
		.css({ width:'1px', height:'1px', display:'none' })
	);
	var _v = ($('#css_test').width() != 1) ? false : true;
	$('#css_test').remove();
	return _v;
};

})();
