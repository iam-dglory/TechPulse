export default {
  expo: {
    name: "TexhPulze",
    slug: "texhpulze",
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
      bundleIdentifier: "com.texhpulze.mobile"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#4ECDC4"
      },
      package: "com.texhpulze.mobile"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      apiBaseUrl: "http://localhost:8090/api",
      eas: {
        projectId: "YOUR_EAS_PROJECT_ID"
      }
    },
    plugins: [],
    scheme: "texhpulze",
    updates: {
      url: "https://u.expo.dev/texhpulze-mobile-project"
    },
    runtimeVersion: {
      policy: "sdkVersion"
    }
  }
};
