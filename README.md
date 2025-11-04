# QR Code Scanner

A real-time QR code scanner application built with React and Material-UI that uses your device's camera to scan QR codes.

## Features

- **Real Camera Scanning**: Uses your device's camera to scan QR codes in real-time
- **Multiple Camera Support**: Choose from available cameras on your device
- **QR Code Detection**: Automatically detects and decodes various QR code formats
- **Smart Data Parsing**: Intelligently parses different types of QR code content (URLs, phone numbers, emails, contact cards, WiFi networks, text)
- **Clean Interface**: Simple, intuitive user interface with Material-UI design
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Feedback**: Visual feedback during scanning process

## Tech Stack

- **React 18.2.0**: Modern React with hooks
- **Material-UI 5.15.0**: Beautiful and responsive UI components
- **Material Icons**: Professional icon set
- **html5-qrcode 2.3.8**: Real-time QR code scanning library

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- A device with a camera (webcam or mobile camera)
- HTTPS connection (required for camera access in most browsers)

### Installation

1. Navigate to the project directory:
   ```bash
   cd editor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and visit `http://localhost:3000`

**Note**: For camera access to work properly, you may need to:
- Use HTTPS in production
- Grant camera permissions when prompted
- Use a modern browser (Chrome, Firefox, Safari, Edge)

## Usage

1. **Camera Selection**: Choose your preferred camera from the dropdown menu
2. **Start Scanning**: Click "Start Camera Scanner" to activate your camera
3. **Point Camera**: Point your camera at a QR code
4. **View Results**: The scanned information will be automatically displayed
5. **Stop Scanning**: Click "Stop Scanning" to stop the camera
6. **Scan Another**: Use "Scan Another" to scan additional QR codes

## Supported QR Code Types

The scanner automatically detects and parses various QR code formats:

- **URLs**: Website links (http://, https://)
- **Phone Numbers**: Contact numbers (tel:)
- **Email Addresses**: Email links (mailto:)
- **Contact Cards**: vCard format contact information
- **WiFi Networks**: WiFi configuration details
- **Plain Text**: Any other text content

## Project Structure

```
editor/
├── public/
│   └── index.html
├── src/
│   ├── App.js              # Main QR scanner application with camera integration
│   ├── index.js            # React entry point
│   └── index.css           # Global styles
├── package.json
└── README.md
```

## Features in Detail

### Real Camera Integration
- Uses the `html5-qrcode` library for reliable QR code scanning
- Supports multiple camera devices
- Real-time video feed with QR code detection overlay
- Automatic camera permission handling

### Smart Data Parsing
- **URL Detection**: Identifies and formats website links
- **Contact Information**: Parses phone numbers and email addresses
- **vCard Support**: Handles contact card QR codes
- **WiFi Configuration**: Recognizes WiFi network QR codes
- **Text Content**: Displays plain text content

### User Interface
- Clean, modern Material-UI design
- Camera selection dropdown
- Real-time scanning status
- Comprehensive results display
- Error handling and user feedback

### Camera Management
- Automatic camera detection
- Multiple camera support
- Camera permission handling
- Start/stop scanning controls

## Browser Compatibility

- **Chrome**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile Browsers**: Works on mobile devices with cameras

## Troubleshooting

### Camera Not Working
1. Check if your browser supports camera access
2. Ensure you've granted camera permissions
3. Try refreshing the page
4. Check if another application is using the camera

### No Cameras Found
1. Make sure your device has a camera
2. Check camera permissions in browser settings
3. Try using a different browser
4. Ensure you're using HTTPS (required for camera access)

### QR Code Not Detected
1. Ensure the QR code is clearly visible
2. Try adjusting the distance between camera and QR code
3. Check if the QR code is damaged or poorly printed
4. Ensure good lighting conditions

## Future Enhancements

- **QR Code Generation**: Add ability to generate QR codes
- **Scan History**: Save and manage scanned QR codes
- **Export Options**: Export scanned data to various formats
- **Barcode Support**: Extend to support other barcode types
- **Offline Mode**: Work without internet connection
- **Advanced Parsing**: Better parsing for complex QR code formats
- **Custom Styling**: User-customizable interface themes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with real QR codes
5. Submit a pull request

## License

This project is licensed under the MIT License.
