// webkitdragdrop.js v1.0, Mon May 15 2010
//
// Copyright (c) 2010 Tommaso Buvoli (http://www.tommasobuvoli.com)
// No Extra Libraries are required, simply download this file, add it to your pages!
//
// To See this library in action, grab an ipad and head over to http://www.gotproject.com
// webkitdragdrop is freely distributable under the terms of an MIT-style license.


//Description
// Because this library was designed to run without requiring any other libraries, several basic helper functions were implemented
// 6 helper functons in this webkit_tools class have been taked directly from Prototype 1.6.1 (http://prototypejs.org/) (c) 2005-2009 Sam Stephenson

var webkit_tools = 
{
	//$ function - simply a more robust getElementById
		
	$:function(e)
	{
		if(typeof(e) == 'string')
		{
			return document.getElementById(e);
		}
		return e;
	},
	
	//extend function - copies the values of b into a (Shallow copy)
	
	extend:function(a,b)
	{
		for (var key in b)
		{
			a[key] = b[key];	
		}	
		return a;
	},
	
	//empty function - used as defaut for events
	
	empty:function()
	{
	
	},
	
	//remove null values from an array
	
	compact:function(a)
	{
		var b = []
		var l = a.length;
		for(var i = 0; i < l; i ++)
		{
			if(a[i] !== null)
			{
				b.push(a[i]);
			}
		}
		return b;
	},
	
	//DESCRIPTION
	//	This function was taken from the internet (http://robertnyman.com/2006/04/24/get-the-rendered-style-of-an-element/) and returns 
	//	the computed style of an element independantly from the browser
	//INPUT
	//	oELM (DOM ELEMENT) element whose style should be extracted
	//	strCssRule element
	
	getCalculatedStyle:function(oElm, strCssRule)
	{
		var strValue = "";
		if(document.defaultView && document.defaultView.getComputedStyle){
			strValue = document.defaultView.getComputedStyle(oElm, "").getPropertyValue(strCssRule);
		}
		else if(oElm.currentStyle){
			strCssRule = strCssRule.replace(/\-(\w)/g, function (strMatch, p1){
				return p1.toUpperCase();
			});
			strValue = oElm.currentStyle[strCssRule];
		}
		return strValue;
	},
	
	//bindAsEventListener function - used to bind events
	
	bindAsEventListener:function(f,object) 
	{
        var __method = f;
        return function(event) {
            __method.call(object, event || window.event);
        };
    },
    
    //cumulative offset - courtesy of Prototype (http://www.prototypejs.org)
    
    cumulativeOffset:function(element) 
    {
	    var valueT = 0, valueL = 0;
	    do {
	      valueT += element.offsetTop  || 0;
	      valueL += element.offsetLeft || 0;
	      if (element.offsetParent == document.body)
	        if (element.style.position == 'absolute') break;
	
	      element = element.offsetParent;
	    } while (element);
	
	    return {left : valueL, top : valueT};
  	},
  	
  	//getDimensions - courtesy of Prototype (http://www.prototypejs.org)
  	
	getDimensions: function(element) 
	{
	    var display = element.style.display;
	    if (display != 'none' && display != null) // Safari bug
	      return {width: element.offsetWidth, height: element.offsetHeight};
	
	    var els = element.style;
	    var originalVisibility = els.visibility;
	    var originalPosition = els.position;
	    var originalDisplay = els.display;
	    els.visibility = 'hidden';
	    if (originalPosition != 'fixed') // Switching fixed to absolute causes issues in Safari
	      els.position = 'absolute';
	    els.display = 'block';
	    var originalWidth = element.clientWidth;
	    var originalHeight = element.clientHeight;
	    els.display = originalDisplay;
	    els.position = originalPosition;
	    els.visibility = originalVisibility;
	    return {width: originalWidth, height: originalHeight};
	},
	
	//hasClassName - courtesy of Prototype (http://www.prototypejs.org)
	
	hasClassName: function(element, className) 
	{
		var elementClassName = element.className;
		return (elementClassName.length > 0 && (elementClassName == className ||
		new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
  	},

	//addClassName - courtesy of Prototype (http://www.prototypejs.org)
	
	addClassName: function(element, className) 
	{
		if (!this.hasClassName(element, className))
			element.className += (element.className ? ' ' : '') + className;
		return element;
	},

	//removeClassName - courtesy of Prototype (http://www.prototypejs.org)
	
	removeClassName: function(element, className) 
	{
		element.className = this.strip(element.className.replace(new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' '));
		return element;
	},
	
	//strip - courtesy of Prototype (http://www.prototypejs.org)
	
	strip:function(s)
	{
    	return s.replace(/^\s+/, '').replace(/\s+$/, '');
    }

}

//Description
// Droppable fire events when a draggable is dropped on them

var webkit_droppables = function()
{
	this.initialize = function()
	{
		this.droppables = [];
		this.droppableRegions = [];
	}
	
	this.add = function(root, instance_props)
	{
		root = webkit_tools.$(root);
		var default_props = {accept : [], hoverClass : null, onDrop : webkit_tools.empty, onOver : webkit_tools.empty, onOut : webkit_tools.empty};
		default_props = webkit_tools.extend(default_props, instance_props || {});
		this.droppables.push({r : root, p : default_props}); 		
	}
	
	this.remove = function(root)
	{
		root = webkit_tools.$(root);
		var d = this.droppables;
		var i = d.length;
		while(i--)
		{
			if(d[i].r == root)
			{
				d[i] = null;
				this.droppables = webkit_tools.compact(d);
				return true;
			}
		}
		return false;
	}
	
	//calculate position and size of all droppables
	
	this.prepare = function()
	{
		var d = this.droppables;
		var i = d.length;
		var dR = [];
		var r = null;
		
		while(i--)
		{
			r = d[i].r;			
			if(r.style.display != 'none')
			{
				dR.push({i : i, size : webkit_tools.getDimensions(r), offset : webkit_tools.cumulativeOffset(r)})			
			}
		}
		
		this.droppableRegions = dR;
	}
	
	this.finalize = function(x,y,r,e)
	{
		var indices = this.isOver(x,y);
		var index = this.maxZIndex(indices);
		var over = this.process(index,r);
		if(over)
		{
			this.drop(index, r,e);
		}
		this.process(-1,r);
		return over;	
	}
	
	this.check = function(x,y,r)
	{
		var indices = this.isOver(x,y);
		var index = this.maxZIndex(indices);
		return this.process(index,r);		
	}
	
	this.isOver = function(x, y)
	{
		var dR = this.droppableRegions;
		var i = dR.length;
		var active = [];
		var r = 0;
		var maxX = 0;
		var minX = 0;
		var maxY = 0;
		var minY = 0;
		
		while(i--)
		{
			r = dR[i];
			
			minY = r.offset.top;
			maxY = minY + r.size.height;
			
			if((y > minY) && (y < maxY))
			{
				minX = r.offset.left;
				maxX = minX + r.size.width;
				
				if((x > minX) && (x < maxX))
				{
					active.push(r.i);
				}			
			}		
		}
		
		return active;	
	}
	
	this.maxZIndex = function(indices)
	{
		var d = this.droppables;
		var l = indices.length;
		var index = -1;
		
		var maxZ = -100000000;
		var curZ = 0;
		
		while(l--)
		{
			curZ = parseInt(d[indices[l]].r.style.zIndex || 0);
			if(curZ > maxZ)
			{
				maxZ = curZ;
				index = indices[l];		
			}	
		}
		
		return index;	
	}
	
	this.process = function(index, draggableRoot)
	{
		//only perform update if a change has occured
		if(this.lastIndex != index)
		{
			//remove previous
			if(this.lastIndex != null)
			{
				var d = this.droppables[this.lastIndex]
				var p = d.p;
				var r = d.r;
				
				if(p.hoverClass)
				{
					webkit_tools.removeClassName(r,p.hoverClass);
				}
				p.onOut();
				this.lastIndex = null;
				this.lastOutput = false;
			}
			
			//add new
			if(index != -1)
			{
				var d = this.droppables[index]
				var p = d.p;
				var r = d.r;
				
				if(this.hasClassNames(draggableRoot, p.accept))
				{
					if(p.hoverClass)
					{
						webkit_tools.addClassName(r,p.hoverClass);
					}
					p.onOver();				
					this.lastIndex = index;
					this.lastOutput = true;	
				}
			}	
		}
		return this.lastOutput;
	}
	
	this.drop = function(index, r, e)
	{
		if(index != -1)
		{
			this.droppables[index].p.onDrop(r,e);
		}
	}
	
	this.hasClassNames = function(r, names)
	{
		var l = names.length;
		if(l == 0){return true}
		while(l--)
		{
			if(webkit_tools.hasClassName(r,names[l]))
			{
				return true;
			}
		}
		return false;
	}
	
	this.initialize();
}

webkit_drop = new webkit_droppables();

//Description
//webkit draggable - allows users to drag elements with their hands

var webkit_draggable = function(r, ip)
{
	this.initialize = function(root, instance_props)
	{
		this.root = webkit_tools.$(root);
		var default_props = {scroll : false, revert : false, handle : this.root, zIndex : 1000, onStart : webkit_tools.empty, onEnd : webkit_tools.empty};		
		
		this.p = webkit_tools.extend(default_props, instance_props || {});
		default_props.handle = webkit_tools.$(default_props.handle);
		this.prepare();
		this.bindEvents();
	}
	
	this.prepare = function()
	{
		var rs = this.root.style;
		
		//set position
		if(webkit_tools.getCalculatedStyle(this.root,'position') != 'absolute')
		{
			rs.position = 'relative';
		}
		
		//set top, right, bottom, left
		rs.top = rs.top || '0px';
		rs.left = rs.left || '0px';
		rs.right = "";
		rs.bottom = "";		
		
		//set zindex;
		rs.zIndex = rs.zIndex || '0';
	}
	
	this.bindEvents = function()
	{
		var handle = this.p.handle;
		
		this.ts = webkit_tools.bindAsEventListener(this.touchStart, this);
		this.tm = webkit_tools.bindAsEventListener(this.touchMove, this);
		this.te = webkit_tools.bindAsEventListener(this.touchEnd, this);		
		
		handle.addEventListener("touchstart", this.ts, false);
		handle.addEventListener("touchmove", this.tm, false);
		handle.addEventListener("touchend", this.te, false);
	}	
	
	this.destroy = function()
	{
		var handle = this.p.handle;
		
		handle.removeEventListener("touchstart", this.ts);
		handle.removeEventListener("touchmove", this.tm);
		handle.removeEventListener("touchend", this.te);	
	}
	
	this.set = function(key, value)
	{
		this.p[key] = value;
	}
	
	this.touchStart = function(event)
	{
		//prepare needed variables
		var p = this.p;
		var r = this.root;
		var rs = r.style;
		var t = event.targetTouches[0];		
		
		//get position of touch
		touchX = t.pageX;
		touchY = t.pageY;
				
		//set base values for position of root
		rs.top = this.root.style.top || '0px';
		rs.left = this.root.style.left || '0px';
		rs.bottom = null;
		rs.right = null;
		
		var rootP = webkit_tools.cumulativeOffset(r);
		var cp = this.getPosition();
		
		//save event properties
		p.rx = cp.x;
		p.ry = cp.y;		
		p.tx = touchX;
		p.ty = touchY;
		p.z = parseInt(this.root.style.zIndex);
		
		//boost zIndex
		rs.zIndex = p.zIndex;
		webkit_drop.prepare();
		p.onStart();
	}
	
	this.touchMove = function(event)
	{
		event.preventDefault();
		event.stopPropagation();
		
		//prepare needed variables
		var p = this.p;
		var r = this.root;
		var rs = r.style;
		var t = event.targetTouches[0];
		if(t == null){return}
		
		var curX = t.pageX;
		var curY = t.pageY;
		
		var delX = curX - p.tx;
		var delY = curY - p.ty;
		
		rs.left = p.rx + delX + 'px';
		rs.top  = p.ry + delY + 'px';
		
		//scroll window
		if(p.scroll)
		{
			s = this.getScroll(curX, curY);
			if((s[0] != 0) || (s[1] != 0))
			{
				window.scrollTo(window.scrollX + s[0], window.scrollY + s[1]);
			}
		}
		
		//check droppables
		webkit_drop.check(curX, curY, r);
		
		//save position for touchEnd
		this.lastCurX = curX;
		this.lastCurY = curY;
	}
	
	this.touchEnd = function(event)
	{
		var r = this.root;
		var p = this.p;
		var dropped = webkit_drop.finalize(this.lastCurX, this.lastCurY, r, event);
		
		if(((p.revert) && (!dropped)) || (p.revert === 'always'))
		{
			//revert root
			var rs = r.style;
			rs.top = (p.ry + 'px');
			rs.left = (p.rx + 'px');
		}
		
		r.style.zIndex = this.p.z;
		this.p.onEnd();
	}
	
	this.getPosition = function()
	{
		var rs = this.root.style;
		return {x : parseInt(rs.left || 0), y : parseInt(rs.top  || 0)}
	}
	
	this.getScroll = function(pX, pY)
	{
		//read window variables
		var sX = window.scrollX;
		var sY = window.scrollY;
		
		var wX = window.innerWidth;
		var wY = window.innerHeight;
		
		//set contants		
		var scroll_amount = 10; //how many pixels to scroll
		var scroll_sensitivity = 100; //how many pixels from border to start scrolling from.
				
		var delX = 0;
		var delY = 0;		
		
		//process vertical y scroll
		if(pY - sY < scroll_sensitivity)
		{
			delY = -scroll_amount;
		}
		else
		if((sY + wY) - pY < scroll_sensitivity)
		{
			delY = scroll_amount;
		}
		
		//process horizontal x scroll
		if(pX - sX < scroll_sensitivity)
		{
			delX = -scroll_amount;
		}
		else
		if((sX + wX) - pX < scroll_sensitivity)
		{
			delX = scroll_amount;
		}
		
		return [delX, delY]
	}
	
	//contructor
	this.initialize(r, ip);
}

//Description
//webkit_click class. manages click events for draggables

var webkit_click = function(r, ip)
{
	this.initialize = function(root, instance_props)
	{
		var default_props = {onClick : webkit_tools.empty};
		
		this.root = webkit_tools.$(root);
		this.p = webkit_tools.extend(default_props, instance_props || {});
		this.bindEvents();
	}
	
	this.bindEvents = function()
	{
		var root = this.root;
		
		//bind events to local scope
		this.ts = webkit_tools.bindAsEventListener(this.touchStart,this);
		this.tm = webkit_tools.bindAsEventListener(this.touchMove,this);
		this.te = webkit_tools.bindAsEventListener(this.touchEnd,this);
		
		//add Listeners
		root.addEventListener("touchstart", this.ts, false);
		root.addEventListener("touchmove", this.tm, false);
		root.addEventListener("touchend", this.te, false);
		
		this.bound = true;	
	}	
	
	this.touchStart = function()
	{
		this.moved = false;
		if(this.bound == false)
		{
			this.root.addEventListener("touchmove", this.tm, false);
			this.bound = true;
		}
	}
	
	this.touchMove = function()
	{
		this.moved = true;
		this.root.removeEventListener("touchmove", this.tm);
		this.bound = false;
	}
	
	this.touchEnd = function()
	{
		if(this.moved == false)
		{
			this.p.onClick();
		}
	}
	
	this.setEvent = function(f)
	{
		if(typeof(f) == 'function')
		{
			this.p.onClick = f;
		}
	}
	
	this.unbind = function()
	{
		var root = this.root;
		root.removeEventListener("touchstart", this.ts);
		root.removeEventListener("touchmove", this.tm);
		root.removeEventListener("touchend", this.te);
	}
		
	//call constructor
	this.initialize(r, ip);
}


//*******************************************************


if(navigator.platform == 'iPad' ) { var isiPad = true; };
var id_num = 1;

//expandable blocks
$(document).ready(function() {
	var expand_els = $('#sidebar div#cb-art-figures')
	if (expand_els[0]) {
		$('#sidebar').addClass('js-target'); 
		//collapse blocks
		expand_els.not('.open').addClass('closed')
		.children('ol').hide();
	}
});


//figure viewer
$(document).ready(function() {
	if ($('#content-block div.fulltext-view div.pos-float.fig')[0]) {	
		$('#sidebar').addClass('js-target'); 
		// create new element to contain cloned figures and UL for navigation tabs
		var new_el = '<div class="cb-section expandable-block dynamic-figs" id="cb-art-figures">'
		+ '<h4 class="cb-section-header">Figures</h4>'
		+ '<ol>'
		+ '<li id="sidebar-figures">'
		+ '<ul class="fig-nav"></ul>'
		+ '</li>'
		+ '</ol>'
		+ '</div>';
		
	 	// insert new element into #sidebar
		if ($('#cb-art-related')[0]) {	
			$('#cb-art-related').after(new_el);
		}
		else if ($('#cb-art-coll')[0]) {	
			$('#cb-art-coll').after(new_el);
		}
		else {	
			$('#sidebar div.figures').prepend(new_el);
		}
		
		// clone & change class name on figures
		$('#content-block div.fulltext-view div.pos-float.fig').each(function(index) {
			var new_figure = $(this).clone();
			var fig_id = 'i_' + index;
			new_figure.addClass(fig_id);
			new_figure.find('.fig-inline')
				.removeClass('fig-inline')
				.addClass('fig-sidebar');
			
			// edit links on cloned figures
			var fig_links = new_figure.find('a[href*="expansion"]');
			if (fig_links[0]) {
				fig_links.each(function() {
					var this_link = $(this);					
					var classAttr = this_link.attr("class");
					if (!(classAttr && (classAttr == 'in-nw'))) {
						if (this_link.text().indexOf('n this window') >= 0) {
							this_link.text("In this page");
						}				
					}
					else if ((classAttr && (classAttr == 'in-nw'))) {		
						this_link.removeClass().addClass('fig-in-nw').attr("target", "_blank");							
					}
				});
			}	
			
			// append cloned figure to new element and hide it
			new_figure
				.appendTo('#sidebar-figures')
				.hide();
			
			// add navigation tab for each figure	
			var fig_label = new_figure.find('span.fig-label').text();
			// looking for string like "Figure 2A."
			var fig_regexp = /^figure\s+(\w?\d+[a-z]*)\.?\s*$/i
			var result = fig_label.match(fig_regexp)
			var fig_num = result ? result[1] : fig_label;
			
			var new_nav_item = '<li id="i_' + index + '">' + fig_num + '</li>';		
			$('ul.fig-nav').append(new_nav_item);
		});
		
		// show the first figure
		$('#sidebar div.dynamic-figs div.fig').eq(0).show();
		// if only one figure present remove navigation
		if (!$('#content-block div.fulltext-view div.fig')[1]) {
			$('#sidebar ul.fig-nav').remove();
		}
		//add 'active' class to first tab
		var nav_item = $('#sidebar ul.fig-nav li');
		nav_item.eq(0).addClass('active');

	}
});


//event handlers - all bubble from #sidebar
$(document).ready(function() {

	var target_area = $('#sidebar.js-target');

	target_area.click(function(e) { 
		var this_target = $(e.target);
		
		//expandable blocks
		if(this_target.is('h4.cb-section-header')) { 
			var this_ex_id = this_target.parent('div.expandable-block').attr('id');
			$('#sidebar div#cb-art-figures').filter(function () {
				return $(this).attr("id") == this_ex_id;
			})
			.toggleClass('closed')
			.children('ol').toggle();
		}
		
		//figure viewer navigation
		else if(this_target.parents().hasClass('fig-nav')) { 
			var this_tab_id = this_target.attr('id');
			$('#sidebar ul.fig-nav li').removeClass('active')
			.filter(function () {
				return $(this).attr("id") == this_tab_id;
			})
			.addClass('active');
			$('#sidebar div.dynamic-figs div.fig').hide()
			.filter(function () {
				return $(this).hasClass(this_tab_id);
			})
			.show();
		}

		else if(this_target.is('a[class="fig-in-nw"]')) { 
			e.stopPropagation();
			return;
		}
				
		else if(this_target.is('a[href*="expansion"]')) { 
			winCheck (this_target);
			buildWin (this_target);
			e.stopPropagation();
			e.preventDefault();
			return;
		}
		
		//figure viewer thumbnails
		else if(this_target.is('img') && this_target.parent('a[href*="expansion"]')) { 
			target_link = this_target.parent('a');
			winCheck (target_link);
			buildWin (target_link);
			e.stopPropagation();
			e.preventDefault();
			return;
		}
	});
});


//check to see if this figure window already exists, remove if it does
function winCheck (link) {	
	var fig_label = link.parents('div.fig').find('span.fig-label').text();	
	$('div.fig-win').each(function() {
		var this_fig_win = $(this);
		if (this_fig_win.find('span.fig-label').text() == fig_label) {
			this_fig_win.remove();
			calulateTopPos (-35);
		}
	});
}	

function buildWin (link) {
	var new_win = $('<div class="fig-win">'
	+ '<div class="fig-win-hdr fig-win-handle">'
	+ '<h4>Figure Viewer</h4>'		
	+ '<em>(drag to move)</em>'
	+ '<span class="close">[ close <b>X</b> ]</span>'
	+ '</div>'
	+ '<div class="fig-img">'
	+ '<div class="fig-loading">Loading...</div>'
	+ '</div>'
	+ '<div class="fig-zoom"></div>'
	+ '</div>');
	calulateTopPos (35);
	new_win.css({'top' : top_pos, 'left' : '5px'});
	if (isiPad) { new_win.addClass('ipad'); };
	var fig_txt = $("div.fig(1) div.fig-caption").html();
	if (fig_txt) { new_win.append('<div class="fig-caption">' + fig_txt + '</div>'); }
	new_win.append('<div class="fig-win-ft fig-win-handle"><em>(drag to move)</em><span class="close">[ close <b>X</b> ]</span></div>');
	new_win.appendTo('body').hide();
	$('div.fig-win-handle .close').click(function(e) {
		$(e.target).parents('div.fig-win').remove();
		calulateTopPos (-35);
	});
	launchWin (new_win, link);
}


var top_pos = 50;
function calulateTopPos (inc) {
	top_pos +=inc;
	if (top_pos >= 300) { 
		top_pos = 85
	}
}

function launchWin (win_el, link) {
	var href = link.attr("href");
	var pathseg = href.substring(0, href.lastIndexOf('/') + 1);
	//grabbing page url segment to test against later for ie6 & 7
	var location_array = location.href.split('/');
	location_seg_1 = location_array.pop();
	location_seg_2 = location_array.pop();	
	location_seg_3 = location_array.pop();
	location_test = location_seg_3 + '/' + location_seg_2;
	$.ajax({		
		url: href,
		dataType: "html",
		type: "GET",
		error: ajaxErr,
		success: function(xhtml) {
			var x = jQuery(xhtml);
			var ex_img = x.find('.fig-expansion img');			
			var ex_link = x.find('.fig-expansion a');
			//path to large img
			var ex_link_href = ex_link.attr('href');
			var new_img_all = '';
			
			//there are multiple images or iPad- insert into figure window but without zoom function
			if (ex_img[1] || isiPad) {				
				ex_img.each(function() {
				//src of medium img	
				var ex_img_src = $(this).attr('src');
				//test for ie6 & 7 which returns wrong img src
				if (ex_img_src.indexOf(location_test) != -1) {
					ex_img_src = ex_img_src.substring(ex_img_src.lastIndexOf(location_test));
					ex_img_src = ex_img_src.substring(ex_img_src.indexOf('/') +1);
					ex_img_src = ex_img_src.substring(ex_img_src.indexOf('/') +1);
				}
				var new_img_src = pathseg + ex_img_src;	
				var new_l_img_src = pathseg + ex_link_href;				
				var new_img = '<img src="' + new_img_src + '" alt="" />';
				new_img_all += new_img;
				var fig_img_el = win_el.find('div.fig-img');
				fig_img_el.html(new_img_all);
				});
			}
			
			//there's only one image - insert into figure
			else {	
				//src of medium img							
				var ex_img_src = ex_img.attr('src');
				//test for ie6 & 7 which returns wrong img src
				if (ex_img_src.indexOf(location_test) != -1) {
					ex_img_src = ex_img_src.substring(ex_img_src.lastIndexOf(location_test));
					ex_img_src = ex_img_src.substring(ex_img_src.indexOf('/') +1);
					ex_img_src = ex_img_src.substring(ex_img_src.indexOf('/') +1);
				}
				//click medium img to replace with large img
				function zoomImg() {
					$(this).parents('div.fig-win').find('div.fig-zoom a').html('Zoom Out');
					fig_img_el.css('overflow','hidden').html($('<img src="' + new_l_img_src + '" alt="" title="drag to move" />').draggable());
				}
				
				var new_img_src = pathseg + ex_img_src;							
				var new_img = $('<img src="' + new_img_src + '" alt="" title="Zoom In" class="medium" />').bind('click', zoomImg);
				
				//test for ie6 & 7 which returns wrong href
				if (ex_link_href.indexOf(location_test) != -1) {
					ex_link_href = ex_link_href.substring(ex_link_href.lastIndexOf(location_test));
					ex_link_href = ex_link_href.substring(ex_link_href.indexOf('/') +1);
					ex_link_href = ex_link_href.substring(ex_link_href.indexOf('/') +1);
				}
				var new_l_img_src = pathseg + ex_link_href;	
				var fig_img_el = win_el.find('div.fig-img');
				var zoom_link = $('<a href="#">Zoom In</a>');
				
				//toggle imgs
				zoom_link.click(function() {
					if ($(this).text() == 'Zoom In') { 
						$(this).html('Zoom Out');
						fig_img_el.css('overflow','hidden').html($('<img src="' + new_l_img_src + '" alt="" title="drag to move" />').draggable());
						return false;
					}
					else if ($(this).text() == 'Zoom Out') { 
						$(this).html('Zoom In');
						fig_img_el.css('overflow','auto').html($('<img src="' + new_img_src + '" alt="" title="Zoom In" class="medium" />').bind('click', zoomImg));
						return false;
					}
				});
				
				var fig_zoom_el = win_el.find('div.fig-zoom');
				fig_zoom_el.html(zoom_link);
				fig_img_el.html(new_img);
			}		
		},
		complete: ajaxComplete
	});
	win_el.fadeIn().draggable({ handle: 'div.fig-win-handle', stack: 'body div.fig-win' });
	
	if (isiPad) { 	
		id_num++;
		var win_id = "win_" + top_pos;
		win_el.attr('id', win_id);
		new webkit_draggable(win_id);
	}

}
