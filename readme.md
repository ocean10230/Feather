<div align="center">
  <img src="./public/icon.png" width="80" alt="Feather Logo">

  # Feather `v2.3.0`

  **A lightweight, automated Microsoft Rewards companion built for speed and privacy.**

  ![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue?style=flat-square&logo=typescript)
  ![Bundle Size](https://img.shields.io/badge/Bundle%20Size-10_kB_gzipped-brightgreen?style=flat-square)
</div>

---

## ⚠️ Quick disclaimer

I (the creator) am not responsible if your account is banned **as this repository is an extension designed for full automation which is banned**. Don't use unless you are lazy (just like me)

How to reduce chances of getting banned (only **reduce**):
- Have good account standing (no previous ban from macro)
- Opted in for atleast 5 - 13 months (newly opted in users are on the watch)
- Assist your extension (ridiculous but it works)

The extension does not guaranteed to work for everyone as there is only one tester available

---

## ⚡ Features

Feather brings good features with frequent updates:

* **Optimized:** Zero external dependencies. Compiled to a minimal **~10 kB gzipped** background script.
* **Blazing Fast:** Builds in milliseconds and runs with negligible memory footprint.
* **Privacy-First:** Executes completely locally inside your browser. No telemetry, tracking, or data collection.
* **Smart throttling:** Built-in safety delays to mimic human interaction and ensure better account safety.
* **Human-like generation:** Some tasks automation are ensured to generate with different varriations (typo, lazy-uppercase, random capitalization, normal)

---

## 🛠️ Building from Source

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+ recommended)
* `npm` or `pnpm`

### Installation & Build

Here is a step by step guide on how to build the extension yourself (if you have trust issues on the releases):

1. Clone the repository:
   ```bash
   git clone [https://github.com/your-username/feather.git](https://github.com/your-username/feather.git)
   cd feather
   ```

  If you don't have git. Just download the source code from this repository
   
2. Build the project
   ```bash
   npm install
   npm run build
   ```
3. Import the build into your browser
