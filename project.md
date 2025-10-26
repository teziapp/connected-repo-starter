# The "Scheduled Prompt & Journal"

**The Problem:** People want to journal or think about their lives, but they get analysis paralysis staring at a blank page. They need a simple, timely nudge.

**The Simple Solution:** An app that only provides a scheduled, single question and a text box.

* **Mobile App:**
    1.  **Setup:** The user sets up a time (e.g., 8:00 AM and 9:00 PM).
    2.  **Notification:** At the scheduled time, the app sends a notification with a **single, thought-provoking prompt** (e.g., "What's one thing I can subtract from my schedule today?" or "What's a small win I had since lunch?").
    3.  **Input:** Tapping the notification opens a **plain text box** for the answer. No formatting, no dates, no categories. Just the answer.
    4.  **Search:** The only other screen is a simple search bar to look up past answers.
* **Web App:** A simple web interface to view the history and manage the prompt schedule.
    * **PWA Support:** The web app will be a Progressive Web App, installable on mobile and desktop devices with offline capabilities.
* **Why people pay:** They are paying for the **consistency and the mental shortcut**. The app removes the burden of *what* to write and *when* to write it, delivering a moment of structured self-reflection.

## Technical Architecture

* **Offline-First:** The app is designed to work offline by default, with all journal entries stored locally on the device.
* **Data Storage Strategy:**
    * **Free Users:** All journal data is stored only on the device. No cloud backup available.
    * **Paid Users:** Option to enable cloud backup and sync across devices.
* **Monetization:**
    * **Free Tier:** Supported by advertisements displayed within the app.
    * **Paid Tier:** Ad-free experience with cloud backup and sync capabilities.