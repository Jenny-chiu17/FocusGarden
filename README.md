# FocusGarden

FocusGarden is a small Expo side project that turns focused study sessions into water drops for a personal flower garden.

## Run on Android

The simplest option builds the native app, starts Metro, installs the APK, and opens it on the selected emulator:

```powershell
cd C:\Users\User\Projects\FocusGarden
npm run android
```

To run from Android Studio:

1. Open `C:\Users\User\Projects\FocusGarden\android` as the project.
2. Wait for Gradle Sync to finish.
3. In a separate terminal at the project root, run `npx expo start --dev-client`.
4. Select the `app` run configuration and an Android device, then click Run.

The debug APK is generated at `android\app\build\outputs\apk\debug\app-debug.apk`.

## Run With Expo

```bash
npm install
npm run start
```

Use an Android emulator, an iOS simulator, or the web option from the Expo CLI.
