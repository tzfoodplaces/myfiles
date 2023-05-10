var GOLO = GOLO || {};

(function ($) {
    "use strict";

    var $body    = $('body');
    var ajax_url = theme_vars.ajax_url;

    GOLO.element = {
        init: function() {
            GOLO.element.rtl();
            GOLO.element.general();
            GOLO.element.retina_logo();
            GOLO.element.auto_close_loading_effect();
            GOLO.element.widget_catgories();
            GOLO.element.grid_main_query();
            GOLO.element.swiper_carousel();
            GOLO.element.WidgetGoloCarouselHandler();
            GOLO.element.slick_carousel();
            GOLO.element.main_menu();
            GOLO.element.dropdown_select();
            GOLO.element.elementor_header();
            GOLO.element.sticky_header();
            GOLO.element.popup();
            GOLO.element.toggle_popup();
            GOLO.element.nav_tabs();
            GOLO.element.placeholder();
            GOLO.element.validate_form();
            GOLO.element.forget_password();
    	},

        windowLoad: function() {
            this.page_loading_effect();
            this.handler_animation();
            this.handler_entrance_queue_animation();

            this.ajax_login_fb();
            this.ajax_login_google();
        },

        rtl: function() {
			if( $('body').attr( 'dir' ) == 'rtl' ){
				$('.elementor-section-stretched').each(function() {
					var val = $( this ).css( 'left' );
					$( this ).css( 'left', 'auto' );
					$( this ).css( 'right', val );
				});
			}
        },

        general: function() {
            $('.mobile-menu .account .user-show').on('click', function(e) {
                e.preventDefault();
                $(this).parent().toggleClass('active');
            });

            $('.block-search.search-icon').on('click', function(e) {
                e.preventDefault();
                $('.search-form-wrapper.canvas-search').addClass('on');
            });

            $('.canvas-search').on('click', '.btn-close,.bg-overlay', function(e) {
                e.preventDefault();
                $(this).parents('.canvas-search').removeClass('on');
                $('body').css('overflow', 'auto');
            });

            $('.block-search.search-input').on('keyup', '.input-search', function(e) {
                e.preventDefault();
                if( $(this).val().length > 0 ) {
                    $(this).closest('.search-input').addClass('has-clear');
                }else{
                    $(this).closest('.search-input').removeClass('has-clear');
                }
            });

            $('.block-search.search-input').on('click', '.icon-clear', function(e) {
                e.preventDefault();
                $(this).closest('.search-input').find('.input-search').val('');
                $(this).closest('.search-input').removeClass('has-clear');
            });

            var offset_control = 0;
            var has_wpadminbar = $('#wpadminbar').length;
            var wpadminbar     = 0;
            if( has_wpadminbar > 0 ){
                wpadminbar = $('#wpadminbar').height();
                $('.tax-place-city .nav-categories').addClass('has-wpadminbar');
            }
            if( $('.tax-place-city .nav-categories').length > 0 ){
                var offset_control = $('.tax-place-city .nav-categories').offset().top;
            }

            $(window).scroll( function(){
                var Pos = $(this).scrollTop();
                if (Pos > offset_control - wpadminbar ){
                    $('.tax-place-city .nav-categories').addClass('on');
                }else{
                    $('.tax-place-city .nav-categories').removeClass('on');
                }
            });

        },

        retina_logo: function () {
            if (window.matchMedia('only screen and (min--moz-device-pixel-ratio: 1.5)').matches
                || window.matchMedia('only screen and (-o-min-device-pixel-ratio: 3/2)').matches
                || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 1.5)').matches
                || window.matchMedia('only screen and (min-device-pixel-ratio: 1.5)').matches) {
                $('.site-logo img').each(function() {
                    $(this).addClass('logo-retina');
                    $(this).attr('src', $(this).data('retina'));
                });
            }
        },

        page_loading_effect: function() {
            $('.page-loading-effect').addClass('visibility');
            $('.place-item').removeClass('skeleton-loading');

            setTimeout( function() {
                $('.page-loading-effect').remove();
            }, 2000 );
        },

        auto_close_loading_effect: function() {
            setTimeout(function(){ 
                $('.page-loading-effect').remove();
            }, 2000);
        },

        handler_animation: function() {
            var items = $( '.modern-grid' ).children( '.grid-item' );

            items.waypoint( function() {
                // Fix for different ver of waypoints plugin.
                var _self = this.element ? this.element : this;
                var $self = $( _self );
                $self.addClass( 'animate' );
            }, {
                offset: '100%',
                triggerOnce: true
            } );
        },

        handler_entrance_queue_animation: function() {
            var animateQueueDelay  = 200,
                queueResetDelay;
            $( '.golo-entrance-animation-queue' ).each( function() {
                var itemQueue  = [],
                    queueTimer,
                    queueDelay = $( this ).data( 'animation-delay' ) ? $( this ).data( 'animation-delay' ) : animateQueueDelay;

                $( this ).children( '.item' ).waypoint( function() {
                    // Fix for different ver of waypoints plugin.
                    var _self = this.element ? this.element : $( this );

                    queueResetDelay = setTimeout( function() {
                        queueDelay = animateQueueDelay;
                    }, animateQueueDelay );

                    itemQueue.push( _self );
                    GOLO.element.process_item_queue( itemQueue, queueDelay, queueTimer );
                    queueDelay += animateQueueDelay;
                }, {
                    offset: '100%',
                    triggerOnce: true
                } );
            } );
        },

        process_item_queue: function( itemQueue, queueDelay, queueTimer, queueResetDelay ) {
            clearTimeout( queueResetDelay );
            queueTimer = window.setInterval( function() {
                if ( itemQueue !== undefined && itemQueue.length ) {
                    $( itemQueue.shift() ).addClass( 'animate' );
                    GOLO.element.process_item_queue();
                } else {
                    window.clearInterval( queueTimer );
                }
            }, queueDelay );
        },

        widget_catgories: function() {
            $('.widget_categories>ul>li').each( function(){
                if( $(this).find('.children').length > 0 ){
                    $(this).append('<i class="las la-plus"></i>');
                    $(this).on('click', function(){
                        $(this).toggleClass('active');
                    });
                    $('.widget_categories>ul>li a').on('click', function(e){
                        e.stopPropagation();
                    });
                }
            });
            
            $('.widget_product_categories .product-categories>li.cat-parent,.widget_nav_menu ul.menu>li.menu-item-has-children,.widget_pages>ul>li.page_item_has_children').append('<i class="las la-plus"></i>');
            $('.widget_product_categories .product-categories>li.cat-parent,.widget_nav_menu ul.menu>li.menu-item-has-children,.widget_pages>ul>li.page_item_has_children').on('click', function(){
                $(this).toggleClass('active');
            });

            $('.widget_product_categories .product-categories>li a,.widget_nav_menu ul.menu>li.menu-item-has-children a,.widget_pages>ul>li.page_item_has_children a').on('click', function(e){
                e.stopPropagation();
            });
        },

        grid_main_query: function() {
            $( '.golo-main-post' ).GoloGridLayout();
        },

        swiper_carousel: function() {
            $( '.golo-slider' ).each( function() {
                if ( $( this ).hasClass( 'golo-swiper-linked-yes' ) ) {
                    var mainSlider = $( this ).children( '.golo-main-swiper' ).GoloSwiper();
                    var thumbsSlider = $( this ).children( '.golo-thumbs-swiper' ).GoloSwiper();

                    mainSlider.controller.control = thumbsSlider;
                    thumbsSlider.controller.control = mainSlider;
                } else {
                    $( this ).GoloSwiper();
                }
            } );
        },

        WidgetGoloCarouselHandler: function () {

            $( '.golo-carousel-activation' ).each( function() {
                var carousel_elem = $(this);

                if ( carousel_elem.length > 0 ) {

                    var settings = carousel_elem.data('settings');
                    var arrows = settings['arrows'];
                    var arrow_prev_txt = settings['arrow_prev_txt'];
                    var arrow_next_txt = settings['arrow_next_txt'];
                    var dots = settings['dots'];
                    var autoplay = settings['autoplay'];
                    var autoplay_speed = parseInt(settings['autoplay_speed']) || 3000;
                    var animation_speed = parseInt(settings['animation_speed']) || 300;
                    var pause_on_hover = settings['pause_on_hover'];
                    var center_mode = settings['center_mode'];
                    var center_padding = settings['center_padding'] ? settings['center_padding'] : '50px';
                    var display_columns = parseInt(settings['display_columns']) || 1;
                    var scroll_columns = parseInt(settings['scroll_columns']) || 1;
                    var tablet_width = parseInt(settings['tablet_width']) || 800;
                    var tablet_display_columns = parseInt(settings['tablet_display_columns']) || 1;
                    var tablet_scroll_columns = parseInt(settings['tablet_scroll_columns']) || 1;
                    var mobile_width = parseInt(settings['mobile_width']) || 480;
                    var mobile_display_columns = parseInt(settings['mobile_display_columns']) || 1;
                    var mobile_scroll_columns = parseInt(settings['mobile_scroll_columns']) || 1;
                    var carousel_style_ck = parseInt( settings['carousel_style_ck'] ) || 1;

                    if( carousel_style_ck == 4 ){
                        carousel_elem.slick({
                            arrows: arrows,
                            prevArrow: '<button class="golo-carosul-prev">'+arrow_prev_txt+'</button>',
                            nextArrow: '<button class="golo-carosul-next">'+arrow_next_txt+'</button>',
                            dots: dots,
                            customPaging: function( slick,index ) {
                                var data_title = slick.$slides.eq(index).find('.golo-data-title').data('title');
                                return '<h6>'+data_title+'</h6>';
                            },
                            infinite: true,
                            autoplay: autoplay,
                            autoplaySpeed: autoplay_speed,
                            speed: animation_speed,
                            fade: false,
                            pauseOnHover: pause_on_hover,
                            slidesToShow: display_columns,
                            slidesToScroll: scroll_columns,
                            centerMode: center_mode,
                            centerPadding: center_padding,
                            responsive: [
                                {
                                    breakpoint: tablet_width,
                                    settings: {
                                        slidesToShow: tablet_display_columns,
                                        slidesToScroll: tablet_scroll_columns
                                    }
                                },
                                {
                                    breakpoint: mobile_width,
                                    settings: {
                                        slidesToShow: mobile_display_columns,
                                        slidesToScroll: mobile_scroll_columns
                                    }
                                }
                            ]
                        });
                    }else{
                        carousel_elem.slick({
                            arrows: arrows,
                            prevArrow: '<button class="golo-carosul-prev">'+arrow_prev_txt+'</button>',
                            nextArrow: '<button class="golo-carosul-next">'+arrow_next_txt+'</button>',
                            dots: dots,
                            infinite: true,
                            autoplay: autoplay,
                            autoplaySpeed: autoplay_speed,
                            speed: animation_speed,
                            fade: false,
                            pauseOnHover: pause_on_hover,
                            slidesToShow: display_columns,
                            slidesToScroll: scroll_columns,
                            centerMode: center_mode,
                            centerPadding: center_padding,
                            responsive: [
                                {
                                    breakpoint: tablet_width,
                                    settings: {
                                        slidesToShow: tablet_display_columns,
                                        slidesToScroll: tablet_scroll_columns
                                    }
                                },
                                {
                                    breakpoint: mobile_width,
                                    settings: {
                                        slidesToShow: mobile_display_columns,
                                        slidesToScroll: mobile_scroll_columns
                                    }
                                }
                            ]
                            
                        });
                    }

                }
            });
        },

        slick_carousel: function() {
			var rtl = false;
			if( $( 'body' ).hasClass( 'rtl' ) ) {
				rtl = true;
			}
            $('.slick-carousel').each(function () {
                var slider = $(this);
                var defaults = {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    arrows: true,
                    prevArrow: '<div class="gl-prev slick-arrow"><i class="la la-arrow-left large"></i></div>',
                    nextArrow: '<div class="gl-next slick-arrow"><i class="la la-arrow-right large"></i></div>',
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
                    defaults['prevArrow'] = '<div class="gl-prev"><i class="la la-arrow-left large"></i></div>';
                    defaults['nextArrow'] = '<div class="gl-next"><i class="la la-arrow-right large"></i></div>';
                }

                var config = $.extend({}, defaults, slider.data("slick"));
                // Initialize Slider
                slider.slick(config);
            });
        },

    	main_menu: function() {
    		$('.default-menu .menu-item-has-children>a,.site-menu .page_item_has_children>a').append('<i class="la la-angle-down"></i>');
            
    		$('.canvas-menu .menu-item-has-children>a,.canvas-menu .page_item_has_children>a').on('click', function(e){
                e.preventDefault();
                e.stopPropagation();
                var parent = $(this).parent();
                if( parent.hasClass('active') ){
                    parent.removeClass('active');
                    parent.find('>.sub-menu,>.children').slideUp(300);
                }else{
                    if( $(this).parents('.menu-item-has-children,.page_item_has_children').hasClass('active') == false ){
                        $('.canvas-menu li>.sub-menu,.canvas-menu li>.children').slideUp(300);
                        $('.canvas-menu li').removeClass('active');
                    }
                    parent.find('>.sub-menu,>.children').slideDown(300);
                    parent.addClass('active');
                }
            });
            
    		// Open Canvas Menu
            $('.canvas-menu').on('click', '.icon-menu', function(e) {
            	e.preventDefault();
                $(this).parents('.canvas-menu').toggleClass('active');
            });

            // Close Canvas Menu
            $('.canvas-menu').on('click', '.btn-close,.bg-overlay', function(e) {
            	e.preventDefault();
                $(this).parents('.canvas-menu').removeClass('active');
                $('body').css('overflow', 'auto');
            });

            // Check Sub Menu
            $('.site-menu .sub-menu').each( function() {
                var width  = $(this).outerWidth();

                if( width > 0 ) {
                    var offset = $(this).offset();
                    var w_body = $('body').outerWidth();
                    var left = offset.left;
                    if( w_body < left + width ) {
                        $(this).css('left', '-100%');
                    }
                }
            });
    	},

        dropdown_select: function() {
            $('.dropdown-select').on('click', '.entry-show', function() {
                $(this).parent().toggleClass('active');
            });
            GOLO.element.click_outside('.dropdown-select');
        },

        click_outside: function(element) {
            $(document).on('click', function(event){
                var $this = $(element);
                if($this !== event.target && !$this.has(event.target).length){
                    $this.removeClass('active');
                }            
            });
        },

        elementor_header: function() {
            if( theme_vars.sticky_header == 1 ) {
                
                if( theme_vars.sticky_header_homepage == 1 ) {
                    $('.home .elementor-location-header .elementor-section-wrap>.elementor-element').addClass('uxper-sticky');
                }else{
                    $('.elementor-location-header .elementor-section-wrap>.elementor-element').addClass('uxper-sticky');
                }
            }

            if( theme_vars.float_header == 1 ) {

                if( theme_vars.float_header_homepage == 1 ) {
                    $('.home .elementor-location-header .elementor-section-wrap>.elementor-element').addClass('uxper-float');
                }else{
                    $('.elementor-location-header .elementor-section-wrap>.elementor-element').addClass('uxper-float');
                }
            }
        },

        sticky_header: function() {

            var offset = '';
            if( $('header.site-header').length > 0 ){
                offset = $('header.site-header').offset().top;
            }
            var has_wpadminbar = $('#wpadminbar').length;
            var wpadminbar = 0;
            var lastScroll = 0;
            if( has_wpadminbar > 0 ){
                wpadminbar = $('#wpadminbar').height();
                $('.sticky-header').addClass('has-wpadminbar');
            }
            if ( $(window).scrollTop() > offset - wpadminbar ) {
                $('.sticky-header').addClass('on');
            }
            $(window).scroll( function(){
                if ( $(window).scrollTop() > offset - wpadminbar ) {
                    $('.sticky-header').addClass('on');
                } else {
                    $('.sticky-header').removeClass('on');
                }
            });
        },

        popup: function() {
            $('.golo-on-popup').on('click', function(event) {
                event.preventDefault();
                var id = $(this).attr('href');
                $(id).addClass('active');
                $('body').addClass( 'open-popup' );
            });

            $('.golo-popup').on('click', '.btn-close,.bg-overlay', function() {
                $(this).parents('.golo-popup').removeClass('active');
                $('body').removeClass( 'open-popup' );
                $('body').css('overflow', 'auto');

            });
        },

        toggle_popup: function() {
            $('.popup').on('click', '.bg-overlay, .btn-close', function(e) {
                e.preventDefault();
                $('body').css('overflow', 'auto');
                $('body').removeClass( 'open-popup' );
                $(this).parents('.popup').removeClass('open');
                $( '.site-header' ).removeClass( 'show-popup' );
            });

            $('.btn-open-popup').on('click', function(e) {
                e.preventDefault();
                $('body').css('overflow', 'hidden');
                $('body').addClass( 'open-popup' );
                $('.popup').removeClass('open');
                $(this).parent().find('.popup').addClass('open');
                $( '.site-header' ).addClass( 'show-popup' );
            });

            $('#secondary .place-booking .btn-open-popup').on('click', function(e){
                e.preventDefault();
                $('body').css('overflow', 'auto');
            });

            $('.btn-open-claim').on('click', function(e) {
                e.preventDefault();
                $('body').css('overflow', 'hidden');
                $('body').addClass( 'open-popup' );
                $('.popup').removeClass('open');
                $(this).parents('.claim-badge').find('.popup').addClass('open');
                $( '.site-header' ).addClass( 'show-popup' );
            });

            $('.logged-out a').on('click', function(e) {
                e.preventDefault();
                $('body').css('overflow', 'hidden');
                var tab = $(this).attr('class');
                $('.tabs-form a').removeClass('active');
                if( tab.indexOf('btn-login') != -1 ){
                    $('.tabs-form a.btn-login').addClass('active');
                }
                if( tab.indexOf('btn-register') != -1 ){
                    $('.tabs-form a.btn-register').addClass('active');
                }
                $('.form-account').removeClass('active');
                $('.canvas-menu').removeClass('active');
                var form_id = $('.tabs-form a.active').attr('href');
                $(form_id).addClass('active');
                $('.popup').removeClass('open');
                var id = $(this).attr('href');
                $(id).addClass('open');
            });
        },

        nav_tabs: function() {
            $('.tabs-form a').on('click', function(e) {
                e.preventDefault();
                $('.tabs-form a').removeClass('active');
                $(this).addClass('active');
                $('.form-account').removeClass('active');
                var id = $(this).attr('href');
                $(id).addClass('active');
            });

            $('.tab-group > ul li a').on('click', function(e) {
                e.preventDefault();
                $('.tab-group > ul li').removeClass('active');
                $(this).parent().addClass('active');
                $('.tab-group .tab').removeClass('active');
                var id = $(this).attr('href');
                $(id).addClass('active');
            });

            $('.btn-reset-password').on('click', function(e) {
                e.preventDefault();
                $('#ux-login').removeClass('active');
                $('.golo-reset-password-wrap').addClass('active');
            });

            $('.back-to-login').on('click', function(e) {
                e.preventDefault();
                $('.golo-reset-password-wrap').removeClass('active');
                $('#ux-login').addClass('active');
            });
        },

        placeholder: function() {
            $('.form-group .label-field').on('click', function() {
                $(this).parent().find('input-field').focus();
            });
            $('.form-group .input-field').each(function() {
                var inputValue = $(this).val();
                if ( inputValue == "" ) {
                    $(this).parent().removeClass('focused');  
                } else {
                    $(this).parent().addClass('focused');
                }
                $(this).on('focus', function(){
                    $(this).parent().addClass('focused');
                });
                $(this).on('blur', function(){
                    var inputValue = $(this).val();
                    if ( inputValue == '' ) {
                        $(this).parent().removeClass('focused');  
                    }
                });
            });
        },

        validate_form: function() {
            $('#ux-login').validate({
                rules: {
                    email: {
                        required: true,
                    },
                    password: {
                        required: true,
                        minlength: 5,
                        maxlength: 30
                    }
                },
                submitHandler: function(form) {
                    $.ajax({
                        url: ajax_url,
                        type: 'POST',
                        cache: false,
                        dataType: 'json',
                        data: {
                            email: $('#ip_email').val(),
                            password: $('#ip_password').val(),
                            captcha: $('#ux-login .golo-captcha').val(),
                            action: 'get_login_user',
                        },
                        beforeSend: function () {
                            $('.popup-account p.msg').removeClass('text-error text-success text-warning');
                            $('.popup-account p.msg').text(theme_vars.send_user_info);
                            $('#ux-login p.msg').show();
                            $('.popup-account .loading-effect').fadeIn();
                        },
                        success: function(data) {
          
                            $('.popup-account p.msg').text(data.messages);
                            if( data.success != true ) {
                                $('#ux-login p.msg').addClass(data.class);
                            } else { 
                                if (data.url_redirect) {
                                    window.location.href = data.url_redirect
                                } else {
                                    location.reload();
                                }
                            }
                            $('.popup-account .loading-effect').fadeOut();
                        }
                    });
                }
            });
            $('#ux-register').validate({
                rules: {
                    reg_firstname: {
                        required: true,
                    },
                    reg_lastname: {
                        required: true,
                    },
                    reg_email: {
                        required: true,
                        email: true
                    },
                    reg_password: {
                        required: true,
                        minlength: 5,
                        maxlength: 20
                    },
                    accept_account: {
                        required: true,
                    }
                },
                submitHandler: function(form) {
                    $.ajax({
                        url: ajax_url,
                        type: 'POST',
                        cache: false,
                        dataType: 'json',
                        data: {
                            account_type: $('input[name="account_type"]:checked').val(),
                            firstname: $('#ip_reg_firstname').val(),
                            lastname: $('#ip_reg_lastname').val(),
                            companyname: $('#ip_reg_company_name').val(),
                            email: $('#ip_reg_email').val(),
                            password: $('#ip_reg_password').val(),
                            captcha: $('#ux-register .golo-captcha').val(),
                            action: 'get_register_user',
                        },
                        beforeSend: function () {
                            $('.popup-account p.msg').removeClass('text-error text-success text-warning');
                            $('.popup-account p.msg').text(theme_vars.send_user_info);
                            $('#ux-register p.msg').show();
                            $('.popup-account .loading-effect').fadeIn();
                        },
                        success: function(data) {
                            $('.popup-account p.msg').text(data.messages);
                            if( data.success != true ) {
                                $('#ux-register p.msg').addClass(data.class);
                            } else {
                                if (data.url_redirect) {
                                    window.location.href = data.url_redirect
                                } else {
                                    location.reload();
                                }
                            }
                            $('.popup-account .loading-effect').fadeOut();
                        }
                    });
                }
            });
            jQuery.extend(jQuery.validator.messages, {
                required: "This field is required",
                remote: "Please fix this field",
                email: "A valid email address is required",
                url: "Please enter a valid URL",
                date: "Please enter a valid date",
                dateISO: "Please enter a valid date (ISO)",
                number: "Please enter a valid number.",
                digits: "Please enter only digits",
                creditcard: "Please enter a valid credit card number",
                equalTo: "Please enter the same value again",
                accept: "Please enter a value with a valid extension",
                maxlength: jQuery.validator.format("Please enter no more than {0} characters"),
                minlength: jQuery.validator.format("Please enter at least {0} characters"),
                rangelength: jQuery.validator.format("Please enter a value between {0} and {1} characters long"),
                range: jQuery.validator.format("Please enter a value between {0} and {1}"),
                max: jQuery.validator.format("Please enter a value less than or equal to {0}"),
                min: jQuery.validator.format("Please enter a value greater than or equal to {0}")
            });
        },

        forget_password: function($this) {
            $('.forgot-password').on('click', function() {
                $('.golo-resset-password-wrap').slideToggle();
            });

            $('#golo_forgetpass').on('click',function (e) {
                e.preventDefault();
                var $form = $(this).parents('form');
                $('#ux-login p.error').hide();

                $.ajax({
                    type: 'post',
                    url: ajax_url,
                    dataType: 'json',
                    data: $form.serialize(),
                    beforeSend: function () {
                        $('.popup-account p.msg').removeClass('text-error text-success text-warning');
                        $('.popup-account p.msg').text(theme_vars.forget_password);
                        $('.golo-reset-password-wrap p.msg').show();
                        $('.popup-account .loading-effect').fadeIn();
                    },
                    success: function(data) {
                        $('.golo-reset-password-wrap p.msg').text(data.message);
                        $('.golo-reset-password-wrap p.msg').addClass(data.class);
                        $('.popup-account .loading-effect').fadeOut();
                    },
                });
            });

            $( '.generate-password' ).on( 'click', function(e) {
                e.preventDefault();
                var Password = {
 
                    _pattern : /[a-zA-Z0-9_\-\+\.\}\{\?\!\@\#\$\%\&\*\~]/,
                      
                      
                    _getRandomByte : function() {
                        // http://caniuse.com/#feat=getrandomvalues
                        if(window.crypto && window.crypto.getRandomValues) 
                        {
                          var result = new Uint8Array(1);
                          window.crypto.getRandomValues(result);
                          return result[0];
                        }
                        else if(window.msCrypto && window.msCrypto.getRandomValues) 
                        {
                          var result = new Uint8Array(1);
                          window.msCrypto.getRandomValues(result);
                          return result[0];
                        }
                        else
                        {
                          return Math.floor(Math.random() * 256);
                        }
                    },
                      
                    generate : function(length) {
                        return Array.apply(null, {'length': length})
                          .map(function()
                          {
                            var result;
                            while(true) 
                            {
                              result = String.fromCharCode(this._getRandomByte());
                              if(this._pattern.test(result))
                              {
                                return result;
                              }
                            }        
                          }, this)
                          .join('');  
                    }    
                        
                };
                $( '#new-password' ).val(Password.generate(24));
                $( '#new-password-error' ).fadeOut();
            });

            $('.control-password span').on('click', function() {
                var _this = $( this );
                if( _this.hasClass( 'active' ) ){
                    _this.removeClass( 'active' );
                    $( '#new-password' ).attr( 'type', 'text' );
                } else {
                    _this.addClass( 'active' );
                    $( '#new-password' ).attr( 'type', 'password' );
                }
            });

            $('.golo-new-password-wrap form').validate({
                rules: {
                    new_password: {
                        required: true,
                        minlength : 8,
                    },
                },
                submitHandler: function(form) {
                    var new_password = $(form).find( 'input[name="new_password"]' ).val();
                    var login = $(form).find( 'input[name="login"]' ).val();

                    $.ajax({
                        type: 'POST',
                        url: ajax_url,
                        data:  {
                            new_password: new_password,
                            login: login,
                            action: 'change_password_ajax',
                        }, 
                        beforeSend: function () {
                            $('.popup-account p.msg').removeClass('text-error text-success text-warning');
                            $('.popup-account p.msg').text(theme_vars.change_password);
                            $('.golo-new-password-wrap p.msg').show();
                            $('.popup-account .loading-effect').fadeIn();
                        },
                        success: function(data) {
                            var data = $.parseJSON(data);
                            $('.golo-new-password-wrap p.msg').text(data.message);
                            $('.golo-new-password-wrap p.msg').addClass(data.class);
                            $('.popup-account .loading-effect').fadeOut();

                            var baseurl = window.location.origin+window.location.pathname;

                            window.location.href = baseurl;
                        },
                    });
                },
            });

            // $('#golo_newpass').on('click',function (e) {
            //     e.preventDefault();
            //     var $form = $(this).parents('form');
            //     var new_password = $form.find( 'input[name="new_password"]' ).val();
            //     var login = $form.find( 'input[name="login"]' ).val();

            //     $.ajax({
            //         type: 'POST',
            //         url: ajax_url,
            //         data:  {
            //             new_password: new_password,
            //             login: login,
            //             action: 'change_password_ajax',
            //         }, 
            //         beforeSend: function () {
            //             $('.popup-account p.msg').removeClass('text-error text-success text-warning');
            //             $('.popup-account p.msg').text(theme_vars.change_password);
            //             $('.golo-new-password-wrap p.msg').show();
            //             $('.popup-account .loading-effect').fadeIn();
            //         },
            //         success: function(data) {
            //             var data = $.parseJSON(data);
            //             $('.golo-new-password-wrap p.msg').text(data.message);
            //             $('.golo-new-password-wrap p.msg').addClass(data.class);
            //             $('.popup-account .loading-effect').fadeOut();
            //         },
            //     });
            // });
        },

        ajax_login_fb: function() {
            $('.facebook-login').on('click', function() {
                FB.login(function(response) {
                    if (response.status === 'connected') {
                        FB.api('/me', {fields: 'id,name,email,short_name'}, function(response) {
                            $.ajax({
                                url : ajax_url,
                                type: 'POST',
                                data: {
                                    id: response.id,
                                    email: response.email,
                                    name: response.name,
                                    action: 'fb_ajax_login_or_register',
                                },                            
                                success: function(data){
                                    var data = $.parseJSON(data);
                                    if (data.success == true){
                                        location.reload();
                                    }
                                }
                            });
                        });
                    }
                }, {scope: 'public_profile,email'});
            });
        },

        ajax_login_google: function(googleUser) {
            var google_id = theme_vars.google_id;
            $('.google-login').on('click', function(e) {
                e.preventDefault();

                gapi.load('auth2', function() {

                    var scopes = [
                        'https://www.googleapis.com/auth/userinfo.email',
                        'https://www.googleapis.com/auth/userinfo.profile',
                        'https://www.googleapis.com/auth/plus.login'
                    ];

                    var auth2;

                    // Use gapi.auth2.authorize instead of gapi.auth2.init.
                    // This is because I only need the data from Google once.
                    auth2 = gapi.auth2.init({
                        'client_id': google_id,
                        'cookie_policy': 'single_host_origin',
                        'fetch_basic_profile': true,
                        'ux_mode': 'popup',
                        'scope': scopes.join(' '),
                        'prompt': 'select_account'
                    });

                    auth2.signIn().then(() => {
                        var profile = auth2.currentUser.get().getBasicProfile();
                        $.ajax({
                            url: ajax_url,
                            type: 'POST',
                            data: {
                                action: 'google_ajax_login_or_register',
                                id: profile.getId(),
                                name: profile.getName(),
                                avatar: profile.getImageUrl(),
                                email: profile.getEmail(),
                            },
                            beforeSend: function () {
                                $('.popup-account p.msg').removeClass('text-error text-success text-warning');
                                $('.popup-account p.msg').text(theme_vars.forget_password);
                                $('.popup-account p.msg').show();
                                $('.popup-account .loading-effect').fadeIn();
                            },
                            success: function(data) {
                                var data = $.parseJSON(data);
                                $('.popup-account p.msg').text(data.messages);
                                $('.popup-account p.msg').addClass(data.class);
                                if ( data.success == true ) {
                                    location.reload();                              
                                }
                                $('.popup-account .loading-effect').fadeOut();
                            }
                        });
                    }).catch((error) => {
                        console.error('Google Sign Up or Login Error: ', error)
                    });          

                });
            });
        }
    }

    GOLO.woocommerce = {
        init: function() {
            GOLO.woocommerce.nice_select();
            GOLO.woocommerce.quantity();
            GOLO.woocommerce.reset_variations();
        },

        nice_select: function() {
            $('.woocommerce-ordering select.orderby').addClass('right');
            $('.woocommerce-ordering select.orderby').niceSelect();
            $('.woocommerce div.product form.cart .variations select').addClass('wide');
            $('.woocommerce div.product form.cart .variations select').niceSelect();
        },

        reset_variations: function() {
            $('body').on('click', '.reset_variations', function() {
                $('.woocommerce div.product form.cart .variations select').niceSelect('update');
            });
        },

        quantity: function() {
            $('body').on('click', '.entry-quantity .plus', function(e) {
                var input = $(this).parents('.entry-quantity').find('.input-text.qty');
                var val = parseInt(input.val()) + 1;
                input.attr('value',val);
                $('.button[name="update_cart"]').prop('disabled', false);
            });
            $('body').on('click', '.entry-quantity .minus', function(e) {
                var input = $(this).parents('.entry-quantity').find('.input-text.qty');
                var val = parseInt(input.val()) - 1;
                if(input.val() > 0) input.attr('value',val);
                $('.button[name="update_cart"]').prop('disabled', false);
            });
        },
    }

    GOLO.onReady = {
        init: function() {
            GOLO.element.init();
            GOLO.woocommerce.init();
        }
    };

    GOLO.onLoad = {
        init: function() {
            GOLO.element.windowLoad();
        }
    };

    GOLO.onScroll = {
        init: function() {
            // Scroll Window
        }
    };

    GOLO.onResize = {
        init: function() {
            // Resize Window
        }
    };

    $(document).ready(GOLO.onReady.init);
    $(window).scroll(GOLO.onScroll.init);
    $(window).resize(GOLO.onResize.init);
    $(window).load(GOLO.onLoad.init);

})(jQuery);
