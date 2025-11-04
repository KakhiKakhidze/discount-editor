import React, { useState, useEffect, useRef } from 'react';
import { Box, AppBar, Toolbar, Typography, Container, Card, CardContent, Button, Alert, CircularProgress } from '@mui/material';
import { QrCodeScanner as QrCodeScannerIcon, CameraAlt as CameraIcon, Stop as StopIcon } from '@mui/icons-material';
import { Html5Qrcode, Html5QrcodeScanType } from 'html5-qrcode';

function App() {
  const [scannedData, setScannedData] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const scannerRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    // Check if running on HTTPS (required for camera access)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      setError('Camera access requires HTTPS. Please use HTTPS or localhost.');
      return;
    }

    // Get available cameras on component mount
    getAvailableCameras();
    
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const getAvailableCameras = async () => {
    try {
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported in this browser');
      }

      // Request camera permission first
      await navigator.mediaDevices.getUserMedia({ video: true });
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        throw new Error('No cameras found on this device');
      }
      
      setCameras(videoDevices);
      setSelectedCamera(videoDevices[0].deviceId);
    } catch (err) {
      console.error('Camera access error:', err);
      const errorMsg = err?.message || err?.toString() || 'Unknown error';
      setError(`Failed to access camera: ${errorMsg}. Please check camera permissions and ensure you're using HTTPS.`);
    }
  };

  const startScanning = async () => {
    if (!selectedCamera) {
      setError('No camera selected');
      return;
    }

    setIsScanning(true);
    setError(null);
    setScannedData(null);

    // Wait for the DOM to update and the qr-reader element to be rendered
    setTimeout(async () => {
      try {
        // Check if Html5Qrcode is available
        if (typeof Html5Qrcode === 'undefined') {
          throw new Error('Html5Qrcode library not loaded. Please refresh the page.');
        }

        // Check if the DOM element exists
        const qrReaderElement = document.getElementById("qr-reader");
        if (!qrReaderElement) {
          throw new Error('Scanner container not found. Please try again.');
        }

        // Create new Html5Qrcode instance
        scannerRef.current = new Html5Qrcode("qr-reader");
        
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
        };

        // Start scanning
        await scannerRef.current.start(
          { deviceId: selectedCamera },
          config,
          onScanSuccess,
          onScanFailure
        );
      } catch (err) {
        console.error('Scanner start error:', err);
        let errorMessage = 'Failed to start camera scanner: ';
        
        // Safely get error message
        const errorMsg = err?.message || err?.toString() || 'Unknown error';
        
        if (errorMsg.includes('Permission denied')) {
          errorMessage += 'Camera permission denied. Please allow camera access and try again.';
        } else if (errorMsg.includes('NotFoundError')) {
          errorMessage += 'Camera not found. Please check if your camera is connected and not being used by another application.';
        } else if (errorMsg.includes('NotAllowedError')) {
          errorMessage += 'Camera access denied. Please check your browser permissions.';
        } else if (errorMsg.includes('NotReadableError')) {
          errorMessage += 'Camera is already in use by another application.';
        } else if (errorMsg.includes('HTML Element with id=qr-reader not found')) {
          errorMessage += 'Scanner container not ready. Please try again.';
        } else {
          errorMessage += errorMsg;
        }
        
        setError(errorMessage);
        setIsScanning(false);
      }
    }, 100); // Small delay to ensure DOM is updated
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error('Scanner stop error:', err);
      }
    }
    setIsScanning(false);
  };

  const onScanSuccess = (decodedText, decodedResult) => {
    console.log('QR Code detected:', decodedText);
    
    // Parse the scanned data
    let parsedData = {
      type: 'Unknown',
      content: decodedText,
      timestamp: new Date().toLocaleString(),
      format: 'QR Code',
      additionalInfo: {}
    };

    // Try to determine the type of data
    if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) {
      parsedData.type = 'URL';
      parsedData.additionalInfo = {
        title: 'Website Link',
        description: 'Click to visit the website',
        url: decodedText
      };
    } else if (decodedText.startsWith('tel:')) {
      parsedData.type = 'Phone Number';
      parsedData.content = decodedText.replace('tel:', '');
      parsedData.additionalInfo = {
        title: 'Phone Number',
        description: 'Call this number',
        phone: parsedData.content
      };
    } else if (decodedText.startsWith('mailto:')) {
      parsedData.type = 'Email';
      parsedData.content = decodedText.replace('mailto:', '');
      parsedData.additionalInfo = {
        title: 'Email Address',
        description: 'Send email to this address',
        email: parsedData.content
      };
    } else if (decodedText.startsWith('BEGIN:VCARD')) {
      parsedData.type = 'Contact Information';
      parsedData.additionalInfo = {
        title: 'Contact Card',
        description: 'Contact information',
        vcard: decodedText
      };
    } else if (decodedText.startsWith('WIFI:')) {
      parsedData.type = 'WiFi Network';
      parsedData.additionalInfo = {
        title: 'WiFi Configuration',
        description: 'WiFi network details',
        wifi: decodedText
      };
    } else {
      parsedData.type = 'Text';
      parsedData.additionalInfo = {
        title: 'Text Content',
        description: 'Plain text content'
      };
    }

    setScannedData(parsedData);
    stopScanning();
  };

  const onScanFailure = (error) => {
    // Handle scan failure silently - this is normal during scanning
    console.log('Scan failure (normal during scanning):', error);
  };

  const clearScan = () => {
    setScannedData(null);
    setError(null);
  };

  const handleCameraChange = (event) => {
    setSelectedCamera(event.target.value);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" sx={{ bgcolor: '#2d2d2d' }}>
        <Toolbar>
          <QrCodeScannerIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            QR Code Scanner
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, flexGrow: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Scan QR Code
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Point your camera at a QR code to scan and get information
          </Typography>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => {
                  setError(null);
                  getAvailableCameras();
                }}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {!isScanning && !scannedData && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Camera Selection
              </Typography>
              {cameras.length > 0 ? (
                <Box sx={{ mb: 3 }}>
                  <select
                    value={selectedCamera || ''}
                    onChange={handleCameraChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '16px'
                    }}
                  >
                    {cameras.map((camera) => (
                      <option key={camera.deviceId} value={camera.deviceId}>
                        {camera.label || `Camera ${camera.deviceId.slice(0, 8)}`}
                      </option>
                    ))}
                  </select>
                </Box>
              ) : (
                <Box sx={{ mb: 2 }}>
                  <Typography color="text.secondary" sx={{ mb: 1 }}>
                    No cameras found. Please check:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" component="ul" sx={{ pl: 2 }}>
                    <li>Camera permissions are granted</li>
                    <li>Camera is not being used by another application</li>
                    <li>You're using HTTPS or localhost</li>
                    <li>Your browser supports camera access</li>
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<CameraIcon />}
                  onClick={startScanning}
                  disabled={!selectedCamera}
                  sx={{ 
                    py: 2, 
                    px: 4, 
                    fontSize: '1.2rem',
                    bgcolor: '#1976d2',
                    '&:hover': { bgcolor: '#1565c0' }
                  }}
                >
                  Start Camera Scanner
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {isScanning && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <CircularProgress size={24} sx={{ mr: 2 }} />
                <Typography variant="h6" color="primary">
                  Scanning QR Code...
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
                Point your camera at a QR code
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<StopIcon />}
                  onClick={stopScanning}
                  color="error"
                >
                  Stop Scanning
                </Button>
              </Box>
              
              <div id="qr-reader" style={{ width: '100%', marginTop: '20px' }}></div>
            </CardContent>
          </Card>
        )}

        {scannedData && (
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom color="primary">
                Scanned Information
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Type:
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {scannedData.type}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Content:
                </Typography>
                <Typography variant="body1" sx={{ mb: 1, wordBreak: 'break-all' }}>
                  {scannedData.content}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Format:
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {scannedData.format}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Scanned At:
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {scannedData.timestamp}
                </Typography>
              </Box>

              {scannedData.additionalInfo && Object.keys(scannedData.additionalInfo).length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Additional Information:
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    {Object.entries(scannedData.additionalInfo).map(([key, value]) => (
                      <Typography key={key} variant="body2" sx={{ mb: 0.5 }}>
                        <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={clearScan}
                  sx={{ mr: 2 }}
                >
                  Clear
                </Button>
                <Button
                  variant="contained"
                  onClick={startScanning}
                  startIcon={<CameraIcon />}
                >
                  Scan Another
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
}

export default App;
