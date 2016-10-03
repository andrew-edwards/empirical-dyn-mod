// CrossMark Dialog Box
// Uses jQuery UI 1.8.7 / jQuery 1.4.4

// Create crossmark object
var crossmark = {

	sCrossMarkServer: 'http://crossmark.crossref.org',
	sCDNServer: 'http://crossmark.crossref.org',
	sOpenSelector: '#open-crossmark',
	sDOI: '',
	sDomain: '',
	sURIScheme: '',
	sCrossMarkURL: '',
	sStylesURL: '',
	sTooltipID: 'crossmark-tooltip-130',
	sTooltipSelector: '#crossmark-tooltip-130',
	sTooltipCopy: 'Click to get updates and verify authenticity.',

	initialize: function() {
		this.sDOI = this.detectDOI();
		this.sDomain = window.location.hostname;
		this.sURIScheme = window.location.protocol;
		this.sCrossMarkURL = this.sCrossMarkServer + '/dialog/?doi=' + this.sDOI + '&domain=' + this.sDomain + '&uri_scheme=' + this.sURIScheme;
		this.sStylesURL = this.sCDNServer + '/stylesheets/crossmark_widget.css';
	},

	addStylesheet: function() {
		$(this.sOpenSelector).parent().eq(0).prepend("<link media='screen' rel='stylesheet' type='text/css' href='" + this.sStylesURL + "'/>");
		//$('head').append("<link media='screen' rel='stylesheet' type='text/css' href='" + this.sStylesURL + "'/>");
	},

	activateTooltip: function() {
		var that = this;
		$('body').append('<div id="' + this.sTooltipID + '" class="crossmark-tooltip" style="display: none;"><div class="cmtttop"></div><div class="cmttmid"><p>' + this.sTooltipCopy + '</p></div><div class="cmttbot"></div></div>');
		$('#crossmark-icon').attr('title', '');
		$('#crossmark-icon').attr('alt', '');
		$('#crossmark-icon').show();
		$('#crossmark-icon').mouseover(function(){
			var x = $('#crossmark-icon').offset().left + $('#crossmark-icon').width()/2 - $('#crossmark-icon').width()/2;
			var y = $('#crossmark-icon').offset().top - $(that.sTooltipSelector).height() + 10;
			$(that.sTooltipSelector).css({ 'left' : x });
			$(that.sTooltipSelector).css({ 'top' : y });
			$(that.sTooltipSelector).show();
		});
		$('#crossmark-icon').mouseout(function(){
			$(that.sTooltipSelector).hide();
		});
	},

	activateDialog: function() {
		var that = this;
		$(this.sOpenSelector).click(function(){
			$('#crossmark-dialog-frame').attr('src', that.sCrossMarkURL);
			$('#crossmark-dialog').dialog("open");
			$(that.sTooltipSelector).hide();
			return false;
		});
	},
	
	detectDOI: function() {
		this.sDOI = '';
		var dc_id = $('meta').filter(function() {
			var $this = $(this);
			var isIdentifier = (/dc\.identifier/i).test($this.attr('name'));
			var isDOI = (/^info:doi/i).test($this.attr('content')) ||
						(/^doi/i).test($this.attr('content')) ||
						(/^10\./i).test($this.attr('content')) ||
						(/dx.doi.org\./i).test($this.attr('content'));

			return isIdentifier && isDOI;
		}).attr("content");
		
		if (dc_id) {
			dc_id = dc_id.replace(/^info:doi\//, ''); // Nature style
			dc_id = dc_id.replace(/^doi:/, ''); // IngentaConnect style
		}

		return dc_id;
	}
};
	
jQuery(function($) {

	// Define CrossMark Dialog
	$('#crossmark-dialog').dialog({
		zIndex: 3999,
		autoOpen: false,
		// Set to true for PDF case
		modal: true,
		resizable: false,
		draggable: false,
		open: function() { 
			$(".ui-widget-overlay").click(function(){
				$('#crossmark-dialog').dialog("close");
			}); 
		},
		beforeClose: function() { 
			$(".ui-widget-overlay").unbind(); 
		},
		height: 550,
		width: 550
	});

	// Initialize Crossmark Object
	crossmark.initialize();
	crossmark.addStylesheet();
	crossmark.activateTooltip();
	crossmark.activateDialog();

});

