# RentGuard Testing Guide

This guide outlines the steps to verify that the RentGuard application is functioning correctly.

## 1. Technical Health Check

Before testing the UI, ensure the application is structurally sound:

- **Linting**: Run `npm run lint` to catch potential code quality issues or bugs.
- **Build**: Run `npm run build` to ensure there are no compilation errors, especially with TypeScript and Next.js App Router.
- **Database Connection**: Run `npx prisma db pull` or `npx prisma generate` to confirm connectivity to Supabase.

---

## 2. Authentication Flow

Verify the security and identity management system:

- [ ] **Registration**:
    - Create a new account at `/auth/register`.
    - Check if the user is correctly created in the Supabase `auth.users` table.
- [ ] **Login**:
    - Log in with the newly created account at `/auth/login`.
    - Ensure you are redirected to the `/dashboard`.
- [ ] **Logout**:
    - Click the logout button in the dashboard.
    - Ensure your session is cleared and you are redirected to the homepage or login page.
- [ ] **Forgot Password**:
    - Navigate to `/auth/forgot-password`.
    - Submit an email and verify that the reset link flow works (check Supabase logs if email sending is enabled).

---

## 3. Core Modules Testing

### 🏠 Property Management (Landlord)
- [ ] **Add Property**: Navigate to `/dashboard/properties` and add a new listing.
- [ ] **Edit Property**: Modify an existing listing and save changes.
- [ ] **Delete/Archive**: Ensure listings can be removed or hidden.

### 📝 Applications (Tenant)
- [ ] **Search & View**: Browse properties as a tenant.
- [ ] **Apply**: Submit an application for a property.
- [ ] **Application Status**: Verify the application appears in `/dashboard/applications`.

### 💳 Payments & Agreements
- [ ] **Lease Agreements**: Check if digital agreements can be viewed at `/dashboard/agreements`.
- [ ] **Payment Tracking**: Record a test payment at `/dashboard/payments` and verify it reflects in the history.

---

## 4. UI/UX Verification

- **Responsive Design**: Test on Desktop, Tablet, and Mobile views using Browser DevTools.
- **Interactive Elements**: Check hover states, loading skeletons, and button feedbacks.
- **Dark/Light Mode**: If implemented, toggle between themes to ensure readability.

---

## 5. Deployment Readiness

- [ ] Check console for 404 or 500 errors during navigation.
- [ ] Ensure all environment variables in `.env` are mirrored in the production platform (e.g., Vercel).
