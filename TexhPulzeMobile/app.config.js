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
      apiBaseUrl: process.env.API_BASE_URL || "https://texhpulze.onrender.com/api",
      eas: {
        projectId: "58ff0db1-03bb-4613-8cbb-00cbf5daa4a3"
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
