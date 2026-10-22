# Road Scout Insight

Design a modern, professional, high-fidelity web app prototype for “Smart Pothole & Road Distress Mapper,” an AI-powered road inspection platform for municipal authorities.

STYLE: Clean smart-city dashboard, white and light-blue backgrounds, navy-blue typography, orange accents, rounded cards, subtle shadows, clear icons, and responsive desktop layout. Prioritize usability and a realistic hackathon demo.

CREATE 5 CONNECTED SCREENS:

DASHBOARD: Show total defects detected, high-priority issues, verified reports, and roads needing inspection. Include recent activity and a map preview.

UPLOAD & DETECT: Provide drag-and-drop upload for road images/videos, an upload progress indicator, a “Detect Road Defects” button, and a preview showing AI bounding boxes around potholes and cracks with confidence scores.

DEFECT MAP: Display an interactive-style map with colored pins for detected defects. Include filters for defect type, severity, date, and verification status. Clicking a pin opens location, timestamp, evidence image, and confidence.

INSPECTION PRIORITY: Create a ranked table of road defects with severity, confidence, repeat sightings, location, and priority score. Use clear High, Medium, and Low indicators. Add sorting and filtering.

DEFECT REVIEW: Show the original image, detected defect overlays, location metadata, and buttons to Confirm, Correct, or Reject a detection. Include a human-review status.

INTERACTIONS: Connect all screens through a left sidebar with Dashboard, Upload & Detect, Defect Map, Inspection Priority, and Review. Make buttons, filters, navigation, map pins, and report cards clickable. Use realistic sample data and demonstrate the complete workflow from upload to prioritized inspection.

IMPORTANT: Focus on a functional-looking prototype, not a marketing landing page. Keep layouts consistent, data readable, and the main demo flow obvious. Do not imply real AI processing or live GPS unless implemented.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://road-scout-insight.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7e050a2f-bc63-599f-be1b-1c7419301ba2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
