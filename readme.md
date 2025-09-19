

## 🚀 React Deployment Pipeline
---
### 📑 Table of Contents
- [Introduction](#introduction)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Key Features & Enhancements](#key-features--enhancements)
- [How It Works](#how-it-works)
- [Benefits](#benefits)
- [Configuration](#configuration)
  - [.env (Container)](#env-container)
  - [.env (Deployment Server)](#env-deployment-server)
- [⚡ Quick Start](#-quick-start)
- [🎥 Demo](#-demo)
- [📚 What I Learned](#-what-i-learned)
- [🤝 Contributing](#-contributing)
- [📌 Notes](#-notes)
- [🚀 Final Thoughts](#-final-thoughts)

---

### Introduction

This project implements a **fully automated deployment pipeline** for React projects built with **Vite**. It streamlines the process of building, containerizing, and deploying React applications to **AWS S3**, using **Docker**, **AWS ECS**, and **AWS Fargate**.

The pipeline intelligently detects React + Vite projects, builds them, and uploads the static files to S3 — ensuring secure, optimized, and cost-effective deployment.

---

### Architecture

<img width="821" height="513" alt="diagram for react pipeline" src="https://github.com/user-attachments/assets/57e940f7-8725-47a8-8537-5f63fbecac38" />

*The diagram illustrates the sequence from source code to production deployment, leveraging containerization and AWS services.*

---

### Tech Stack

* **Docker** – Containerization for reproducible builds
* **Node.js** – Used to build and push React projects
* **AWS ECS & Fargate** – Run the build container in a scalable, serverless environment
* **AWS S3** – Hosts the production-ready static files
* **AWS IAM** – Enforces least-privilege access for security

---

### Key Features & Enhancements

* **Project Detection:** Automatically detects if a project is React + Vite. If not, exits gracefully.
* **Optimized Docker Image:** Uses Node.js Alpine base image, reducing image size by >50% to lower runtime costs.
* **Secure IAM Policies:** Implements least-privilege policies for all AWS resources.
* **Automated Build & Deploy:** From cloning the repo to uploading to S3, everything is automated.
* **Scalable:** ECS + Fargate provide serverless scaling without managing infrastructure.

---

### How It Works

0. **Send Request:** A request with `gitUrl` and `projectId` is sent to the server (running on port **9000**) at:

   ```
   POST http://localhost:9000/deploy
   {
     "giturl": "https://github.com/user/repo",
     "projectId": "my-project"
   }
   ```

1. **Trigger Build:** The server sends ECS run-task command to start the pipeline.

2. **Clone Repository:** The container clones the provided GitHub repository.

3. **Project Validation:** Confirms the project is React + Vite; exits if not.

4. **Build:** Uses Node.js Docker container to generate production-ready static files.

5. **Upload:** Pushes the build artifacts to the specified S3 bucket.

6. **Secure Execution:** All actions run under IAM least-privilege policies.

---

## Benefits

* **⚡ Faster Deployment:** Zero manual steps, quicker releases.
* **💰 Cost-Effective:** Alpine-based images + Fargate reduce costs.
* **🔐 Secure:** IAM ensures minimal access.
* **✅ Reliable:** Containerization guarantees reproducible builds.

---

### Configuration

##### `.env` (Container)

Required inside the **build container**:

```bash
AWS_ACCESS_KEY_ID=xxxxxx
AWS_SECRET_ACCESS_KEY=yyyyyy
AWS_REGION=ap-south-1
BUCKET_NAME=my_bucket

# Runtime parameters (injected at execution)
GIT_REPOSITORY_URL=https://github.com/user/repo
PROJECT_ID=my-project
```

> ⚠️ These secrets should **not** be hardcoded. Instead, store them in **AWS Secrets Manager** or pass them securely via **Fargate task definitions**.

---

#### `.env` (Deployment Server)

Required by the **server** that triggers ECS tasks:

```bash
AWS_ACCESS_KEY_ID=xxxxxx
AWS_SECRET_ACCESS_KEY=yyyyyy
AWS_REGION=ap-south-1

# ECS details
CLUSTER_ARN=arn:aws:ecs:region:account:cluster/your-cluster
TASK_ARN=arn:aws:ecs:region:account:task-definition/your-task
```

This server listens on **port 9000** and sends ECS commands to start the pipeline.

---


### ⚡ Quick Start

Follow these steps to build and test the deployment pipeline locally:

#### 1. Clone the repository

```bash
git clone https://github.com/PRASHANTSWAROOP001/vite-deployment-pipeline.git
cd builder_server
```

---

#### 2. Build the Docker image

```bash
docker build -t deploy-container .
```

---

#### 3. Set up environment variables

Create a `.env` file in the project root with your AWS credentials and S3 details:

```bash
AWS_ACCESS_KEY_ID=xxxxxx
AWS_SECRET_ACCESS_KEY=yyyyyy
AWS_REGION=ap-south-1
BUCKET_NAME=my_bucket
```

⚠️ Ensure your S3 bucket is **publicly accessible** and **static site hosting** is enabled.

---

#### 4. Run the container

Run the container with your project details:

```bash
docker run --rm \
  --env-file=.env \
  -e PROJECT_ID=test_001 \
  -e GIT_REPOSITORY_URL=https://github.com/your-username/your-react-app.git \
  deploy-container
```

---

#### 5. Verify deployment

* Check your S3 bucket for uploaded build files.
* Visit your S3 static site hosting URL to confirm the React app is live.

---

👉 That’s it — you’ve deployed a React project using the automated pipeline!


---

#### 🎥 Demo

Here’s a short demo of the pipeline in action:

➡️ *\[Insert GIF or video link here]*

The demo shows the flow from triggering a deployment to the React app being live on S3.

---



### 📚 What I Learned
- How to containerize and optimize builds using Node.js Alpine  
- Automating deployments with ECS + Fargate  
- Using IAM least-privilege policies effectively  
- Hosting and serving static React apps with S3  


---
### 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a new branch (`git checkout -b feature-name`)
3. Commit changes (`git commit -m "Add new feature"`)
4. Push to the branch (`git push origin feature-name`)
5. Open a Pull Request

---




#### 📌 Notes

* This project was built to **learn, experiment, and showcase** a real-world deployment pipeline.
* Future improvements may include CI/CD integration, CloudWatch logging, and multi-environment deployments.

---

#### 🚀 Final Thoughts

This pipeline proves that deployment automation can be simple, secure, and scalable.
It combines **Docker + AWS ECS/Fargate + S3** to deliver a lightweight yet powerful workflow for React apps.

---
