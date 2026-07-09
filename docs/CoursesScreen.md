# CoursesScreen

## Prompt
Build a React Native `CoursesScreen` that lets a student browse course bundles, filter by module/category, search by title, open bundle details, and access enrolled study materials. The screen should support mock tests, course curriculum, note banks, question banks, video banks, and document folders, while also handling enrollment and payment verification before unlocking protected content.

## Navigation Name
CoursesScreen

## API Calls
GET /quizzes/bundles
GET /student/modules
GET /payments/me?page={page}&limit={limit}
GET /quizzes/bundles/{id}
GET /quizzes/bundles/{bundleId}/sub-bundles
GET /quizzes/bundles/{bundleId}/sub-bundles/{subBundleId}
POST /student/quizzes/bundles/{id}/enroll
POST /payments
GET /quizzes/{id}
GET /student/note-banks/{noteId}/pages
GET /student/question-banks/{questionBankId}/questions
GET /student/video-banks/{videoBankId}/items
GET /documents/student/folders/{folderId}/documents
GET /documents/student/stream/{documentId}

## Functionality
Displays a course library with search and quick filters, shows course stats, opens detailed course views, supports enrollment and payment flow, and unlocks study materials for enrolled users.

## Screen Behavior
- Loads course bundles on mount and reloads them when the selected module changes.
- Refreshes student modules and payment history when the screen becomes focused.
- Filters course cards by search text and selected module/category.
- Shows a featured horizontal list of course cards with view and enroll actions.
- Opens a detail view for the selected bundle or sub-bundle.
- Displays exam pattern information and switches between mock bank and study materials tabs when both are available.
- If sub-bundles exist, lets the user drill down into a curriculum list before reaching quizzes.
- Verifies enrollment and payment state before allowing attempts or content access.

## Mock Test Flow
- Shows grouped mock quizzes for the selected course or category.
- Fetches quiz metadata to calculate marks, duration, attempts, and marking scheme.
- Opens the mock test rules screen when a quiz is selected.
- Prevents attempts while payment status is still being verified.

## Study Material Flow
- Note banks open a page list, then a full page viewer modal.
- Question banks open a question list, then a detailed question and answer modal.
- Video banks open external YouTube links directly, or a list of items when multiple videos exist.
- Document folders load available documents and open PDFs through a local download and file viewer flow.
- Study materials are blocked until the user is enrolled in the course.

## Enrollment And Payment
- If the bundle is free, the screen enrolls directly.
- If the bundle is paid, it starts the payment flow and opens the payment web view.
- While payment is in progress, the screen polls payment history until the purchase is confirmed.
- After successful payment or enrollment, the course is refreshed and unlocked.

## Important Edge Cases
- Shows a search-empty state when no bundles match the current filters.
- Prevents opening a new payment if another payment session is already active.
- Handles missing note, question, video, and document IDs safely.
- Falls back to view-only states when the user is not enrolled.

