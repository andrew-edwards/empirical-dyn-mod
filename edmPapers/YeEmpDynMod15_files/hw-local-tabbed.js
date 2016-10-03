var mjid = $('head meta[name="citation_mjid"]').attr("content");
var doi = $('head meta[name="citation_doi"]').attr("content");
var altmetricJsonUrl = 'https://api.altmetric.com/v1/doi/' + doi;

$(document).ready(function(){

	//Add article doi at the top
	$('div#content-block ul#site-breadcrumbs li.lastcrumb span.btext').text($('div#content-block ul#site-breadcrumbs li.lastcrumb span.btext').text().trim());
	if (doi != undefined) {
		$('div#content-block ul#site-breadcrumbs li.lastcrumb span.btext').after(', <span class="doi">doi: ' + doi);
	}

	$('#pageid-content #content-block div.metrics').hide();

    //adds cb-views to "cb-section" div
    if(!$("#sidebar .cb-views").length){
    	$('div.access div.cb-section ol li.notice').parents('div.cb-section').addClass('cb-views');
    }

    //moves the recently-classed "cb-views" div directly after "contributors" div this would be for "standard" HTML article views (there's alternate logic for other views, like PDF)
 	if ($('div.contributors').length) {
		if ($(location).attr('pathname').indexOf("figures-only") > 0) {
		 	$('div.contributors').after($('#sidebar div.cb-views'));
		} else {
			$('div.contributors').last('div.contributors').after($('#sidebar div.cb-views'));
		}
	} else if ($('div.article h1').length) {
		$('div.article h1').after($('#sidebar div.cb-views'));
		$('div.article h1').css("padding-bottom", "20px");
	} 
	/*else if ($('div.article .cit-auth-list').length) {
		$('div.article .cit-auth-list').after($('#sidebar div.cb-views'));
	}*/
    //move primary views to new ul
    $('.cb-views ol').each(function(){
    	$(this).addClass("secondary-views cit-views");
        $(this).before('<ul class="cit-views primary-views"></ul>');
	});

   	//handle secondary views
    $('.cb-views > .secondary-views').each(function(){
    	if ($(this).children().length) {
        	$("cb-views .secondary-views li:first-child").addClass("first");
		}
 	});

	$('.cb-views > .secondary-views li span.free').hide();
	if (!$('.cb-views > .secondary-views li').last(".secondary-views li").hasClass("full-text-pdf")) {
		$('.cb-views > .secondary-views li').last(".secondary-views li").after($('.cb-views > .secondary-views li.full-text-pdf'));
	}
	if (!$('.cb-views > .secondary-views li:last-child').hasClass("full-si-pdf")) {
		$('.cb-views > .secondary-views li').last(".secondary-views li").after($('.cb-views > .secondary-views li.full-si-pdf'));
	}

	//hide the second full-text-pdf link if exists
	if ($('.cb-views > .secondary-views li.full-text-pdf').length >1) {
		$('.cb-views > .secondary-views li.full-text-pdf').nextAll(".full-text-pdf").hide();
		$('.cb-views > .secondary-views li.full-text-pdf').first().show();
	}
	if ($('.cb-views > .secondary-views li.full-si-pdf').length >1) {
		$('.cb-views > .secondary-views li.full-si-pdf').nextAll(".full-si-pdf").hide();
		$('.cb-views > .secondary-views li.full-si-pdf').first().show();
	} 
	if ($('.cb-views > .secondary-views li.full-text').length) {
		$('.cb-views > .secondary-views li.full-text').after('<li class="author-tab"><a href="#">Authors & Info</a></li>');
	} else if ($('.cb-views > .secondary-views li.abstract').length) {
		$('.cb-views > .secondary-views li.abstract').after('<li class="author-tab"><a href="#">Authors & Info</a></li>');
	}

	//Add Metrics
	if ($('.cb-views > .secondary-views li.si').length) {
		$('.cb-views > .secondary-views li.si').after('<li class="metrics"><a href="#">Metrics</a></li>');
	} else if ($('.cb-views > .secondary-views li.figures-only').length) {
		$('.cb-views > .secondary-views li.figures-only').after('<li class="metrics"><a href="#">Metrics</a></li>');
	} else {
		$('.cb-views > .secondary-views li.author-tab').after('<li class="metrics"><a href="#">Metrics</a></li>');
	}    

	//hide discussion section for views other than article view
	if ($(location).attr('pathname').indexOf("figures-only") > 0) {
		$('#pageid-content #content-block div#disqus_thread').hide();
		$('#sidebar hr.commentWrapper').hide();
		$('#pageid-content #content-block').addClass("figures-tab");
		$('#pageid-content #sidebar').addClass("figures-tab");
	}

	//Change Supporting Information to SI
	if ($('.cb-views > .secondary-views li.si').length) {
		$('.cb-views > .secondary-views li.si a').text("SI");
	}
	if ($('.cb-views > .secondary-views li.full-text').length) {
		$('.cb-views > .secondary-views li.full-text a').text("Full Text");
		$('.cb-views > .secondary-views li.full-text span').text("Full Text");
	}
	if ($('.cb-views > .secondary-views li.figures-only').length) {
		$('.cb-views > .secondary-views li.figures-only a').text("Figures");
		$('.cb-views > .secondary-views li.figures-only span').text("Figures");
	}

	if ($('.cb-views > .secondary-views li.full-text-pdf').length) {
   		$('.cb-views > .secondary-views li.full-text-pdf a').text("PDF");
		//fix the IE8 on winXP for css background overlay on "PDF", IE8 on win7 works fine
		if ((navigator.userAgent.indexOf("MSIE 8") >= 0) && (navigator.appVersion.indexOf("NT 5.1") >=0)) {
			$('.cb-views > .secondary-views li.full-text-pdf').css("background", "none");
		}
	}

	if ($('.cb-views > .secondary-views li.full-si-pdf').length && (navigator.userAgent.indexOf("MSIE 8") >= 0) && (navigator.appVersion.indexOf("NT 5.1") >=0)) {
		$('.cb-views > .secondary-views li.full-si-pdf').css("background", "none");
	}

	if ($('.cb-views > .secondary-views li.author-summary').length) {
		$('.cb-views > .secondary-views li.author-summary').hide();
	}
	//combine related
	if ($('.cb-views > .secondary-views li.related').length) {
		$('.cb-views > .secondary-views li.related').hide();
		$('.cb-views > .secondary-views li div#content_box_related').hide();
		$('.cb-views > .secondary-views li.metrics').after('<li class="related"><a href="#">Related Content</a></li>');
	} else if ($('.cb-views > .secondary-views li div#content_box_related').length) {
		$('.cb-views > .secondary-views li div#content_box_related').hide();
		$('.cb-views > .secondary-views li.metrics').after('<li class="related"><a href="#">Related Content</a></li>');
	} else if ($('.cb-views > .secondary-views li.classic-related').length) {
		$('.cb-views > .secondary-views li.metrics').after('<li class="related"><a href="#">Related Content</a></li>');
		$('.cb-views > .secondary-views li.classic-related').hide();
	} else if ($('.cb-views > .secondary-views li.author-summary').length) {
		$('.cb-views > .secondary-views li.metrics').after('<li class="related"><a href="#">Related Content</a></li>');
		$('.cb-views > .secondary-views li.author-summary').hide();
	}

	//for PDF only artitle, leave the citation view have the related article not suppressed
	if ($(location).attr('pathname').indexOf(".citation") > 0) {
		$('div#content-block #related-content').addClass("show-related");	
	}

	//if correction link exists, move it above the tab
	var corrLink = $('div.article > div.cb-views > .secondary-views li ul#content_box_errata li.errata');
	if (corrLink.length) {
		$('#content-block div.article div.contributors').last().after('<ul class="relmgr-links correction-list"></ul>');
		for (var i=0; i<corrLink.length; i++) {
			$('.relmgr-links.correction-list').append(corrLink[i]);
		}
	}

	if ($('.cb-views > .secondary-views li.si').length >1) {
		$('.cb-views > .secondary-views li.si').nextAll(".si").hide();
		$('.cb-views > .secondary-views li.si').first().show();
	}
	if ($('.cb-views > .secondary-views li.metrics').length >1) {
		$('.cb-views > .secondary-views li.metrics').nextAll(".metrics").hide();
		$('.cb-views > .secondary-views li.metrics').first().show();
	}
	if ($('.cb-views > .secondary-views li.related').length >1) {
		$('.cb-views > .secondary-views li.related').nextAll(".related").hide();
		$('.cb-views > .secondary-views li.related').first().show();
	}
	
	//link function
	$('.cb-views > .secondary-views li.author-tab a').click(function(event) {
		event.preventDefault();
		contentPath = getContentPath();
		window.location = contentPath + '/?tab=author-info';
	});

	$('.cb-views > .secondary-views li.metrics a').click(function(event) {
		event.preventDefault();
		contentPath = getContentPath();
		window.location = contentPath + '/?tab=metrics';
	}); 

	$('.cb-views > .secondary-views li.si a').click(function(event) {
		event.preventDefault();
		contentPath = getContentPath();
		window.location = contentPath + '/?tab=ds';
	});

	//Related articles
	$('#content-block .article .cb-views > .secondary-views li.related a').click(function(event) {
		event.preventDefault();
		contentPath = getContentPath();
		window.location = contentPath+ '/?tab=related';
	});

	$('#pageid-content #sidebar .access .cb-views > .secondary-views li.related a').click(function(event) {
		if (!pdfOnlyView()) {
			event.preventDefault();
			contentPath = getContentPath();
			window.location = contentPath+ '/?tab=related';
		}
	});

	var relURL = location.href.substring(location.href.lastIndexOf('?')+1);
	if (relURL == 'tab=author-info') {
		showAuthorInfo();
		$('#sidebar div#commentWrapper').hide();
		$('#sidebar hr.commentWrapper').hide();
	} else if (relURL =='tab=metrics') {
		getArticleMetrics();
		$('#sidebar div#commentWrapper').hide();
		$('#sidebar hr.commentWrapper').hide();
	} else if (relURL =='tab=related') {
		showRelated();
		$('#sidebar div#commentWrapper').hide();
		$('#sidebar hr.commentWrapper').hide();

	} else if (relURL =='tab=ds') {
		var dsLink = $('.cb-views > .secondary-views li.si a').attr("href");
		getDataSuppl(dsLink);
		$('#sidebar div#commentWrapper').hide();
		$('#sidebar hr.commentWrapper').hide();
	}


	/** TAB Border related Changes **/      
	$('#content-block .cb-views ol.secondary-views li span.variant-indicator').each(function(){
		$(this).parent('li').addClass('active');
	});

	$('#content-block .cb-views ol.secondary-views li a').click(function(){
		$(this).parent('li').addClass('active');
	});

	
        var relURL = location.href.substring(location.href.lastIndexOf('?')+1);
        if (relURL == 'tab=author-info') {
            $('#content-block .cb-views ol.secondary-views li').removeClass('active');
            $('#content-block .cb-views ol.secondary-views li.author-tab').addClass('active');
                getAbstractURL();
        } else if (relURL =='tab=metrics') {
            $('#content-block .cb-views ol.secondary-views li').removeClass('active');
            $('#content-block .cb-views ol.secondary-views li.metrics').addClass('active');
                getAbstractURL();
        } else if (relURL =='tab=related') {
            $('#content-block .cb-views ol.secondary-views li').removeClass('active');
            $('#content-block .cb-views ol.secondary-views li.related').addClass('active');
                getAbstractURL();
        } else if (relURL =='tab=ds') {
			$('#content-block .cb-views ol.secondary-views li').removeClass('active');
			$('#content-block .cb-views ol.secondary-views li.si').addClass('active');
			getAbstractURL();
		}

	$('#content-block .cb-views ol.secondary-views').after('<div style="clear:both"/>');
	$("#content-block ol.secondary-views").contents().filter(function(){
		return this.nodeType == 3;
	}).remove();
	/** END: TAB Border related Changes **/ 
}); 

function getContentPath() {
	var path = $(location).attr('pathname');
	var contentPath;
	if (path.indexOf("full.pdf") > 0) {
		contentPath = path.substring(0, path.indexOf(".full.pdf"));
	} else if (path.indexOf("figures-only") > 0) {
		contentPath = path.substring(0, path.indexOf(".figures-only"));
	} else if (path.indexOf("extract") > 0) {
		contentPath = path.substring(0, path.indexOf(".extract"));
	} else if (path.indexOf("short") >0) {
		contentPath = path.substring(0, path.indexOf(".short"));
	} else {
		contentPath = path;
	}
	return contentPath;
}

function getAbstractURL(){
    var absURL;
    var citationId = $('head meta[name="citation_abstract_html_url"]').attr("content");
    var citationURL = $('head meta[name="citation_public_url"]').attr("content");

    if(citationId && citationId.indexOf("/content")!= -1){
        absURL = citationId.substring(citationId.indexOf("/content"));
        if(absURL) $('#content-block .cb-views ol.secondary-views li.abstract span.variant-indicator').wrap('<a rel="view-abstract" href="'+ absURL + '"></a>');
    }else if($('#content-block .cb-views ol.secondary-views li.abstract span.variant-indicator:contains("Extract")') && citationURL && citationURL.indexOf("/content")!= -1){
        absURL = citationURL.substring(citationURL.indexOf("/content"));
        if(absURL) $('#content-block .cb-views ol.secondary-views li.abstract span.variant-indicator').wrap('<a rel="view-abstract" href="'+ absURL + '.extract"></a>');
    }

    var citationFullId = $('head meta[name="citation_fulltext_html_url"]').attr("content");

    if(citationFullId && citationFullId.indexOf("/content")!= -1){
	fullURL = citationFullId.substring(citationFullId.indexOf("/content"));
	if(fullURL) $('#content-block .cb-views ol.secondary-views li.full-text span.variant-indicator').wrap('<a rel="view-full-text" href="'+ fullURL + '"></a>');
    }
}


function showRelated() {
	$('#pageid-content #content-block').addClass("related-tab");
	$('#pageid-content #sidebar').addClass("related-tab");
	$('#pageid-content #content-block div#disqus_thread').hide();

	contentPath = getContentPath();
	$.ajax({
		url: contentPath,
		dataType: "html",
		type: "GET",
		error: ajaxErr,
		success: getRelatedContent,
		complete: ajaxComplete
	});
}

function getRelatedContent(xhtmlData) {
	var relatedData = '<div class="related-content">';
	if ($(xhtmlData).find('div#main div#content-block div#related-content').html()) {
		relatedData = relatedData + $(xhtmlData).find('div#main div#content-block div#related-content').html();
	} 
	if ($(xhtmlData).find('div#main div#content-block div.related').html()) {
		relatedData = relatedData + $(xhtmlData).find('div#main div#content-block div.related').html();
	}
	relatedData = relatedData + '</div>';

	//add classic related contents here
	if ($('#content-block .cb-views ol.secondary-views li.classic-related').length) {
		relatedData = relatedData + '<ul class="classic-related">';
		$('#content-block .cb-views ol.secondary-views li.classic-related').each(function() {
			relatedData = relatedData + '<li>' + $(this).html() + '</li>';
		});
		relatedData = relatedData + '</ul>';	
	}

	//add author summary here
	if ($('#content-block .cb-views ol.secondary-views li.author-summary').length) {
		relatedData = relatedData + '<ul class="author-summary">';
		$('#content-block .cb-views ol.secondary-views li.author-summary').each(function() {
			relatedData = relatedData + '<li>' + $(this).html() + '</li>';
		});
		relatedData = relatedData + '</ul>';
	}

	$(relatedData).css("padding-top", "10px");
	$('#pageid-content #content-block div.cb-views').nextAll().hide();
	$('#pageid-content #content-block #semantics-similar-articles-content-block').before(relatedData);
	$('#pageid-content #content-block div.social-bookmarking').hide();

	//remove extra "Related Article" 
	$('#content-block div.related-content h2').each(function () {
		if ($(this).text().indexOf("Related Article") >= 0) 
			$(this).addClass("related-article");
	});

	$('#content-block div.related-content h2.related-article').nextAll('h2.related-article').hide();

	// Force an adjustment to the height of the content block
	gColTempResize = true;
	fixColHeights(1);
	gColTempResize = false;
}

function showAuthorInfo() {
	$('#pageid-content #content-block').addClass("author-info");
	$('#pageid-content #sidebar').addClass("author-info");

	$('#pageid-content #content-block div.cb-views').nextAll().hide();
	var authorInfo = '<div class="author-info"><h1 class="author-title">Authors</h1><ol class="author-group">';

	$('#pageid-content #content-block .article .contributors ol.contributor-list li').each(function() {
		var authList = $(this);
		var authName = $(authList).children("span.name").html();
		var name = $(authList).children("span.name").text();
		authorInfo = authorInfo + '<li class="author"><span class="author-name">' + authName +'</span><ul class="author-affil-list">';
		
		var affilLetter, affil, orcid;
		$(authList).children(".xref-aff").each(function() {
			affilLetter = $(this).children("sup").text();
			if (affilLetter) {
				affil = $('#pageid-content #content-block .article .contributors .affil-body li.aff address sup:contains("'+ affilLetter+'")').parent('address').html();
				authorInfo = authorInfo + '<li class="author-affil"><span class="affil">' + affil + '</span></li>';
			}
		});
		authorInfo = authorInfo + '</ul>';
		//ORCID here if exists
		orcid = $("head meta[name='citation_author'][content='" + name + "']").nextUntil("head meta[name='citation_author']","head meta[name='citation_author_orcid']").attr("content");
		if (orcid) {
			authorInfo = authorInfo + '<p class="author-orcid"><a href="http://orcid.org/'+ orcid + '">View ORCID profile for ' + name + '</a></p>';
		} 
	});

	authorInfo = authorInfo + '</ol></div>';

	var footNote;
	if ($('#pageid-content #content-block div.fn-group').length) {
		footNote = '<div class="section fn-group">' + $('#pageid-content #content-block div.fn-group').html(); 
		if ($('#pageid-content #content-block .history-list').length) {
			footNote = footNote + $('#pageid-content #content-block .history-list').html();
		} 
		if ($('#pageid-content #content-block .copyright-statement').length) {
			footNote = footNote + $('#pageid-content #content-block .copyright-statement').html();
		}
		
		footNote = footNote + '</div>';
		authorInfo = authorInfo + footNote;
	}

	var articleInfo ='<div class="section article-info"><h1 class="article-title">Article Information</h1><p class="vol-page">';
	if ($("head meta[name=citation_volume]").attr("content")) {
		articleInfo = articleInfo + '<span class="vol">vol. ' + $("head meta[name=citation_volume]").attr("content") + ' </span>';
	}
	if ($("head meta[name=citation_issue]").attr("content")) {
		articleInfo = articleInfo + '<span class="issue">no. ' + $("head meta[name=citation_issue]").attr("content") + ', </span>';
	}
	//if both vol and issue are not available, then don't check pages
	if ($("head meta[name=citation_volume]").attr("content") || $("head meta[name=citation_issue]").attr("content")) {
		articleInfo = articleInfo + '<span class="pages">' + $("head meta[name=citation_firstpage]").attr("content");

		if ($("head meta[name=citation_lastpage]").attr("content") != $("head meta[name=citation_firstpage]").attr("content")) {
			articleInfo = articleInfo + '-' + $("head meta[name=citation_lastpage]").attr("content") + '</span>';
		} else {
			articleInfo = articleInfo + '</span>';
		}
	}
	articleInfo = articleInfo  + '</p>';

	if (doi != undefined) {
		articleInfo = articleInfo + '<p class="doi"><span class="doi-title">DOI</span><span class="doi">' + doi + '</span></p>';
	}
	if ($("head meta[name=citation_pmid]").attr("content") != undefined) {	
		articleInfo = articleInfo + '<p class="pubmed-id"><span class="pubmedid-title">PubMed ID</span><span class="pubmedid">' + $("head meta[name=citation_pmid]").attr("content") + '</span></p>'; 
	} 

	//if it's pap?
	var pubPapdate, pubDate;
	if ($('div#sidebar span.footnote span.slug-metadata-note .slug-ahead-of-print-date').length) {
		pubPapDate = 'Published online before print on ' + $('div#sidebar span.footnote span.slug-ahead-of-print-date').text();
	} else {
		pubPapDate = 'Published on ' + $('div#sidebar span.footnote span.slug-pub-date').text();
	}

	articleInfo = articleInfo + '<p class="pub-his"><span class="pub-title">Publication History</span><span class="pap-date">' + pubPapDate + '</span></p></div>';

	authorInfo = authorInfo + articleInfo;
	

	$('#pageid-content #content-block div.social-bookmarking').before(authorInfo);
	$('#pageid-content #content-block div.social-bookmarking').nextAll().hide();
	$('#pageid-content #content-block div.social-bookmarking').hide();
}

function getDataSuppl(dsLink) {
	$('#pageid-content #content-block').addClass("si-tab");
	$('#pageid-content #sidebar').addClass("si-tab");
	var dsLink, dsUrl;
	if ($('.cb-views > .secondary-views li.si').length >1) {
		$('#pageid-content #content-block div.social-bookmarking').before( '<div class="ds">');
		$('.cb-views > .secondary-views li.si').each(function() {
			dsLink = $(this).children('a').attr("href");
			dsUrl = document.location.protocol + '//' + document.location.host + dsLink; 
			$.ajax({
					url: dsUrl,
					dataType: "html",
					type: "GET",
					error: ajaxErr,
					success: function(xhtmlData) {
						$('#pageid-content #content-block div.ds').append($(xhtmlData).find('div#main div#content-block div').html());
					},
					complete: ajaxComplete
			});
		});
		$('#pageid-content #content-block div.ds').append('</div>');
		$('#pageid-content #content-block div.cb-views').nextAll().hide();
		$('#pageid-content #content-block div.social-bookmarking').hide();
		$('#pageid-content #content-block div#related-content').hide();

		// If data supplement contains math markup (MathML), rerun MathJax processing
		if ($('#pageid-content #content-block math').length) {
			$('#pageid-content #content-block math').addClass('mathjax');
			MathJax.Hub.Queue(['Typeset', MathJax.Hub]);

			// Force an adjustment to the height of the content block
			gColTempResize = true;
			fixColHeights(1);
			gColTempResize = false;
		}
	} else {
		dsLink = $('.cb-views > .secondary-views li.si a').attr("href");
		dsUrl = document.location.protocol + '//' + document.location.host + dsLink;
		$.ajax({
			url: dsUrl,
			dataType: "html",
			type: "GET",
			error: ajaxErr,
			success: parseDS, 
			complete: ajaxComplete
		});
	}
}

function parseDS(xhtmlData) {
	var dataSuppl = '<div class="ds">' + $(xhtmlData).find('div#main div#content-block div').html() + '</div>';

	$('#pageid-content #content-block div.cb-views').nextAll().hide();
	$('#pageid-content #content-block div.social-bookmarking').before(dataSuppl);
	$('#pageid-content #content-block div.social-bookmarking').hide();
	$('#pageid-content #content-block div#related-content').hide();

	// If data supplement contains math markup (MathML), rerun MathJax processing
	if ($('#pageid-content #content-block math').length) {
		$('#pageid-content #content-block math').addClass('mathjax');
		MathJax.Hub.Queue(['Typeset', MathJax.Hub]);

		// Force an adjustment to the height of the content block
		gColTempResize = true;
		fixColHeights(1);
		gColTempResize = false;
	}
}

function getArticleMetrics() {
	$('#pageid-content #content-block').addClass("metrics-tab");
	$('#pageid-content #sidebar').addClass("metrics-tab");

	var mjid = $('head meta[name="citation_mjid"]').attr("content");
	var metricsUrl = document.location.protocol + '//' + document.location.host + '/articleusage?gca=' + mjid;

	$('#pageid-content #content-block div.social-bookmarking').nextAll().hide();
	$('#pageid-content #content-block div.cb-views').nextAll().hide();
	$('#pageid-content #content-block div.metrics').show();

	$.ajax({
		url: metricsUrl,
		dataType: "html",
		type: "GET",
		error: ajaxErr,
		success: parseMetricsData,
		complete: ajaxComplete
	});
}

function ajaxErr(req, msg, e) {
}
function ajaxComplete(req, msg) {
}

function parseMetricsData(xhtmlData) {
	var usageStats = '<h4 class="article-usage">Article Usage</h4><div class="usage-stats">' + $(xhtmlData).find('div.usage-stats-monthly-view').html() + '</div>';
	$('#pageid-content #content-block div.metrics').after(usageStats);
	$('#pageid-content #content-block div.social-bookmarking').hide();
	jQuery.getJSON(altmetricJsonUrl + '?output=json&callback=?', function(data) {
		stCtAll = data.context.similar_age_3m.count;
		stSampleAll = data.context.similar_age_3m.higher_than;
		stPctAll = data.context.similar_age_3m.pct;
		stPctPNAS = data.context.similar_age_journal_3m.pct;
		stCtPNAS = data.context.similar_age_journal_3m.count;
		stRankPNAS = data.context.similar_age_journal_3m.rank;
		var altDetail = '<div class="more-info"><span class="title">This Altmetric score means that the article is:</span><ul><li class="pct">in the ' + stPctAll + ' percentile of a sample of ' + stSampleAll + ' of the ' + stCtAll + ' tracked articles of a similar age in all journals</li><li class="pct">in the ' + stPctPNAS + ' percentile (ranked ' + stRankPNAS + ') of the ' + stCtPNAS + ' tracked articles of a similar age in PNAS</li></div>';
		$('#content-block div.metrics div.altmetric-embed').first().after(altDetail);
	});
	setTimeout(function() {
		var metricDataHideNoMention = $('div.metrics div.altmetric-embed a img');
		if (!$('div.metrics div.altmetric-embed').attr('data-uuid') || (metricDataHideNoMention.length == 0)) {
			$('div.metrics h4.altmetric').addClass("hide-metrics");
			$('div.metrics .more-info').addClass("hide-metrics");
		}
	
		$('div.usage-stats').append('<p class="zero-comment">Article usage is updated on the 15th of each month, starting after the first month of publication.</p>');
	},200);
}

function pdfOnlyView() {
	if ($('#sidebar div.access .cb-views > .secondary-views li.abstract').length ||
		$('#sidebar div.access .cb-views > .secondary-views li.extract').length ||
		$('#sidebar div.access .cb-views > .secondary-views li.full').length) {
		return false;
	} else {
		return true;
	}
}
