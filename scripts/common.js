
$(window).resize(function(){
	var winHeight = $(window).height();

	//$('body').height(winHeight);
	//$('#spotlight').height(winHeight);
	//$('#cnt').height(winHeight);
	$('.page').outerHeight(winHeight);

	$(window).triggerHandler('hashchange');
});

$(function(){
	$(window).resize();

	$('header .burger').click(function(){
		$('header').toggleClass('active');
	});

	$('.page_headshots .carousel').slick({
		'dots': true,
		'infinite': false,
		//'prevArrow': '.page_headshots .carousel-cnt .cbtn.back',
		//'nextArrow': '.page_headshots .carousel-cnt .cbtn.next',
	});
});

function pageIndex(){
	switch(location.hash){
		case '#home': return 0;
		case '#headshots': return 1;
		case '#media': return 2;
		case '#shows': return 3;
		case '#contact': return 4;
	}
	return 0;
}

function pageTitle(){
	switch(location.hash){
		case '#home': return 'About Me';
		case '#headshots': return 'Headshots';
		case '#media': return 'Media';
		case '#shows': return 'Shows';
		case '#contact': return 'Contact';
	}
	return '';
}

$(window).on('hashchange', function(){
	$('header').removeClass('active');
	$('header .curtitle').text(pageTitle());

	var index = pageIndex();

	var pageHeight = $('.page').outerHeight();
	
	$('#content').css('transform', 'translate(0, -'+ (pageHeight*index) +'px)');
	$('header a.logo').css('transform', 'rotate('+ (360*index) +'deg)');

	$('header ul.nav li').removeClass('current');
	$('header ul.nav li a[href$="'+ location.hash +'"]').closest('li').addClass('current');
});


var calData = [];
$(function(){
	//http://www.google.com/calendar/feeds/your-calendar@gmail.com/public/full?orderby=starttime&sortorder=ascending&max-results=3&futureevents=true&alt=json
	//var calendar_json_url = "http://www.google.com/calendar/feeds/ucsd.psyc.events@gmail.com/public/full?orderby=starttime&sortorder=ascending&max-results=3&futureevents=true&alt=json";
	//var calendar_json_url = "http://www.google.com/calendar/feeds/developer-calendar@google.com/public/full?alt=json&orderby=starttime&max-results=3&singleevents=true&sortorder=ascending&futureevents=true";
	//var calendar_json_url = "http://www.google.com/calendar/feeds/rtl1ibhdl1lf23nnf3r7v34jak%40group.calendar.google.com/public/full?alt=json-in-script&orderby=starttime&callback=?";
	var calendar_json_url = "http://www.google.com/calendar/feeds/bigmanni.comedy%40gmail.com/public/full?alt=json-in-script&orderby=starttime&callback=?";
	jQuery.getJSON(calendar_json_url, function(data){
		//console.debug(data.feed.entry);
		if(data.feed.entry.length > 0){
			calData = data.feed.entry;
			jQuery.each(data.feed.entry, function(i, item){
				if(item['gd$eventStatus']['value'] != 'http://schemas.google.com/g/2005#event.confirmed'){
					return;
				}
				
	      		// Render the event
	      		var now = moment();
	      		var datetime = moment(item['gd$when'][0].startTime);
	      		var selector = '#gcal-events';
	      		if(datetime < now){
	      			selector = '#gcal-events-archive';
	      		}
	      		var place = item['gd$where'][0].valueString.split(',');
	      		jQuery(selector).append('<li>' +
	      			'<div class="day">' +
	      				'<div class="month">'+ datetime.format('MMM') +'</div>' +
	      				'<div class="date">'+ datetime.format('D') +'</div>' +
	      			'</div>' +
	      			'<div class="title"><a href="#" id="cal-entry-'+i+'">' + item.title.$t +'</a></div>' +
	      			'<div class="location">' +
	      				'<span class="venue">'+ place[0] +'</span>' +
	      				'<span class="place">'+ place.slice(1, -1).join(', ') +'</span>' +
	      			'</div>' +
	      			//item['gd$when'][0].startTime + ' - ' + item['gd$where'][0].valueString +
	      			'<div class="clear"></div>' +
	      			'</li>');
	    	});

			$.facebox.settings.loadingImage = 'images/loading.gif';
			$.facebox.settings.closeImage = 'images/closelabel.png';
	    	//$('a[rel*=facebox]').facebox();

               $('.page_shows a[id^="cal-entry-"]').click(function(){
	    		var index = parseInt(this.id.substring(10));
	    		var item = calData[index];

	    		$.facebox(function(){
					var overlay = $('#overlay');
					overlay.find('.title').html(item.title.$t);
					overlay.find('.description').html(item.content.$t);
					var datetime = moment(item['gd$when'][0].startTime);
					overlay.find('.date').html(datetime.format('dddd, MMM D, h:mm a') + ' &ndash; ' + moment(item['gd$when'][0].endTime).format('h:mm a'));
					var place = item['gd$where'][0].valueString.split(',');
					overlay.find('.venue').html(place[0]);
					overlay.find('.place').html(place.slice(1, -1).join(', '));

					$.facebox({div:'#overlay'}, 'overlay-visible');

					$('.overlay-visible .map').gmap3({
						marker:{
							address: item['gd$where'][0].valueString,
						},
						map:{
							options:{
								zoom: 16
							}
						}
					});
				});

	    		return false;
	    	});
		}
		else{
			jQuery('#gcal-events').append('<li>No events listed</li>');
		}
	});
});

$(function(){
	$('#cnt .page_shows .expand').click(function(){
		$('#cnt .page_shows ul#gcal-events-archive').slideToggle();
		var dt = $(this);
		if(dt.text() == '[+]'){
			dt.html('[&ndash;]');
		}
		else{
			dt.text('[+]');
		}
	});
})