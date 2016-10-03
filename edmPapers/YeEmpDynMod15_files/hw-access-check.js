$(document).ready(function() {
	setTimeout("kickoffAccessCheck()", 25);
});

function kickoffAccessCheck() {
	// get any accesscheck citations; generate a callback document
	var acspans = $('span.accesscheck');
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
			postAccessCheck(doc);
		}
	}
}
function postAccessCheck(doc) {
	var ajaxUrl = document.location.protocol + "//" + document.location.host + '/authn-callback';
	$.ajax({
		url: ajaxUrl,
		contentType: 'text/xml',
		data: doc,
		dataType: "xml",
		type: "POST",
		processData: false,
		error: postAccessCheckError,
		success: postAccessCheckResponse,
		complete: postAccessCheckComplete
	});
}

function postAccessCheckError(req, msg, e) {
}
function postAccessCheckComplete(req, msg) {
}
function postAccessCheckResponse(xmlData) {
	var allSpans = $('span.accesscheck');
	if (allSpans.length) {
		var classValArr = new Array(allSpans.length);
		for (var i = 0; i < allSpans.length; i++) {
			classValArr[i] = (allSpans.eq(i).attr('class').split(/\s+/));
		}
		$(xmlData).find('check-resource').each(
			function(i) {
				var resid = $(this).attr('resid');
				if (resid != null) {
					var newClass = $(this).attr('add-class');
					if ((newClass == null) || (newClass == '')) {
						newClass = 'noac';
					}
					for (var i = 0; i < allSpans.length; i++) {
						if ((classValArr[i])[1] == resid) {
							var citParent = allSpans.eq(i).parents('.cit').eq(0);
							if (citParent.length) {
								modClass(citParent, newClass, '');
								if (!(newClass == 'noac')) {
									publCustomizeCitation(citParent,newClass);
								}
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

