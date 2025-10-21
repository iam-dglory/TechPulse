export default {
  expo: {
    name: "TexhPulze",
    slug: "texhpulze",
    version: "1.0.0",
    orientation: "portrait",
    description: "Your gateway to tech news - AI, gadgets, software, and more. Stay informed with the latest technology trends and innovations.",
    keywords: ["tech", "news", "AI", "gadgets", "software", "technology", "innovation"],
    primaryColor: "#4ECDC4",
        icon: "./assets/logo-texhpulze.svg",
    userInterfaceStyle: "light",
        splash: {
            image: "./assets/logo-texhpulze.svg",
            resizeMode: "contain",
            backgroundColor: "#000000"
        },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.iamdglory.texhpulze",
      buildNumber: "1.0.0",
      infoPlist: {
        NSUserTrackingUsageDescription: "This app uses tracking to provide personalized content and analytics.",
        NSCameraUsageDescription: "This app uses the camera to capture images for grievance reports.",
        NSPhotoLibraryUsageDescription: "This app accesses your photo library to attach images to grievance reports.",
        NSLocationWhenInUseUsageDescription: "This app uses location to provide location-based grievance reporting.",
      }
    },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/logo-texhpulze.svg",
                backgroundColor: "#4169E1",
                monochromeImage: "./assets/logo-texhpulze.svg"
            },
      package: "com.iamdglory.texhpulze",
      versionCode: 1,
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ]
    },
        web: {
            favicon: "./assets/favicon.ico"
        },
    plugins: [
      "expo-dev-client",
      [
        "expo-build-properties",
        {
          ios: {
            deploymentTarget: "13.0"
          },
          android: {
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            buildToolsVersion: "34.0.0"
          }
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "your-eas-project-id"
      }
    },
    owner: "iam-dglory"
  }
};
