# 🤖 Gemini AI Chatbot with PDF Understanding

This project is a web-based AI chatbot that allows users to upload a PDF file and interact with it using natural language. It uses **Google's Gemini 2.0 API** to answer questions by combining user input and the content extracted from the uploaded PDF.

---

## 🔥 Features

- 📄 **PDF Upload Support**  
  Upload a PDF file and parse its content directly in the browser using PDF.js (via CDN).

- 🧠 **Gemini 2.0 Flash API Integration**  
  Uses Google’s powerful Gemini language model to provide intelligent responses.

- 🗣️ **Natural Chat UI**  
  Clean, responsive chatbot interface built with React, TailwindCSS, and ShadCN components.

- 🕵️‍♀️ **Invisible Context Injection**  
  The parsed PDF text is sent silently to the API with the user's query — not shown in the chat UI.

- ❌ **Remove Uploaded File**  
  Users can clear the uploaded file and its content dynamically.

---

## 🧰 Tech Stack

| Technology      | Description                          |
|-----------------|--------------------------------------|
| React + Next.js | Frontend Framework                   |
| Tailwind CSS    | Styling Framework                    |
| PDF.js (CDN)    | PDF Parsing in the Browser           |
| Google Gemini API | Conversational AI Model (v1beta)   |
| TypeScript      | Type Safety                          |

---

## 🚀 How It Works

1. **Upload a PDF**  
   The PDF content is extracted page-by-page using `pdf.js` and stored locally.

2. **Type a Message**  
   The chatbot input is combined with the parsed PDF content (only for API use).

3. **Send to Gemini**  
   The combined message is sent to Gemini 2.0 Flash endpoint for intelligent response.

4. **Display Response**  
   The AI reply is shown in the UI, while the PDF content remains hidden.

---

## 📸 Screenshots

> You can upload your project UI screenshots here if you want!

---

## 📂 Project Structure

