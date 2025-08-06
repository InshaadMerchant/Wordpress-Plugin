<?php
/**
 * Plugin Name: Dynamic Format Converter
 * Description: Allow visitors to convert articles to different formats (AP Style, etc.)
 * Version: 2.0
 * Author: Digital Commerce 360 Pakistan
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class DynamicFormatConverter {
    
    private $api_key;
    
    public function __construct() {
        // Admin hooks
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        
        // Frontend hooks
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_scripts'));
        add_filter('the_content', array($this, 'add_format_selector'));
        
        // AJAX hooks (for both admin and frontend)
        add_action('wp_ajax_convert_article_format', array($this, 'convert_article_format'));
        add_action('wp_ajax_nopriv_convert_article_format', array($this, 'convert_article_format'));
        
        // Initialize API key
        $this->api_key = get_option('format_converter_api_key', '');
    }
    
    public function enqueue_frontend_scripts() {
        if (is_single() && get_post_type() == 'post') {
            wp_enqueue_script('jquery');
            wp_enqueue_script('format-converter-frontend', plugin_dir_url(__FILE__) . 'frontend-converter.js', array('jquery'), '2.0', true);
            wp_localize_script('format-converter-frontend', 'format_ajax', array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('format_converter_nonce')
            ));
            
            // Add CSS inline
            wp_add_inline_style('wp-block-library', $this->get_frontend_css());
        }
    }
    
    public function add_format_selector($content) {
        // Only show on single posts
        if (!is_single() || get_post_type() != 'post') {
            return $content;
        }
        
        global $post;
        
        // Add the toggle button at the bottom of the content
        $toggle_button = '
        <div id="format-converter-widget" class="format-converter-container">
            <button id="format-toggle-btn" class="format-toggle-btn" data-format="ap" data-post-id="' . $post->ID . '">
                <span class="toggle-icon">📰</span>
                <span class="toggle-text">Convert to AP Format</span>
            </button>
            
            <div id="format-loading" class="format-loading" style="display:none;">
                <div class="loading-spinner"></div>
                <p>Converting to AP format... <span id="loading-text">Please wait</span></p>
            </div>
            
            <div id="format-error" class="format-error" style="display:none;">
                <p>❌ Conversion failed. <a href="#" id="retry-conversion">Try again</a></p>
            </div>
        </div>
        
        <!-- Store original content -->
        <script type="application/json" id="original-content">' . json_encode($content) . '</script>
        ';
        
        return $content . $toggle_button;
    }
    
    public function convert_article_format() {
        check_ajax_referer('format_converter_nonce', 'nonce');
        
        $post_id = intval($_POST['post_id']);
        $format = sanitize_text_field($_POST['format']);
        
        $post = get_post($post_id);
        if (!$post) {
            wp_send_json_error('Article not found');
        }
        
        // Return original content if requested
        if ($format === 'original') {
            wp_send_json_success(array(
                'content' => apply_filters('the_content', $post->post_content),
                'format' => 'original'
            ));
        }
        
        // Convert to requested format
        if ($format === 'ap') {
            $result = $this->convert_to_ap_format($post);
            
            if ($result['success']) {
                wp_send_json_success(array(
                    'content' => $result['content'],
                    'format' => 'ap'
                ));
            } else {
                wp_send_json_error($result['message']);
            }
        }
        
        wp_send_json_error('Invalid format requested');
    }
    
    private function convert_to_ap_format($post) {
        if (empty($this->api_key)) {
            return array('success' => false, 'message' => 'API key not configured');
        }
        
        // Check if we have a cached conversion
        $cached_conversion = get_transient('ap_conversion_' . $post->ID);
        if ($cached_conversion) {
            return array('success' => true, 'content' => $cached_conversion);
        }
        
        $model = get_option('format_converter_model', 'gpt-4o-mini');
        $prompt = $this->build_ap_conversion_prompt($post->post_title, $post->post_content);
        
        $response = $this->call_openai_api($prompt, $model);
        
        if ($response['success']) {
            // Cache the conversion for 24 hours
            set_transient('ap_conversion_' . $post->ID, $response['content'], 24 * HOUR_IN_SECONDS);
            
            return array('success' => true, 'content' => $response['content']);
        } else {
            return array('success' => false, 'message' => $response['error']);
        }
    }
    
    private function build_ap_conversion_prompt($title, $content) {
        return "You are an expert AP style editor for Digital Commerce 360 Pakistan. Convert this article to Associated Press format with these requirements:

STRUCTURE:
- Lead paragraph: Maximum 35 words, answers who/what/when/where/why
- Inverted pyramid structure
- Short paragraphs (1-3 sentences)
- Include dateline if location-specific: KARACHI, Pakistan - 

STYLE:
- Third person voice only
- Use 'said' for attribution
- Numbers: Spell out one-nine, numerals for 10+
- Dates: Month Day, Year format
- Attribution required for all claims
- No editorial language

PAKISTAN E-COMMERCE FOCUS:
- Currency: PKR format
- Company names: Full legal names first reference
- Government sources: Proper titles
- Industry terminology: Clear definitions

Original Article:
Title: {$title}
Content: {$content}

Return ONLY the converted article content in proper HTML format with paragraphs.";
    }
    
    private function call_openai_api($prompt, $model) {
        $data = array(
            'model' => $model,
            'messages' => array(
                array(
                    'role' => 'user',
                    'content' => $prompt
                )
            ),
            'max_tokens' => 4000,
            'temperature' => 0.3
        );
        
        $response = wp_remote_post('https://api.openai.com/v1/chat/completions', array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $this->api_key,
                'Content-Type' => 'application/json'
            ),
            'body' => json_encode($data),
            'timeout' => 60
        ));
        
        if (is_wp_error($response)) {
            return array('success' => false, 'error' => $response->get_error_message());
        }
        
        $body = wp_remote_retrieve_body($response);
        $decoded = json_decode($body, true);
        
        if (isset($decoded['error'])) {
            return array('success' => false, 'error' => $decoded['error']['message']);
        }
        
        if (isset($decoded['choices'][0]['message']['content'])) {
            return array('success' => true, 'content' => wpautop(trim($decoded['choices'][0]['message']['content'])));
        }
        
        return array('success' => false, 'error' => 'Unexpected API response');
    }
    
    private function get_frontend_css() {
        return '
        .format-converter-container {
            text-align: center;
            margin: 40px 0;
            padding: 20px 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        
        .format-toggle-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 50px;
            padding: 15px 30px;
            color: white;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            display: inline-flex;
            align-items: center;
            gap: 10px;
            text-decoration: none;
            font-family: inherit;
        }
        
        .format-toggle-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
            text-decoration: none;
            color: white;
        }
        
        .format-toggle-btn:active {
            transform: translateY(0);
        }
        
        .format-toggle-btn.converted {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
        }
        
        .format-toggle-btn.converted:hover {
            box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
        }
        
        .toggle-icon {
            font-size: 18px;
        }
        
        .toggle-text {
            font-size: 16px;
            font-weight: 600;
        }
        
        .format-loading {
            text-align: center;
            padding: 20px;
            background: rgba(102, 126, 234, 0.1);
            border-radius: 10px;
            margin-top: 20px;
            border: 1px solid rgba(102, 126, 234, 0.2);
        }
        
        .loading-spinner {
            width: 30px;
            height: 30px;
            border: 3px solid rgba(102, 126, 234, 0.3);
            border-radius: 50%;
            border-top-color: #667eea;
            animation: spin 1s ease-in-out infinite;
            margin: 0 auto 15px auto;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .format-error {
            background: rgba(220, 53, 69, 0.1);
            border: 1px solid rgba(220, 53, 69, 0.3);
            border-radius: 10px;
            padding: 15px;
            margin-top: 20px;
            text-align: center;
            color: #dc3545;
        }
        
        .format-error a {
            color: #dc3545;
            text-decoration: underline;
            font-weight: 600;
        }
        
        .format-error a:hover {
            color: #c82333;
        }
        
        /* Mobile responsive */
        @media (max-width: 768px) {
            .format-toggle-btn {
                padding: 12px 25px;
                font-size: 14px;
            }
            
            .toggle-icon {
                font-size: 16px;
            }
            
            .toggle-text {
                font-size: 14px;
            }
        }
        ';
    }
    
    // Admin functions
    public function add_admin_menu() {
        add_menu_page(
            'Format Converter',
            'Format Converter',
            'manage_options',
            'format-converter',
            array($this, 'admin_page'),
            'dashicons-media-text',
            30
        );
    }
    
    public function enqueue_admin_scripts($hook) {
        if (strpos($hook, 'format-converter') !== false) {
            wp_enqueue_script('jquery');
        }
    }
    
    public function admin_page() {
        if (isset($_POST['save_settings'])) {
            update_option('format_converter_api_key', sanitize_text_field($_POST['api_key']));
            update_option('format_converter_model', sanitize_text_field($_POST['model']));
            echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
            $this->api_key = get_option('format_converter_api_key', '');
        }
        
        $current_model = get_option('format_converter_model', 'gpt-4o-mini');
        ?>
        
        <div class="wrap">
            <h1>Dynamic Format Converter Settings</h1>
            
            <div class="notice notice-info">
                <p><strong>New Feature:</strong> Visitors can now choose article formats on the frontend! Configure your API settings below.</p>
            </div>
            
            <form method="post">
                <table class="form-table">
                    <tr>
                        <th scope="row">OpenAI API Key</th>
                        <td>
                            <input type="password" name="api_key" value="<?php echo esc_attr($this->api_key); ?>" class="regular-text" />
                            <p class="description">Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI Platform</a></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">AI Model</th>
                        <td>
                            <select name="model">
                                <option value="gpt-4o-mini" <?php selected($current_model, 'gpt-4o-mini'); ?>>GPT-4O Mini (Recommended)</option>
                                <option value="gpt-4o" <?php selected($current_model, 'gpt-4o'); ?>>GPT-4O</option>
                            </select>
                        </td>
                    </tr>
                </table>
                
                <p class="submit">
                    <input type="submit" name="save_settings" class="button-primary" value="Save Settings" />
                </p>
            </form>
            
            <div class="postbox">
                <h2 class="hndle">How It Works</h2>
                <div class="inside">
                    <p><strong>Frontend Experience:</strong></p>
                    <ul>
                        <li>✅ Visitors see format options on every article</li>
                        <li>✅ Real-time conversion using AI</li>
                        <li>✅ Cached results for faster loading</li>
                        <li>✅ Mobile-friendly design</li>
                    </ul>
                    
                    <p><strong>Available Formats:</strong></p>
                    <ul>
                        <li>📄 <strong>Original:</strong> Article as published</li>
                        <li>📰 <strong>AP Format:</strong> Associated Press news style</li>
                        <li>🔜 <strong>More formats:</strong> Coming soon...</li>
                    </ul>
                    
                    <p><strong>Cost Estimate:</strong> ~$0.01-0.03 per conversion (cached for 24 hours)</p>
                </div>
            </div>
            
            <div class="postbox">
                <h2 class="hndle">Clear Cache</h2>
                <div class="inside">
                    <p>If you need to clear cached conversions:</p>
                    <p>
                        <button type="button" class="button" onclick="clearFormatCache()">Clear All Cached Conversions</button>
                    </p>
                    
                    <script>
                    function clearFormatCache() {
                        if (confirm('This will clear all cached format conversions. Are you sure?')) {
                            jQuery.post(ajaxurl, {
                                action: 'clear_format_cache',
                                nonce: '<?php echo wp_create_nonce('format_converter_nonce'); ?>'
                            }, function(response) {
                                alert('Cache cleared successfully!');
                            });
                        }
                    }
                    </script>
                </div>
            </div>
        </div>
        <?php
    }
}

// Initialize the plugin
new DynamicFormatConverter();

// Add clear cache AJAX handler
add_action('wp_ajax_clear_format_cache', function() {
    check_ajax_referer('format_converter_nonce', 'nonce');
    
    if (!current_user_can('manage_options')) {
        wp_die('Unauthorized');
    }
    
    global $wpdb;
    $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_ap_conversion_%'");
    $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_timeout_ap_conversion_%'");
    
    wp_send_json_success('Cache cleared');
});