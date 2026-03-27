# DriftSense 🌊⚙️

![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-success)
![MLOps](https://img.shields.io/badge/MLOps-MLflow-orange)

**DriftSense** is an open-source, automated MLOps and predictive maintenance pipeline. It goes beyond simple anomaly detection by automatically identifying concept drift in real-time sensor data and triggering a self-healing model retraining cycle—all with zero downtime.

Designed for Industrial IoT and server health monitoring, DriftSense provides enterprise-grade AI infrastructure packaged for one-click deployment.

---

## 🚀 Core Features

* **Real-Time Inference Engine:** Fast API microservice serving low-latency predictions on incoming time-series log data.
* **Concept Drift Detection:** Continuously monitors prediction confidence and data distribution. If accuracy drops below the configurable threshold (e.g., 85%), an alarm is triggered.
* **Automated Retraining Pipeline:** Automatically spins up a background job to pull the latest historical logs, preprocesses the data, and retrains the XGBoost/Scikit-Learn model.
* **Zero-Downtime Model Swapping:** Integrates natively with MLflow to version the newly trained model and hot-swaps it into the inference engine without dropping incoming requests.
* **Full Observability:** Out-of-the-box Prometheus scraping and Grafana dashboards for visualizing sensor health and model degradation.

---

## 🏗️ Architecture & Tech Stack

DriftSense utilizes a modern, decoupled microservices architecture:

* **Frontend:** React (Administrative UI for manual triggers and system monitoring)
* **Backend Orchestration:** Spring Boot (Java)
* **Inference & ML Engine:** FastAPI (Python), Scikit-Learn, XGBoost
* **MLOps / Registry:** MLflow
* **Database / State:** PostgreSQL
* **Monitoring:** Prometheus & Grafana
* **Deployment:** Docker & Docker Compose

---

## 🏁 Quick Start

DriftSense is built to run entirely inside Docker. You do not need to install Python, Java, or PostgreSQL locally.

### Prerequisites
* Docker and Docker Compose installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/yourusername/DriftSense.git](https://github.com/yourusername/DriftSense.git)
   cd DriftSense
