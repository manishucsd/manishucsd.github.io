
isSelfTriggered = false;
isAnimating = false;

$(window).resize(function(){
	var winHeight = $(window).height();

	//$('body').height(winHeight);
	//$('#spotlight').height(winHeight);
	//$('#cnt').height(winHeight);
	//$('.page').outerHeight(winHeight);
	$('.page').css('min-height', winHeight-66);

	var hash = location.hash;
	if(hash = '' || hash == '#' || hash == '#home'){
		isSelfTriggered = true;
	}
	else{
		isSelfTriggered = false;
	}
	$(window).triggerHandler('hashchange');
});

$(function(){
	$('header .burger').click(function(){
		$('header').toggleClass('active');
	});

	$('.page_headshots .carousel').slick({
		'dots': true,
		'infinite': false,
		//'prevArrow': '.page_headshots .carousel-cnt .cbtn.back',
		//'nextArrow': '.page_headshots .carousel-cnt .cbtn.next',
	});

	$(window).resize();
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
	
	//$('#content').css('transform', 'translate(0, -'+ (pageHeight*index) +'px)');
	if(!isSelfTriggered){
		//$('body').scrollTo(pageHeight*index);
		isAnimating = true;
		var hash = location.hash || '#home';
		$('body').animate({scrollTop: $('.page_' + hash.substring(1)).offset().top}, 1000, 'swing', function(){
			setTimeout(function(){isAnimating = false;}, 0);
		});
	}
	else{
		isSelfTriggered = false;
	}
	$('header a.logo').css('transform', 'rotate('+ (360*index) +'deg)');

	$('header ul.nav li').removeClass('current');
	$('header ul.nav li a[href$="'+ location.hash +'"]').closest('li').addClass('current');
});

$(window).on('scroll', function(){
	if(isAnimating) return;
	var pageHeight = $('.page').outerHeight();
	var top = $(window).scrollTop();
	var page = Math.floor((top + pageHeight/2)/pageHeight);
	var index = pageIndex();
	if(page >= 0 && page <= 4 && page != index){
		isSelfTriggered = true;
		var hash = '#';
		if(page == 0) hash += 'home';
		if(page == 1) hash += 'headshots';
		if(page == 2) hash += 'media';
		if(page == 3) hash += 'shows';
		if(page == 4) hash += 'contact';
		location.href = hash;
	}
});


var calData = [];
$(function(){
	var myKey = 'AIzaSyABhOY_WhmxQg0T8sf90bM5vbLNleem71Y';
	var calendarId = 'bigmanni.comedy@gmail.com';
	var calUrl = 'https://www.googleapis.com/calendar/v3/calendars/' + calendarId+ '/events?key=' + myKey + '&singleEvents=true&orderBy=startTime';

	jQuery.ajax({
		type: 'GET',
		url: encodeURI(calUrl),
		dataType: 'json',
		success: function(data){
			//do whatever you want with each
			//console.debug(data.items);
			if(data.items.length > 0){
				var upcoming = [];
				var archives = [];
				var now = moment();
				jQuery.each(data.items, function(i, item){
					if(item.status != 'confirmed'){
						return;
					}

					var datetime = moment(item.start.dateTime);
					if(datetime < now){
						archives.unshift(item); // add at beginning
					}
					else{
						upcoming.push(item);
					}
				});

				jQuery.each(archives, function(i, item){
					upcoming.push(item); // merge reverse sorted archives into upcoming
				});

				calData = upcoming;
				jQuery.each(upcoming, function(i, item){
					if(item.status != 'confirmed'){
						return;
					}

					// Render the event
					var datetime = moment(item.start.dateTime);
					var selector = '#gcal-events';
					if(datetime < now){
						selector = '#gcal-events-archive';
					}
					var place = item.location.split(',');
					jQuery(selector).append('<li>' +
						'<div class="day">' +
							'<div class="month">'+ datetime.format('MMM') +'</div>' +
							'<div class="date">'+ datetime.format('D') +'</div>' +
						'</div>' +
						'<div class="title"><a href="#" id="cal-entry-'+i+'">' + item.summary +'</a></div>' +
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
						overlay.find('.title').html(item.summary);
						overlay.find('.description').html((item.description || '').replace(/\n/g, '<br />'));
						var datetime = moment(item.start.dateTime);
						overlay.find('.date').html(datetime.format('dddd, MMM D, h:mm a') + ' &ndash; ' + moment(item.end.dateTime).format('h:mm a'));
						var place = item.location.split(',');
						overlay.find('.venue').html(place[0]);
						overlay.find('.place').html(place.slice(1, -1).join(', '));

						$.facebox({div:'#overlay'}, 'overlay-visible');

						$('.overlay-visible .map').gmap3({
							marker:{
								address: item.location,
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
		},
		error: function(response){}
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