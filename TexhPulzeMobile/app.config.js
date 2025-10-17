export default {
  expo: {
    name: "TexhPulze",
    slug: "texhpulze",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    platforms: ["ios", "android", "web"],
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    updates: { 
      fallbackToCacheTimeout: 0 
    },
    assetBundlePatterns: ["**/*"],
    ios: { 
      supportsTablet: true 
    },
    android: { 
      adaptiveIcon: { 
        foregroundImage: "./assets/adaptive-icon.png", 
        backgroundColor: "#ffffff" 
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false
    },
    web: {
      bundler: "metro",
      favicon: "./assets/favicon.png"
    },
    extra: { 
      eas: { 
        projectId: "58ff0db1-03bb-4613-8cbb-00cbf5daa4a3" 
      } 
    }
  }
};