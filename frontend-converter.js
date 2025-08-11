// Frontend Format Converter JavaScript - Single Toggle Button Version
jQuery(document).ready(function($) {
    console.log('Format Converter: jQuery ready, starting initialization...');
    
    let originalContent = '';
    let currentFormat = 'original';
    let isConverting = false;
    let loadingInterval;
    
    // Debug: Check if button exists
    const toggleButton = $('#format-toggle-btn');
    console.log('Format Converter: Toggle button found:', toggleButton.length > 0);
    
    if (toggleButton.length === 0) {
        console.error('Format Converter: Toggle button not found! Check if plugin is active and on a single post page.');
        return;
    }
    
    // Debug: Check if format_ajax object exists
    if (typeof format_ajax === 'undefined') {
        console.error('Format Converter: format_ajax object not found! Check if plugin is properly enqueued.');
        return;
    }
    
    console.log('Format Converter: format_ajax object found:', format_ajax);
    
    // Get original content from script tag
    const originalContentScript = $('#original-content');
    if (originalContentScript.length) {
        try {
            originalContent = JSON.parse(originalContentScript.text());
            console.log('Format Converter: Original content loaded successfully');
        } catch (e) {
            console.error('Format Converter: Could not parse original content:', e);
            originalContent = $('article, .entry-content, .post-content').first().html();
        }
    } else {
        console.warn('Format Converter: Original content script tag not found');
    }
    
    // Toggle button click handler
    toggleButton.on('click', function(e) {
        console.log('Format Converter: Button clicked!');
        e.preventDefault();
        
        if (isConverting) {
            console.log('Format Converter: Already converting, ignoring click');
            return;
        }
        
        const postId = $(this).data('post-id');
        console.log('Format Converter: Post ID:', postId, 'Current format:', currentFormat);
        
        if (currentFormat === 'original') {
            // Convert to AP format
            console.log('Format Converter: Converting to AP format...');
            convertToAPFormat(postId);
        } else {
            // Revert to original
            console.log('Format Converter: Reverting to original...');
            revertToOriginal();
        }
    });
    
    console.log('Format Converter: Event handlers attached successfully');
    
    // Convert to AP format
    function convertToAPFormat(postId) {
        console.log('Format Converter: Starting AP conversion for post ID:', postId);
        isConverting = true;
        showLoading();
        
        const ajaxData = {
            action: 'convert_article_format',
            post_id: postId,
            format: 'ap',
            nonce: format_ajax.nonce
        };
        
        console.log('Format Converter: AJAX data:', ajaxData);
        console.log('Format Converter: AJAX URL:', format_ajax.ajax_url);
        
        // Make AJAX request for AP format conversion
        $.ajax({
            url: format_ajax.ajax_url,
            type: 'POST',
            data: ajaxData,
            timeout: 60000, // 60 seconds timeout
            success: function(response) {
                console.log('Format Converter: AJAX success response:', response);
                if (response.success) {
                    updateContent(response.data.content, 'ap');
                    updateButtonState('ap');
                    trackFormatUsage('ap');
                } else {
                    console.error('Format Converter: AJAX success but conversion failed:', response.data);
                    showError(response.data || 'Conversion failed');
                }
            },
            error: function(xhr, status, error) {
                console.error('Format Converter: AJAX error:', {xhr: xhr, status: status, error: error});
                let errorMessage = 'Network error occurred';
                
                if (status === 'timeout') {
                    errorMessage = 'Conversion timed out. Please try again.';
                } else if (xhr.status === 500) {
                    errorMessage = 'Server error. Please try again later.';
                } else if (xhr.status === 0) {
                    errorMessage = 'Connection failed. Check your internet connection.';
                }
                
                showError(errorMessage);
            }
        });
    }
    
    // Revert to original format
    function revertToOriginal() {
        isConverting = true;
        showLoading();
        
        // Small delay for UX
        setTimeout(function() {
            updateContent(originalContent, 'original');
            updateButtonState('original');
            hideLoading();
            hideError();
        }, 300);
    }
    
    // Update article content
    function updateContent(content, format) {
        // Find the main content area
        const contentArea = $('article, .entry-content, .post-content').first();
        
        if (contentArea.length) {
            // Fade out current content
            contentArea.fadeOut(300, function() {
                // Update content
                contentArea.html(content);
                
                // Fade in new content
                contentArea.fadeIn(300, function() {
                    currentFormat = format;
                    isConverting = false;
                    hideLoading();
                    hideError();
                    
                    // Scroll to top of article smoothly
                    $('html, body').animate({
                        scrollTop: Math.max(0, contentArea.offset().top - 100)
                    }, 500);
                });
            });
        } else {
            // Fallback: update the entire body content
            $('body').fadeOut(300, function() {
                $('body').html(content);
                $('body').fadeIn(300, function() {
                    currentFormat = format;
                    isConverting = false;
                    hideLoading();
                    hideError();
                });
            });
        }
    }
    
    // Update button state and text
    function updateButtonState(format) {
        const button = $('#format-toggle-btn');
        const icon = button.find('.toggle-icon');
        const text = button.find('.toggle-text');
        
        if (format === 'ap') {
            button.addClass('converted');
            icon.text('📄');
            text.text('Revert to Original');
        } else {
            button.removeClass('converted');
            icon.text('📰');
            text.text('Convert to AP Format');
        }
    }
    
    // Show loading state
    function showLoading() {
        $('#format-loading').show();
        $('#format-error').hide();
        $('#format-toggle-btn').prop('disabled', true);
        
        // Start animated loading text
        animateLoadingText();
    }
    
    // Hide loading state
    function hideLoading() {
        $('#format-loading').hide();
        $('#format-toggle-btn').prop('disabled', false);
        
        // Clear loading text animation
        if (loadingInterval) {
            clearInterval(loadingInterval);
            loadingInterval = null;
        }
    }
    
    // Show error state
    function showError(message) {
        $('#format-loading').hide();
        $('#format-error').show();
        $('#format-error p').html('❌ ' + message + ' <a href="#" id="retry-conversion">Try again</a>');
        $('#format-toggle-btn').prop('disabled', false);
        isConverting = false;
        
        // Clear loading text animation
        if (loadingInterval) {
            clearInterval(loadingInterval);
            loadingInterval = null;
        }
    }
    
    // Hide error state
    function hideError() {
        $('#format-error').hide();
    }
    
    // Animate loading text
    function animateLoadingText() {
        const loadingTexts = [
            'Analyzing article structure...',
            'Applying AP style rules...',
            'Restructuring paragraphs...',
            'Adding proper attribution...',
            'Formatting quotes and sources...',
            'Finalizing AP conversion...'
        ];
        
        let textIndex = 0;
        const loadingTextElement = $('#loading-text');
        
        // Update text immediately
        loadingTextElement.text(loadingTexts[textIndex]);
        
        loadingInterval = setInterval(function() {
            if (!isConverting) {
                clearInterval(loadingInterval);
                loadingInterval = null;
                return;
            }
            
            textIndex = (textIndex + 1) % loadingTexts.length;
            loadingTextElement.fadeOut(200, function() {
                $(this).text(loadingTexts[textIndex]).fadeIn(200);
            });
        }, 2500);
    }
    
    // Retry conversion on error
    $(document).on('click', '#retry-conversion', function(e) {
        e.preventDefault();
        
        const postId = $('#format-toggle-btn').data('post-id');
        hideError();
        convertToAPFormat(postId);
    });
    
    // Track format usage for analytics
    function trackFormatUsage(format) {
        // You can integrate with Google Analytics, Facebook Pixel, etc.
        if (typeof gtag !== 'undefined') {
            gtag('event', 'format_conversion', {
                'format_type': format,
                'article_id': $('#format-toggle-btn').data('post-id')
            });
        }
        
        console.log('Format conversion:', format);
    }
    
    // Add helpful tooltip
    $('#format-toggle-btn').attr('title', 'Click to convert this article to Associated Press news format');
    
    // Test function for debugging
    window.testFormatConverter = function() {
        console.log('Format Converter: Running test...');
        
        $.ajax({
            url: format_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'test_format_converter',
                nonce: format_ajax.nonce
            },
            success: function(response) {
                console.log('Format Converter: Test response:', response);
                alert('Test successful! Check console for details.');
            },
            error: function(xhr, status, error) {
                console.error('Format Converter: Test failed:', {xhr: xhr, status: status, error: error});
                alert('Test failed! Check console for details.');
            }
        });
    };
    
    console.log('Format Converter: Plugin fully initialized. Run testFormatConverter() in console to test.');
});