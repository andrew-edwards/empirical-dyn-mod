$(document).ready(function() {
	setTimeout("kickoffViewSpecAccessCheck()", 25);
});

function kickoffViewSpecAccessCheck() {
	// get any accesscheck citations; generate a callback document
	var acspans = $('span.viewspecificaccesscheck');
	if (acspans.length) {
		var doc = "<accesscheck>";
		var rows = 0;
		for (var i = 0; i < acspans.length; i++) {
			var acspanclass = acspans.eq(i).attr('class');
			var acspandata = acspanclass.split(/\s+/);
			if (acspandata.length == 3) {
				var resid = acspandata[1];
				var checkviews = acspandata[2];
				doc = doc + "<check-resource resid='" + resid + "' views='" + checkviews + "' ><\/check-resource>";
				rows++;
			}
		}
		doc = doc + "<\/accesscheck>";
		if (rows > 0) {
			postViewSpecAccessCheck(doc);
		}
	}
}
function postViewSpecAccessCheck(doc) {
	var ajaxUrl = document.location.protocol + "//" + document.location.host + '/authn-callback';
	$.ajax({
		url: ajaxUrl,
		contentType: 'text/xml',
		data: doc,
		dataType: "xml",
		type: "POST",
		processData: false,
		error: postViewSpecAccessCheckError,
		success: postViewSpecAccessCheckResponse,
		complete: postViewSpecAccessCheckComplete
	});
}

function postViewSpecAccessCheckError(req, msg, e) {
}
function postViewSpecAccessCheckComplete(req, msg) {
}
function postViewSpecAccessCheckResponse(xmlData) {
	var allSpans = $('span.viewspecificaccesscheck');
	var freeText = getSiteOption('free-text', 'Free');
	var freeToYouText = getSiteOption('free-to-you-text', 'Free to you');
	if (allSpans.length) {
		var classValArr = new Array(allSpans.length);
		for (var i = 0; i < allSpans.length; i++) {
			classValArr[i] = (allSpans.eq(i).attr('class').split(/\s+/));
		}
		$(xmlData).find('check-resource').each(
			function(i) {
				var resid = $(this).attr('resid');
				var view = $(this).attr('view');
				
				if (resid != null) {
					var newClass = $(this).attr('add-class');
					if ((newClass == null) || (newClass == '')) {
						newClass = 'noac';
					}
					for (var i = 0; i < allSpans.length; i++) {
						if ((classValArr[i])[1] == resid && (classValArr[i])[2] == view) {
						      modClass(allSpans.eq(i), newClass, '');
						      if(newClass == 'free'){
                                allSpans.eq(i).append(freeText);
                            }else if(newClass == 'free-to-you'){
                                allSpans.eq(i).append(freeToYouText);
                            }
						}
					}
				}
			}
		);
	}
}

function publCustomizeCitation(citationJQuery, newClass) {
}

