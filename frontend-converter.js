// Frontend Format Converter JavaScript - Single Toggle Button Version
jQuery(document).ready(function($) {
    let originalContent = '';
    let currentFormat = 'original';
    let isConverting = false;
    let loadingInterval;
    
    // Get original content from script tag
    const originalContentScript = $('#original-content');
    if (originalContentScript.length) {
        try {
            originalContent = JSON.parse(originalContentScript.text());
        } catch (e) {
            console.log('Could not parse original content');
            originalContent = $('article, .entry-content, .post-content').first().html();
        }
    }
    
    // Toggle button click handler
    $('#format-toggle-btn').on('click', function(e) {
        e.preventDefault();
        
        if (isConverting) {
            return;
        }
        
        const postId = $(this).data('post-id');
        
        if (currentFormat === 'original') {
            // Convert to AP format
            convertToAPFormat(postId);
        } else {
            // Revert to original
            revertToOriginal();
        }
    });
    
    // Convert to AP format
    function convertToAPFormat(postId) {
        isConverting = true;
        showLoading();
        
        // Make AJAX request for AP format conversion
        $.ajax({
            url: format_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'convert_article_format',
                post_id: postId,
                format: 'ap',
                nonce: format_ajax.nonce
            },
            timeout: 60000, // 60 seconds timeout
            success: function(response) {
                if (response.success) {
                    updateContent(response.data.content, 'ap');
                    updateButtonState('ap');
                    trackFormatUsage('ap');
                } else {
                    showError(response.data || 'Conversion failed');
                }
            },
            error: function(xhr, status, error) {
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
});