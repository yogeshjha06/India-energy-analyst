# 🌏⚡ **India Energy Analyst (IEA)**

### *AI-powered real-time energy intelligence platform for India*

### **Google DeepMind – Vibe Code with Gemini 3 Pro in AI Studio**

[![FastAPI](https://img.shields.io/badge/API-FastAPI-009688?style=flat\&logo=fastapi)]()
[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)]()
[![Government Data](https://img.shields.io/badge/Data-NPP%20Gov%20of%20India-green)]()
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)]()
[![AI](https://img.shields.io/badge/AI-Gemini%203%20Pro-purple?logo=google)]()
[![Hackathon](https://img.shields.io/badge/Google-DeepMind%20Hackathon-orange?logo=google)]()

---

# 🚀 **Overview**

**India Energy Analyst (IEA)** is a real-time energy market intelligence platform built during
**Google DeepMind’s “Vibe Code with Gemini 3 Pro in AI Studio” Hackathon**.

The platform aggregates **live government energy data** from India’s
**National Power Portal (NPP)** including:

* Installed Capacity by **state × fuel**
* Transmission infrastructure growth
* Historical generation trends (1946–2024)
* Daily renewable generation
* Real-time demand vs supply
* Grid frequency, load curve, and more

IEA then uses **Gemini 3 Pro** to interpret these datasets as an **Energy Research Analyst**,
helping users get **fresh, contextual, research-grade insights** instantly.

To bring **global awareness**, we integrated **Talvi Web API**, enabling the user to toggle 🌍
to enrich Indian insights with global market signals (EU, China, US, Japan).

Frontend is built with **HTML/JS/CSS**, backend with **FastAPI**, fully containerized using **Docker**
for future cloud deployment.

<img width="2133" height="869" alt="image" src="https://github.com/user-attachments/assets/e87b569a-b104-4ea3-9da4-6b7dbc4a4787" />



---

# 🧠 **Problem Statement**

The global energy landscape is undergoing a structural shift.
Major markets like **China, EU, and Japan** are now reaching **demand saturation**:

* China’s energy demand fell in several sectors in 2023–24
* EU electricity consumption dropped to nearly **2007 levels** (Eurostat)
* Japan’s population decline is shrinking overall energy demand

This indicates a **coming stagnation in traditional energy mega-markets**.

At the same time, **India is emerging as the world's fastest-growing energy market**:

* Electricity demand growing at **>7% YoY**
* Record RE expansion (solar/wind)
* Massive transmission build-out
* Rising industrialization and clean-energy reforms

However…

### ❌ There is **no single platform** to access India’s energy data

### ❌ Most official data is buried in **PDFs, Excel sheets, or fragmented dashboards**

### ❌ Analysts waste time collecting, cleaning, validating this data

### ❌ No tool provides **AI-powered research interpretation** for India’s energy scenario

This makes research slow, incomplete, and inaccessible for investors, analysts, and policymakers.

---

# 🎯 **Objective**

Build a **one-stop AI-powered energy research assistant** for India that provides:

1. **Real-time energy data** from verified government sources
2. **AI insights** using Gemini 3 Pro that behave like an expert analyst
3. **Interactive charts and dashboard UI**
4. **Global context awareness** via Talvi API
5. **Developer-friendly, scalable backend** for integration into web/apps

---

# 💡 **Solution Statement**

IEA solves the data-access and analysis problem through a modern architecture:

### 🔹 **1. Real-Time Government Data (NPP API)**

Using India’s National Power Portal (NPP), we fetch:

* Installed capacity
* Transmission line growth
* Daily renewable generation
* Generation mix (thermal/hydro/nuclear/RE)
* Historical trends
* Demand-supply gap
* Capacity status

All data updates live via FastAPI fetchers.

---

### 🔹 **2. Gemini 3 Pro as an Energy Analyst**

We pass real datasets into Gemini 3 Pro as **context**, enabling:

* Market research summaries
* Investor insights
* Policy explanations
* Comparative analysis
* Forecast reasoning

Users can chat with an AI that behaves like an **actual energy market analyst**.

---

### 🔹 **3. Global Layer with Talvi API**

Adds real-time world context:

* Oil prices
* Gas markets
* RE growth globally
* Geopolitical disruptions

Users can toggle 🌍 to combine Indian and global insights.

---

### 🔹 **4. Modern FastAPI Backend + Frontend**

* Python + FastAPI
* HTML/JS/CSS UI
* Fully modular
* Easily extendable
* Dockerized for cloud

---

# 📊 **Business Impact**

IEA unlocks powerful value:

### ✔ For **Investors**

* Faster due diligence
* RE project scouting
* Coal risk assessment
* Market entry strategy

### ✔ For **Energy Companies**

* Instant demand projections
* Competitive intelligence
* Outage risk monitoring

### ✔ For **Government / Think Tanks**

* Policy impact evaluation
* State-wise performance tracking
* Infrastructure gap analysis

### ✔ For **Analysts & Researchers**

* No more PDF/Excel scraping
* Automated time-series insights
* AI-summarized reports

IEA reduces analysis time from **hours → seconds**.

---

# 🔮 **Future Enhancements**

Planned upgrades:

* Add PPAC (Oil & Gas) real-time data
* Add DISCOM dues (PRAAPTI portal)
* Add CEA emissions + grid carbon factor
* Add AI forecasting models
* Add district-level energy analytics
* Build Web UI with React or Svelte
* Host as a public API service
* Build PowerBI/Tableau connectors

---

# 🏗️ **Architecture Overview**

```
FastAPI Backend
     ├── NPP Real-Time Data Fetchers
     ├── Talvi Global API Layer
     ├── Gemini 3 Pro Analyst
     ├── Unified Dashboard Endpoints
Frontend
     ├── HTML + JS + CSS
     ├── Charts + Insights
Docker
     ├── Production-ready container
```

---

# 🧪 **Local Setup**

```bash
python -m venv venv  
venv\Scripts\activate 
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

---

# 🌐 **Working API Endpoints**

### 📊 **Dashboard**

```
GET http://localhost:8000/dashboard
```

### ⚡ **NPP (National Power Portal)**

```
GET http://localhost:8000/npp/installed-capacity
GET http://localhost:8000/npp/generation-chart
GET http://localhost:8000/npp/transmission
GET http://localhost:8000/npp/map-data
```

### 🤖 **Gargi AI Assistant (Gemini 3 Pro)**

```
POST http://localhost:8000/gargi/chat
Body:
{
  "query": "What is India's renewable capacity?",
  "use_web_search": false
}
```

---

# 🐳 **Docker Deployment**

Build:

```bash
docker build -t iea-app:latest .
```

Run:

```bash
docker run -p 8000:8000 iea-app:latest
```

---

# 🏁 **Conclusion**

**India Energy Analyst (IEA)** is not just another dashboard—
it is the **first AI-native, real-time, government-backed energy intelligence platform**
designed specifically for the fastest-growing energy market in the world: **India**.

By combining:

* **Government open data**
* **Gemini 3 Pro reasoning**
* **Global awareness (Talvi API)**
* **Clean engineering architecture**

IEA provides the foundation for India’s next decade of energy innovation.

This platform enables **researchers, investors, policymakers, and developers** to access
critical data and insights—instantly, reliably, and intelligently.

# 🤝 **Support & Connect**

- [☕ Buy Me a Coffee](https://buymeacoffee.com/yogeshjha06)
- [🔗 LinkedIn](https://www.linkedin.com/in/yogeshjha06/)


# 📄 **License**

MIT License — free to use, free to build with.

# 🙌 **Contributing**

PRs, issues, and suggestions are all welcome — help grow the Gargi ecosystem.
