# Dynamic Format Converter - WordPress Plugin

A powerful WordPress plugin that automatically converts all existing articles to AP Style format when activated, and provides toggle buttons for new posts. Deactivating the plugin reverts all articles to their original format.

## Features

### 🚀 Automatic Bulk Conversion
- **Plugin Activation**: Automatically converts ALL existing articles to AP Style format
- **Plugin Deactivation**: Automatically reverts ALL articles to original format
- **Content Preservation**: Original content is safely stored and restored
- **No Manual Work**: One-click activation handles your entire website

### 🎯 Smart Button Display
- **Existing Posts**: No buttons shown (already converted automatically)
- **New Posts**: Toggle buttons for users to convert/revert as needed
- **Automatic Detection**: Plugin knows which posts are new vs. existing

### 📰 Format Conversion
- **Original Format**: Article as originally published
- **AP Style Format**: Professional Associated Press news wire style
- **One-Click Toggle**: Easy switching between formats for new posts

### ⚡ Performance Optimizations
- **Smart Caching**: 24-hour cache for converted articles
- **Bulk Processing**: Efficient handling of large numbers of articles
- **Metadata Tracking**: Tracks which articles have been converted

## Installation

1. Upload the plugin files to `/wp-content/plugins/ap-format-converter/`
2. **Activate the plugin** - this will automatically convert ALL existing articles to AP format
3. Configure your OpenAI API key in the admin settings
4. All existing articles are now in AP format, new posts will have toggle buttons

## Configuration

### Admin Settings
Navigate to **WordPress Admin → Format Converter** to configure:

- **OpenAI API Key**: Your OpenAI API key for AI-powered conversions
- **AI Model**: Choose between GPT-4O Mini (recommended) or GPT-4O
- **Bulk Conversion Controls**: Convert/revert all articles at once
- **Cache Management**: Clear cached conversions when needed

### API Key Setup
1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Enter it in the plugin settings
3. The plugin will automatically convert all existing articles

## How It Works

### For Existing Articles (Created Before Plugin Activation)
- ✅ **Automatically converted** to AP format when plugin is activated
- ✅ **No buttons shown** - content is permanently in AP format
- ✅ **Original content preserved** - can be restored by deactivating plugin

### For New Articles (Created After Plugin Activation)
- ✅ **Toggle buttons available** at bottom of articles
- ✅ **User control** - can convert to AP or revert to original
- ✅ **Individual management** - each post can be handled separately

### Plugin Lifecycle
1. **Activation**: All existing articles → AP format
2. **Active State**: New posts get buttons, existing posts stay converted
3. **Deactivation**: All articles → Original format
4. **Reactivation**: All articles → AP format again

## Usage

### For Website Administrators
1. **Activate Plugin**: All existing articles automatically convert to AP format
2. **Monitor New Posts**: New articles will have toggle buttons for users
3. **Bulk Controls**: Use admin panel to convert/revert all articles at once
4. **Deactivate When Needed**: All articles revert to original format

### For Content Creators (New Posts)
1. **Create new article** on your WordPress site
2. **Scroll to bottom** - see "Convert to AP Format" button
3. **Click button** - article converts to AP style
4. **Toggle as needed** - switch between formats using the button

### For Visitors
- **Existing articles**: Already in AP format, no action needed
- **New articles**: Can toggle between formats using buttons

## Technical Details

### File Structure
```
ap-format-converter/
├── ap-format-converter.php    # Main plugin file
├── frontend-converter.js      # Frontend JavaScript (for new posts only)
└── README.md                  # This file
```

### Key Features
- **WordPress Standards**: Follows WordPress coding standards
- **Security**: Nonce verification and input sanitization
- **Performance**: Efficient bulk processing and caching
- **Data Integrity**: Original content is never lost

### Database Changes
- **Post Meta**: Stores original content and conversion status
- **Options**: Tracks plugin activation date and status
- **Transients**: Caches converted content for performance

## Admin Controls

### Bulk Conversion
- **Convert All to AP**: One-click conversion of entire website
- **Revert All to Original**: One-click reversion of entire website
- **Safety Confirmations**: Prevents accidental bulk operations

### Status Monitoring
- **Plugin Status**: Shows if plugin is active/inactive
- **Activation Date**: Tracks when plugin was first activated
- **Conversion Counts**: Shows how many articles were processed

## Troubleshooting

### Common Issues

**"API key not configured"**
- Ensure your OpenAI API key is entered in the admin settings
- Check that the API key is valid and has sufficient credits

**"Bulk conversion failed"**
- Check your internet connection
- Verify the API key has sufficient credits
- Check WordPress error logs

**"Articles not converting"**
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

### Bulk Processing
- **Efficient Conversion**: Processes all articles in one activation
- **Smart Caching**: 24-hour cache for converted articles
- **Memory Management**: Handles large numbers of articles efficiently

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
- [ ] Custom format templates
- [ ] Scheduled conversions

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