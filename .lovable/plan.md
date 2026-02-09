

# ICPC Feedback & Complaint Tracking Portal

A frontend-only landing page that mirrors the official ICPC website branding (green, white, gold accents, institutional typography) with mock/placeholder backend logic.

---

## 1. Header & Navigation
- ICPC logo (uploaded seal) with full commission name
- Navigation bar matching ICPC's institutional style (green background, white text)
- Links: Home, Submit Feedback, Track Complaint, About, Contact
- Mobile-responsive hamburger menu

## 2. Hero Section
- Page title: **ICPC Feedback & Complaint Tracking Portal**
- Subtitle about transparency and citizen trust
- Brief description of ICPC's constitutional mandate
- Three call-to-action cards for the three feedback categories (Complainants, Respondents, Public Interest)
- Reassurance messaging about confidentiality and whistleblower protection

## 3. Feedback Submission Forms (Tabbed Interface)

### Tab 1: Complainants
- Anonymous toggle (when ON, hides name/contact fields)
- Full name, email/phone (hidden when anonymous)
- Complaint category dropdown (Corruption, Abuse of Office, Misconduct)
- Description textarea
- File upload for supporting documents
- CAPTCHA placeholder
- Submit button generates a mock tracking reference ID

### Tab 2: Respondents
- Reference ID input (to link to existing complaint)
- Name / Organization
- Response text
- File attachments
- Declaration checkbox ("I confirm this response is truthful...")
- Submit button

### Tab 3: Public Interest
- Name (optional), Contact (optional)
- Topic dropdown (Policy Suggestion, Public Service Concern, Anti-Corruption Idea, Observation)
- Message textarea
- Submit button

All forms include client-side validation, input sanitization, and clear error messages.

## 4. Track Your Complaint Section
- Input field for tracking reference ID
- Displays a mock timeline/stepper showing statuses: Submitted → Under Review → Assigned → Responded → Closed
- Each step shows a date and brief status note
- No internal/sensitive notes exposed

## 5. How It Works Section
- Step-by-step visual guide: Submit → Get Reference ID → Track Progress → Get Response
- Icons and brief descriptions for each step

## 6. Trust & Security Section
- Cards highlighting: Confidentiality, Whistleblower Protection, Data Security, ICPC's Legal Mandate
- Formal, reassuring government language

## 7. Admin Dashboard (Described, Not Built)
- A brief informational section describing that ICPC officers have access to a secure dashboard for managing submissions, SLA tracking, and audit logs
- This section is descriptive text only, not functional

## 8. Footer
- ICPC contact information and address
- Links to ICPC Act, Privacy Policy, Terms
- Social media links
- Nigerian coat of arms / ICPC branding
- Copyright notice

## Design & Accessibility
- ICPC color palette: deep green (#006838), white, muted gold (#C4A35A), dark text
- Clean, formal typography (sans-serif, government-appropriate)
- WCAG 2.1 AA compliant (proper contrast, focus states, aria labels)
- Fully mobile-responsive
- Screen-reader friendly with semantic HTML and plain-language labels

