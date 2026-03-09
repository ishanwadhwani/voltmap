# VoltMap ⚡

VoltMap is a React Native mobile application designed to help Electric Vehicle (EV) owners locate charging stations, manage their vehicles, and estimate charging costs. Built with Expo and Firebase, the app provides a seamless and authenticated experience for tracking EV infrastructure.

## Features

* **User Authentication:** Secure email and password login/registration powered by Firebase Auth.
* **Interactive Map:** Real-time map interface (via Google Maps API) to view surrounding areas and charging locations.
* **My Garage:** A local storage feature allowing users to select and save their specific EV model (e.g., Tata Nexon, BYD Atto 3) to their device.
* **Dynamic Cost Estimator:** Automatically calculates the estimated cost of a full charge (0-100%) based on the specific battery capacity of the user's saved vehicle.
* **Custom UI Theme:** A fully custom, responsive interface built with NativeWind (Tailwind CSS) utilizing a professional Teal and Slate color palette.

## Tech Stack

* **Frontend:** React Native, Expo, Expo Router
* **Backend & Auth:** Firebase (Authentication)
* **Styling:** NativeWind (Tailwind CSS)
* **Local Storage:** AsyncStorage (`@react-native-async-storage/async-storage`)
* **Cloud Builds:** Expo Application Services (EAS)

## Installation and Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ishanwadhwani/voltmap.git
   cd voltmap-ev
   ```
2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```
3. **Environment Variables:**
      EXPO_PUBLIC_GOOGLE_API_KEY=your_google_maps_key
      EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
      EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
      EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
      EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
      EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
      EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

5. **Start the development server:**
   ```bash
   npx expo start -c
   ```


**Building the APK**
This project uses EAS to build standalone Android binaries. To generate an APK for local installation:
   ```bash
   eas build -p android --profile preview
   ```

