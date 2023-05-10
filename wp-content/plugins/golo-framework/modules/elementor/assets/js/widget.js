var ISF = ISF || {};

(function ($) {
    "use strict";

    var Widget_Golo_Nav_Menu = function () {

        $('.elementor-widget-golo-nav-menu ul.elementor-nav-menu>li.menu-item-has-children>a').append('<span class="sub-arrow"><i class="fa"></i></span>');
    }

    var Widget_Reload_Testimonial = function () {

        $('.testimonial-slider-for').slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: true,
            fade: true,
            asNavFor: '.testimonial-slider-nav'
        });

        $('.testimonial-slider-nav').slick({
            slidesToShow: 5,
            slidesToScroll: 1,
            asNavFor: '.testimonial-slider-for',
            dots: false,
            arrows: false,
            centerMode: true,
            centerPadding: '0px',
            focusOnSelect: true,
            infinite: true,
        });
    }

    /******************* Refresh after live preview *********************/
    var Widget_Reload_Carousel = function ($scope, $) {

        var carousel_elem = $scope.find('.elementor-carousel').eq(0);
        if (carousel_elem.length > 0) {
            var settings = carousel_elem.data('slider_options');

            if (settings['isslick'] == 'false') {
                alert(settings['isslick']);
                carousel_elem.unslick();
            } else {
                carousel_elem.slick( settings );
            }
        }
    }

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction('frontend/element_ready/places.default', Widget_Reload_Carousel);
        elementorFrontend.hooks.addAction('frontend/element_ready/cities.default', Widget_Reload_Carousel);
        elementorFrontend.hooks.addAction('frontend/element_ready/place-categories.default', Widget_Reload_Carousel);
        elementorFrontend.hooks.addAction('frontend/element_ready/golo-testimonial.default', Widget_Reload_Testimonial);
        elementorFrontend.hooks.addAction('frontend/element_ready/golo-nav-menu.default', Widget_Golo_Nav_Menu);
    });

})(jQuery);