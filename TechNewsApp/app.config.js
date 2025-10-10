export default {
  expo: {
    name: "TechPulse",
    slug: "techpulse",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#4ECDC4"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.iamdglory.techpulse",
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
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#4ECDC4"
      },
      package: "com.iamdglory.techpulse",
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
      favicon: "./assets/favicon.png"
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
