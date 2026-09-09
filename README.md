# E-FASD — Finance Approval System Demo

A role-aware finance request and approval workflow built with Next.js and TypeScript.

The project demonstrates how a business approval process can be modeled as a web application with authenticated access, request submission, approval permissions, role-specific navigation, dashboards, and supporting cloud services.

## What the application demonstrates

- authenticated user access with NextAuth/Auth.js components;
- role-aware dashboards and navigation;
- finance request submission and request-detail views;
- approval authorization checks before actions are accepted;
- administrative and onboarding flows;
- MongoDB-backed application data;
- Azure Blob Storage integration for file/object storage;
- server-side application actions and API routes;
- responsive UI built with Next.js, React, TypeScript, Tailwind CSS, and Radix-based components.

## Architecture and stack

**Frontend / application**
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod

**Identity and data**
- NextAuth / Auth.js
- MongoDB
- MongoDB Auth adapter

**Cloud integration**
- Azure Blob Storage
- Nodemailer for email-related workflows

## Business workflow focus

The repository includes role-specific experiences for requesters, finance users, approvers, and administrators. Approval actions include permission checks before a request can be approved, and application routes are revalidated after workflow actions so the user sees current state.

The goal of this project is not to present a generic CRUD demo. It is an example of translating an organizational approval process into a structured, permission-aware application.

## Repository notes

This is a portfolio/demo repository. Production deployments should use environment-based secret management, least-privilege credentials, protected databases and storage accounts, validated authorization rules, logging, monitoring, backups, and a documented deployment/recovery process.

## Local development

Install dependencies:

```bash
pnpm install
```

Create the required environment configuration locally, then run:

```bash
pnpm dev
```

Before deploying, review authentication, database, email, and Azure Storage configuration for the target environment.

## Skills demonstrated

`Next.js` · `React` · `TypeScript` · `MongoDB` · `Azure Blob Storage` · `Authentication` · `Authorization` · `Workflow Design` · `Business Process Automation`

---

**Author:** Derek Asamoah-Amoyaw  
Senior IT Infrastructure & Cloud Engineer · Microsoft Certified: Azure Administrator Associate (AZ-104)
