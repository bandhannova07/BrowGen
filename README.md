# Browgen - Revolutionary Browser Website

A modern, creative tech-style website for the Browgen mobile browser app with download functionality.

## Features

- **Modern Design**: Creative tech-style UI with animations and gradients
- **Responsive**: Fully responsive design that works on all devices
- **Download Functionality**: APK download with proper error handling
- **Smooth Animations**: Scroll-triggered animations and parallax effects
- **Contact Form**: Functional contact form with validation
- **Mobile Navigation**: Hamburger menu for mobile devices

## Sections

1. **Home**: Hero section with app showcase and call-to-action
2. **About**: Feature highlights with animated cards
3. **Download**: APK download section with app information
4. **Team**: Team information and details
5. **Contact**: Contact form and company information

## Setup Instructions

### 1. Add Your APK File
To enable APK downloads, add your `browgen-app.apk` file to the project root directory:

```
browgen_mainweb/
├── index.html
├── style.css
├── script.js
├── browgen-app.apk  ← Add your APK file here
└── README.md
```

### 2. Customize Content
Edit the following files to customize your website:

- **index.html**: Update text content, contact information, and team details
- **style.css**: Modify colors, fonts, and styling
- **script.js**: Add custom functionality or modify existing features

### 3. Run the Website
Simply open `index.html` in a web browser or serve it using a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

## Customization Guide

### Colors
The website uses CSS custom properties for easy color customization. Edit these variables in `style.css`:

```css
:root {
    --primary-color: #6366f1;     /* Main brand color */
    --secondary-color: #06b6d4;   /* Secondary accent */
    --accent-color: #f59e0b;      /* Accent color */
    /* ... other colors */
}
```

### Content Updates
1. **Company Information**: Update contact details in the contact section
2. **App Information**: Modify app description and features in the about section
3. **Team Details**: Add your team members in the team section
4. **Download Stats**: Update download statistics in the download section

### APK File Management
The download functionality will:
- Check if `browgen-app.apk` exists in the project directory
- Show an informative modal if the file is not found
- Automatically trigger download if the file exists
- Display success/error messages appropriately

## File Structure

```
browgen_mainweb/
├── index.html          # Main HTML file
├── style.css           # Stylesheet with animations
├── script.js           # JavaScript functionality
├── browgen-app.apk     # Your APK file (add this)
└── README.md           # This file
```

## Browser Support

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with animations, gradients, and flexbox/grid
- **JavaScript (ES6+)**: Interactive functionality
- **Font Awesome**: Icons
- **Google Fonts**: Typography (Inter & JetBrains Mono)

## Performance Features

- Optimized animations with CSS transforms
- Lazy loading for scroll animations
- Efficient event handling
- Minimal external dependencies

## License

This project is created for Browgen browser app. Modify and use as needed for your project.

---

**Note**: Remember to add your actual `browgen-app.apk` file to enable downloads, and update the contact information and content to match your requirements.
