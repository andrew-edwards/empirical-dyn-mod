/* This is removed till PNAS OK to release TEMIS widgets */
gSiteOptions.hasSemanticsSearch=true;
function getSimilarSemanticsArticles() {

  var currentPath = window.location.pathname;
  var articlePath;
  if (currentPath.indexOf('.') != -1) {
  	articlePath = currentPath.substring(currentPath.indexOf('content/')+8, currentPath.indexOf('.'));
  } else {
  	articlePath = currentPath.substring(currentPath.indexOf('content/')+8);
  }
  var host = document.location.protocol + "//" + document.location.host;
  var url = host + '/similar-articles?resource=' + articlePath;
  
  //console.log("Get resource from ...." + url);
  
  var resultsDiv = '<div id="semantics-similar-articles" class="content-box"> \
  <div class="cb-contents"> \
  <h3 class="cb-contents-header"><span>Semantically Related Articles</span></h3> \
  <div class="cb-section" id="semantics-similar-articles-content"><\div> \
  </div> \
  </div>';

  // When viewing the "Related Content" tab, add semantically-related data directly to the content block
  var onRelatedTab = false;

  if (location.href.indexOf('tab=related') > 0) {
    onRelatedTab = true;
    $('#pageid-content #content-block div.social-bookmarking').before('<div id="semantics-similar-articles-content-block"><div class="temis-data"></div><\div>');
  }

  $(resultsDiv).appendTo('#sidebar #semantics-article');
  $("#semantics-similar-articles-content, #semantics-similar-articles-content-block .temis-data").load(url, function (response, status, xhr) {
    
    if (status=="success") {
		if (!$('.cb-views > .secondary-views li.related').length) {
			var relatedUrl = getContentPath() + '/?tab=related';
			$('.cb-views > .secondary-views li.metrics').after('<li class="related"><a href="#">Related Content</a></li>');
			$('.cb-views > .secondary-views li.related a').attr("href", relatedUrl);

			if ($('.cb-views > .secondary-views li.related').length >1) {
				$('.cb-views > .secondary-views li.related').nextAll(".related").hide();
				$('.cb-views > .secondary-views li.related').first().show();
			}

			if (onRelatedTab) {
				$('#content-block .cb-views ol.secondary-views li').removeClass('active');
				$('#content-block .cb-views ol.secondary-views li.related').addClass('active');
			}
		}

        // Avoid multiple updates to the semantically-related data in the content block
        if (onRelatedTab && ($('#content-block #semantics-similar-articles-content-block .temis-title').length <= 0)) {
            $('#content-block #semantics-similar-articles-content-block .temis-data').before($('#content-block div.m-site-recommendation'),'<h2 class="temis-title">Semantically Related Articles</h2>');
			$('#pageid-content #content-block #semantics-similar-articles-content-block div.m-site-recommendation').show();
			$('#pageid-content #content-block #semantics-similar-articles-content-block div.m-site-recommendation li').each(function(e) {
			 	var className=$(this).attr('class');
			 	$("#pageid-content #content-block #semantics-similar-articles-content-block div.m-site-recommendation li[class='" + className+"']").hide();
				$("#pageid-content #content-block #semantics-similar-articles-content-block div.m-site-recommendation li[class='" + className+"']").first().show();
			 });

            $('#content-block #similar-articles').removeAttr("xmlns");
            addAbsPops();
        }
    }
    if (status=="error") {

      $("#semantics-similar-articles").hide();
      //console.log("Error processing similar articles: " + xhr.status + " " + xhr.statusText);
    }
  //console.log("Done resource from ...." + url+ ' ' +status);
  });
}

function getRelatedSemanticsTerms() {
  var id = $('meta[name=citation_id]').attr('content');
  var host = document.location.protocol + "//" + document.location.host;
  var url = host + '/related-terms?resource=' + id;
  //console.log("Get terms from ...." + url);

  $("#semantics-related-terms-content").load(url, function (response, status, xhr) {
    if (status=="success") {
      $("#semantics-related-terms").show();
      $('#related-terms').removeAttr("xmlns");
    //console.log('ok processing terms feed with url= ' + url);
    }
    
    if (status=="error") {
      $("#semantics-related-terms").hide();
      //console.log("Error processing related terms: " + xhr.status + " " + xhr.statusText);
    }
    //console.log('Done processing terms feed with id= ' + id);
  });
}
$(document).ready(function() {
	//Overrides for the FancyBox on the media elements
	jQuery.extend(jQuery.fn.fancybox.defaults, {
  		overlayOpacity: 0.8,       
  		overlayColor: '#000'     
	});
		
   // to hide indicator 
    if ($('#article-views .cb-contents .cb-section ol li .variant-indicator').text().search('»') > -1 ) {
         var ctext = $('#article-views .cb-contents .cb-section ol li span.variant-indicator span').text();
         $('#article-views .cb-contents .cb-section ol li .variant-indicator').html(ctext);
    }

    //remove widget when no article icon to avoid extra space
    if ($('#sidebar div.horizontal_links ul.article_key').text() == '' ) {
         $('#sidebar div.horizontal_links').remove();
    }

	var pnasClassicIcon = '<ul class="article_key"><li><a href="#" class="tooltip"><img src="/local/img/misc/icon-c.jpg" alt="" /><span>Cla\
ssic</span></a></li></ul>';

       var pnasClassicArticle = ($('ul.subject-headings').find('a').text().indexOf("PNAS Classic Article") >= 0) ? true : false;
       var checkClassicIcon = $('ul.article_key a.tooltip');
               if (!checkClassicIcon.length && pnasClassicArticle)
               {
                       $('ul.subject-headings').after(pnasClassicIcon);
               }    

    $(".cit").each(function(){
  
        //openacess
        var cit_openaccess = '<ul class="article_key"><li><a href="#" class="tooltip"><img src="/local/img/misc/icon-o.gif" alt="" /><span>Open Access</span></a></li></ul>';
        var openaccess = '<li><a href="#" class="tooltip"><img src="/local/img/misc/icon-o.gif" alt="" /><span>Open Access</span></a></li>';
        if ( $(this).find("div.cit-extra  .cit-flags .open-access-note").text().search("OPEN ACCESS ARTICLE") > -1) {
                $(this).find("div.cit-extra .cit-flags").remove();
                $(this).find(".cit-views").before(cit_openaccess);    	
    	}
    	
    	//From the cover
        var cit_fromcover = '<ul class="article_key"><li><a href="#" class="tooltip"><img src="/local/img/misc/icon-f.jpg" alt="" /><span>From the Cover</span></li></a></ul>';
        var fromcover = '<li><a href="#" class="tooltip"><img src="/local/img/misc/icon-f.jpg" alt="" /><span>From the Cover</span></a></li>';
        if ( $(this).find("div.cit-extra  ul.article_key li a span").text().search("Open Access") > -1) {
     	    if ($(this).find("div.cit-metadata  span.cit-series-title").text().search("From the Cover") > -1 ) {
    	        $(this).find("ul.article_key").append(fromcover);
    	    }
    	}
    	else {
    	    if ($(this).find("div.cit-metadata  span.cit-series-title").text().search("From the Cover") > -1 ) {
    	        $(this).find(".cit-views").before(cit_fromcover); 
    	    }    	     	
    	}
    	
        //Inaugural
        var cit_inaugural = '<ul class="article_key"><li><a href="#" class="tooltip"><img src="/local/img/misc/icon-i.jpg" alt="" /><span>Inaugural Article</span></li></a></ul>';
        var inaugural = '<li><a href="#" class="tooltip"><img src="/local/img/misc/icon-i.jpg" alt="" /><span>Inaugural Article</span></a></li>';
        if (( $(this).find("div.cit-extra  ul.article_key li a span").text().search("Open Access") > -1) || ( $(this).find("div.cit-extra  ul.article_key li a span").text().search("From the Cover") > -1) ){
     	    if ($(this).find("div.cit-metadata  span.cit-series-title").text().search("Inaugural Article") > -1 ) {
    	        $(this).find("ul.article_key").append(inaugural);
    	    }
    	}
    	else {
    	    if ($(this).find("div.cit-metadata  span.cit-series-title").text().search("Inaugural Article") > -1 ) {
    	        $(this).find(".cit-views").before(cit_inaugural); 
    	    }    	     	
    	}
    	
    	//Classic Perspective
        var cit_perspective = '<ul class="article_key"><li><a href="#" class="tooltip"><img src="/local/img/misc/icon-c.jpg" alt="" /><span>Classic Perspective</span></a></li></ul>';
        var perspective = '<li><a href="#" class="tooltip"><img src="/local/img/misc/icon-c.jpg" alt="" /><span>Classic Perspective</span></a></li>';
        if (( $(this).find("div.cit-extra  ul.article_key li a span").text().search("Open Access") > -1) || ( $(this).find("div.cit-extra  ul.article_key li a span").text().search("From the Cover") > -1) || ($(this).find("div.cit-metadata  span.cit-series-title").text().search("Inaugural Article") > -1 )){
     	    if ($(this).find("div.cit-metadata  span.cit-series-title").text().search("Classic Perspective") > -1 ) {
    	        $(this).find(".cit-flags .open-access-note").after(perspective);
    	    }
    	}
    	else {
    	    if ($(this).find("div.cit-metadata  span.cit-series-title").text().search("Classic Perspective") > -1 ) {
    	        $(this).find(".cit-views").before(cit_perspective); 
    	    }    	     	
    	}
    	//Classic Profile
        var cit_profile = '<ul class="article_key"><li><a href="#" class="tooltip"><img src="/local/img/misc/icon-c.jpg" alt="" /><span>Classic Profile</span></a></li></ul>';
        var profile = '<li><a href="#" class="tooltip"><img src="/local/img/misc/icon-c.jpg" alt="" /><span>Classic Profile</span></a></li>';
        if (( $(this).find("div.cit-extra  ul.article_key li a span").text().search("Open Access") > -1) || ( $(this).find("div.cit-extra  ul.article_key li a span").text().search("From the Cover") > -1) || ($(this).find("div.cit-metadata  span.cit-series-title").text().search("Inaugural Article") > -1 ) ){
     	    if ($(this).find("div.cit-metadata  span.cit-series-title").text().search("Classic Profile") > -1 ) {
    	        $(this).find(".cit-flags .open-access-note").after(profile);
    	    }
    	}
    	else {
    	    if ($(this).find("div.cit-metadata  span.cit-series-title").text().search("Classic Profile") > -1 ) {
    	        $(this).find(".cit-views").before(cit_profile); 
    	    }    	     	
    	}
    	
    	//Cozzarelli Prize Winner
        var cit_inaugural = '<ul class="article_key"><li><a href="#" class="tooltip"><img src="/local/img/misc/icon-p.jpg" alt="" /><span>Cozzarelli Prize Winner</span></li></a></ul>';
        var inaugural = '<li><a href="#" class="tooltip"><img src="/local/img/misc/icon-p.jpg" alt="" /><span>Cozzarelli Prize Winner</span></a></li>';
        if (( $(this).find("div.cit-extra  ul.article_key li a span").text().search("Open Access") > -1) || ( $(this).find("div.cit-extra  ul.article_key li a span").text().search("From the Cover") > -1) || ($(this).find("div.cit-metadata  span.cit-series-title").text().search("Inaugural Article") > -1 )){
     	    if (($(this).find("div.cit-metadata  span.cit-series-title").text().search("Cozzarelli") > -1 ) &&  ($(this).find("div.cit-metadata  span.cit-series-title").text().search("Prize Winner") > -1 )){
    	        $(this).find("ul.article_key").append(inaugural);
    	    }
    	}
    	else {
     	    if (($(this).find("div.cit-metadata  span.cit-series-title").text().search("Cozzarelli") > -1 ) &&  ($(this).find("div.cit-metadata  span.cit-series-title").text().search("Prize Winner") > -1 )){
    	        $(this).find(".cit-views").before(cit_inaugural); 
    	    }    	     	
    	}
    	
    });
    
    //hide/show for Author Affil. leave in place for the ios device
    if ($(".pagetype-content.ios-device").length){
        // do nothing
    } else { // remove it
        $("#content-block p.affiliation-list-reveal").removeClass().addClass("expand menu_head affil-head");
        $("#content-block ol.affiliation-list.hideaffil").removeClass().addClass("collapse menu_body affil-body");
        $("#content-block a.view-more").remove();
    }
    //Apply style when has executive-summary
    if ($('#content-block.eq .article div.executive-summary').text().search("Significance") > -1  ) {
         $('#content-block.eq .article div.executive-summary').addClass('significance-box');
    }
    
    //remove sidebar for new window /content/109/40/16012/F1.expansion.html
    //if ($('#pageid-content #main #content-block #power-point .power-point-instructions').text().search("Downloading") > -1  ) {    
    //    $("#pageid-content #main #sidebar").css("display", "none");
    //    $("#pageid-content #main #content-block").css("width", "920px");       
    //}
 
     if ($('#commentWrapper').length) {
        var top = ($('#sidebar').children().last().offset().top - parseFloat($('#commentWrapper').css('marginTop').replace(/ auto /, 0))) + 120;
        $(window).scroll(function (event) {
            // what the y position of the scroll is
            var y = $(this).scrollTop();
            // whether that's below the form
            if (y >= top) {
                // if so, ad the fixed class
                $('#commentWrapper').addClass('fixed');
            } else {
                // otherwise remove it
                $('#commentWrapper').removeClass('fixed');
            }
        });
    }

    //to handle supplement issue
    if ($('#sidebar').find('img[src*="Supplement"]').length > 0) {
        var imghref = $('#sidebar a').attr('href');
        var imgsrc = imghref.substr(0, imghref.length - 3) + 'cover.gif';
        $('#sidebar a img.cover').attr('src', imgsrc);
        $('#sidebar ul.sub_component li a.masthead').hide();
        
        var stext = $('#sidebar ul.sub_component li span.caption').text();
        var ntext = stext.replace(/no./,""); 
        $('#sidebar ul.sub_component li span.caption').text(ntext);
        
        $('#content-block #site-breadcrumbs li:eq(1) a').attr('href', imghref);

        stext = $('#content-block #site-breadcrumbs li:eq(2) span.btext').text();
        ntext = stext.replace(/no./,""); 
        $('#content-block #site-breadcrumbs li:eq(2) span.btext').text(ntext);
    }
    
    var viewLargeTableImage = $('#pageid-content .view-larger-img');
    var tableExpansionCaption = $('#pageid-content .table-caption');
    if (viewLargeTableImage.length && tableExpansionCaption.length) {
    	viewLargeTableImage.detach();
    	tableExpansionCaption.after(viewLargeTableImage).css('margin-top','1.5em');
    }
    
    //add space between author affiliate and article content (SF #00141239)
    var author_affil_el = $('.contributors .affil-body');
    var content_top_el = $('.contributors .fn-track');
    if (author_affil_el.length && !content_top_el.length) {
		author_affil_el.css('margin-bottom','1.5em');
    }

//for "Navigate This Article" bullet
$("#pageid-content #article-dyn-nav #cb-art-nav ol li").each(function(i){
	if(i==0){
		$(this).addClass('fa-caret-up');
	}else{
		$(this).addClass('fa-circle-o');
	}
})

$("#pageid-content #article-dyn-nav #cb-art-nav ol li").hover(function(){
    if($(this).hasClass('fa-caret-up')){
    }else{
		$(this).toggleClass('fa-circle');
		$(this).toggleClass('fa-circle-o');
	}
}, function() {
    if($(this).hasClass('fa-caret-up')){
    }else{
		$(this).toggleClass('fa-circle');
		$(this).toggleClass('fa-circle-o');
	}
})
 

$("#sidebar .social-bookmarking .social-bookmarking-item-facebook a").html('<i class="fa fa-facebook"></i>');
$("#sidebar .social-bookmarking .social-bookmarking-item-twitter a").html('<i class="fa fa-twitter"></i>');

var $m_sustainability = $('div.m-site-recommendation ul li a img.sustainability');
if ($m_sustainability.length > 1) { $m_sustainability.not(':first').remove() }
var $m_frontmatter = $('div.m-site-recommendation ul li a img.frontmatter');
if ($m_frontmatter.length > 1) { $m_frontmatter.not(':first').remove() }
var $m_anthropology = $('div.m-site-recommendation ul li a img.anthropology');
if ($m_anthropology.length > 1) { $m_anthropology.not(':first').remove() }
var $m_chemistry = $('div.m-site-recommendation ul li a img.chemistry');
if ($m_chemistry.length > 1) { $m_chemistry.not(':first').remove() }
var $m_physics = $('div.m-site-recommendation ul li a img.physics');
if ($m_physics.length > 1) { $m_physics.not(':first').remove() }

$('ol.figonly-list').prepend('<h2>Figures</h2>');
$('ol.figonly-list div.callout ul.callout-links a.in-nw').text('Open in New Window');

$('ol.figonly-list div.fig-caption').each(function(){
 var captionWords = $(this).children('p').html().replace(/\s+/g, " ").split(" ");
 var captionWordsCount = captionWords.length;
  if(captionWordsCount > 85){
   var tempFigCaption = document.createElement("div");
   var tempFigCaptionText = captionWords.slice(0, 85).join(" ");
   var tempFigCaptionPara = "<p>" + tempFigCaptionText + " ...</p>";
   var showMore = "<span class='show-more'>Show More</span>";  
   var showLess = "<span class='show-less'>Show Less</span>";
     $(tempFigCaption).addClass('fig-caption');
     $(this).children('span.fig-label').clone().appendTo(tempFigCaption);
     $(tempFigCaptionPara).appendTo(tempFigCaption);
     $(showMore).appendTo(tempFigCaption);
     $(tempFigCaption).insertAfter(this);
     $(this).children('p').append(showLess);
     $(this).css('display', 'none');
  }
});

$('div.fig-caption span[class^="show-"]').click(function(){
   $(this).closest('li.figonly-item').find('div.fig-caption').css('display', 'block');
   $(this).closest('div.fig-caption').css('display', 'none');
});

$('ol.figonly-list li.figonly-item div.fig-inline img').each(function(){
  var imgSource = $(this).attr('src').replace(/small/, "medium");
     $(this).attr('src', imgSource);
});

$('.fig div.fig-inline img').each(function(){
  var imgSource = $(this).attr('src').replace(/small/, "medium");
     $(this).attr('src', imgSource);
});

//end document.ready
});
