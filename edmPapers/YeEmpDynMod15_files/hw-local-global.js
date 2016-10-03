$(document).ready(function(){
//adding classes for expand/contract
//article tools and other articles
$("#sidebar .sidebar-tools.art-tools h4.cb-section-header, #sidebar .sidebar-tools.other-arts h4.cb-section-header").addClass("expand menu_head");
// $("#sidebar .sidebar-tools h4.cb-section-header").addClass("expand menu_head");
$("#sidebar .sidebar-tools .cb-section ol").addClass("collapse menu_body");
//Classifications
$("#sidebar .menu_list ul.subject-headings").addClass("collapse menu_body");

// 
//Expand contract
$(function() {
    // --- first section initially expanded:
    //for the sidebars
    $("#sidebar .sidebar-tools.art-tools h4.cb-section-header.expand, #sidebar .sidebar-tools.art-tools #cb-art-mgr h4.cb-section-header.expand, #sidebar .sidebar-tools.art-tools #cb-art-dir h4.cb-section-header.expand, #sidebar .sidebar-tools.other-arts h4.cb-section-header.expand").toggler({initShow: ".collapse:first"});
    // for the classifications
    $("#sidebar .menu_list .expand").toggler({initShow: ".collapse"});
    //for the author affil
    $("#content-block p.expand").toggler({cllpsEl: "ol.collapse"}); 
    //To expand sidebar video & image widget
    //video
    $("#sidebar.eq div.video div.content-box.sidebar-tools #cb-art-videos h4").addClass("expand menu_head");
    $("#sidebar.eq div.video div.content-box.sidebar-tools div.cb-contents #cb-art-videos h4.expand").toggler({initShow: ".collapse"});
    $('#sidebar.eq div.video div.content-box.sidebar-tools div.cb-contents #cb-art-videos ol.collapse.menu_body').css("display", "block");
    
    //figures
    $("#sidebar .pnasfigures .sidebar-tools #cb-art-featuredfigs h4").addClass("expand menu_head");
    $("#sidebar.eq .pnasfigures div.content-box.sidebar-tools div.cb-contents #cb-art-featuredfigs h4.expand").toggler({initShow: ".collapse"});
    $('#sidebar.eq .pnasfigures div.content-box.sidebar-tools div.cb-contents #cb-art-featuredfigs ol.collapse.menu_body').css("display", "block");

    //social bookmark
    $('#sidebar.eq div.content-box.sidebar-tools.art-tools div.cb-contents #cb-art-soc ol.collapse.menu_body').css("display", "block");
    $('#sidebar.eq div.content-box.sidebar-tools.art-tools div.cb-contents #cb-art-cpy ol.collapse.menu_body').css("display", "block");

    // --- Other options:
    //$("h2.expand").toggler({method: "toggle", speed: 0});
    //$("h2.expand").toggler({method: "toggle"});
    //$("h2.expand").toggler({speed: "fast"});
    //$("h2.expand").toggler({method: "fadeToggle"});
    //$("h2.expand").toggler({method: "slideFadeToggle"});    
    // $("#content").expandAll({trigger: "p.expand", ref: "div.demo",  speed: 300, oneSwitch: false});
    var dataSuppText = $('#pageid-data-supp .cb-section .variant-indicator span').text();
    if (dataSuppText) {
    	$('#pageid-data-supp .cb-section .variant-indicator').empty().append('<span>' + dataSuppText + '</span>');
    }
});

var myInt = window.setInterval("normalizeHeight()", 1000);
setTimeout(function(){window.clearInterval(myInt);}, 18000);

});

function normalizeHeight() {

	var heightContentBlock = $('#content-block').height();
	var paddingTopContentBlock = parseFloat($('#content-block').css('paddingTop'));
	var paddingBottomContentBlock = parseFloat($('#content-block').css('paddingBottom'));
	var computedHeightContentBlock = heightContentBlock + paddingTopContentBlock + paddingBottomContentBlock;
	
	var heightSideBar = $('#sidebar').height();
	var paddingTopSideBar = parseFloat($('#sidebar').css('paddingTop'));
	var paddingTopBottomSideBar = parseFloat($('#sidebar').css('paddingBottom'));
	var computedHeightSideBar = heightSideBar + paddingTopSideBar + paddingTopBottomSideBar;
	
	if (computedHeightSideBar < computedHeightContentBlock) {
		$('#sidebar').height(computedHeightContentBlock - paddingTopSideBar - paddingTopBottomSideBar);
	} else if (computedHeightSideBar > computedHeightContentBlock) {
		$('#content-block').height(computedHeightSideBar - paddingTopContentBlock - paddingBottomContentBlock);
	}
	
}