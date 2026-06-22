# GYANODAYA Mobile Application

Welcome to **Gyanodaya**, a premium, high-performance, and feature-rich React Native mobile learning application tailored for comprehensive exam preparation and online courses.

The application has been designed with a **futuristic, glassy user interface**, offering dynamic multi-theme customization and full multilingual localization.

---

## Table of Contents
1. [Key Features](#key-features)
2. [Technology Stack](#technology-stack)
3. [Project Directory Structure](#project-directory-structure)
4. [Theming & Localization Architecture](#theming--localization-architecture)
5. [Local Development Environment Setup](#local-development-environment-setup)
6. [Android Deployment Procedure (Google Play Store)](#android-deployment-procedure-google-play-store)
7. [iOS Deployment Procedure (Apple App Store)](#ios-deployment-procedure-apple-app-store)
8. [Troubleshooting & Build Optimization](#troubleshooting--build-optimization)

---

## Key Features

- **Personalized Exam Prep & Mock Tests**: Full-fledged test screen with rule verification, live countdown timers, question navigation, score sheets, and real-time detailed performance analytics.
- **Futuristic Multi-Theme Support**: Instant global theme switching across four premium schemes:
  - **Classic**: Traditional, elegant educational dark blue and gold layout.
  - **Neon Cyber**: Sleek, immersive sci-fi deep-space dark mode with cyan and purple neon highlights.
  - **Aurora Dream**: Vibrant light theme with soft lavender background and clean glassmorphic borders.
  - **Sunset Glow**: Rich espresso dark mode accented with warm amber and orange tones.
- **Multilingual Support**: Fully localized in **English (EN)**, **Hindi (हिन्दी)**, and **Odia (ଓଡ଼ିଆ)**, resolving all UI elements dynamically.
- **Security Protections**: Prevents unauthorized screen recording, screenshots, and audio recording to protect proprietary course materials.
- **Course Payments & Enrolling**: Intuitive courses browser, teacher profiles, payment history trackers, and course status badges.

---

## Technology Stack

- **Framework**: React Native (TypeScript)
- **State Management**: Redux Toolkit (Slices) & Redux Saga (Asynchronous Side Effects & Api Requests)
- **Navigation**: React Navigation 7 (Native Stack Navigator & Bottom Tabs)
- **Storage**: AsyncStorage (Local persistent caching of auth tokens, themes, and language choices)
- **Styling**: Vanilla StyleSheet styling paired with scaled scaling helpers for dynamic responsiveness across phone screens.
- **Visuals & Icons**: Vector Icons (Feather / FontAwesome) & Shimmer placeholders.

---

## Project Directory Structure

```text
mobileapp_gyanodaya/
├── android/               # Native Android configurations & Gradle setup
├── ios/                   # Native iOS CocoaPods, certificates & Xcode workspace
├── src/                   # React Native source root
│   ├── Assets/            # Local images, logos, and custom vectors
│   ├── Components/        # Reusable UI widgets (Avatar, EmptyState, Shimmers)
│   ├── Navigator/         # StackNav (routes stack) and TabNav (bottom tab navigator)
│   ├── Redux/             # Redux Store configuration
│   │   ├── Reducers/      # Auth, Profile, Home, MockTest, and UiPreference slices
│   │   └── Saga/          # Saga middlewares for authentication, tests, and profiles
│   ├── Screen/            # UI Screen components
│   │   ├── Auth/          # Onboarding, Login, Register, OTP, ForgotPassword, ChangePassword
│   │   ├── HomeScreen/    # Main dashboard statistics & activity feeds
│   │   ├── MockBankScreen/# Tests repository and quiz rule parameters
│   │   ├── ProfileScreen/ # Profile parameters, preferences selectors, account deletion
│   │   └── ...            # Other auxiliary screens (Teacher, Result, AboutUs, PaymentHistory)
│   ├── Themes/            # Styling utilities (fonts, layouts, core color paths)
│   │   ├── themes.ts      # Active colors definitions for Classic, Neon, Aurora, and Sunset
│   │   ├── translations.ts# Localization dictionary for English, Hindi, and Odia
│   │   └── hooks.ts       # useTheme() and useTranslation() global hooks
│   └── Utils/             # Network requests wrappers and responsive scaling calculators
├── App.tsx                # Application wrapper with SafeAreaProviders
├── index.js               # Entry point registering Gyanodaya App under StoreProvider
└── package.json           # Scripts, dependencies, and metadata configuration
```

---

## Theming & Localization Architecture

Gyanodaya uses a reactive context-free approach utilizing the active Redux store:
- **`useTheme()`**: Returns the active theme name (`theme`) and dynamic color codes (`colors`) mapped in `src/Themes/themes.ts`. Component views dynamically apply colors using double arrays: `style={[styles.box, { backgroundColor: colors.cardBackground }]}`.
- **`useTranslation()`**: Returns a `t(key, replacements)` translation parser. Translates keys by locating strings inside `src/Themes/translations.ts` depending on the active Redux language settings (`en`, `hi`, `or`).

---

## Local Development Environment Setup

### Prerequisites
- Node.js >= `22.11.0`
- Android Studio & JDK 17 (for Android compiles)
- Xcode (macOS only, for iOS compiles)

### Installation
1. Install node dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
2. For macOS (iOS native components setup):
   ```bash
   cd ios && pod install && cd ..
   ```

### Start Development Server
1. Start Metro bundler:
   ```bash
   npm run start
   ```
2. Launch native mobile builders (in a separate terminal):
   - **Android emulator / connected device**:
     ```bash
     npm run android
     ```
   - **iOS simulator**:
     ```bash
     npm run ios
     ```

---

## Android Deployment Procedure (Google Play Store)

### 1. Generate a Signing Key
You need a 2048-bit RSA release signing keystore. Generate it using the command line:
```bash
keytool -genkey -v -keystore gyanodaya-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias gyanodaya-alias
```
*Save `gyanodaya-release-key.jks` in the `android/app` directory (make sure it is ignored in `.gitignore` if it is a private key).*

### 2. Configure Gradle credentials
Edit `android/gradle.properties` (or setup env parameters) with the keystore credentials:
```properties
GYANODAYA_RELEASE_STORE_FILE=gyanodaya-release-key.jks
GYANODAYA_RELEASE_KEY_ALIAS=gyanodaya-alias
GYANODAYA_RELEASE_STORE_PASSWORD=your_keystore_password
GYANODAYA_RELEASE_KEY_PASSWORD=your_key_password
```

### 3. Setup Gradle Signing Configuration
Verify `android/app/build.gradle` has the signing configuration hooked up under `signingConfigs`:
```groovy
signingConfigs {
    release {
        if (project.hasProperty('GYANODAYA_RELEASE_STORE_FILE')) {
            storeFile file(GYANODAYA_RELEASE_STORE_FILE)
            storePassword GYANODAYA_RELEASE_STORE_PASSWORD
            keyAlias GYANODAYA_RELEASE_KEY_ALIAS
            keyPassword GYANODAYA_RELEASE_KEY_PASSWORD
        }
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
    }
}
```

### 4. Build the Release Bundle (AAB/APK)
Navigate to the root and trigger gradle compiles:
- **Build APK (For staging / internal testing)**:
  ```bash
  cd android && ./gradlew assembleRelease && cd ..
  ```
  The generated APK is stored at `android/app/build/outputs/apk/release/app-release.apk`.
- **Build Android App Bundle (AAB) (For Google Play console distribution)**:
  ```bash
  cd android && ./gradlew bundleRelease && cd ..
  ```
  The generated AAB is stored at `android/app/build/outputs/bundle/release/app-release.aab`.

### 5. Submit to Google Play
1. Log in to the [Google Play Console](https://play.google.com/console).
2. Choose the Gyanodaya application, go to **Production** or **Internal Testing**.
3. Create a new release, upload the `app-release.aab` bundle, fill out the release tags, and submit for review.

---

## iOS Deployment Procedure (Apple App Store)

### 1. Xcode Provisioning & Certificates Setup
1. Open the project in Xcode: `open ios/GYANODAYA.xcworkspace`.
2. Select the `GYANODAYA` root project node in the left bar.
3. Select the primary target, choose the **Signing & Capabilities** tab.
4. Verify **Automatically manage signing** is selected. Choose your Apple Developer **Team** profile.
5. Xcode will generate iOS Developer and Distribution profiles matching the app Bundle Identifier.

### 2. Configure Bundle Display Name & Versioning
- Verify version parameters in the **General** settings inside Xcode:
  - **Version** (e.g. `1.0.0`)
  - **Build** (e.g. increment `1`, `2`, `3` for subsequent uploads)

### 3. Xcode Build Archive
1. Connect a generic iOS device (`Any iOS Device (arm64)`) in the Xcode top device dropdown.
2. Click **Product** in the top menu, then click **Archive**.
3. Once the archive builds, Xcode Organizer will open automatically.

### 4. Upload to App Store Connect
1. In Xcode Organizer, choose the latest archive and click **Distribute App**.
2. Select **App Store Connect** -> **Upload**.
3. Check the App Store configuration certificates, click **Upload**.
4. Once completed, your build will appear on [App Store Connect](https://appstoreconnect.apple.com) under your app profile within 15-30 minutes.

### 5. Release Submission
1. In App Store Connect, go to **TestFlight** to configure internal/external testers.
2. To push to the App Store, create a new App Version, select the uploaded build from Xcode, configure screenshots, descriptions, metadata, and submit the release for App Review.

---

## Troubleshooting & Build Optimization

### Clear caches
If compilation fails or Metro shows outdated assets, clear the project caches:
```bash
# Clean watchman & react-native cache
watchman watch-del-all
rm -rf node_modules
npm cache clean --force
npm install --legacy-peer-deps

# Clean Android build artifacts
cd android && ./gradlew clean && cd ..

# Clean iOS build artifacts
cd ios && rm -rf build DerivedData Pods Podfile.lock && pod install && cd ..
```

---

## Docker Containerization Setup

The project includes a complete Docker configuration to develop, build, or serve the React Native Web client inside containers.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running on your system.

### 1. Local Development Mode (with Hot Reloading)
To run a containerized development server with host volume mounting and hot reloading enabled:
```bash
docker compose up web-dev
```
- **Access URL**: [http://localhost:3000](http://localhost:3000)
- **Features**: Maps the project root directory into the container while isolating container-specific `node_modules`. Webpack Dev Server will watch local files and hot-reload changes instantly in your browser.

### 2. Production Build and Nginx Hosting
To compile the web assets using a multi-stage build and serve them via an optimized Nginx server:
```bash
docker compose up web-prod --build
```
- **Access URL**: [http://localhost:8080](http://localhost:8080)
- **Features**: Automatically triggers a production webpack compilation (`npm run build-web`) and places the resulting files into an Nginx container. The Nginx server includes:
  - SPA routing fallback support (routing all subpaths back to `index.html`).
  - Gzip compression for faster asset load times.
  - An API gateway proxy redirecting `/api/*` requests securely to `https://www.gyanodaya.cloud` with SSL verification.

### Docker CLI Reference
- **Stop and teardown containers**:
  ```bash
  docker compose down
  ```
- **Rebuild the images from scratch**:
  ```bash
  docker compose build --no-cache
  ```
- **Inspect container runtime logs**:
  ```bash
  docker compose logs -f [service-name]
  ```

