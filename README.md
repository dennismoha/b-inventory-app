# About

This project is a custom inventory management system designed for a small shop. It includes:

- **Frontend**: Built using Next.js
- **Backend**: Built using Node.js and Express

### Branching Structure

- **Feature Branches**: Each feature is developed in a separate branch:
  - Frontend features are in branches named `frontend/feature/featurename`.
  - Backend features are in branches named `backend/feature/featurename`.
  
- **Main Branch**: The `main` branch contains the final, stable code.

- **Development Flow**:
  - All feature branches are rebased from the `develop` branch.
  - All pull requests (PRs) are made to the `develop` branch.

### Notes

- The `docs` folder is not relevant for the project and can be ignored.
- Both the backend and frontend contain detailed `README.md` files explaining the project structure and how to run the application.
- The entire project is written in TypeScript.


# Deployment Guide

## Overview
The deployment is managed using GitHub Actions.

### Backend Deployment

- The backend is deployed on Render through GitHub Actions.
- To see how the deployment works, navigate to the **GitHub Actions workflows** in the repository.
- The `server.yml` workflow is responsible for deploying the backend code to Render.

### Deployment Considerations

1. **Do not add `NODE_ENV` when deploying on Render**  
   Adding `NODE_ENV` may cause issues with `tsc` (TypeScript Compiler), as noted in this [Render community post](https://community.render.com/t/tsc-not-found-during-build/6428).

2. **Setting up GitHub Actions for Render Deployment**  
   For a complete guide on how to set up GitHub Actions for deployment to Render, check out this official Render documentation:  
   [Deploy to Render from GitHub Actions](https://render.com/docs/cli?_gl=1*vyo77d*_gcl_au*MTY5Nzk3NzExOS4xNzMxOTM1NjQw*_ga*NTQzNzk3MjQ4LjE3MTY0OTU5ODI.*_ga_QK9L9QJC5N*MTczNjU4MzA3MC4yNi4xLjE3MzY1ODM2MTYuNjAuMC4w#example-github-actions)

3. **Finding the Render Service ID**  
   If you're having trouble finding the Render service ID, follow the instructions in this video:  
   [YouTube: How to get Render Service ID](https://www.youtube.com/embed/DBlmF91Accg?si=Ze1lKvN6zpphtwiE&amp;start=458)

4. **Render API Key**  
   To interact with the Render API, you can find the necessary documentation and instructions here:  
   [Render API Documentation](https://render.com/docs/api)

5. **Setting Up PostgreSQL on Render**  
   To set up a PostgreSQL database on Render and retrieve the database URL, follow these instructions:  
   [Render PostgreSQL Setup Guide](https://render.com/docs/postgresql-creating-connecting#create-your-database)

---

### Frontend Deployment

- The frontend deployment is managed by the `frontend.yml` workflow.
- The workflow file can be found in the **workflows** folder of the repository.



