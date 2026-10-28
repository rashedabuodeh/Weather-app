It is a React Native (Expo SDK 58) Android weather app, written in TypeScript. It shows the weather for your current location and any cities you add, with optional accounts that sync your cities and push weather alerts.
____________
Features:
 - 📍 My Location tab: weather for wherever the phone is, using GPS.
 - Add cities: search by name; each city gets its own tab, saved on the phone or in your account.
 - Each city's page scrolls vertically and shows:
 - current conditions (temperature, feels like, humidity, wind, today's high/low);
 - next 24 hours, scrolling sideways;
 - 7-day forecast, with "Show 7 more days" for up to 14 days and min–max temperature bars.
 - Pull to refresh on every page.
 - Accounts (email/password): saved cities sync live across devices.
 - Weather alerts: push notifications for storms, heavy rain, snow, extreme heat or frost, and strong wind in your cities. They can be switched off, and there's a test button.
 - Campaigns: messages sent from the Firebase console reach every install.
______________
How data flows:
 - Forecast: a screen calls useForecast, which calls fetchForecast (Open-Meteo); the result is converted to our Forecast type and drawn by the components.
 - Login: services/auth calls Firebase Auth; onAuthStateChanged updates AuthContext, and the screens re-render.
 - Cities:
   
   1- signed out, they're stored on the phone
   
   2- signed in, they live in Firestore at users/{uid}, a live listener updates every device, and a copy stays on the phone.
   
- Alerts:
  
  1- the phone gets an FCM token, saved at users/{uid}/devices
  
  2- every 3 hours a Cloud Function checks each city's forecast
  
  3- it sends new alerts through FCM
  
  4- tapping an alert opens that city's tab.
  
- Security: firestore.rules lets each user read and write only their own data.
