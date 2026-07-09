## Navigation Name
SplashScreen

## API Call
None

## Functionality
Checks stored auth state and routes to onboarding or the main app.

## Navigation Name
OnboardingScreen

## API Call
None

## Functionality
Introduces the app and lets the user continue to login.

## Navigation Name
LoginScreen

## API Call
POST /auth/student/login

## Functionality
Authenticates a student and starts the app session.

## Navigation Name
RegisterScreen

## API Call
POST /auth/student/register

## Functionality
Creates a new student account.

## Navigation Name
PrivacyPolicyScreen

## API Call
None

## Functionality
Shows the app privacy policy.

## Navigation Name
TermsConditionsScreen

## API Call
None

## Functionality
Shows the app terms and conditions.

## Navigation Name
ForgotPasswordScreen

## API Call
POST /auth/forgot-password

## Functionality
Starts password recovery by sending an OTP to the user email.

## Navigation Name
OtpScreen

## API Call
POST /auth/verify-otp
POST /auth/forgot-password

## Functionality
Verifies the recovery OTP and can resend the OTP if needed.

## Navigation Name
ChangePasswordScreen

## API Call
POST /auth/change-password
POST /auth/reset-password

## Functionality
Updates the user password after verification or from account settings.

## Navigation Name
HomeScreen

## API Call
GET /student/dashboard
GET /auth/me
GET /student/attempts/{id}/result

## Functionality
Shows the student dashboard, loads the profile when needed, and opens mock test results.

## Navigation Name
TeacherScreen

## API Call
None

## Functionality
Displays a list of available teachers and mentors.

## Navigation Name
TeacherProfileScreen

## API Call
None

## Functionality
Shows detailed mentor information and booking actions.

## Navigation Name
MockBankScreen

## API Call
GET /quizzes
GET /student/modules
GET /payments/me?page={page}&limit={limit}

## Functionality
Lists mock tests, filters them by enrollment status, and checks payment access.

## Navigation Name
MockTestRulesScreen

## API Call
GET /quizzes/{id}
POST /student/quizzes/{id}/start

## Functionality
Loads test details, shows the exam rules, and starts the attempt.

## Navigation Name
MockTestQuestionScreen

## API Call
POST /student/quizzes/{id}/start
POST /student/attempts/{id}/submit
GET /student/attempts/{id}/result

## Functionality
Presents the live test, submits the attempt, and fetches the result.

## Navigation Name
MockResultScreen

## API Call
GET /student/attempts/{id}/result
GET /student/dashboard

## Functionality
Displays the submitted test result and refreshes dashboard data after completion.

## Navigation Name
AboutUsScreen

## API Call
None

## Functionality
Shows platform information, mission, vision, and offerings.

## Navigation Name
CoursesPaymentHistoryScreen

## API Call
GET /payments/me?page={page}&limit={limit}

## Functionality
Lists the user’s course payment records.

## Navigation Name
ProfileScreen

## API Call
GET /auth/me
PATCH /users/me/profile
GET /payments/me?page={page}&limit={limit}
POST /account/delete/send-otp
POST /account/delete/verify-otp
DELETE /account/delete
POST /auth/logout

## Functionality
Shows and updates the user profile, payment history, logout, and account deletion flow.

## Navigation Name
CoursesScreen

## API Call
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
Browses courses, opens course content, handles enrollment, payment, and study material access.
