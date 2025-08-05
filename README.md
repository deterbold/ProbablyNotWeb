
A playful web application that uses machine learning to tell you what objects in images **probably aren't**! Instead of the typical "this is a cat" classification, our AI confidently declares "Probably Not a sandwich" by showing the 3rd most likely classification result.

## Prerequisites

- Modern web browser with camera support
- Camera permissions (for taking photos)
- Internet connection (for ML5.js library)


**Grant camera permissions** when prompted by your browser

## 📁 Project Structure

```
probably-not/
│
├── index.html          # Landing page with instructions
├── probablyNot.html    # Main application interface
├── probablyNot.js      # JavaScript logic with ML5.js integration
└── README.md           # This file
```

## Technical Details

### Technologies Used
- **HTML5**: Structure and camera API access
- **CSS3**: Modern styling with glassmorphism effects
- **JavaScript (ES6+)**: Application logic and image processing
- **ML5.js**: Machine learning library for browser-based AI
- **MobileNet**: Pre-trained image classification model

### How the AI Works
1. **Model Loading**: ML5.js loads Google's MobileNet model
2. **Image Processing**: Captured/uploaded images are analyzed
3. **Classification**: MobileNet returns top predictions with confidence scores
4. **3rd Result Selection**: We extract the 3rd most likely result
5. **Display**: Show "Probably Not a [result]" for entertainment


## Privacy & Security

- **No Data Storage**: Images are processed locally and not stored
- **No Server Communication**: Everything runs in your browser
- **Camera Access**: Only used when explicitly taking photos
- **ML5.js**: Uses CDN-hosted library for AI functionality


## Troubleshooting

### Camera Not Working
- Ensure browser has camera permissions
- Check if camera is being used by another application
- Try refreshing the page
- Make sure you're using HTTPS (required for camera in many browsers)

### Model Loading Issues
- Check internet connection
- Ensure ML5.js CDN is accessible
- Try clearing browser cache
- Check browser console for error messages

### Performance Issues
- Close other camera-using applications
- Try using a different browser
- Reduce browser tab usage for better performance
