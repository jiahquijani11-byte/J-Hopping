# Expo SDK 57 Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the managed Expo application from SDK 54 to SDK 57 so it can run in the installed Expo Go client.

**Architecture:** Use Expo CLI's SDK-aware installer to align all Expo and React Native packages in `package.json` and `package-lock.json`. Make the one identified Expo Router source compatibility change, then validate with Expo Doctor, TypeScript, and lint without changing app behavior.

**Tech Stack:** Expo SDK 57, React Native 0.86, React 19.2, Expo Router, npm.

**Spec:** Approved in chat on 2026-09-06.

## Global Constraints

- Upgrade only mobile runtime dependencies and the required Expo Router type import.
- Do not change PHP, database files, application features, or UI behavior.
- Do not use Git commands or create/run tests.
- The project has no `android` or `ios` directory, so no native folder migration is needed.

---

### Task 1: Align Expo SDK dependencies

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: Expo SDK 57's compatible dependency matrix through Expo CLI.
- Produces: An SDK 57 dependency graph compatible with Expo Go SDK 57.

- [ ] **Step 1: Install Expo SDK 57 and compatible dependencies**

Run:

```powershell
npx expo install expo@^57.0.0 --fix
```

- [ ] **Step 2: Confirm the package manifest targets SDK 57**

Run:

```powershell
npm pkg get dependencies.expo dependencies.react dependencies.react-native dependencies.expo-router
```

Expected: Expo is `^57.0.0` or `~57.x`, React is `19.2.x`, React Native is `0.86.x`, and Expo Router is a compatible `~57.x` release.

### Task 2: Correct the Expo Router tab-bar type import

**Files:**
- Modify: `components/AppTabBar.tsx:1`

**Interfaces:**
- Consumes: Expo Router's SDK 57-compatible bottom tabs type export.
- Produces: A custom tab bar that uses the same type-only contract without a direct application import from `@react-navigation/bottom-tabs`.

- [ ] **Step 1: Update the type import**

Replace the import of `BottomTabBarProps` from `@react-navigation/bottom-tabs` with the SDK 57 Expo Router-compatible export or, if Expo Router does not expose that type, retain the package only as a direct type dependency verified by Expo Doctor.

- [ ] **Step 2: Verify the source does not contain invalid Expo Router navigation imports**

Run:

```powershell
rg -n '@react-navigation' app components lib
```

Expected: No direct runtime React Navigation import used by Expo Router application code.

### Task 3: Validate the upgraded project

**Files:**
- No source changes expected.

**Interfaces:**
- Consumes: The aligned dependency graph and corrected tab bar import.
- Produces: CLI evidence that package compatibility and TypeScript/lint checks succeed.

- [ ] **Step 1: Check Expo compatibility**

Run:

```powershell
npx expo-doctor@latest
```

Expected: No unresolved SDK-version or dependency compatibility errors.

- [ ] **Step 2: Check TypeScript**

Run:

```powershell
npx tsc --noEmit
```

Expected: Exit code 0.

- [ ] **Step 3: Check the project lint configuration**

Run:

```powershell
npm run lint
```

Expected: Exit code 0.

