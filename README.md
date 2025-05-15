# Sukh-Mind

Sukh-Mind is an AI-powered mental health chatbot designed to provide emotional support, stress management techniques, and well-being assistance. Developed for a hackathon by [**Ranit Kumar Manik**](https://www.linkedin.com/in/ranit-manik/), [**Soumen Tunga**](https://www.linkedin.com/in/soumen-tunga/), [**Sagnik Metiya**](https://www.linkedin.com/in/sagnikmetiya/), and [**Anish Kanrar**](https://www.linkedin.com/in/anish-kanrar-1b716128a/), this project leverages cutting-edge AI technology to enhance mental health support.

## 🔹 Overview

Sukh-Mind utilizes **Google’s AI Studio and Gemini AI** to deliver intelligent responses to users. The frontend is built with **React, JavaScript, and CSS**, ensuring a responsive and seamless user experience. This project eliminates the need for a backend, directly interacting with the Gemini API for enhanced performance and efficiency.

## ✨ Key Features

- **AI-Powered Support** – Offers emotional assistance and stress management guidance.
- **Google Gemini AI Integration** – Leverages AI for personalized responses.
- **Modern Frontend** – Developed with React, JavaScript, and CSS for scalability and performance.
- **Seamless API Communication** – Direct interaction with Gemini AI, eliminating backend dependencies.
- **Secure API Key Management** – Uses environment variables for safe API key storage.

## 📌 Installation & Setup

### 1️⃣ Prerequisites

Ensure you have the following installed:

- **Node.js (Latest LTS version recommended)**
- **npm or yarn**

### 2️⃣ Clone the Repository

```bash
git clone https://github.com/RanitManik/Sukh-Mind.git
cd Sukh-Mind
```

### 3️⃣ Install Dependencies

```bash
npm install
```

### 4️⃣ Configure API Key and Model

Create a `.env.local` file in the project root and add:

```ini
GEMINI_API_KEY=your-api-key-here
```

Then, update the model configuration in `src/config/gemini.js`:

```javascript
const apiKey = process.env.GEMINI_API_KEY;

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "tunedModels/mentalhealthchatbot-02-7ul5vhgobzol", // update this model name
});
```

Restart the development server to apply changes.

### 5️⃣ Run the Application

```bash
npm run dev
```

Access the application at [`http://localhost:5173`](http://localhost:3000).

## 📸 Screenshots

Here are some screenshots of the Sukh-Mind application in action:

### Home Screen
![Home Screen](./screenshot/sc%20(1).png)

### Chat Interface
![Chat Interface](./screenshot/sc%20(2).png)

### Model Selection
![Model Selection](./screenshot/sc%20(3).png)

## 🤝 Contribution Guidelines

We welcome contributions! Follow these steps to contribute:

1. **Fork the repository** on GitHub.
2. **Clone your forked repository**:

```bash
git clone https://github.com/Sukh-Mind/Sukh-Mind.git
```

3. **Create a new branch** for your feature or bug fix:

```bash
git checkout -b feature-or-bugfix-name
```

4. **Make necessary changes and commit**:

```bash
git commit -m "Brief description of changes"
```

5. **Push your changes and submit a Pull Request (PR)**.

## 📜 License

Sukh-Mind is released under the **MIT License**. See [LICENSE](LICENSE) for details.
