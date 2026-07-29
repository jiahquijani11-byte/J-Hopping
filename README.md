# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## XAMPP MySQL setup

1. Start **Apache** and **MySQL** in the XAMPP Control Panel.

2. Open phpMyAdmin:

   ```text
   http://localhost/phpmyadmin
   ```

3. Import the migration file:

   ```text
   database/migrations/001_create_jhopping_database.sql
   ```

   This creates the MySQL database named `jhopping` with normalized auth tables:
   `users`, `user_personal_information`, and `user_contact_information`.

4. Check the database connection in your browser:

   ```text
   http://localhost/J-Hopping/api/health.php
   ```

The PHP database settings are in `api/config.php`. XAMPP usually uses username `root` and an empty password by default.

Signup and login use these API endpoints:

```text
http://localhost/J-Hopping/api/signup.php
http://localhost/J-Hopping/api/login.php
```

For Expo running on a physical phone, replace `localhost` in `lib/api.ts` with your computer's local IP address, for example `http://192.168.1.10/J-Hopping/api`.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
