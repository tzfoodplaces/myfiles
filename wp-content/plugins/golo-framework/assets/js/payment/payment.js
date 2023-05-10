var GOLO_STRIPE = GOLO_STRIPE || {};
(function ($) {
    'use strict';

    GOLO_STRIPE = {
        init: function () {
            this.setupForm();
        },

        setupForm: function () {
            var self = this,
                $form = $('.golo-stripe-form');
            if ($form.length === 0) return;
            var formId = $form.attr('id');
            // Set formData array index of the current form ID to match the localized data passed over for form settings.
            var formData =   golo_stripe_vars[ formId ];
            // Variable to hold the Stripe configuration.
            var stripeHandler = null;
            var $submitBtn = $form.find( '.golo-stripe-button' );

            if ($submitBtn.length) {
                stripeHandler = StripeCheckout.configure( {
                    // Key param MUST be sent hgolo instead of stripeHandler.open().
                    key: formData.key,
                    locale: 'auto',
                    token: function( token, args ) {
                        $( '<input>' ).attr( {
                            type: 'hidden',
                            name: 'stripeToken',
                            value: token.id
                        } ).appendTo( $form );

                        $( '<input>' ).attr( {
                            type: 'hidden',
                            name: 'stripeTokenType',
                            value: token.type
                        } ).appendTo( $form );

                        if (token.email) {
                            $( '<input>' ).attr( {
                                type: 'hidden',
                                name: 'stripeEmail',
                                value: token.email
                            } ).appendTo( $form );
                        }
                        $form.submit();
                    },
                } );

                $submitBtn.on('click',function (event) {
                    event.preventDefault();
                    stripeHandler.open(formData.params);
                });
            }

            // Close Checkout on page navigation:
            window.addEventListener('popstate', function() {
                if (stripeHandler != null) {
                    stripeHandler.close();
                }
            });

        }

    };


    $(document).ready(function () {
        GOLO_STRIPE.init();

        var show_loading = function ($text) {
            if($text == 'undefined' || $text == '' || $text == null) {
                $text = loading_text;
            }
            var template = wp.template('golo-processing-template');
            $('body').append(template({'ico': 'fa fa-spinner fa-spin', 'text': $text}));
        }

        if (typeof golo_payment_vars !== "undefined") {
            var ajax_url = golo_payment_vars.ajax_url;
            var processing_text = golo_payment_vars.processing_text;

            $('#golo_payment_package').on('click', function (event) {
                var payment_method = $("input[name='golo_payment_method']:checked").val();
                var package_id = $("input[name='golo_package_id']").val();
                var woo_redirect = $("input[name='woo_redirect']").val();
                if (payment_method == 'paypal') {
                    golo_paypal_payment_per_package(package_id);
                } else if (payment_method == 'stripe') {
                    $('#golo_stripe_per_package button').trigger("click");
                } else if (payment_method == 'woocheckout') {
                    golo_woocommerce_payment_per_package(package_id);
                } else if (payment_method == 'wire_transfer') {
                    golo_wire_transfer_per_package(package_id);
                }
            });

            var golo_paypal_payment_per_package = function (package_id) {
                $.ajax({
                    type: 'POST',
                    url: ajax_url,
                    data: {
                        'action': 'golo_paypal_payment_per_package_ajax',
                        'package_id': package_id,
                        'golo_security_payment': $('#golo_security_payment').val()
                    },
                    beforeSend: function () {
                        $('#golo_payment_package').append('<div class="golo-loading-effect"><span class="golo-dual-ring"></span></div>');
                    },
                    success: function (data) {
                        window.location.href = data;
                    }
                });
            };

            var golo_woocommerce_payment_per_package = function (package_id) {
                $.ajax({
                    type: 'POST',
                    url: ajax_url,
                    data: {
                        'action': 'golo_woocommerce_payment_per_package_ajax',
                        'package_id': package_id,
                        'golo_security_payment': $('#golo_security_payment').val()
                    },
                    beforeSend: function () {
                        $('#golo_payment_package').append('<div class="golo-loading-effect"><span class="golo-dual-ring"></span></div>');
                    },
                    success: function (data) {
                        window.location.href = data;
                    }
                });
            };

            var golo_wire_transfer_per_package = function (package_id) {
                $.ajax({
                    type: 'POST',
                    url: ajax_url,
                    data: {
                        'action': 'golo_wire_transfer_per_package_ajax',
                        'package_id': package_id,
                        'golo_security_payment': $('#golo_security_payment').val()
                    },
                    beforeSend: function () {
                        $('#golo_payment_package').append('<div class="golo-loading-effect"><span class="golo-dual-ring"></span></div>');
                    },
                    success: function (data) {
                        window.location.href = data;
                    }
                });
            };

            $('#golo_free_package').on('click', function () {
                var package_id = $("input[name='golo_package_id']").val();
                $.ajax({
                    type: 'POST',
                    url: ajax_url,
                    data: {
                        'action': 'golo_free_package_ajax',
                        'package_id': package_id,
                        'golo_security_payment': $('#golo_security_payment').val()
                    },
                    beforeSend: function () {
                        $('#golo_payment_package').append('<div class="golo-loading-effect"><span class="golo-dual-ring"></span></div>');
                    },
                    success: function (data) {
                        window.location.href = data;
                    }
                });
            });
        }
    });
})(jQuery);