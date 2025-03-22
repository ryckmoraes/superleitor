# Welcome to your Lovable project

## SDK Installation Instructions

To install the necessary SDK for this project, run the following command:

```bash
npm install @capacitor/core
```

### Configuration

After installation, ensure that the SDK is properly configured in the `capacitor.config.ts` and `android/app/src/main/assets/capacitor.config.json` files.

## Project info

**URL**: https://lovable.dev/projects/61c9c85a-521b-4753-a60e-0cdb64c7b0cc

## APK Download

An Android APK is built automatically when changes are made to the project. To compile the APK, follow these steps:

1. Ensure that you have the necessary environment set up, including Node.js and Android Studio.
2. Update the `capacitor.config.ts` file with the correct keystore information if you plan to sign the APK.
3. Run the following command to install all dependencies:
   ```bash
   npm install
   ```
4. Build the APK using Capacitor:
   ```bash
   npx cap build android
   ```
5. Test the APK on an Android device or emulator to ensure it functions as expected.

If you need to release the APK, ensure it is signed properly using the keystore information provided in the `capacitor.config.ts` file.
