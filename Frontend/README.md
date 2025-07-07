# How to Run the Frontend Web App

This document provides instructions on how to run the Plant Detect UI frontend web application.

## Prerequisites

Before running the application, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- npm (comes with Node.js)

## Installation

1. Navigate to the project directory:
   ```bash
   cd ./plantech_website/plantech_ui
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Development Mode

To run the application in development mode:

```bash
npm run dev
```


This will:
- Start the development server on port 5173
- Automatically open your default browser to http://localhost:5173
- Enable hot module replacement for fast development

### Building for Production

To build the application for production:

```bash
npm run build
```


This will create a `dist` directory with the production-ready files.

### Previewing the Production Build

To preview the production build locally:

```bash
npm run preview
```


This will serve the production build on a local server for testing.

## Project Structure

- `src/` - Contains the source code for the application
  - `components/` - React components
  - `pages/` - Page components
  - `main.jsx` - Application entry point
  - `index.css` - Global styles (using Tailwind CSS)

## Technologies Used

- React 18
- Vite (for fast development and optimized builds)
- Tailwind CSS (for styling)
- React Router (for navigation)