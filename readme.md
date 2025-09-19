

## 🚀 React Deployment Pipeline

### Introduction

This project implements a **fully automated deployment pipeline** for React projects built with **Vite**. It is designed to streamline the process of building, containerizing, and deploying React applications to **AWS S3**, using **Docker**, **AWS ECS**, and **AWS Fargate**.

The pipeline intelligently detects React + Vite projects, builds them, and uploads the static files to S3—ensuring secure, optimized, and cost-effective deployment.

---

### Architecture

![Architecture Diagram](../diagram%20for%20react%20pipeline.png)

*The diagram illustrates the sequence from source code to production deployment, leveraging containerization and AWS services.*

---

### Tech Stack

* **Docker** – Containerization for reproducible builds.
* **Node.js** – Used to build and push React projects.
* **AWS ECS & Fargate** – Run the build container in a scalable, serverless environment.
* **AWS S3** – Hosts the production-ready static files.
* **AWS IAM** – Ensures least-privilege access for security.

---

### Key Features & Enhancements

* **Project Detection:** Automatically detects if a project is React + Vite. If not, it exits gracefully.
* **Optimized Docker Image:** Uses Node.js Alpine base image, reducing image size by over 50% for lower runtime costs.
* **Secure IAM Policies:** Implements least-privilege policies for all AWS resources, ensuring security best practices.
* **Automated Build & Deploy:** Eliminates manual deployment steps—everything from cloning the repo to S3 upload is automated.
* **Scalable:** ECS + Fargate architecture allows scaling without managing servers.

---

### How It Works

1. **Trigger Build:** ECS Task or manual trigger starts the pipeline.
2. **Clone Repository:** Pulls the latest code from the Git repository.
3. **Project Validation:** Confirms the project is React + Vite; exits if not.
4. **Build:** Uses Node.js Docker container to build the project.
5. **Upload:** Pushes the built static files to the specified S3 bucket for production.
6. **Secure Execution:** All actions run under least-privilege IAM policies.

---

### Benefits

* **Faster Deployment:** Reduces manual steps, accelerates time-to-production.
* **Cost-Effective:** Lightweight Docker images and Fargate reduce infrastructure costs.
* **Secure:** IAM policies ensure minimal access.
* **Reliable:** Containerization ensures reproducible builds and fewer runtime issues.

---
