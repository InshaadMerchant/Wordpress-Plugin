# Dynamic Format Converter - WordPress Plugin

A powerful WordPress plugin that allows visitors to convert news articles to AP Style format using AI. Features a simple toggle button that switches between original and AP format.

## Features

### 🎯 Simple Toggle Interface
- **Single Toggle Button**: Clean, simple button at the bottom of each article
- **Smart State Management**: Button text changes based on current format
- **Smooth Transitions**: Fade animations for content switching
- **Mobile Responsive**: Works perfectly on all devices

### 📰 Format Conversion
- **Original Format**: Article as originally published
- **AP Style Format**: Professional Associated Press news wire style
- **One-Click Toggle**: Easy switching between formats

### ⚡ Performance Optimizations
- **Smart Caching**: 24-hour cache for converted articles
- **Fast Loading**: Optimized AJAX requests with timeout handling
- **Progressive Enhancement**: Graceful degradation if JavaScript is disabled

### 🎨 Enhanced User Experience
- **Visual Feedback**: Loading states and error handling
- **Button State Changes**: Clear indication of current format
- **Error Recovery**: Automatic retry functionality
- **Analytics Ready**: Built-in tracking for format usage

## Installation

1. Upload the plugin files to `/wp-content/plugins/ap-format-converter/`
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Configure your OpenAI API key in the admin settings
4. The toggle button will automatically appear at the bottom of all single post pages

## Configuration

### Admin Settings
Navigate to **WordPress Admin → Format Converter** to configure:

- **OpenAI API Key**: Your OpenAI API key for AI-powered conversions
- **AI Model**: Choose between GPT-4O Mini (recommended) or GPT-4O
- **Cache Management**: Clear cached conversions when needed

### API Key Setup
1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Enter it in the plugin settings
3. Test with a sample article

## Usage

### For Visitors
1. Visit any article on your WordPress site
2. Scroll to the bottom of the article
3. Click **"Convert to AP Format"** to convert the article
4. Click **"Revert to Original"** to switch back
5. Enjoy the professionally formatted content

### For Developers
The plugin is designed to be easily extensible:

```php
// Add new format support
add_filter('format_converter_formats', function($formats) {
    $formats['academic'] = 'Academic Style';
    return $formats;
});
```

## Technical Details

### File Structure
```
ap-format-converter/
├── ap-format-converter.php    # Main plugin file
├── frontend-converter.js      # Frontend JavaScript
└── README.md                  # This file
```

### Key Features
- **WordPress Standards**: Follows WordPress coding standards
- **Security**: Nonce verification and input sanitization
- **Performance**: Efficient caching and optimized queries
- **Accessibility**: Keyboard navigation and screen reader support

### CSS Classes
- `.format-converter-container` - Main container
- `.format-toggle-btn` - Toggle button
- `.format-loading` - Loading state
- `.format-error` - Error state

### JavaScript Events
- `format_conversion` - Fired when format is converted
- `format_error` - Fired when conversion fails
- `format_loading` - Fired during conversion process

## Customization

### Styling
The plugin includes comprehensive CSS that can be overridden in your theme:

```css
/* Custom toggle button styling */
.format-toggle-btn {
    background: linear-gradient(135deg, #your-color, #your-color);
}
```

### Adding New Formats
1. Add format to the toggle button logic in `add_format_selector()`
2. Add conversion logic in `convert_article_format()`
3. Update the JavaScript format handling
4. Add format-specific CSS styling

## Troubleshooting

### Common Issues

**"API key not configured"**
- Ensure your OpenAI API key is entered in the admin settings
- Check that the API key is valid and has sufficient credits

**"Conversion failed"**
- Check your internet connection
- Verify the article content is accessible
- Try clearing the cache in admin settings

**Toggle button not appearing**
- Ensure you're on a single post page
- Check that the plugin is activated
- Verify your theme supports `the_content` filter

### Debug Mode
Enable WordPress debug mode to see detailed error messages:

```php
// In wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

## Performance

### Caching Strategy
- **24-hour cache** for converted articles
- **Automatic cache cleanup** for old conversions
- **Manual cache clearing** available in admin

### Cost Optimization
- **~$0.01-0.03** per conversion (cached for 24 hours)
- **Bulk conversions** are cached to reduce API calls
- **Error handling** prevents unnecessary API usage

## Future Enhancements

### Planned Features
- [ ] Academic format support
- [ ] Social media format (Twitter threads, LinkedIn posts)
- [ ] PDF export functionality
- [ ] User preference saving
- [ ] Bulk format conversion
- [ ] Custom format templates

### API Integrations
- [ ] Google Analytics integration
- [ ] Facebook Pixel tracking
- [ ] Custom analytics hooks
- [ ] Performance monitoring

## Support

For support and feature requests:
- Check the troubleshooting section above
- Review WordPress error logs
- Contact the development team

## Changelog

### Version 2.1
- ✨ Simplified to single toggle button interface
- 🎯 Clean, focused user experience
- 📱 Better mobile responsiveness
- ⚡ Improved performance and caching
- 🎨 Streamlined visual design

### Version 2.0
- ✨ Enhanced user interface with prominent format selection
- 🎨 Improved visual design with animations and effects
- 📱 Better mobile responsiveness
- ⚡ Performance optimizations and caching improvements
- 🎯 Better error handling and user feedback
- ⌨️ Keyboard shortcuts for power users

### Version 1.0
- 🚀 Initial release with AP format support
- 📰 Basic format conversion functionality
- 🔧 Admin settings panel
- 💾 Basic caching system

## License

This plugin is developed for Digital Commerce 360 Pakistan. All rights reserved.

---

**Made with ❤️ for better reading experiences** 