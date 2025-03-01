$(document).ready(function() {
    let currentStep = 1;
    let selectedTheme = null;
    
    const $wizard = $('.wizard-container');
    

    const $steps = $('#step1, #step2, #step3');
    const $progressBar = $('#progressBar');
    const $stepIndicators = $('.step-indicator');

    function validateStep1() {
        return $('.theme-card.active').length > 0;
    }

    function validateStep2() {
        return $("input[placeholder='eg - books']").val().trim() !== '';
    }

    function validateStep3() {
        return $('#productName').val().trim() !== '' && 
               $('#netPrice').val().trim() !== '';
    }

    function updateProgress(step) {
        const progress = (step / 3) * 100;
        $progressBar
            .css('width', `${progress}%`)
            .attr('aria-valuenow', progress);
            
        $stepIndicators
            .removeClass('active')
            .eq(step - 1)
            .addClass('active');
    }

    function showStep(step) {
    
        $steps.removeClass('visible').addClass('hidden');
        
       
        $(`#step${step}`).removeClass('hidden').addClass('visible');
        
        if(step === 1 && selectedTheme) {
            const $themeCard = $(`.theme-card[data-theme="${selectedTheme}"]`);
            const $allButtons = $('.apply-btn');
            
            $('.theme-card').removeClass('active');
            $themeCard.addClass('active');
            
            $allButtons
                .text('Apply')
                .prop('disabled', false)
                .removeClass('btn-outline-success')
                .addClass('btn-outline-primary');
                
            $themeCard.find('.apply-btn')
                .text('✔ Selected')
                .prop('disabled', true)
                .removeClass('btn-outline-primary')
                .addClass('btn-outline-success');
        }
        
        updateProgress(step);
        currentStep = step;
    }


    $wizard.on('click', '.theme-card', function() {
        const $this = $(this);
        const $allButtons = $('.apply-btn');
        
        $('.theme-card').removeClass('active');
        $this.addClass('active');
        selectedTheme = $this.data('theme');
        
        $allButtons
            .text('Apply')
            .prop('disabled', false)
            .removeClass('btn-outline-success')
            .addClass('btn-outline-primary');
            
        $this.find('.apply-btn')
            .text('✔ Selected')
            .prop('disabled', true)
            .removeClass('btn-outline-primary')
            .addClass('btn-outline-success');
    });

    $('#nextButton').on('click', function() {
        validateStep1() 
            ? showStep(2)
            : showAlert('Please select a theme to continue');
    });

    $('#nextStep2Button').on('click', function() {
        if(validateStep2()) {
            showStep(3);
            updatePreview(); 
            
        } else {
            showAlert('Please enter a product type to continue');
        }
    });

    $('#nextStep3Button').on('click', function() {
        validateStep3()
            ? showAlert('Product added successfully!', 'success')
            : showAlert('Please fill in all required fields');
    });

    $('#backButton, #backButton3').on('click', function() {
        showStep(currentStep - 1);
    });

    $('.image-input').on('change', function() {
        const files = this.files;
        const $container = $('.image-preview-container');
        
        $container.find('.image-preview-box:not(:first)').remove();
        
        if (files && files[0]) {
            const file = files[0];
            if (!file.type.startsWith('image/')) return;
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                // Update form preview
                const $previewBox = $container.find('.image-preview-box:first');
                const $preview = $previewBox.find('.preview-image');
                const $placeholder = $previewBox.find('.upload-placeholder');
                const $removeBtn = $previewBox.find('.remove-image');
                
                $preview
                    .attr('src', e.target.result)
                    .removeClass('d-none');
                    
                $placeholder.addClass('d-none');
                $removeBtn.removeClass('d-none');
                
               
                $('#previewImage')
                    .attr('src', e.target.result)
                    .removeClass('d-none');
                $('#previewPlaceholder').addClass('d-none');
            };
            
            reader.readAsDataURL(file);
        }
    });

    $(document).on('click', '.remove-image', function(e) {
        e.stopPropagation();
        const $box = $(this).closest('.image-preview-box');
        const $preview = $box.find('.preview-image');
        const $placeholder = $box.find('.upload-placeholder');
        const $removeBtn = $box.find('.remove-image');
        

        $preview
            .addClass('d-none')
            .attr('src', '');
        $placeholder.removeClass('d-none');
        $removeBtn.addClass('d-none');
        
        
        $('#previewImage')
            .addClass('d-none')
            .attr('src', '');
        $('#previewPlaceholder').removeClass('d-none');
    });

    $(document).on('click', '.upload-placeholder', function() {
        $('.image-input').trigger('click');
    });

    $('#step2, #step3').addClass('hidden');
    $('#step1').addClass('visible');
    updateProgress(1);

    
    const debounce = (fn, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn(...args), delay);
        };
    };

    const validateInput = debounce(() => {
      
    }, 250);

    function updatePreview() {
    
        const productName = $('#productName').val().trim() || 'Product title';
        $('#previewTitle').text(productName);
        
        const productDescription = $('#productDescription').val().trim() || 'Product description will appear here...';
        $('#previewDescription').text(productDescription);

        // Get all price-related values
        const listPrice = parseFloat($('#listPrice').val().trim() || '0');
        const discountPercentage = parseFloat($('#discountPercentage').val().trim() || '0');
        const shippingCharges = parseFloat($('#shippingCharges').val().trim() || '0');
        const gstRate = parseFloat($('#gstRate').val().trim() || '0');
        const isGstInclusive = $('#gst-check').is(':checked');


        let calculatedPrice = listPrice;


        if (discountPercentage > 0) {
            const discount = (calculatedPrice * discountPercentage) / 100;
            calculatedPrice -= discount;
        }

    
        if (gstRate > 0 && !isGstInclusive) {
            const gstAmount = (calculatedPrice * gstRate) / 100;
            calculatedPrice += gstAmount;
        }


        calculatedPrice += shippingCharges;

    
        $('#netPrice').val(calculatedPrice.toFixed(2));

  
        $('#previewPrice').text(`RS ${calculatedPrice.toFixed(2)}`);
        
        if (listPrice > calculatedPrice) {
            $('#previewListPrice')
                .text(`RS ${listPrice.toFixed(2)}`)
                .addClass('text-decoration-line-through')
                .removeClass('d-none');
        } else {
            $('#previewListPrice').addClass('d-none');
        }

       
        let additionalInfo = [];
        
        if (shippingCharges > 0) {
            additionalInfo.push(`+ RS ${shippingCharges.toFixed(2)} shipping`);
        }
        
        if (gstRate > 0) {
            additionalInfo.push(`${isGstInclusive ? 'Incl.' : '+ '} ${gstRate}% GST`);
        }

        if (discountPercentage > 0) {
            additionalInfo.push(`${discountPercentage}% OFF`);
        }

        if (additionalInfo.length > 0) {
            $('#previewShipping')
                .text(additionalInfo.join(' • '))
                .removeClass('d-none');
        } else {
            $('#previewShipping').addClass('d-none');
        }
    }


    $('#productName, #productDescription, #listPrice, #discountPercentage, #shippingCharges, #gstRate, #gst-check')
        .on('input change', updatePreview);

 
    updatePreview();
});

function showAlert(message, type = 'warning') {
    const $toast = $('#toast');
    const toast = new bootstrap.Toast($toast[0]);
    
    $toast
        .find('.toast-body')
        .text(message);
        
    $toast
        .removeClass()
        .addClass(`toast bg-${type} text-white`);
        
    toast.show();
} 
