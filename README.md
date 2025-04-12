# Focus Mode Chrome Extension

A Chrome extension that helps you stay focused by preventing new tab creation while in "focus mode". Once activated, the extension will keep your existing tabs but block any attempts to open new ones.

## Features

- **Tab Restriction**: When focus mode is enabled, new tabs cannot be opened
- **Password Protection**: Require a randomly generated 12-character password to disable focus mode
- **Website Blocklist**: Permanently block access to distracting websites
- **Timer Functionality**: Set a specific duration for your focus session with preset options
- **Visual Indicators**: Badge and notifications inform you of the extension's status
- **Modern UI**: Clean, user-friendly interface with tabbed navigation

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory
5. The Focus Mode extension should now be installed and visible in your toolbar

## How to Use

### Focus Mode
1. Click on the Focus Mode icon in your Chrome toolbar
2. Toggle the "Enable Focus Mode" switch to activate focus mode
3. When focus mode is active, any attempt to open a new tab will be blocked
4. To disable focus mode, toggle the switch off (requires password if enabled)

### Timer
1. Set a timer duration using the hours and minutes inputs or select a preset time
2. Click "Start Timer" to begin a timed focus session
3. When a timer completes, focus mode will automatically turn off

### Website Blocklist
1. Click on the "Blocklist" tab in the extension popup
2. Enter a website URL you want to block (e.g., microsoft.com)
3. Click "Add" to add the website to your blocklist
4. Any attempt to visit a blocked website will redirect to a block page
5. To remove a website from the blocklist, click the "Remove" button next to the URL

### Password Protection
1. Click on the "Settings" tab in the extension popup
2. Toggle the "Require Password to Disable" switch to enable password protection
3. When you try to disable focus mode, you'll need to enter a randomly generated 12-character password

## Note About Icons

The current icon files are placeholders. Before using this extension, you should replace them with proper PNG icons of the respective sizes (16x16, 48x48, and 128x128).

## License

This project is open source and available under the MIT License. 
