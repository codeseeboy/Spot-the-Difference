# Spot the Difference Game

A JSON-configurable "Spot the Difference" game built with React.js. This application allows users to create and play custom spot-the-difference puzzles with an intuitive interface.

## Features

- **Create Custom Games**: Upload your own image pairs and mark differences
- **Intuitive Difference Marking**: Simply click on differences in both images
- **Visual Difference Indicators**: Numbered markers show all differences
- **Adjustable Difference Areas**: Fine-tune the size and position of differences
- **JSON Configuration**: Save and load game configurations as JSON files
- **Interactive Gameplay**: Click to find differences with visual feedback
- **Score Tracking**: Track found differences and completion time
- **Responsive Design**: Works on desktop and mobile devices

## Installation and Setup

1. Clone this repository:
   \`\`\`
   git clone <https://github.com/codeseeboy/Spot-the-Difference>
   cd Spot-the-Difference
   \`\`\`

2. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

3. Start the development server:
   \`\`\`
   npm start
   \`\`\`

4. Open your browser and navigate to `http://localhost:3000`

## How to Use

### Creating a Game

1. **Upload Images**:
   - Upload your original and modified images using the "Upload Image" buttons

2. **Mark Differences**:
   - Click "Mark New Difference" button
   - Click on the first image where you see a difference
   - Click on the corresponding location in the second image
   - The difference will be added with a numbered marker

3. **Adjust Differences**:
   - Expand each difference in the list to adjust its position and size
   - Remove any unwanted differences with the delete button

4. **Save Configuration**:
   - Click "Save Configuration" to download your game setup as a JSON file
   - This file can be loaded later to continue editing or to share with others

5. **Start Game**:
   - Click "Start Game" when you've added all the differences

### Playing the Game

1. Click on differences you spot between the two images
2. Use the hint button if you get stuck
3. Track your progress with the score counter
4. Complete the game by finding all differences

## How the Game Uses JSON

The game uses a JSON structure to define all aspects of the game configuration. This allows for easy saving, loading, and sharing of custom games.

### JSON Structure

\`\`\`json
{
  "gameTitle": "Spot the Difference - Custom Game",
  "images": {
    "image1": "data:image/jpeg;base64,...", // Base64 encoded image data
    "image2": "data:image/jpeg;base64,..." // Base64 encoded image data
  },
  "differences": [
    {
      "x": 15,
      "y": 25,
      "width": 10,
      "height": 10,
      "description": "Description of the difference"
    },
    ...
  ]
}
\`\`\`

### JSON Fields Explained

- `gameTitle`: The title displayed at the top of the game
- `images`: Contains the two images used in the game
  - `image1`: Original image (as data URL or path)
  - `image2`: Modified image with differences (as data URL or path)
- `differences`: Array of objects defining each difference
  - `x`: Horizontal position of the difference (percentage of image width)
  - `y`: Vertical position of the difference (percentage of image height)
  - `width`: Width of the difference area (percentage of image width)
  - `height`: Height of the difference area (percentage of image height)
  - `description`: Text description of the difference

### JSON Configuration Flow

1. **Creation**: When you mark differences in the configuration screen, the app builds this JSON structure internally
2. **Saving**: When you click "Save Configuration", this JSON is downloaded as a file
3. **Loading**: When you load a configuration, the JSON is parsed and applied to the game
4. **Playing**: During gameplay, the JSON structure is used to validate clicks and track found differences

## Recent Updates

- **Click-to-Mark Differences**: Added intuitive interface for marking differences by clicking on both images
- **Visual Difference Indicators**: Added numbered markers to show differences on both images
- **Clean Configuration Screen**: Removed default differences for a clean starting point
- **Improved User Flow**: Added clear instructions and visual feedback during difference marking
- **Responsive Design**: Improved mobile compatibility for both configuration and gameplay

## Technical Implementation

- **React.js**: Modern component-based architecture
- **React Hooks**: State management with useState and useEffect
- **File Handling**: Upload and process images client-side
- **JSON Export/Import**: Save and load game configurations
- **Responsive Design**: Works on various screen sizes
