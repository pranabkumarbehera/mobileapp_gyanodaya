const fs = require('fs');
const files = [
"src/Components/CustomNoteRenderer.tsx",
"src/Components/CourseCatalog.tsx",
"src/Components/EmptyState.tsx",
"src/Screen/TeacherProfileScreen/TeacherProfileScreen.tsx",
"src/Screen/CoursesPaymentHistoryScreen/CoursesPaymentHistoryScreen.tsx",
"src/Screen/CoursesScreen/CoursesScreen.tsx",
"src/Screen/Auth/OnboardingScreen/OnboardingScreen.tsx",
"src/Screen/Auth/ChangePasswordScreen/ChangePasswordScreen.tsx",
"src/Screen/Auth/RegisterScreen/RegisterScreen.tsx",
"src/Screen/Auth/ForgotPasswordScreen/ForgotPasswordScreen.tsx",
"src/Screen/Auth/LoginScreen/LoginScreen.tsx",
"src/Screen/Auth/OtpScreen/OtpScreen.tsx",
"src/Screen/MockTestRulesScreen/MockTestRulesScreen.tsx",
"src/Screen/SplashScreen/SplashScreen.tsx",
"src/Screen/MockTestQuestionScreen/MockTestQuestionScreen.tsx",
"src/Screen/MockResultScreen/MockResultScreen.tsx",
"src/Screen/TeacherScreen/TeacherScreen.tsx",
"src/Screen/HomeScreen/HomeScreen.tsx",
"src/Screen/ProfileScreen/ProfileScreen.tsx",
"src/Screen/MockBankScreen/MockBankScreen.tsx",
"src/Screen/AboutUsScreen/AboutUsScreen.tsx",
"src/Navigator/TabNav.tsx",
"src/Navigator/StackNav.tsx",
"src/Themes/hooks.ts"
];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // Using regex to remove shadow properties and elevation
    content = content.replace(/shadowColor:\s*[^,{}]+,?/g, '');
    content = content.replace(/shadowOffset:\s*\{[^}]*\},?/g, '');
    content = content.replace(/shadowOpacity:\s*[^,{}]+,?/g, '');
    content = content.replace(/shadowRadius:\s*[^,{}]+,?/g, '');
    content = content.replace(/elevation:\s*[^,{}]+,?/g, '');
    
    fs.writeFileSync(file, content, 'utf8');
});
console.log("Shadows removed!");
