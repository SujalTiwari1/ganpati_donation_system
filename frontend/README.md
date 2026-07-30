# Saffron Stream

# Ganpati Vargani Collection Management System

You are a Senior Staff Frontend Engineer and Product Designer.

Your task is to build a COMPLETE production-ready frontend for an existing backend.

The backend is already finished and deployed.

DO NOT invent APIs.

Use the supplied README and FRONTEND_SPEC as the source of truth.

Everything must match the backend implementation.

---

## Backend

Backend URL

https://ganpati-donation-system.onrender.com

REST API

JWT Authentication

Prisma

Express

WhatsApp Integration

Receipt Generation

Analytics

Audit Logs

---

## Important

DO NOT create fake APIs.

DO NOT mock backend responses unless absolutely necessary.

Assume every endpoint described in the documentation already exists.

The frontend should be written exactly as if it were a production SaaS dashboard.

---

# Technology Stack

Use:

React 19

TypeScript

Vite

Tailwind CSS v4

React Router DOM

TanStack Query

Axios

React Hook Form

Zod

shadcn/ui

Lucide React

Recharts

Sonner

Framer Motion

date-fns

clsx

tailwind-merge

Use modern React patterns.

Functional components only.

Strict TypeScript.

Reusable hooks.

Reusable UI.

No duplicated logic.

---

# Overall Goal

Build an enterprise-quality dashboard.

It should feel comparable to:

• Linear

• Stripe Dashboard

• Vercel Dashboard

• Clerk

NOT a college CRUD project.

---

# Theme

Follow the supplied FRONTEND_SPEC exactly.

Primary Color

Saffron

Secondary

Emerald

Support

Light Mode

Dark Mode

Responsive Design

Desktop First

---

# Project Structure

Create a clean scalable architecture.

Example:

src/

api/

components/

features/

hooks/

layouts/

pages/

routes/

providers/

store/

types/

utils/

constants/

styles/

assets/

Each feature should be isolated.

Example

features/

auth/

dashboard/

buildings/

donors/

transactions/

analytics/

audit/

settings/

---

# Authentication

Implement complete JWT authentication.

Login page.

Protected routes.

Auth provider.

Axios interceptor.

Automatic Authorization header.

401 redirect.

Logout.

Session persistence.

---

# Dashboard

Beautiful dashboard.

Cards

Charts

Recent Activity

Quick Actions

Recent Transactions

Collection Metrics

Responsive Layout

Skeleton loading

Error States

Empty States

---

# Buildings

Complete CRUD UI.

Search

Pagination

Filters

Create

Edit

Delete

Restore

Confirmation Dialog

Validation

Optimistic updates

---

# Donors

Professional data table.

Search

Sorting

Pagination

CRUD

Building selection

Validation

---

# Transactions

This is the most important module.

Design it beautifully.

Features

Building autocomplete

Donor autocomplete

Mobile number

Room number

Amount

Payment method

Notes

Live receipt preview

Duplicate donation warning

Save Donation

Loading indicator while generating receipt

Success screen

Receipt download

WhatsApp Status Badge

Status updates

Timeline

Everything should feel premium.

---

# Analytics

Beautiful charts.

Line Charts

Bar Charts

Pie Charts

Summary Cards

Date Filters

Export Buttons

---

# Audit Logs

Professional table.

Expandable rows.

Timeline view.

Badges.

Search.

Filters.

---

# Settings

Profile

Theme

Account

System Info

Read-only WhatsApp Configuration

---

# UI Components

Create reusable components.

Button

Card

Modal

Drawer

Table

DataTable

Pagination

Search

Combobox

Badge

StatCard

ChartCard

Loading Skeleton

Sidebar

Navbar

Breadcrumb

Avatar

Dropdown

Command Palette

Toast

Error Boundary

Empty State

Page Header

Section Header

Form Components

---

# UX

Everything should be polished.

Use Framer Motion.

Smooth page transitions.

Hover animations.

Loading animations.

Optimistic UI.

Toast notifications.

Keyboard shortcuts.

Accessibility.

Dark mode.

---

# API Layer

Create a proper API abstraction.

Axios Instance

Interceptors

Authentication

Refresh handling (if backend supports it)

Error parsing

Typed responses

Service layer

React Query hooks

Do NOT call axios directly inside components.

---

# Forms

Use React Hook Form.

Use Zod.

Inline validation.

Client-side validation.

Disable submit while loading.

Proper error messages.

---

# Tables

Professional DataTable.

Sorting.

Pagination.

Filtering.

Search.

Column visibility.

Sticky headers.

Responsive.

---

# Charts

Use Recharts.

Professional styling.

Responsive.

Animated.

---

# Notifications

Use Sonner.

Success

Warning

Error

Info

Loading

---

# Loading

Skeletons

Page loaders

Button loaders

Table skeletons

Card skeletons

Chart skeletons

---

# Error Handling

401

403

404

500

Network Error

Server Error

Retry Actions

Friendly Messages

---

# Code Quality

Use:

SOLID principles

Reusable hooks

Custom hooks

Reusable utilities

Typed APIs

No duplicated logic

Consistent naming

Feature-based architecture

---

# Performance

Lazy loading.

Route-based code splitting.

Memoization where appropriate.

React Query caching.

Debounced search.

Optimized rendering.

---

# Deliverables

Generate:

Complete project structure

All pages

All components

All routing

Authentication

API layer

Theme

Dark mode

Charts

Forms

Tables

Responsive layout

Everything required for a production-ready frontend.

Do NOT stop after generating a login page.

Generate the ENTIRE application.

Use the provided README and FRONTEND_SPEC as the authoritative specifications.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1c4ca54a-5a10-48cc-89c5-3370f62c2b48).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
