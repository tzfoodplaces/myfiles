var GLF = GLF || {};

(function ($) {
    "use strict";

    var $body = $('body');

    var ajax_url           = golo_template_vars.ajax_url,
        item_amount        = golo_template_vars.item_amount,
        default_icon       = golo_template_vars.marker_default_icon,
        not_place          = golo_template_vars.not_place,
        no_results         = golo_template_vars.no_results,
        wishlist_color     = golo_template_vars.wishlist_color,
        wishlist_save      = golo_template_vars.wishlist_save,
        wishlist_saved     = golo_template_vars.wishlist_saved,
        booking_success    = golo_template_vars.booking_success,
        booking_error      = golo_template_vars.booking_error,
        enable_city_map    = golo_template_vars.enable_city_map,
        enable_archive_map = golo_template_vars.enable_archive_map,
        sending_text       = golo_template_vars.sending_text;


    var markers             = [];
    var markers_prop        = [];
    var search_markers      = [];
    var golo_map;
    var place_maps_filter;
    var menu_filter_wrap    = $('.golo-menu-filter');
    // Only take visible one
    menu_filter_wrap.each(function () {
        if ($(this).closest('.archive-filter').is(':visible') ) {
            menu_filter_wrap = $(this);
        }
    })
    
    var mapbox_type         = $('.maptype').data( 'maptype' );
    if( mapbox_type == 'google_map' ){
        place_maps_filter   = $('#place-map-filter');
    } else if( mapbox_type == 'openstreetmap' ){
        place_maps_filter   = $('#maps');
    } else {
        place_maps_filter   = $('#map');
    }
    var has_map             = '';
    var cached_html         = {};
    var cached_location     = {};

    if( enable_city_map && place_maps_filter.length ) {
        has_map = 'yes';
    }

    var ajax_call    = false;
    var drgflag      = true;
    var is_mobile    = false;
    var click_marker = false;

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        is_mobile = true;
    }

    function checkValue(value,arr){
        var status = 'notexist';

        for(var i=0; i<arr.length; i++){
            var name = arr[i];
            if(name == value){
                status = 'exist';
                break;
            }
        }

      return status;
    }

    GLF.element = {
        init: function() {
            GLF.element.waypoints();
            GLF.element.click_outside();
            GLF.element.place_layout();
            GLF.element.nice_select();
            GLF.element.select2();
            GLF.element.sticky_element();
            GLF.element.light_gallery();
            GLF.element.click_to_demo();
            GLF.element.booking_form();
            GLF.element.toggle_panel();
            GLF.element.toggle_social();
            GLF.element.toggle_content();
            GLF.element.nav_scroll();
            GLF.element.filter_toggle();
            GLF.element.slick_carousel();
            GLF.element.pagination();
            GLF.element.filter_single();
            GLF.element.filter_clear();
            GLF.element.add_to_wishlist();
            GLF.element.click_search_location();
            GLF.element.contact_agent_by_email();

            $('.filter-open-time').on('click', 'a', function (e) {
                e.preventDefault();
                if ($(this).hasClass('open-filter')) {
                    $(this).attr('data-open', '');
                    $(this).removeClass('open-filter');
                    $(this).parent().find('i').removeClass().addClass('fal fa-clock icon-small');
                } else {
                    $(this).attr('data-open', 1);
                    $(this).addClass('open-filter');
                    $(this).parent().find('i').removeClass().addClass('las la-door-open icon-medium');
                }

                ajax_call = true;
                GLF.element.ajax_load(ajax_call);
            })

            if ($( window ).width() > 992) {
                $( '.btn-canvas-filter.hidden-md-up' ).remove();
                $( 'select.hidden-md-up' ).remove();
            }

            if( place_maps_filter.length > 0 ){
                GLF.element.ajax_load();
            }

            $('.golo-menu-filter').on('input', 'input.input-control', function() {
                $('.golo-pagination').find('input[name="paged"]').val(1);
                ajax_call = true;
                GLF.element.ajax_load(ajax_call);
            });

            $('.archive-layout select.sort-by').on('change', function() {
                $('.golo-pagination').find('input[name="paged"]').val(1);
                ajax_call = true;
                GLF.element.ajax_load(ajax_call);
            });

            var timer;
            $('.golo-ajax-search').on('keyup input focus', 'input', function(event, status){
                var $this = $(this);
                if( $this.val() ){
                    clearInterval(timer);
                    timer = setTimeout(function() {
                        if( $this.attr('name') == 's' ) {
                            GLF.element.ajax_search($this);
                        }

                        if( $this.attr('name') == 'place_location' ) {
                            var $input = $this.closest('.golo-ajax-search').find('input[name="s"]');
                            GLF.element.ajax_search($input, 'hide');
                            if (status == 'hide') {
                                GLF.element.ajax_search_location($this, 'hide');
                            } else {
                                GLF.element.ajax_search_location($this, 'show');
                            }
                        }
                        
                    }, 50);
                }else{
                    clearInterval(timer);
                }
            });

            $('.golo-ajax-search').on('focus input', 'input', function(event, status){
                var $this = $(this);
                $('.form-field .area-result').hide();
                if( $this.val() ){
                    $this.closest('.area-search').find('.focus-result').hide();
                    if (status == 'hide') {
                        $this.closest('.form-field').find('.area-result').hide();
                    } else {
                        $this.closest('.form-field').find('.area-result').show();
                    }
                }else{
                    $this.closest('.form-field').find('.focus-result').show();
                    $this.closest('.form-field').find('.area-result').hide();
                }
            });

            GLF.element.click_outside('.input-field','.focus-result');
            GLF.element.click_outside('.location-field','.focus-result');
            GLF.element.click_outside('.type-field','.focus-result');
            GLF.element.click_outside('.location-field','.area-result');

            $('.formBooking').on('submit', function(e){
                e.preventDefault();
                var $this       = $(this);
                var coupon      = $( this ).find( 'input[name="place_coupon"]' ).val();
                var coupon_code = $( this ).find( 'input[name="place_coupon_code"]' ).val();
                if ( coupon_code != '' && coupon != '' && coupon != coupon_code ) {
                    $( '.form-coupon + p.error' ).fadeIn();
                } else {
                    GLF.element.ajax_booking_form($this);
                    $( '.form-coupon + p.error' ).fadeOut();
                }
                
            });

            $('.formClaim').validate({
                rules: {
                    your_name: {
                        required: true,
                    },
                    your_email: {
                        required: true,
                    },
                    your_username: {
                        required: true,
                    },
                    your_listing: {
                        required: true,
                    },
                },
                submitHandler: function(form) {
                    GLF.element.ajax_claim_form($('.formClaim'));
                }
            });

            $('body').on('click', '.btn-maps-filter', function(e) {
                e.preventDefault();
                $('html, body').animate({scrollTop: 0}, 500);
                $('body').css('overflow', 'hidden');
                $('.filter-place-search').fadeIn();
                GLF.element.ajax_load();
            });

            $('body').on('click', '.filter-place-search .btn-close', function(e) {
                e.preventDefault();
                $('body').css('overflow', 'inherit');
                $('.filter-place-search').fadeOut();
                ajax_call = false;
            });

            $('.golo-payment-method-wrap .radio').on('click', function() {
                $('.golo-payment-method-wrap .radio').removeClass('active');
                $(this).addClass('active');
            });

            $('.btn-hide-map input[type="checkbox"]').on('change', function() {
				var elem = $('.archive-layout .inner-content');
				var ltf = $('.layout-top-filter .nav-bar');
				if($(this).attr('checked')){
					$("input[value='hide_map']").prop('checked',false);
				}else{
					$("input[value='hide_map']").prop('checked',true);
				}
				if( elem.hasClass('has-map') ) {
					elem.removeClass('has-map');
					elem.addClass('no-map');
					ltf.removeClass('has-map');
					ltf.addClass('no-map');
				}else{
					elem.removeClass('no-map');
					elem.addClass('has-map');
					ltf.removeClass('no-map');
					ltf.addClass('has-map');
				}
                ajax_call = true;
                GLF.element.ajax_load(ajax_call);
			});

            $('.toggle-select').on('click', '.toggle-show', function() {
                $(this).closest('.toggle-select').find('.toggle-list').slideToggle();
            });
            GLF.element.click_outside('.toggle-select', '.toggle-list', 'slide');
    	},

        waypoints: function() {       
            var $elem = $( '.offset-item' );

            var waypoints = $elem.waypoint(function(direction) {
                // Fix for different ver of waypoints plugin.
                var _self = this.element ? this.element : this;
                var $self = $( _self );
                $self.addClass( 'animate' );
            }, {
                offset: '85%',
                triggerOnce: true
            });
        },
        
        light_gallery: function() {
            $('.single-place-thumbs.enable').lightGallery({
                thumbnail: true,
                selector: '.lgbox'
            });

            $('.single-place-thumbs .btn-gallery').on('click', function(e) {
                e.preventDefault();
               $(this).closest('.single-place-thumbs').find('.slick-slide.slick-current.slick-active .lgbox').trigger('click');
            });
        },

        scroll_to: function(element) {          
            var offset = $(element).offset().top;
            $('html, body').animate({
                scrollTop: offset - 100
            }, 500);
        },

        click_to_demo: function() {          
            $('.menu a').on('click', function(e) {
                var id = $(this).attr('href');
                if( id == '#demo' ) {
                    e.preventDefault();
                    scroll_to(id);
                }
            });
        },

        click_outside: function(element, child, type = '') {
            $(document).on('click', function(event){
                var $this = $(element);
                if($this !== event.target && !$this.has(event.target).length){
                    if( type ) {
                        if( child ) {
                            $this.find(child).slideUp();
                        }else{
                            $this.slideUp();
                        }
                    }else{
                        if( child ) {
                            $this.find(child).hide();
                        }else{
                            $this.hide();
                        }
                    }
                }            
            });
        },

        removeClassStartingWith: function(node, begin) {
            node.removeClass (function (index, className) {
                return (className.match ( new RegExp("\\b"+begin+"\\S+", "g") ) || []).join(' ');
            });
        },

        place_layout: function() {
            $('.place-layout a').on('click', function(event){
                event.preventDefault();
                var layout = $(this).attr('data-layout');
                var type_pagination = $('.golo-pagination').attr('data-type');
                if( type_pagination == 'loadmore' ) {
                    $('.golo-pagination').find('input[name="paged"]').val(1);
                }
                $(this).closest('.place-layout').find('>a').removeClass('active');
                $(this).addClass('active');
                GLF.element.removeClassStartingWith( $('.archive-layout>.inner-content'), 'layout-' );
                $(this).closest('.inner-content').addClass(layout);

                $('.area-places .place-item').each( function() {
                    GLF.element.removeClassStartingWith( $(this), 'layout-' );
                    $(this).addClass(layout);
                });

                ajax_call = true;
                GLF.element.ajax_load(ajax_call);
            });
        },

        nice_select: function() {
            $( '.nice-select' ).niceSelect();
        },

        select2: function() {
            $( '.golo-select2' ).select2();
        },

        sticky_element: function() {
            var offset = '';
            if( $('.uxper-sticky').length > 0 ){
                offset = $('.uxper-sticky').offset().top;
            }
            var has_wpadminbar = $('#wpadminbar').length;
            var height_sticky  = $('.uxper-sticky').height();
            var wpadminbar = 0;
            var lastScroll = 0;
            if( has_wpadminbar > 0 ){
                wpadminbar = $('#wpadminbar').height();
                $('.uxper-sticky').addClass('has-wpadminbar');
            }

            var lastScrollTop = 0;
            $(window).scroll(function(event){
                var st = $(this).scrollTop();
                if (st < lastScrollTop){
                    $('.uxper-sticky').addClass('on');
                }else{
                    $('.uxper-sticky').removeClass('on');
                }

                if( st < height_sticky + wpadminbar ) {
                    $('.uxper-sticky').removeClass('on');
                }
                lastScrollTop = st;
            });
        },

        booking_form: function() {
            $('.datepicker').datetimepicker({
                timepicker:false,
                format:'d.m.Y',
            });
            $('.timepicker').datetimepicker({
                datepicker:false,
                format:'H:i',
            });

            var language = $('.datepicker').data( 'language' );
            if (language != '') {
                $.datetimepicker.setLocale(language);
            }

            $('body').on('click', '.datepicker', function() {
                $(this).parent().find('.xdsoft_datetimepicker').addClass('on');
                var width = $('.datepicker').outerWidth();
                $('.xdsoft_datetimepicker').width(width - 10);
            });

            $('body').on('click', '.timepicker', function() {
                $(this).parent().find('.xdsoft_timepicker').addClass('on');
                var width = $('.timepicker').outerWidth();
                $('.xdsoft_datetimepicker').width(width - 10);
            });

            $('.booking-bar .golo-button a').on('click', function(e){
                e.preventDefault();
                $('body').addClass( 'open-popup' );
                $('#secondary .place-booking').toggleClass('open');
                $( '.site-header' ).addClass( 'show-popup' );
            });

            $('#secondary .place-booking .bg-overlay').on('click', function(e){
                e.preventDefault();
                $('body').removeClass( 'open-popup' );
                $(this).parent().removeClass('open');
                $( '.popup' ).removeClass('open');
                $( '.site-header' ).removeClass( 'show-popup' );
                $('body').css('overflow', 'auto');
            });

            $( '.widget-area > div' ).wrapAll( '<div class="widget-area-inner"></div>' );

            $( '.place-booking' ).each( function() {
                var _this = $( this );
                if( _this.hasClass( 'has-sticky' ) ){
                    _this.removeClass( 'has-sticky' );
                    _this.parents( '.widget-area-inner' ).addClass( 'has-sticky' );
                }
            });

            var lastScrollTop = 0;
            $(window).scroll(function(event){
                var st = $(this).scrollTop();
                if (st > lastScrollTop){
                    $('.booking-bar').addClass('on');
                } else {
                    $('.booking-bar').removeClass('on');
                }
                lastScrollTop = st;
            });

        },

        toggle_panel: function() {
            $('.block-panel').on('click', '.block-tab', function(){
                var parent = $(this).closest('.block-panel');
                if( parent.hasClass('active') ){
                    parent.removeClass('active');
                    parent.find('.block-content').slideUp(300);
                }else{
                    $('.entry-property-element .block-panel').removeClass('active');
                    $('.entry-property-element .block-panel .block-content').slideUp(300);
                    parent.addClass('active');
                    parent.find('.block-content').slideDown(300);
                }
            });
        },

        toggle_social: function() {
            $('.toggle-social').on('click', '.btn-share', function (e) {
                e.preventDefault();
                $(this).parent().toggleClass('active');
                $(this).parent().find('.social-share').slideToggle(300);
            });
        },

        toggle_content: function() {
            var h_desc = $('.single-place .place-content .inner-content .entry-visibility').height();
            if( h_desc > 130 ) {
                $('.single-place .place-content').addClass('on');
            }

            $('.show-more').on('click', function(e) {
                e.preventDefault();
                $(this).parents('.place-area').addClass('active');
            });

            $('.hide-all').on('click', function(e) {
                e.preventDefault();
                $(this).parents('.place-area').removeClass('active');
            });

            $('.open-toggle').on('click', function (e) {
                e.preventDefault();
                $(this).parent().toggleClass('active');
            });

            $(document).on('click', function(event){
                var $this = $('.form-toggle');
                if($this !== event.target && !$this.has(event.target).length){
                    $this.removeClass('active');
                }
                
                // Update Booking From Guest Text when open
                var bookingFormGuest = $('.area-booking .btn-quantity');
                if (bookingFormGuest) {
                    var val  = $(bookingFormGuest).parent().find('input').val();
                    var name = $(bookingFormGuest).parent().find('input').attr('name');
                    if( parseInt(val) > 0 ){
                        $(bookingFormGuest).parents('.area-booking').find('.open-toggle').addClass('active');
                        $(bookingFormGuest).parents('.area-booking').find('.' + name + ' span').text(parseInt(val));
                    }else{
                        $(bookingFormGuest).parents('.area-booking').find('.open-toggle').removeClass('active');
                    }
                }
            });

            $('.area-booking').on('click','.btn-quantity', function() {
                var val  = $(this).parent().find('input').val();
                var name = $(this).parent().find('input').attr('name');
                if( parseInt(val) > 0 ){
                    $(this).parents('.area-booking').find('.open-toggle').addClass('active');
                    $(this).parents('.area-booking').find('.' + name + ' span').text(parseInt(val));
                }else{
                    $(this).parents('.area-booking').find('.open-toggle').removeClass('active');
                }
            });

            $('body').on('click', '.area-booking .plus', function(e) {
                var input = $(this).parents('.product-quantity').find('.input-text.qty');
                var name = $(this).parents('.product-quantity').find('.input-text.qty').attr('name');
                var val = parseInt(input.val()) + 1;
                input.attr('value',val);
                $(this).parents('.area-booking').find('.open-toggle').addClass('active');
                if( val > 0 ){
                    $(this).parents('.area-booking').find('.' + name + ' span').text(parseInt(val));
                }else{
                    $(this).parents('.area-booking').find('.' + name + ' span').text(0);
                }
            });

            $('body').on('click', '.area-booking .minus', function(e) {
                var input = $(this).parents('.product-quantity').find('.input-text.qty');
                var name = $(this).parents('.product-quantity').find('.input-text.qty').attr('name');
                var val = parseInt(input.val()) - 1;

                // Adult cannot be 0
                if (val == 0 && $(this).parents('.adult').length > 0) {
                    val = 1;
                }

                if(input.val() > 0) input.attr('value',val);
                $(this).parents('.area-booking').find('.open-toggle').addClass('active');
                if( val > 0 ){
                    $(this).parents('.area-booking').find('.' + name + ' span').text(parseInt(val));
                }else{
                    $(this).parents('.area-booking').find('.' + name + ' span').text(0);
                }
            });
        },

        nav_scroll: function() {
            $('.nav-scroll a[href^="#"]').on('click', function(event) {
                event.preventDefault();
                var target         = $(this.getAttribute('href'));
                var has_wpadminbar = 0;
                if($("#wpadminbar").height()) {
                    has_wpadminbar = $("#wpadminbar").height();
                }
                if( target.length ) {
                    if ($(window).width() > 767) {
                        var top = target.offset().top - 15 - has_wpadminbar;
                    } else {
                        var top = target.offset().top - 15 - has_wpadminbar;
                    }
                    $('html, body').stop().animate({
                        scrollTop: top
                    }, 500);
                }

                $( '.nav-scroll li' ).removeClass( 'active' );
                $( this ).parent().addClass( 'active' );
            });

            $(window).scroll(function() {
                var scrollDistance = $(window).scrollTop();

                // Assign active class to nav links while scolling
                $('.group-field').each(function(i) {
                    if ($(this).offset().top <= scrollDistance + 50) {
                        var href = $(this).attr('id'),
                            id   = '#' + href;
                        $('.nav-scroll a').parent().removeClass('active');
                        $('.nav-scroll a').each(function(){
                            var attr = $(this).attr('href');
                            // For some browsers, `attr` is undefined; for others, `attr` is false. Check for both.
                            if ( attr == id ) {
                                // Element has this attribute
                                $(this).parent().addClass('active');
                            }
                        });
                    }
                });
            });
        },

        filter_toggle: function() {
            $('.filter-toggle .golo-filter-toggle').on('click', function() {
                $(this).toggleClass('active');
                $(this).parents('.filter-toggle').find('.golo-menu-filter').slideToggle(200);
            });

            $('.filter-dropdown .entry-filter>h4').on('click', function() {
                $(this).parents('.entry-filter').toggleClass('active');
                $(this).parents('.entry-filter').find('.filter-control').slideToggle(200);
            });

            $('.btn-canvas-filter').on('click', function(event) {
                event.preventDefault();
                $('body').css('overflow', 'hidden');
                $('body').addClass('open-popup');
                $(this).toggleClass('active');
                $('.archive-filter').toggleClass('open-canvas');
            });

            $('.archive-filter').on('click', '.btn-close,.bg-overlay', function(e) {
                e.preventDefault();
                $('body').css('overflow', 'inherit');
                $('body').removeClass('open-popup');
                $(this).parents('.archive-filter').removeClass('open-canvas');
                $('.btn-canvas-filter').removeClass('active');
            });

            GLF.element.click_outside_filter('.nav-bar .filter-price .entry-filter');
            GLF.element.click_outside_filter('.nav-bar .filter-city .entry-filter');
            GLF.element.click_outside_filter('.nav-bar .filter-categories .entry-filter');
            GLF.element.click_outside_filter('.nav-bar .filter-type .entry-filter');
            GLF.element.click_outside_filter('.nav-bar .filter-amenities .entry-filter');
            GLF.element.click_outside_filter('.nav-bar .filter-neighborhood .entry-filter');
        },

        click_outside_filter: function(element, child) {
            $(document).on('click', function(event){
                var $this = $(element);
                if($this !== event.target && !$this.has(event.target).length){
                    $this.removeClass('active');
                    $this.find('.filter-control').slideUp(200);
                }            
            });
        },

    	slick_carousel: function() {
			var rtl = false;
			if( $( 'body' ).hasClass( 'rtl' ) ) {
				rtl = true;
			}
            $('.golo-slick-carousel').each(function () {
                var slider = $(this);
                var defaults = {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    arrows: true,
                    prevArrow: '<div class="gl-prev slick-arrow"><i class="la la-angle-left large"></i></div>',
                    nextArrow: '<div class="gl-next slick-arrow"><i class="la la-angle-right large"></i></div>',
                    dots: false,
                    fade: false,
                    infinite: false,
                    centerMode: false,
                    adaptiveHeight: true,
                    pauseOnFocus: true,
                    pauseOnHover: true,
                    swipe: true,
                    draggable: true,
                    rtl: rtl,
                    autoplay: false,
                    autoplaySpeed: 250,
                    speed: 250,
                };

                if( slider.hasClass('slick-nav') ){
                    defaults['prevArrow'] = '<div class="gl-prev"><i class="la la-angle-left large"></i></div>';
                    defaults['nextArrow'] = '<div class="gl-next"><i class="la la-angle-right large"></i></div>';
                }

                var config = $.extend({}, defaults, slider.data("slick"));
                // Initialize Slider
                slider.slick(config);
            });
        },

        pagination: function() {
            $('body').on('click','.golo-pagination.ajax-call a.page-numbers', function(e) {
                e.preventDefault();
                $('.golo-pagination .pagination').addClass('active');
                $('.golo-pagination li .page-numbers').removeClass('current');
                $(this).addClass('current');
                var paged = $(this).text();
                var current_page = 1;
                if( $('.golo-pagination').find('input[name="paged"]').val() ) {
                    current_page = $('.golo-pagination').find('input[name="paged"]').val();
                }
                if( $(this).hasClass('next') ){
                    paged = parseInt(current_page) + 1;
                }
                if( $(this).hasClass('prev') ){
                    paged = parseInt(current_page) - 1;
                }
                $('.golo-pagination').find('input[name="paged"]').val(paged);
                ajax_call = true;
                if( $(this).attr('data-type') == 'number' ){
                    GLF.element.scroll_to('.area-places');
                    GLF.element.ajax_load(ajax_call);
                }else{
                    GLF.element.ajax_load(ajax_call, 'loadmore');
                }
                
            });
        },

        filter_single: function() {
            $('.golo-menu-filter ul.filter-control a').on('click', function(e) {
                e.preventDefault();
                $('.golo-pagination').find('input[name="paged"]').val(1);
                if( $(this).parent().hasClass('active') ){
                    $(this).parents('.golo-menu-filter ul.filter-control').find('li').removeClass('active');
                    $(this).closest('.entry-filter').removeClass('open');
                }else{
                    $(this).parents('.golo-menu-filter ul.filter-control').find('li').removeClass('active');
                    $(this).parent().addClass('active');
                    $(this).closest('.entry-filter').addClass('open');
                }
                ajax_call = true;
                GLF.element.ajax_load(ajax_call);
            });
        },

        display_clear: function() {
            if( $('.golo-menu-filter ul.filter-control li.active').length > 0 ){
                $('.golo-nav-filter').addClass('active');
            }else{
                $('.golo-nav-filter').removeClass('active');
            }
            
            $('.golo-menu-filter input[type="checkbox"]:checked').each( function() {
                if ( $(this).length > 0 ) {
                    $('.golo-nav-filter').addClass('active');
                    $(this).closest('.entry-filter').addClass('open');
                }else{
                    $('.golo-nav-filter').removeClass('active');
                    $(this).closest('.entry-filter').removeClass('open');
                }
            });

            $('.golo-menu-filter .entry-filter').each( function() {
                if ( $(this).find('input[type="checkbox"]:checked').length > 0 ) {
                    $(this).addClass('open');
                }else{
                    $(this).removeClass('open');
                }

                if( $(this).closest('.filter-price').length > 0 ) {
                    if( $(this).find('ul.filter-control li.active').length > 0 ){
                        $(this).addClass('open');
                    }else{
                        $(this).removeClass('open');
                    }
                }
            });
        },

        filter_clear: function() {
            $('.golo-clear-filter').on('click', function() {
                $('.golo-menu-filter ul.filter-control li').removeClass('active');
                $('.golo-menu-filter input[type="checkbox"]').prop('checked', false);
                ajax_call = true;
                GLF.element.ajax_load(ajax_call);
            });
        },


        ajax_load: function(ajax_call, pagination) {
            var title, height, sortby, price, sort_by, cities, categories, types, place_type, amenities, neighborhood, current_term, type_term, city, location, place_layout, open_now;
            var paged = 1;
            var map_html = $( '.maptype' ).clone();
            height = $('.area-places').height();

            paged        = $('.golo-pagination').find('input[name="paged"]').val();
            title        = $('input[name="title"]').val();
            current_term = $('input[name="current_term"]').val();
            type_term    = $('input[name="type_term"]').val();
            city         = $('input[name="city"]').val();
            location     = $('input[name="place_location"]').val();
            place_type   = $('input[name="place_type"]').val();
            place_layout = $('.place-layout a.active').attr('data-layout');
            open_now     = $('.filter-open-time a.open-filter').attr('data-open');

            price   = menu_filter_wrap.find('.price.filter-control li.active a').data('price');
            sort_by = menu_filter_wrap.find('.sort-by.filter-control li.active a').data('sort');

            var select_sort = $('.archive-layout select[name="sort_by"]').val();
            if( select_sort ) {
                sort_by = select_sort;
            }

            if( price ) {
                menu_filter_wrap.find('.price-filter').hide();
                menu_filter_wrap.find('.price-filter').removeClass('active');
            }else{
                menu_filter_wrap.find('.price-filter').show();
            }

            var cities = [];
            menu_filter_wrap.find("input[name='cities']:checked").each(function ()
            {   
                cities.push(parseInt($(this).val()));
            });

            var categories = [];

            menu_filter_wrap.find("input[name='categories']:checked").each(function ()
            {   
                categories.push(parseInt($(this).val()));
            });

            var types = [];
            menu_filter_wrap.find("input[name='types']:checked").each(function ()
            {      
                types.push(parseInt($(this).val()));
            });

            var amenities = [];

            $( '.left' ).find(".golo-menu-filter input[name='amenities']:checked").each(function ()
                {   
                amenities.push($(this).val());
            });

            if (amenities.length === 0) {
                $( '.col-left' ).find(".golo-menu-filter input[name='amenities']:checked").each(function ()
                {   
                    amenities.push($(this).val());
                });
            }

            var neighborhood = [];
            menu_filter_wrap.find("input[name='neighborhood']:checked").each(function ()
            {   
                neighborhood.push(parseInt($(this).val()));
            });
            
            var maptype = $( '.maptype' ).data( 'maptype' );

            var review_status = $( '.maptype' ).parents( '.filter-place-search' ).data( 'review' );
            
            if ( maptype == 'google_map' ) {
                
                var marker_cluster         = null,
                    googlemap_default_zoom = golo_template_vars.googlemap_default_zoom,
                    not_found              = golo_template_vars.not_found,
                    clusterIcon            = golo_template_vars.clusterIcon,
                    google_map_style       = golo_template_vars.google_map_style,
                    google_map_type        = golo_template_vars.google_map_type,
                    pin_cluster_enable     = golo_template_vars.pin_cluster_enable;
    
                var infowindow = new google.maps.InfoWindow({
                    maxWidth: 370,
                });
    
                var silver = [
                    {
                        "featureType": "landscape",
                        "elementType": "labels",
                        "stylers": [
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "transit",
                        "elementType": "labels",
                        "stylers": [
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "poi",
                        "elementType": "labels",
                        "stylers": [
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "water",
                        "elementType": "labels",
                        "stylers": [
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "road",
                        "elementType": "labels.icon",
                        "stylers": [
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "stylers": [
                            {
                                "hue": "#00aaff"
                            },
                            {
                                "saturation": -100
                            },
                            {
                                "gamma": 2.15
                            },
                            {
                                "lightness": 12
                            }
                        ]
                    },
                    {
                        "featureType": "road",
                        "elementType": "labels.text.fill",
                        "stylers": [
                            {
                                "visibility": "on"
                            },
                            {
                                "lightness": 24
                            }
                        ]
                    },
                    {
                        "featureType": "road",
                        "elementType": "geometry",
                        "stylers": [
                            {
                                "lightness": 57
                            }
                        ]
                    }
                ];
    
                if( has_map ) {
                    var golo_search_map_option = {
                        scrollwheel: true,
                        scroll: {x: $(window).scrollLeft(), y: $(window).scrollTop()},
                        zoom: parseInt(googlemap_default_zoom),
                        mapTypeId: google_map_type,
                        draggable: drgflag,
                        fullscreenControl: true,
                        styles: silver,
                        mapTypeControl: false,
                        zoomControlOptions: {
                            position: google.maps.ControlPosition.RIGHT_BOTTOM
                        },
                        fullscreenControlOptions: {
                            position: google.maps.ControlPosition.RIGHT_BOTTOM
                        }
                    };
                }
                
                var golo_input_search = function(map) {
                    // Create the search box and link it to the UI element.
                    var input     = document.getElementById('pac-input');
                    var searchBox = new google.maps.places.SearchBox(input);
                    golo_map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    
                    // Bias the SearchBox results towards current map's viewport.
                    golo_map.addListener('bounds_changed', function() {
                        searchBox.setBounds(golo_map.getBounds());
                    });
    
                    // Listen for the event fired when the user selects a prediction and retrieve
                    // more details for that place.
                    searchBox.addListener('places_changed', function() {
                        var places = searchBox.getPlaces();
    
                        if ( places.length == 0 ) {
                            return;
                        }
    
                        // Clear out the old markers.
                        search_markers.forEach(function(marker) {
                            marker.setMap(null);
                        });
                        search_markers = [];
    
                        // For each place, get the icon, name and location.
                        var bounds = new google.maps.LatLngBounds();
                        places.forEach(function(place) {
                            if ( !place.geometry ) {
                                console.log("Returned place contains no geometry");
                                return;
                            }
                            var icon = {
                                url: place.icon,
                                size: new google.maps.Size(71, 71),
                                origin: new google.maps.Point(0, 0),
                                anchor: new google.maps.Point(17, 34),
                                scaledSize: new google.maps.Size(25, 25)
                            };
    
                            // Create a marker for each place.
                            search_markers.push(new google.maps.Marker({
                                map: golo_map,
                                icon: icon,
                                title: place.name,
                                position: place.geometry.location
                            }));
    
                            if (place.geometry.viewport) {
                                bounds.union(place.geometry.viewport);
                            } else {
                                bounds.extend(place.geometry.location);
                            }
                        });
    
                        golo_map.fitBounds(bounds);
                    });
                }
    
                var golo_add_markers = function(props, map) {
                    $.each(props, function(i, prop) {
                        var latlng = new google.maps.LatLng(prop.lat, prop.lng),
                            marker_url = prop.marker_icon,
                        marker_size = new google.maps.Size(60, 60);
                        var marker_icon = {
                            url: marker_url,
                            size: marker_size,
                            scaledSize: new google.maps.Size(40, 40),
                            origin: new google.maps.Point(-10, -10),
                            anchor: new google.maps.Point(7, 27)
                        };
    
                        var marker = new google.maps.Marker({
                            position: latlng,
                            url: '.place-' + prop.id,
                            map: map,
                            icon: marker_icon,
                            draggable: false,
                            title: 'marker' + prop.id,
                            animation: google.maps.Animation.DROP
                        });
    
                        var prop_title  = prop.data ? prop.data.post_title : prop.title;
                        var rating_html = '';
                        if( prop.rating ) {
                            rating_html = 
                            '<div class="place-rating">' +
                                '<span>' + prop.rating + '</span>' +
                                '<i class="la la-star"></i>' +
                            '</div>';
                        }
                        
                        var contentString = document.createElement("div");
                        contentString.className = 'golo-marker';
                        contentString.innerHTML = 
                        '<div class="inner-marker">' +
                            '<div class="entry-thumbnail">' +
                                '<a href="' + prop.url + '">' +
                                    '<img src="' + prop.image_url + '" alt="' + prop_title + '">' +
                                '</a>' +
                            '</div>' +
                            '<div class="entry-detail">' +
                                '<div class="entry-head">' +
                                    '<div class="place-cate list-item">' +
                                        prop.cate +
                                    '</div>' +
                                    '<div class="place-title">' +
                                        '<h3 class="entry-title"><a href="' + prop.url + '">' + prop_title + '</a></h3>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="entry-bottom">' +
                                    '<div class="place-preview ' + review_status + '">' +
                                        rating_html +
                                        '<span class="place-reviews">(' + prop.review + ' reviews)</span>' +
                                    '</div>' +
                                    '<div class="place-price">' +
                                        '<span>' + prop.price + '</span>' +
                                    '</div>' +
                                '</div>' + 
                            '</div>' +
                        '</div>';
    
                        marker.addListener('mouseover', function() {
                            click_marker = true;
                        });
    
                        marker.addListener('mouseout', function() {
                            click_marker = false;
                        });
    
                        google.maps.event.addListener(marker, 'click', function() {
    
                            infowindow.close();
                            infowindow.setContent(contentString);
                            infowindow.open(map,marker);
                            
                            var scale                = Math.pow(2, map.getZoom()),
                                offsety              = ( (30 / scale) || 0 ),
                                projection           = map.getProjection(),
                                markerPosition       = marker.getPosition(),
                                markerScreenPosition = projection.fromLatLngToPoint(markerPosition),
                                pointHalfScreenAbove = new google.maps.Point(markerScreenPosition.x, markerScreenPosition.y - offsety),
                                aboveMarkerLatLng    = projection.fromPointToLatLng(pointHalfScreenAbove);
                            map.panTo(aboveMarkerLatLng);
    
                            var elem = $(marker.url);
                            $('.area-places .place-item').removeClass('highlight');
                            if( elem.length > 0 && click_marker && $('.archive-place.map-event').length > 0 ) {
                                elem.addClass('highlight');
                                $('html, body').animate({
                                    scrollTop: elem.offset().top - 50
                                }, 500 );
                            }
                        });
                        
                        markers.push(marker);
                    });
                };
    
                var golo_my_location = function(map) {
    
                    var my_location = {};
                    var my_lat = '';
                    var my_lng = '';
    
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(function(position) {
                            var pos = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude
                            };
    
                            my_lat = position.coords.latitude;
                            my_lng = position.coords.longitude;
    
                            my_location = { lat: parseFloat(my_lat),lng: parseFloat(my_lng) };
    
                        }, function() {
                            handleLocationError(true, infowindow, map.getCenter());
                        });
                    } else {
                        // Browser doesn't support Geolocation
                        handleLocationError(false, infowindow, map.getCenter());
                    }
    
                    function CenterControl(controlDiv, map) {
    
                        // Set CSS for the control border.
                        const controlUI = document.createElement("div");
                        controlUI.style.backgroundColor = "#fff";
                        controlUI.style.border = "2px solid #fff";
                        controlUI.style.borderRadius = "3px";
                        controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
                        controlUI.style.cursor = "pointer";
                        controlUI.style.width = "40px";
                        controlUI.style.height = "40px";
                        controlUI.style.margin = "10px";
                        controlUI.style.textAlign = "center";
                        controlUI.title = "My location";
                        controlDiv.appendChild(controlUI);
    
                        // Set CSS for the control interior.
                        const controlText = document.createElement("div");
                        controlText.style.fontSize = "18px";
                        controlText.style.lineHeight = "37px";
                        controlText.style.paddingLeft = "5px";
                        controlText.style.paddingRight = "5px";
                        controlText.innerHTML = "<i class='fas fa-location'></i>";
                        controlUI.appendChild(controlText);

                        var marker_icon = {
                            url: default_icon,
                            scaledSize: new google.maps.Size(40, 40),
                            origin: new google.maps.Point(0, 0),
                            anchor: new google.maps.Point(7, 27)
                        };
    
                        // Setup the click event listeners: simply set the map to Chicago.
                        controlUI.addEventListener('click', () => {
                            var current_location = new google.maps.Marker({
                                position: my_location,
                                map,
                                icon: marker_icon
                            });
    
                            infowindow.setPosition(my_location);
                            infowindow.setContent('<div class="default-result">Your location.</div>');
                            //infowindow.open(map);
                            map.panTo(my_location);
                        });
                    }
    
                    const centerControlDiv = document.createElement("div");
                    CenterControl(centerControlDiv, map);
    
                    centerControlDiv.index = 1;
                    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(centerControlDiv);
    
                    function handleLocationError(browserHasGeolocation, infowindow, pos) {
                        infowindow.setPosition(pos);
                        infowindow.setContent(browserHasGeolocation ? 'Error: The Geolocation service failed.' : 'Error: Your browser doesn\'t support geolocation.');
                        infowindow.open(map);
                    }
    
                };
    
                var golo_infowindow_hover_trigger = function() {
    
                    $('.map-event .area-places .place-item').each(function(i) {
                        var index = i;
    
                        $(this).on('mouseenter', function() {
                            var title = $( this ).find( '.golo-add-to-wishlist' ).data( 'place-id' );
                            if(golo_map) {
                                if( paged > 1 ) {
                                    index = i + (item_amount * (paged - 1 ));
                                }
                                $( 'div[title="marker' + title + '"]' ).trigger('click');
                            }
                        });
    
                        $(this).on('mouseleave', function() {
                            infowindow.open(null,null);
                        });
                    });

                    $('.map-event-zoom .area-places .place-item').each(function(i) {
                        var index = i;

                        $(this).on('mouseenter', function() {
                            var title = $( this ).find( '.golo-add-to-wishlist' ).data( 'place-id' );
                            if(golo_map) {
                                if( paged > 1 ) {
                                    index = i + (item_amount * (paged - 1 ));
                                }
                                $( 'div[title="marker' + title + '"]' ).addClass('zoom');
                            }
                        });
    
                        $(this).on('mouseleave', function() {
                            var title = $( this ).find( '.golo-add-to-wishlist' ).data( 'place-id' );
                            $( 'div[title="marker' + title + '"]' ).removeClass('zoom');
                        });
                    });
                    return false;
                };
    
                var golo_infowindow_scroll_trigger = function() {
                    var $elem = $('.area-places').find( '.place-item' );
    
                    var waypoints_map = $elem.waypoint(function(direction) {
                        if (direction === 'down') {
                            if( golo_map ) {
                                google.maps.event.trigger(markers[$(this.element).index()], 'click');
                            }
                        } else if (direction === 'up') { 
                            if( golo_map ) {
                                google.maps.event.trigger(markers[$(this.element).prev().index()], 'click');
                            }
                        }
                    }, {
                        offset: '50%',
                        triggerOnce: true
                    });
                };
                
            
            } else if ( maptype == 'openstreetmap' ) {
                
                // Begin Openstreetmap
                
                var golo_osm_add_markers = function(props, maps) {
                    
                    $( '.maptype' ).remove();
                    $( map_html ).insertAfter( "#pac-input" );
                    
                    var osm_api = $( '#maps' ).data( 'key' );
                    var osm_level = $( '#maps' ).data( 'level' );
                    var osm_style = $( '#maps' ).data( 'style' );
      
                    var features_info = [];
                    var lng_args = [];
                    var lat_args = [];
                    
                    
                    $.each(props, function(i, prop) {
              
                        features_info.push(
                            {
                                "type": "Feature",
                                "geometry": {
                                  "type": "Point",
                                  "coordinates": [
                                    prop.lat,
                                    prop.lng
                                  ]
                                },
                                "properties": {
                                    "iconSize": [40, 40],
                                    "id": prop.id,
                                    "icon": prop.marker_icon,
                                    "url": prop.url,
                                    "image_url": prop.image_url,
                                    "title": prop.title,
                                    "cate": prop.cate,
                                    "rating": prop.rating,
                                    "review": prop.review,
                                    "price": prop.price,
                                }
                            }
                        );
                        
                        lng_args.push(prop.lng);
                        lat_args.push(prop.lat);
                        
                    });
                    
                    var stores = {
                        "type": "FeatureCollection",
                        "features": features_info
                    };
                    
                    var sum_lng = 0;
                    for( var i = 0; i < lng_args.length; i++ ){
                        sum_lng += parseFloat( lng_args[i], 10 );
                    }
                    
                    var avg_lng = 0;
                    
                    if( sum_lng/lng_args.length ){
                        avg_lng = sum_lng/lng_args.length;
                    } 
                    
                    
                    var sum_lat = 0;
                    for( var i = 0; i < lat_args.length; i++ ){
                        sum_lat += parseFloat( lat_args[i], 10 );
                    }
                    
                    var avg_lat = 0;
                    
                    if( sum_lat/lat_args.length ){
                        avg_lat = sum_lat/lat_args.length;
                    }
                    
                    var container = L.DomUtil.get('maps'); if(container != null){ container._leaflet_id = null; }
                    
                    $( '.leaflet-map-pane' ).remove();
                    $( '.leaflet-control-container' ).remove();
                    
                    var osm_map = new L.map('maps');
                    
                    osm_map.on('load', onMapLoad);
                    
                    osm_map.setView([avg_lat, avg_lng], osm_level);
                

                    function onMapLoad(){
                        
                        var titleLayer_id = 'mapbox/' + osm_style;
        
                        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' + osm_api, {
                            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                            id: titleLayer_id,
                            tileSize: 512,
                            zoomOffset: -1,
                            accessToken: osm_api
                        }).addTo(osm_map);
                    
                        /**
                         * Add all the things to the page:
                         * - The location listings on the side of the page
                         * - The markers onto the map
                        */
                        addMarkers();

                        // $( '.leaflet-marker-icon' ).each( function() {
                        //     $( this ).wrap( '<div class="leaflet-marker-icon-wrap"></div>' );
                        // });
                    
                        $('.map-event .area-places .place-item').each(function(i) {
                            var index = i;
                            
                            $(this).on('mouseenter', function() {
                                var title = $( this ).find( '.golo-add-to-wishlist' ).data( 'place-id' );
                                if(osm_map) {
                                    if( paged > 1 ) {
                                        index = i + (item_amount * (paged - 1 ));
                                    }
                                    $( ".marker-" + title ).trigger( "click" );
                                }
                            });
        
                            $(this).on('mouseleave', function() {
                                $( ".leaflet-popup-close-button" )[0].click();
                            });
                        });
                        $('.map-event-zoom .area-places .place-item').each(function(i) {
                            var index = i;
                            
                            $(this).on('mouseenter', function() {
                                var title = $( this ).find( '.golo-add-to-wishlist' ).data( 'place-id' );
                                if(osm_map) {
                                    if( paged > 1 ) {
                                        index = i + (item_amount * (paged - 1 ));
                                    }
                                    $( ".marker-" + title ).addClass( 'zoom' );
                                }
                            });
        
                            $(this).on('mouseleave', function() {
                                var title = $( this ).find( '.golo-add-to-wishlist' ).data( 'place-id' );
                                $( ".marker-" + title ).removeClass( 'zoom' );
                            });
                        });
                    };
                    
                    function flyToStore(currentFeature) {
                        osm_map.flyTo(currentFeature.geometry.coordinates, osm_level);
                    }
                    
                    /* This will let you use the .remove() function later on */
                    if (!('remove' in Element.prototype)) {
                      Element.prototype.remove = function() {
                        if (this.parentNode) {
                          this.parentNode.removeChild(this);
                        }
                      };
                    }
                    
                    function addMarkers() {

                        /* For each feature in the GeoJSON object above: */
                        stores.features.forEach(function(marker) {
                            /* Create a div element for the marker. */
                            var el = document.createElement('div');
                            /* Assign a unique `id` to the marker. */
                            el.id = "marker-" + marker.properties.id;
                            /* Assign the `marker` class to each marker for styling. */
                            el.className = 'marker';
                            el.style.backgroundImage = 'url(' + marker.properties.icon + ')';
                            el.style.width = marker.properties.iconSize[0] + 'px';
                            el.style.height = marker.properties.iconSize[1] + 'px';
                            /**
                             * Create a marker using the div element
                             * defined above and add it to the map.
                            **/
                            var icon = L.divIcon({
                                className:      'marker-' + marker.properties.id,
                                html: '<div><img src="' + marker.properties.icon + '" alt=""></div>',
                                iconSize:       [40, 40],
                                shadowSize:     [50, 64],
                                iconAnchor:     [22, 94],
                                shadowAnchor:   [4, 62],
                                popupAnchor:    [-3, -76]
                            });
                            var rating_html = '';
                            if( marker.properties.rating ) {
                                rating_html = 
                                '<div class="place-rating">' +
                                    '<span>' + marker.properties.rating + '</span>' +
                                    '<i class="la la-star"></i>' +
                                '</div>';
                            }
                            
                            new L.marker([marker.geometry.coordinates[0], marker.geometry.coordinates[1]], {icon: icon}).addTo(osm_map).bindPopup( '<div class="golo-marker"><div class="inner-marker">' +
                                '<div class="entry-thumbnail">' +
                                    '<a href="' + marker.properties.url + '">' +
                                        '<img src="' + marker.properties.image_url + '" alt="' + marker.properties.title + '">' +
                                    '</a>' +
                                '</div>' +
                                '<div class="entry-detail">' +
                                    '<div class="entry-head">' +
                                        '<div class="place-cate list-item">' +
                                            marker.properties.cate +
                                        '</div>' +
                                        '<div class="place-title">' +
                                            '<h3 class="entry-title"><a href="' + marker.properties.url + '">' + marker.properties.title + '</a></h3>' +
                                        '</div>' +
                                    '</div>' +
                                    '<div class="entry-bottom">' +
                                        '<div class="place-preview ' + review_status + '">' +
                                            rating_html +
                                            '<span class="place-reviews">(' + marker.properties.review + ' reviews)</span>' +
                                        '</div>' +
                                        '<div class="place-price">' +
                                            '<span>' + marker.properties.price + '</span>' +
                                        '</div>' +
                                    '</div>' + 
                                '</div>' +
                            '</div></div>', { maxWidth : 325 } );
                              
                            el.addEventListener('click', function(e){
                                /* Fly to the point */
                                flyToStore(marker);
                                /* Highlight listing in sidebar */
                                var activeItem = document.getElementsByClassName('active');
                                e.stopPropagation();
                                if (activeItem[0]) {
                                    activeItem[0].classList.remove('active');
                                }
                            });
                        });
                    }
                    
                };
                
                // End Openstreetmap
                
            } else {
            
                // Begin Mapbox
                
                var golo_mapbox_add_markers = function(props, map) {
                    var mapbox_api = $( '#map' ).data( 'key' );
                    var mapbox_level = $( '#map' ).data( 'level' );
                    var mapbox_type = $( '#map' ).data( 'type' );
                    mapboxgl.accessToken = mapbox_api;
                    $( '.mapboxgl-canary' ).remove();
                    $( '.mapboxgl-canvas-container' ).remove();
                    $( '.mapboxgl-control-container' ).remove();
                    var features_info = [];
                    var lng_args = [];
                    var lat_args = [];

                    $.each(props, function(i, prop) {
              
                        features_info.push(
                            {
                                "type": "Feature",
                                "geometry": {
                                  "type": "Point",
                                  "coordinates": [
                                    prop.lng,
                                    prop.lat
                                  ]
                                },
                                "properties": {
                                    "iconSize": [40, 40],
                                    "id": prop.id,
                                    "icon": prop.marker_icon,
                                    "url": prop.url,
                                    "image_url": prop.image_url,
                                    "title": prop.title,
                                    "cate": prop.cate,
                                    "rating": prop.rating,
                                    "review": prop.review,
                                    "price": prop.price,
                                }
                            }
                        );
                        
                        lng_args.push(prop.lng);
                        lat_args.push(prop.lat);
                        
                    });
                    
                    var sum_lng = 0;
                    for( var i = 0; i < lng_args.length; i++ ){
                        sum_lng += parseFloat( lng_args[i] );
                    }
                    
                    var avg_lng = 0;
                    
                    if( sum_lng/lng_args.length ){
                        avg_lng = sum_lng/lng_args.length;
                    } 
                    
                    
                    var sum_lat = 0;
                    for( var i = 0; i < lat_args.length; i++ ){
                        sum_lat += parseFloat( lat_args[i] );
                    }
                    
                    var avg_lat = 0;
                    
                    if( sum_lat/lat_args.length ){
                        avg_lat = sum_lat/lat_args.length;
                    }
                    
                    var map = new mapboxgl.Map({
                        container: 'map',
                        style: 'mapbox://styles/mapbox/' + mapbox_type,
                        zoom: mapbox_level,
                        center: [avg_lng, avg_lat],
                    });

                    map.addControl(new mapboxgl.NavigationControl());
                    
                    var stores = {
                        "type": "FeatureCollection",
                        "features": features_info
                    };
                
                    /**
                    * Wait until the map loads to make changes to the map.
                    */
                    map.on('load', function (e) {
                        /**
                         * This is where your '.addLayer()' used to be, instead
                         * add only the source without styling a layer
                        */
                        map.addLayer({
                            "id": "locations",
                            "type": "symbol",
                            /* Add a GeoJSON source containing place coordinates and information. */
                            "source": {
                              "type": "geojson",
                              "data": stores
                            },
                            "layout": {
                              "icon-image": "",
                              "icon-allow-overlap": true,
                            }
                          });
                
                        /**
                         * Add all the things to the page:
                         * - The location listings on the side of the page
                         * - The markers onto the map
                        */
                        addMarkers();
                        
                        $('.map-event .area-places .place-item').each(function(i) {
                            var index = i;
                            
                            $(this).on('mouseenter', function() {
                                var title = $( this ).find( '.golo-add-to-wishlist' ).data( 'place-id' );
                                if(map) {
                                    if( paged > 1 ) {
                                        index = i + (item_amount * (paged - 1 ));
                                    }
                                    $( "#marker-" + title ).trigger( "click" );
                                }
                            });
        
                            $(this).on('mouseleave', function() {
                                $( ".mapboxgl-popup-close-button" ).trigger( "click" );
                            });
                        });

                        $('.map-event-zoom .area-places .place-item').each(function(i) {
                            var index = i;
                            
                            $(this).on('mouseenter', function() {
                                var title = $( this ).find( '.golo-add-to-wishlist' ).data( 'place-id' );
                                if(map) {
                                    if( paged > 1 ) {
                                        index = i + (item_amount * (paged - 1 ));
                                    }
                                    $( "#marker-" + title ).addClass( 'zoom' );
                                }
                            });
        
                            $(this).on('mouseleave', function() {
                                var title = $( this ).find( '.golo-add-to-wishlist' ).data( 'place-id' );
                                $( "#marker-" + title ).removeClass( 'zoom' );
                            });
                        });
                    });
                    
                    function flyToStore(currentFeature) {
                        map.flyTo({
                            center: currentFeature.geometry.coordinates,
                            bearing: 0,
                            duration: 0,
                            speed: 0.2, 
                            curve: 1, 
                            easing: function (t) {
                                return t;
                            }
                        });
                    }
                    
                    function createPopUp(currentFeature) {
                      var popUps = document.getElementsByClassName('mapboxgl-popup');
                      /** Check if there is already a popup on the map and if so, remove it */
                      if (popUps[0]) popUps[0].remove();
                      
                        var rating_html = '';
                        if( currentFeature.properties.rating ) {
                            rating_html = 
                            '<div class="place-rating">' +
                                '<span>' + currentFeature.properties.rating + '</span>' +
                                '<i class="la la-star"></i>' +
                            '</div>';
                        }
                    
                      var popup = new mapboxgl.Popup({ closeOnClick: false })
                        .setLngLat(currentFeature.geometry.coordinates)
                        .setHTML('<div class="golo-marker"><div class="inner-marker">' +
                        '<div class="entry-thumbnail">' +
                            '<a href="' + currentFeature.properties.url + '">' +
                                '<img src="' + currentFeature.properties.image_url + '" alt="' + currentFeature.properties.title + '">' +
                            '</a>' +
                        '</div>' +
                        '<div class="entry-detail">' +
                            '<div class="entry-head">' +
                                '<div class="place-cate list-item">' +
                                    currentFeature.properties.cate +
                                '</div>' +
                                '<div class="place-title">' +
                                    '<h3 class="entry-title"><a href="' + currentFeature.properties.url + '">' + currentFeature.properties.title + '</a></h3>' +
                                '</div>' +
                            '</div>' +
                            '<div class="entry-bottom">' +
                                '<div class="place-preview ' + review_status + '">' +
                                    rating_html +
                                    '<span class="place-reviews">(' + currentFeature.properties.review + ' reviews)</span>' +
                                '</div>' +
                                '<div class="place-price">' +
                                    '<span>' + currentFeature.properties.price + '</span>' +
                                '</div>' +
                            '</div>' + 
                        '</div>' +
                    '</div></div>')
                        .addTo(map);
                    }
                    
                    /* This will let you use the .remove() function later on */
                    if (!('remove' in Element.prototype)) {
                      Element.prototype.remove = function() {
                        if (this.parentNode) {
                          this.parentNode.removeChild(this);
                        }
                      };
                    }
                    
                    
                    map.on('click', function(e) {
                      /* Determine if a feature in the "locations" layer exists at that point. */
                      var features = map.queryRenderedFeatures(e.point, {
                        layers: ['locations']
                      });
                      
                      /* If yes, then: */
                      if (features.length) {
                        var clickedPoint = features[0];
                        
                        /* Fly to the point */
                        flyToStore(clickedPoint);
                        
                        /* Close all other popups and display popup for clicked store */
                        createPopUp(clickedPoint);
                        
                      }
                    });
                    
                    
                    
                    function addMarkers() {
                      /* For each feature in the GeoJSON object above: */
                      stores.features.forEach(function(marker) {
                        /* Create a div element for the marker. */
                        var el = document.createElement('div');
                        /* Assign a unique `id` to the marker. */
                        el.id = "marker-" + marker.properties.id;
                        /* Assign the `marker` class to each marker for styling. */
                        el.className = 'marker';
                        el.style.backgroundImage = 'url(' + marker.properties.icon + ')';
                        el.style.width = marker.properties.iconSize[0] + 'px';
                        el.style.height = marker.properties.iconSize[1] + 'px';
                        /**
                         * Create a marker using the div element
                         * defined above and add it to the map.
                        **/
                        new mapboxgl.Marker(el, { offset: [0, -23] })
                          .setLngLat(marker.geometry.coordinates)
                          .addTo(map);
                          
                          el.addEventListener('click', function(e){
                          /* Fly to the point */
                          flyToStore(marker);
                          /* Close all other popups and display popup for clicked store */
                          createPopUp(marker);
                          /* Highlight listing in sidebar */
                          var activeItem = document.getElementsByClassName('active');
                          e.stopPropagation();
                          if (activeItem[0]) {
                            activeItem[0].classList.remove('active');
                          }
                        });
                      });
                    }
                };
                
                // End Mapbox
            
            }
            
            GLF.element.display_clear();

            var page_item = $('.area-places').attr('data-item-amount');

            if( page_item ) {
                item_amount = page_item;
            }

            var type_pagination = $('.golo-pagination').attr('data-type');
            $('.area-places .place-item').addClass('skeleton-loading');

            $.ajax({
                dataType: 'json',
                url: ajax_url,
                data: {
                    'action': 'golo_pagination_ajax',
                    'paged': paged,
                    'title': title,
                    'item_amount': item_amount,
                    'price': price,
                    'sort_by': sort_by,
                    'cities': cities,
                    'categories': categories,
                    'types': types,
                    'amenities': amenities,
                    'neighborhood': neighborhood,
                    'current_term': current_term,
                    'type_term': type_term,
                    'city': city,
                    'location': location,
                    'place_type': place_type,
                    'place_layout': place_layout,
                    'open_now': open_now,
                },
                beforeSend: function () {
                    $('.filter-place-search .golo-loading-effect').fadeIn();
                },
                success: function(data) {
                    if ( maptype == 'google_map' ) {
                        
                        if( has_map ) {

                            golo_map = new google.maps.Map(document.getElementById('place-map-filter'), golo_search_map_option);
                            
                            //golo_input_search(golo_map);
                            google.maps.event.trigger(golo_map, 'resize');
                            if( data.success === true ) {
                                if ( data.places ) {
                                    var count_places = data.places.length;
                                }
                            }
    
                            if( count_places == 1 ) {
                                var boundsListener = google.maps.event.addListener((golo_map), 'bounds_changed', function (event) {
                                    this.setZoom(parseInt(googlemap_default_zoom));
                                    google.maps.event.removeListener(boundsListener);
                                });
                            }
                            
                            if( google_map_style !== '' ) {
                                var styles = JSON.parse(google_map_style);
                                golo_map.setOptions({styles: styles});
                            }
    
                            var mapPosition = new google.maps.LatLng('34.0207305', '-118.6919226');
                            golo_map.setCenter(mapPosition);
                            golo_map.setZoom(parseInt(googlemap_default_zoom));
                            google.maps.event.addListener(golo_map, 'tilesloaded', function () {
                                $('.filter-place-search .golo-loading-effect').fadeOut();
                            });


                        }
    
                        if( data.success === true ) {
                            if( has_map ) {
                                markers.forEach(function(marker) {
                                    marker.setMap(null);
                                });
    
                                markers = [];
                                golo_add_markers(data.places, golo_map);
                                //golo_my_location(golo_map);
                                golo_map.fitBounds(markers.reduce(function (bounds, marker) {
                                    return bounds.extend(marker.getPosition());
                                }, new google.maps.LatLngBounds()));
                            }    
                            
                            if( ajax_call == true ){
   
                                if( data.pagination_type == 'number' || pagination !== 'loadmore' ) {
                                    $('.area-places').html(data.place_html);
                                    $('.filter-neighborhood ul.neighborhood').html(data.filter_html);
                                    $('.golo-pagination .pagination').html(data.pagination);
                                    $('.archive-layout .result-count').html(data.count_post);
                                }else{
                                    $('.area-places').append(data.place_html);
                                    $('.filter-neighborhood ul.neighborhood').html(data.filter_html);
                                    if( data.hidden_pagination ) {
                                        $('.golo-pagination .pagination').html('');
                                    }
                                    $('.golo-pagination .pagination').removeClass('active');
                                }
    
                                GLF.element.waypoints();
                            }
    
                            if( has_map ) {
                                google.maps.event.trigger(golo_map, 'resize');
    
                                if( golo_template_vars.map_pin_cluster != 0 ) {
                                    marker_cluster = new MarkerClusterer(golo_map, markers, {
                                        gridSize: 60,
                                        styles: [
                                            {
                                                url: clusterIcon,
                                                width: 66,
                                                height: 65,
                                                textColor: "#fff"
                                            }
                                        ]
                                    });
                                }
    
                                if( !is_mobile ) {
                                    golo_infowindow_hover_trigger();
                                }
    
                                // setTimeout(function() { 
                                //     golo_infowindow_scroll_trigger();
                                // }, 50);
                                
                            }
                        }else{
                            if( ajax_call == true ){
                                if( data.pagination_type == 'number' || pagination !== 'loadmore' ) {
                                    $('.area-places').html('<div class="golo-ajax-result">' + not_place + '</div>');
                                    $('.archive-layout .result-count').html(data.count_post);
                                    $('.golo-pagination .pagination').html('');
                                }else{
                                    $('.area-places').append(data.place_html);
                                    if( data.hidden_pagination ) {
                                        $('.golo-pagination .pagination').html('');
                                    }
                                    $('.golo-pagination .pagination').removeClass('active');
                                }
                            }
                        }
    
                        if( has_map ) {
                            golo_map.fitBounds(markers.reduce(function (bounds, marker) {
                                return bounds.extend(marker.getPosition());
                            }, new google.maps.LatLngBounds()));
                            google.maps.event.trigger(golo_map, 'resize');
                        }
    
                        $('.area-places .place-item').removeClass('skeleton-loading');
                        
                    
                    } else if ( maptype == 'openstreetmap' ) {
                        
                        $('.filter-place-search .golo-loading-effect').fadeOut();
                        // if( has_map ) {
                        //     golo_osm_add_markers(data.places, maps);
                        // }
                        if( data.success === true ) {
                            
                            if( ajax_call == true ){

                                if( data.pagination_type == 'number' || pagination !== 'loadmore' ) {
                                    $('.area-places').html(data.place_html);
                                    $('.filter-neighborhood ul.neighborhood').html(data.filter_html);
                                    $('.golo-pagination .pagination').html(data.pagination);
                                    $('.archive-layout .result-count').html(data.count_post);
                                }else{
                                    $('.area-places').append(data.place_html);
                                    $('.filter-neighborhood ul.neighborhood').html(data.filter_html);
                                    if( data.hidden_pagination ) {
                                        $('.golo-pagination .pagination').html('');
                                    }
                                    $('.golo-pagination .pagination').removeClass('active');
                                }
    
                                GLF.element.waypoints();
                            }
                            
                            if( has_map ) {
                                
                                golo_osm_add_markers(data.places, maps);
    
                            }    
    
                        }else{
                            if( ajax_call == true ){

                                if( data.pagination_type == 'number' || pagination !== 'loadmore' ) {
                                    $('.area-places').html('<div class="golo-ajax-result">' + not_place + '</div>');
                                    $('.archive-layout .result-count').html(data.count_post);
                                    $('.golo-pagination .pagination').html('');
                                }else{
                                    $('.area-places').append(data.place_html);
                                    if( data.hidden_pagination ) {
                                        $('.golo-pagination .pagination').html('');
                                    }
                                    $('.golo-pagination .pagination').removeClass('active');
                                }
                            }
                        }
    
                        $('.area-places .place-item').removeClass('skeleton-loading');
                        
                    } else {
                        
                        $('.filter-place-search .golo-loading-effect').fadeOut();
                        if( has_map ) {
                            golo_mapbox_add_markers(data.places, map);
                        }
                        if( data.success === true ) {
                            if( has_map ) {
                                
                                golo_mapbox_add_markers(data.places, map);
    
                            }    
                            
                            if( ajax_call == true ){

                                if( data.pagination_type == 'number' || pagination !== 'loadmore' ) {
                                    $('.area-places').html(data.place_html);
                                    $('.filter-neighborhood ul.neighborhood').html(data.filter_html);
                                    $('.golo-pagination .pagination').html(data.pagination);
                                    $('.archive-layout .result-count').html(data.count_post);
                                }else{
                                    $('.area-places').append(data.place_html);
                                    $('.filter-neighborhood ul.neighborhood').html(data.filter_html);
                                    if( data.hidden_pagination ) {
                                        $('.golo-pagination .pagination').html('');
                                    }
                                    $('.golo-pagination .pagination').removeClass('active');
                                }
    
                                GLF.element.waypoints();
                            }
    
                        }else{
                            if( ajax_call == true ){
                                if( data.pagination_type == 'number' || pagination !== 'loadmore' ) {
                                    $('.area-places').html('<div class="golo-ajax-result">' + not_place + '</div>');
                                    $('.archive-layout .result-count').html(data.count_post);
                                    $('.golo-pagination .pagination').html('');
                                }else{
                                    $('.area-places').append(data.place_html);
                                    if( data.hidden_pagination ) {
                                        $('.golo-pagination .pagination').html('');
                                    }
                                    $('.golo-pagination .pagination').removeClass('active');
                                }
                            }
                        }
    
                        $('.area-places .place-item').removeClass('skeleton-loading');
                        
                    }
                    
                    
                },
            });
        },

        add_to_wishlist: function () {

            var burst = new mojs.Burst( {
                left    : 0,
                top     : 0,
                radius  : { 4: 32 },
                angle   : 45,
                count   : 14,
                children: {
                    radius     : 2.5,
                    fill       : wishlist_color,
                    scale      : {
                        1     : 0,
                        easing: 'quad.in'
                    },
                    pathScale  : [.8, null],
                    degreeShift: [13, null],
                    duration   : [500, 700],
                    easing     : 'quint.out'
                }
            } );
            burst.el.style.zIndex = 10;

            $('body').on('click', '.golo-add-to-wishlist', function (e) {
                e.preventDefault();
                if (!$(this).hasClass('on-handle')) {

                    var $this       = $(this).addClass('on-handle'),
                        place_inner = $this.closest('.place-inner').addClass('place-active-hover'),
                        place_id    = $this.attr('data-place-id'),
                        save        = '';

                    if( !$this.hasClass('added') ){
                        var offset = $this.offset(),
                            width  = $this.width(),
                            height = $this.height(),
                            coords = {
                                x: offset.left + width / 2,
                                y: offset.top + height / 2
                            };

                        burst.tune( coords ).replay();
                    }
                    
                    $.ajax({
                        type: 'post',
                        url: ajax_url,
                        dataType: 'json',
                        data: {
                            'action': 'golo_add_to_wishlist',
                            'place_id': place_id
                        },
                        beforeSend: function () {
                            $this.find('.icon-heart').html('<span class="golo-dual-ring"></span>');
                        },
                        success: function (data) {
                            if (data.added) {
                                save = wishlist_saved;
                                $this.removeClass('removed').addClass('added');
                                $this.parents('.place-item').removeClass('removed-wishlist');
                            } else {
                                 save = wishlist_save;
                                $this.removeClass('added').addClass('removed');
                                $this.parents('.place-item').addClass('removed-wishlist');
                            }
                            $this.children('i').removeClass('fa-spinner fa-spin');
                            if (typeof(data.added) == 'undefined') {
                                console.log('login?');
                            }
                            $this.removeClass('on-handle');
                            place_inner.removeClass('place-active-hover');
                            $this.html('<div class="icon-heart"><i class="la la-bookmark large"></i></div>');
                        },
                        error: function (xhr) {
                            var err = eval("(" + xhr.responseText + ")");
                            console.log(err.Message);
                            $this.children('i').removeClass('fa-spinner fa-spin');
                            $this.removeClass('on-handle');
                            place_inner.removeClass('place-active-hover');
                        }
                    });
                }
            });
        },

        ajax_search_location: function($this, list = 'show') {

            var location;

            location = $this.closest('.golo-ajax-search').find('input[name="place_location"]').val();

            if (cached_location[location]) {
                GLF.element.cache_result($this, cached_location[location], list);
            } else {
                $.ajax({
                    dataType: 'json',
                    cache: true,
                    url: ajax_url,
                    data: {
                        'action': 'golo_search_location_ajax',
                        'location': location,
                    },
                    success: function (data) {
                        if( data.success === true ) {
                            cached_location[location] = data.location_html;
                            GLF.element.cache_result($this, data.location_html, list);
                        }else{
                            cached_location[location] = '<div class="golo-ajax-result">' + no_results + '</div>';
                            $this.closest('.form-field').find('.area-result').empty().append('<div class="golo-ajax-result">' + no_results + '</div>');
                        }

                        if( list !== 'hide' ) {
                            $this.closest('.form-field').find('.area-result').show();
                            $this.closest('.golo-ajax-search').removeClass('active');
                        }

                        GLF.element.click_outside('.location-field','.focus-result');
                        GLF.element.click_search_location();
                    },
                });
            }
        },

        ajax_search: function($this, list = 'show') {

            var post_type, key, location, obj;

            post_type = $this.closest('.golo-ajax-search').find('input[name="post_type"]').val();
            key       = $this.closest('.golo-ajax-search').find('input[name="s"]').val();
            location  = $this.closest('.golo-ajax-search').find('input[name="place_location"]').val();

            obj = key + '_' + location;

            if (cached_html[obj]) {
                GLF.element.cache_result($this, cached_html[obj]);
            } else {
                
                $.ajax({
                    dataType: 'json',
                    cache: true,
                    url: ajax_url,
                    data: {
                        'action': 'golo_search_ajax',
                        'post_type': post_type,
                        'key': key,
                        'location': location,
                    },
                    beforeSend: function () {
                        $this.closest('.golo-ajax-search').addClass('active');
                    },
                    success: function (data) {
                        if( data.success === true ) {
                            cached_html[obj] = data.place_html;
                            GLF.element.cache_result($this, data.place_html, list);
                        }else{
                            cached_html[obj] = '<div class="golo-ajax-result">' + not_place + '</div>';
                            $this.closest('.form-field').find('.area-result').empty().append('<div class="golo-ajax-result">' + not_place + '</div>');
                        }

                        if( list !== 'hide' ) {
                            $this.closest('.form-field').find('.area-result').show();
                            $this.closest('.golo-ajax-search').removeClass('active');
                        }

                        GLF.element.click_outside('.input-field','.area-result');
                    },
                });
            }
        },

        cache_result: function($this, html, list = 'show') {
            $this.closest('.form-field').find('.area-result').empty().append(html);

            if( list !== 'hide' ) {
                $('.form-field .area-result').hide();
                $this.closest('.form-field').find('.area-result').show();
            }
        },

        click_search_location: function() {
            $('.location-result a').on('click', function(e) {
                e.preventDefault();
                var text = $(this).text();
                var id = $(this).data('ciid');
                
                var formField = $(this).closest('.form-field');
                formField.find('.location-search').val( text.trim() ).trigger('input', ['hide']);
                formField.find('input[name="ciid"]').val( id );
            });
            $('.type-result a').on('click', function(e) {
                e.preventDefault();
                var text = $(this).text();
                var id = $(this).data('tyid');

                var formField = $(this).closest('.form-field');
                formField.find('.type-search').val( text.trim() ).trigger('input');
                formField.find('input[name="tyid"]').val( id );
            });            

            $('.list-categories a').on('click', function(e) {
                e.preventDefault();
                var text = $(this).text();
                var id = $(this).data('caid');

                var formField = $(this).closest('.form-field');
                formField.find('.input-search').val( text.trim() ).trigger('input');
                formField.find('input[name="caid"]').val( id );
            });
        },

        ajax_booking_form: function($this) {

            var place_title, place_id, place_author_id, adults, childrens, booking_date, booking_time, place_coupon;

            place_title     = $this.find('input[name="place_title"]').val();
            place_id        = $this.find('input[name="place_id"]').val();
            place_author_id = $this.find('input[name="place_author_id"]').val();
            adults          = $this.find('input[name="adults"]').val();
            childrens       = $this.find('input[name="childrens"]').val();
            booking_date    = $this.find('input[name="booking_date"]').val();
            booking_time    = $this.find('input[name="booking_time"]').val();
            place_coupon    = $this.find('input[name="place_coupon"]').val();

            $.ajax({
                type: 'post',
                dataType: 'json',
                url: ajax_url,
                data: {
                    'action': 'golo_booking_form_ajax',
                    'place_title': place_title,
                    'place_id': place_id,
                    'place_author_id': place_author_id,
                    'adults': adults,
                    'childrens': childrens,
                    'booking_date': booking_date,
                    'booking_time': booking_time,
                    'place_coupon': place_coupon,
                },
                beforeSend: function () {
                    $this.find('.golo-loading-effect').fadeIn();
                },
                success: function (data) {
                    $this.find('.golo-loading-effect').fadeOut();
                    $this.find('.form-messages').removeClass('success warning');
                    if( data.success === true ) {
                        $this.find('.form-messages').addClass('success');
                        $this.find('.form-messages span').text(booking_success);
                    }else{
                        $this.find('.form-messages').addClass('warning');
                        $this.find('.form-messages span').text(booking_error);
                    }
                },
            });
        },

        ajax_claim_form: function($this) {

            var your_name, your_email, your_username, your_listing, place_id, messager;

            your_name           = $this.find('input[name="your_name"]').val();
            your_email          = $this.find('input[name="your_email"]').val();
            your_username       = $this.find('input[name="your_username"]').val();
            your_listing        = $this.find('input[name="your_listing"]').val();
            place_id            = $this.find('input[name="place_id"]').val();
            messager            = $this.find('textarea[name="messager"]').val();

            $.ajax({
                type: 'post',
                dataType: 'json',
                url: ajax_url,
                data: {
                    'action': 'golo_claim_form_ajax',
                    'your_name': your_name,
                    'your_email': your_email,
                    'your_username': your_username,
                    'your_listing': your_listing,
                    'place_id': place_id,
                    'messager': messager,
                },
                beforeSend: function () {
                    $this.find('.golo-loading-effect').fadeIn();
                },
                success: function (data) {
                    $this.find('.golo-loading-effect').fadeOut();
                    $this.find('.form-messages').removeClass('success warning');
                    if( data.success === true ) {
                        $this.find('.form-messages').addClass('success');
                        $this.find('.form-messages span').text(data.success_text);
                        $this.trigger("reset");
                    }else{
                        $this.find('.form-messages').addClass('warning');
                        $this.find('.form-messages span').text(data.error_text);
                    }
                },
            });
        },

        contact_agent_by_email: function() {
            $('.agent-contact-btn', '#contact-agent-form').each(function () {
                $(this).on('click', function (event) {
                    event.preventDefault();
                    var $this = $(this),
                        $form = $(this).parents('form'),
                        name = $('[name="sender_name"]', $form).val(),
                        phone = $('[name="sender_phone"]', $form).val(),
                        sender_email = $('[name="sender_email"]', $form).val(),
                        message = $('[name="sender_msg"]', $form).val(),
                        error = false;

                    $('.form-messages', $form).hide();

                    if(name == null || name.length === 0) {
                        $('.name-error', $form).removeClass('hidden');
                        error = true;
                    } else if(!$('.name-error', $form).hasClass('hidden')) {
                        $('.name-error', $form).addClass('hidden');
                    }
                    if(phone == null || phone.length === 0) {
                        $('.phone-error', $form).removeClass('hidden');
                        error = true;
                    } else if(!$('.phone-error', $form).hasClass('hidden')) {
                        $('.phone-error', $form).addClass('hidden');
                    }

                    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

                    if( sender_email == null || sender_email.length === 0 || !re.test(sender_email) ) {
                        $('.email-error', $form).removeClass('hidden');
                        if(sender_email.trim().length !== 0 && !re.test(sender_email)) {
                            $('.email-error', $form).text($('.email-error', $form).data('not-valid'));
                        } else {
                            $('.email-error', $form).text($('.email-error', $form).data('error'));
                        }
                        error = true;
                    } else if( !$('.email-error', $form).hasClass('hidden') ) {
                        $('.email-error', $form).addClass('hidden');
                    }
                    if( message == null || message.length === 0 ) {
                        $('.message-error', $form).removeClass('hidden');
                        error = true;
                    } else if( !$('.message-error', $form).hasClass('hidden') ) {
                        $('.message-error', $form).addClass('hidden');
                    }

                    if(!error) {
                        $.ajax({
                            type: 'post',
                            url: ajax_url,
                            dataType: 'json',
                            data: $form.serialize(),
                            beforeSend: function () {
                                $('.form-messages', $form).show();
                                $('.form-messages', $form).html('<span class="success text-success"> ' + sending_text + '</span>');
                            },
                            success: function (response) {
                                if (response.success) {
                                    $('.form-messages', $form).html('<span class="success text-success"><i class="lar la-check-circle icon-large"></i> ' + response.message + '</span>');                                    
                                    $("#contact-agent-form")[0].reset();
                                } else {
                                    $('.form-messages', $form).html('<span class="error text-danger"><i class="lar la-check-circle icon-large"></i> ' + response.message + '</span>');
                                }
                            },
                            error: function () {
                            }
                        });
                    }
                });
            });
        },

        load_unseen_notification: function($this) {
            (function poll() {
                $.ajax({
                    dataType: 'json',
                    url: ajax_url,
                    data: {
                        'action': 'golo_load_unseen_notification_ajax',
                    },
                    beforeSend: function () {
                        
                    },
                    success: function (data) {
                        $('.recent-notification .listing-detail').prepend(data.noti_html);
                        var limit = $('.recent-notification .listing-detail li').length;
                        if( limit > 20 ) {
                            $('.recent-notification .listing-detail li').last().remove();
                        }
                    },
                    complete: setTimeout(function() { 
                        poll();
                    }, 3000),
                });
            })();
        },
    }

    GLF.onReady = {
        init: function() {
            GLF.element.init();
        }
    };

    GLF.onLoad = {
        init: function() {
            
        }
    };

    GLF.onScroll = {
        init: function() {
            GLF.element.waypoints();
        }
    };

    GLF.onResize = {
        init: function() {
            // Resize Window
        }
    };

    $(document).ready(GLF.onReady.init);
    $(window).scroll(GLF.onScroll.init);
    $(window).resize(GLF.onResize.init);
    $(window).load(GLF.onLoad.init);

})(jQuery);