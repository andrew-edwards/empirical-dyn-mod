/* jQuery javascript functions for pop-up abstract box */
var gHoverAbsMetrics = {
	x: -9999, y: 10,
	citW: 0, citH: 0,
	defaultW: 405
};
var gHoverAbsAdditions = {
	defaultMatchExpr: 'div#hovering-abs div.abstract-view',
	matchExpr: '',
	prependHtml: '',
	appendHtml: ''
};
var gHoverSessionPing = {
	timeout: (4.25 * 1000 * 60),
	URI: '/'
}

gSiteOptions.medlineAbsAttribution = "Abstract from Medline";


$(document).ready(function() {

	/* set up abs rollover (after short delay) */
	if (callbackToken && allowsCookies()) {
		setTimeout("addAbsPops()", 25);
	}
	
});

var gFloatAbs = {
	deferRef: null, deferFor: null,
	citHovRef: null, absHovRef: null, dispAbsRef: null
};
var gAbsDims = {
	cursX: 20, cursY: -20,
	pad: { top:15, left: 20, right: 30, bottom: 35 }
};

//var popupViews=['abstract','extract','excerpt'];

function addAbsPops() {
	var popupViews;
	if ((gSiteOptions == undefined) || (gSiteOptions.popupViews == undefined)) {
		popupViews = ['abstract'];
	}
	else {
		popupViews = gSiteOptions.popupViews;
	}

	var usingRefPopupLinks = false;
	var refPopupLinkTypes;
	if ((gSiteOptions == undefined) || (gSiteOptions.refPopupLinkTypes == undefined)) {
		refPopupLinkTypes = null;
	}
	else {
		refPopupLinkTypes = gSiteOptions.refPopupLinkTypes;
	}
	
	
	var absCits = null;
	var matchExpr;
	for (var i = 0; i < popupViews.length; i++) {
	    if (gSiteOptions.suppressFloatingAbs != null){
	        matchExpr = ".cit:has(div.cit-extra a[rel='" + popupViews[i] + "']):lt(" +gSiteOptions.suppressFloatingAbs + ")";
	    } else {
	        matchExpr = ".cit:has(div.cit-extra a[rel='" + popupViews[i] + "'])";
	    }
	    
		if ((absCits == null) || !(absCits.length)) {
			absCits = $(matchExpr);
		}
		else {
			absCits = absCits.add(matchExpr);
		}
	}
	if (!(absCits.length) && (refPopupLinkTypes != null) && (refPopupLinkTypes.length > 0)) {
		for (var i = 0; i < refPopupLinkTypes.length; i++) {
			matchExpr = ".cit.ref-cit:has(div.cit-extra a.cit-ref-sprinkles-" + refPopupLinkTypes[i] + ")";
			if ((absCits == null) || !(absCits.length)) {
				absCits = $(matchExpr);
			}
			else {
				absCits = absCits.add(matchExpr);
			}
		}
		if (absCits.length) {
			usingRefPopupLinks = true;
		}
	}
	
	if (absCits.length) {
	
		var popupTimeout = 500;
		if (usingRefPopupLinks) {
			if (!((gSiteOptions == undefined) || (gSiteOptions.refAbsPopupTimeout == undefined))) {
				popupTimeout = gSiteOptions.refAbsPopupTimeout;
			}
		}
		else {
			if (!((gSiteOptions == undefined) || (gSiteOptions.absPopupTimeout == undefined))) {
				popupTimeout = gSiteOptions.absPopupTimeout;
			}
		}
		
		var foundPopup = false;
		var citationHover = false;
		var thumbnailHover = false;
		
		absCits.each(
			function() {
				var $this = $(this);
				var thisW = this.offsetWidth;
				var thisH = this.offsetHeight;
				var absLink = null;
				var matchExpr;
				var titleHtml = '';
				var appendHtml = '';
				if (!usingRefPopupLinks) {
					for (var i = 0; i < popupViews.length; i++) {
						if ((absLink == null) || !(absLink.length)) {
							matchExpr = "div.cit-extra a[rel='" + popupViews[i] + "']";
							absLink = $this.find(matchExpr);
						}
					}
				}
				else {
					for (var i = 0; i < refPopupLinkTypes.length; i++) {
						if ((absLink == null) || !(absLink.length)) {
							matchExpr = "div.cit-extra a.cit-ref-sprinkles-" + refPopupLinkTypes[i];
							absLink = $this.find(matchExpr);
						}
					}
					var titleSpan = $this.find("cite .cit-article-title");
					if (absLink.length) {
						if (titleSpan.length) {
							titleHtml = '<h1 class="cit-article-title">' + titleSpan.html() + '<\/h1>';
						}
						if (absLink.hasClass('cit-ref-sprinkles-medline') && gSiteOptions.medlineAbsAttribution && !(gSiteOptions.medlineAbsAttribution == '')) {
							appendHtml = '<p class="medline-attribution"><span>' + gSiteOptions.medlineAbsAttribution + '<\/span><\/p>';
						}
					}
				}
				foundPopup = (absLink.length && (absLink.length > 0));
				if (foundPopup) {
					var newCitHover = absLink.attr("href");
					foundPopup = newCitHover;
					var curQueryString = document.location.search;
					if (curQueryString.indexOf('popuprefStatus=') > -1) {
						var statusParam = curQueryString.substring(curQueryString.indexOf('popuprefStatus='));
						if (statusParam.indexOf('&') > -1) {
							statusParam = statusParam.substring(0, statusParam.indexOf('&'));
						}
						if (newCitHover.indexOf('?') > -1) {
							newCitHover = newCitHover + '&' + statusParam;
						}
						else {
							newCitHover = newCitHover + '?' + statusParam;
						}
					}

					if (gSiteOptions.suppressFloatingAbsOnThumbnails) {
						$this.find("img[class*='cit-thumbnail']").hover(
							function() {
								// If an abstract is being displayed, hide it
								if (gFloatAbs.dispAbsRef) {
									hideAbs(true);
								}

								// If an abstract has been queued for display, remove it
								if (gFloatAbs.deferRef != null) {
									clearTimeout(gFloatAbs.deferRef);
									gFloatAbs.deferRef = null;
									gFloatAbs.deferFor = null;
								}

								thumbnailHover = true;
							},

							function() {
								// If mouse is still hovering over the citation, queue the abstract
								if (citationHover) {
									var cmd = "showAbs('" + newCitHover + "')";
									gFloatAbs.deferRef = setTimeout(cmd, popupTimeout);
								}

								thumbnailHover = false;
							}
						);
					}

					$this.hover(
						function() {
							/* if we're displaying abs for different citation, remove it */
							if (gFloatAbs.dispAbsRef && (gFloatAbs.dispAbsRef != newCitHover)) {
								hideAbs(true);
							}
							/* if we're already displaying an abstract it must be for this cit */
							if (gFloatAbs.dispAbsRef != null) {
								gFloatAbs.citHovRef = newCitHover;
							}
							else if (!thumbnailHover) {
								if (gFloatAbs.deferRef != null) {
									clearTimeout(gFloatAbs.deferRef);
									gFloatAbs.deferRef = null;
									gFloatAbs.deferFor = null;
								}
								var citOffset = $this.offset(); /* top, left */
								gFloatAbs.deferFor = newCitHover;
								gHoverAbsMetrics.x = citOffset.left + thisW;
								gHoverAbsMetrics.y = citOffset.top;
								gHoverAbsMetrics.citW = thisW;
								gHoverAbsMetrics.citH = thisH;
								if (titleHtml && (titleHtml != '')) {
									gHoverAbsAdditions.prependHtml = titleHtml;
								}
								else {
									gHoverAbsAdditions.prependHtml = '';
								}
								if (appendHtml && (appendHtml != '')) {
									gHoverAbsAdditions.appendHtml = appendHtml;
								}
								else {
									gHoverAbsAdditions.prependHtml = '';
								}
								var cmd = "showAbs('" + newCitHover + "')";
								gFloatAbs.deferRef = setTimeout(cmd, popupTimeout); /*1000);*/
								gFloatAbs.citHovRef = newCitHover;
							}
							citationHover = true;
						},
						function() {
							gFloatAbs.citHovRef = null;
							setTimeout("hideAbs()", 20);
							citationHover = false;
						}
					);
				}
			}
		);
		
		if (foundPopup) {
			// add 4 minute timer to renew session...
			var sessURI = (((gHoverSessionPing.URI).indexOf('://') >= 0) ? gHoverSessionPing.URI : document.location.protocol + "//" + document.location.host + gHoverSessionPing.URI);
			addSessionTimer(gHoverSessionPing.timeout, sessURI);
		}
	}
}

function rollOffCit(href) {
	hideAbs();
}

function showAbs(absHref) {
	/** timer went off **/
	gFloatAbs.deferRef = null;
	gFloatAbs.deferFor = null;

	gFloatAbs.dispAbsRef = absHref;
	var newDiv = '<div id="hovering-abs"></div><div id="hovering-abs-ptr"></div>';
	$("body").append(newDiv);
	$("div#hovering-abs").css("left", "-9999px").css("top", "10px").css("position", "absolute");
	$("div#hovering-abs-ptr").css("left", "-9999px").css("top", "10px").css("position", "absolute");

	var ajaxUrl = document.location.protocol + "//" + document.location.host + absHref;
	if ((typeof(gSiteOptions.popabsParam) != "undefined") && (gSiteOptions.popabsParam.length > 0)) {
		// add on param
		if (ajaxUrl.indexOf('?') >= 0) {
			ajaxUrl = (ajaxUrl + "&" + gSiteOptions.popabsParam);
		}
		else {
			ajaxUrl = (ajaxUrl + "?" + gSiteOptions.popabsParam);
		}
	}

	$.ajax({
		url: ajaxUrl,
		dataType: "html",
		type: "GET",
		beforeSend: addAbsDirHeaders,
		error: ajaxErr,
		success: addHoverAbs,
		complete: ajaxComplete
	});

}
function addAbsDirHeaders(req) {
	addCommonHeaders(req);
	addPartHeaders(req);
}
function ajaxErr(req, msg, e) {
}
function ajaxComplete(req, msg) {
}
function hideAbs() {
	hideAbs(false);
}
function hideAbs(force) {
	if ((gFloatAbs.deferRef != null) && ((gFloatAbs.citHovRef == null) || (gFloatAbs.deferFor != gFloatAbs.citHovRef))) {
		clearTimeout(gFloatAbs.deferRef);
		gFloatAbs.deferRef = null;
		gFloatAbs.deferFor = null;
	}
	if (((gFloatAbs.citHovRef == null) && (gFloatAbs.absHovRef == null)) || force) {
		var hoverAbs = $("div#hovering-abs");
		var hoverAbsPtr = $("div#hovering-abs-ptr");
		if (hoverAbs.length) {
			hoverAbs.remove();
			if (hoverAbsPtr) {
				hoverAbsPtr.remove();
			}
		}
		gFloatAbs.dispAbsRef = null;
	}
}
/* ajax callback- show abs */
function addHoverAbs(xhtmlData) {
	// if we get back a whole html page instead of a fragment, don't display
	if (xhtmlData && !(xhtmlData.indexOf('<html') >= 0)) {
		var pageDim = getViewportDim();
		var hoverAbs = $("div#hovering-abs");
		var hoverAbsPtr = $("div#hovering-abs-ptr");
		if (hoverAbs.length) {
			hoverAbs.empty().append('<div id="hovering-abs-close"><a href="#">[x] <span>close</span></a></div>').append(xhtmlData);
			$("div#hovering-abs div.article ul.kwd-group").prepend('<span class="keywords">Keywords</span>');
			$("div#hovering-abs-close a").click(
				function(e) {
					hideAbs(true);
					e.preventDefault();
				}
			);

			// Fix relative URLs in src (in <img>) and href (in <a>) attributes
			var prependURL = gFloatAbs.dispAbsRef.substring(0, (gFloatAbs.dispAbsRef.lastIndexOf("/") + 1));

			// IE7 converts relative URLs to absolute, limit possible changes to attributes known to be problematic
			if (navigator.userAgent.indexOf("MSIE 7") >= 0) {
				hoverAbs.find("div.graphic-abstract img").attr("src",
					function(i, srcValue) {
						if (srcValue) {
							if (srcValue.indexOf(prependURL) < 0) {
								return prependURL + srcValue.substr(document.location.href.lastIndexOf("/") + 1);
							} else {
								return;
							}
						} else {
							return;
						}
					}
				);

				hoverAbs.find("div.graphic-abstract a").not("[href*='/powerpoint/']").attr("href",
					function(i, hrefValue) {
						if (hrefValue) {
							if (hrefValue.indexOf(prependURL) < 0) {
								return prependURL + hrefValue.substr(document.location.href.lastIndexOf("/") + 1);
							} else {
								return;
							}
						} else {
							return;
						}
					}
				);

			// Can't accurately test if URL of "src" attribute is absolute in IE8 or Firefox (some versions),
			// limit scope of possible (src) changes
			} else if ((navigator.userAgent.indexOf("MSIE 8") >= 0) || (navigator.userAgent.indexOf("Firefox") >= 0)) {
				hoverAbs.find("div.graphic-abstract img").attr("src",
					function(i, srcValue) {
						if (srcValue) {
							if (srcValue.indexOf("http://") != 0) {
								return prependURL + srcValue;
							} else if (srcValue.indexOf(prependURL) < 0) {
								return prependURL + srcValue.substr(document.location.href.lastIndexOf("/") + 1);
							} else {
								return;
							}
						} else {
							return;
						}
					}
				);

				hoverAbs.find("a").not("[href^='http://']").not("[href^='/']").not("[href^='#']").attr("href",
					function(i, hrefValue) {
						if (hrefValue) {
							return prependURL + hrefValue;
						} else {
							return;
						}
					}
				);
			} else {
				hoverAbs.find("div.graphic-abstract img").not("[src^='http://']").not("[src^='/']").attr("src",
					function(i, srcValue) {
						if (srcValue) {
							return prependURL + srcValue;
						} else {
							return;
						}
					}
				);

				hoverAbs.find("a").not("[href^='http://']").not("[href^='/']").not("[href^='#']").attr("href",
					function(i, hrefValue) {
						if (hrefValue) {
							return prependURL + hrefValue;
						} else {
							return;
						}
					}
				);
			}
			
			// add any content, if set up
			var hasPrepend = ((gHoverAbsAdditions != undefined) && gHoverAbsAdditions.prependHtml && !(gHoverAbsAdditions.prependHtml == ''));
			var hasAppend = ((gHoverAbsAdditions != undefined) && gHoverAbsAdditions.appendHtml && !(gHoverAbsAdditions.appendHtml == ''));
			if (hasPrepend || hasAppend) {
				var matchExpr = ((gHoverAbsAdditions.matchExpr && !(gHoverAbsAdditions.matchExpr == '')) ? gHoverAbsAdditions.matchExpr : gHoverAbsAdditions.defaultMatchExpr);
				if (matchExpr != '') {
					var matchEl = $(matchExpr);
					if (matchEl.length) {
						if (hasPrepend) {
							matchEl.prepend(gHoverAbsAdditions.prependHtml);
						}
						if (hasAppend) {
							matchEl.append(gHoverAbsAdditions.appendHtml);
						}
					}
				}
				gHoverAbsAdditions.matchExpr = '';
				gHoverAbsAdditions.prependHtml = '';
				gHoverAbsAdditions.appendHtml = '';
			}
			
			var pageOffset = getPageOffset();
			var height = getObjHeight(hoverAbs); //height();
			var width = Math.min(gHoverAbsMetrics.defaultW, pageDim.x - (gAbsDims.pad.left + gAbsDims.pad.right));
			var forceWidth = false;
			/* x,y is upper left of abs */
			/* ptrX, ptrY is upper left of ptr */
			var x = gHoverAbsMetrics.x;
			if ((x + width + gAbsDims.pad.right) > (pageDim.x + pageOffset.x)) {
				x = ((pageDim.x + pageOffset.x) - (width + gAbsDims.pad.right));
				if ((gHoverAbsMetrics.x - x) > 200) {
					forceWidth = true;
					width = Math.max(width - (gHoverAbsMetrics.x - x) + 200, 200);
					x = gHoverAbsMetrics.x - 200;
				}
			}
			var minY = pageOffset.y + gAbsDims.pad.top;
			var y = Math.max(Math.min(Math.max((gHoverAbsMetrics.y + (gHoverAbsMetrics.citH / 2) - (height / 2) + gAbsDims.pad.top), minY), ((pageDim.y + pageOffset.y) - (height + gAbsDims.pad.bottom))), minY);
			if ((height + gAbsDims.pad.top + gAbsDims.pad.bottom) > pageDim.y) {
				height = pageDim.y - (gAbsDims.pad.top + gAbsDims.pad.bottom);
			}
			var ptrX = x - 25;
			var ptrY = Math.min(Math.max(gHoverAbsMetrics.y + (gHoverAbsMetrics.citH / 2) - 16, y+16), (y + height)-32);
					
			hoverAbsPtr.hide().css("height", "32px").css("width", "32px").css("left", "" + ptrX + "px").css("top", "" + ptrY + "px");
			hoverAbs.hide().css("height", "" + height + "px").css("left", "" + x + "px").css("top", "" + y + "px");
			if (forceWidth) {
				hoverAbs.css("width", "" + width + "px");
			}
			customAddHoverAbsCallback();
			hoverAbs.fadeIn(200);
			hoverAbsPtr.fadeIn(200);
			hoverAbs.hover(rollOverAbs, rollOffAbs);
			hoverAbsPtr.hover(rollOverAbs, rollOffAbs);
		}
	}
}

/* sites can override in order to do something when the hovering abstract loads */
function customAddHoverAbsCallback() {
	// placeholder, can be overridden
}

function rollOverAbs(e) {
	gFloatAbs.absHovRef = gFloatAbs.dispAbsRef;
}
function rollOffAbs(e) {
	gFloatAbs.absHovRef = null;
	setTimeout("hideAbs()", 20);
}

function addSessionTimer(timerLen, URI) {
	setTimeout("renewSession(" + timerLen + ", '" + URI + "')", timerLen);
}
function renewSession(callAgainTimeout, URI) {
	$.ajax({
		url: URI,
		dataType: "html",
		type: "HEAD",
		beforeSend: addAbsDirHeaders,
		error: ajaxErr,
		success: function() {
			addSessionTimer(callAgainTimeout, URI);
		},
		complete: ajaxComplete
	});
}
