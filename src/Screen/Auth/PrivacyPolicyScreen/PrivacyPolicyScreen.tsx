import React, { useMemo } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../../Navigator/StackNav';
import { useTheme } from '../../../Themes/hooks';
import { normalize, verticalScale } from '../../../Utils/Helpers/normalize';

type PrivacyPolicyScreenProps = StackScreenProps<RootStackParamList, 'PrivacyPolicy'>;

const PrivacyPolicyScreen = ({ navigation }: PrivacyPolicyScreenProps) => {
    const { colors, tokens } = useTheme();
    const styles = useMemo(() => getStyles(colors, tokens), [colors, tokens]);

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={colors.statusBg} barStyle={colors.statusBar} />

            <View style={styles.headerBackground}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.topBar}>
                        <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
                            <Icon name="arrow-left" size={normalize(24)} color="#FFFFFF" />
                        </Pressable>
                        <Text style={styles.headerTitle}>Privacy Policy</Text>
                        <View style={styles.iconButton} />
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <Text style={styles.title}>Privacy Policy</Text>
                <Text style={styles.updatedText}>Effective Date: June 17, 2026</Text>
                
                <Text style={styles.paragraph}>
                    Welcome to GYANODAYA, an educational mobile application operated by JANMEJAY PARIDA.
                </Text>
                <Text style={[styles.paragraph, { marginTop: verticalScale(8) }]}>
                    This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the GYANODAYA mobile application and related services.
                </Text>
                <Text style={[styles.paragraph, { marginTop: verticalScale(8) }]}>
                    By downloading, accessing, or using the Application, you agree to the collection and use of information in accordance with this Privacy Policy.
                </Text>

                <Text style={styles.sectionTitle}>1. Information We Collect</Text>
                
                <Text style={styles.subSectionTitle}>Personal Information</Text>
                <Text style={styles.paragraph}>To provide our educational services, we may collect the following information:</Text>
                <Text style={styles.bullet}>• Full Name</Text>
                <Text style={styles.bullet}>• Email Address</Text>
                <Text style={styles.bullet}>• Mobile Number</Text>
                <Text style={styles.bullet}>• Gender</Text>
                <Text style={styles.bullet}>• Any information voluntarily provided through forms, feedback, or support requests</Text>

                <Text style={styles.subSectionTitle}>Automatically Collected Information</Text>
                <Text style={styles.paragraph}>When you use the Application, certain information may be collected automatically, including:</Text>
                <Text style={styles.bullet}>• Device Internet Protocol (IP) Address</Text>
                <Text style={styles.bullet}>• Device Model and Operating System</Text>
                <Text style={styles.bullet}>• Application Usage Statistics</Text>
                <Text style={styles.bullet}>• Pages or Screens Viewed</Text>
                <Text style={styles.bullet}>• Date and Time of Access</Text>
                <Text style={styles.bullet}>• Time Spent Using the Application</Text>
                <Text style={styles.bullet}>• Crash Reports and Diagnostic Data</Text>

                <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
                <Text style={styles.paragraph}>The information collected may be used to:</Text>
                <Text style={styles.bullet}>• Provide and maintain educational services</Text>
                <Text style={styles.bullet}>• Deliver study materials, mock tests, and learning content</Text>
                <Text style={styles.bullet}>• Improve application performance and user experience</Text>
                <Text style={styles.bullet}>• Respond to user inquiries and support requests</Text>
                <Text style={styles.bullet}>• Monitor usage trends and analytics</Text>
                <Text style={styles.bullet}>• Send important service-related notifications</Text>
                <Text style={styles.bullet}>• Comply with legal obligations</Text>
                <Text style={[styles.paragraph, { marginTop: verticalScale(8) }]}>
                    We do not sell users' personal information to third parties.
                </Text>

                <Text style={styles.sectionTitle}>3. Cookies and Tracking Technologies</Text>
                <Text style={styles.paragraph}>
                    The Application or its third-party service providers may use cookies, SDKs, analytics tools, and similar technologies to:
                </Text>
                <Text style={styles.bullet}>• Improve functionality</Text>
                <Text style={styles.bullet}>• Analyze application performance</Text>
                <Text style={styles.bullet}>• Enhance user experience</Text>
                <Text style={styles.bullet}>• Maintain security and reliability</Text>
                <Text style={[styles.paragraph, { marginTop: verticalScale(8) }]}>
                    Where required by applicable laws, user consent will be obtained before using non-essential tracking technologies.
                </Text>

                <Text style={styles.sectionTitle}>4. Third-Party Services</Text>
                <Text style={styles.paragraph}>
                    The Application may use trusted third-party services to support functionality and analytics.
                </Text>
                <Text style={styles.paragraph}>Current third-party services may include:</Text>
                <Text style={styles.bullet}>1. Google Play Services</Text>
                <Text style={styles.bullet}>2. Razorpay</Text>
                <Text style={[styles.paragraph, { marginTop: verticalScale(8) }]}>
                    These third-party providers may collect and process information according to their own privacy policies.
                </Text>

                <Text style={styles.sectionTitle}>5. Sharing of Information</Text>
                <Text style={styles.paragraph}>We may disclose information only in the following circumstances:</Text>
                <Text style={styles.bullet}>• To comply with legal obligations or lawful requests</Text>
                <Text style={styles.bullet}>• To protect our rights, users, or public safety</Text>
                <Text style={styles.bullet}>• To prevent fraud, abuse, or security threats</Text>
                <Text style={styles.bullet}>• To trusted service providers working on our behalf</Text>
                <Text style={[styles.paragraph, { marginTop: verticalScale(8) }]}>
                    All authorized service providers are required to maintain appropriate confidentiality and security measures.
                </Text>

                <Text style={styles.sectionTitle}>6. International Data Transfers</Text>
                <Text style={styles.paragraph}>
                    Your information may be processed or stored on servers located outside your country of residence.
                </Text>
                <Text style={[styles.paragraph, { marginTop: verticalScale(8) }]}>
                    Where required by law, appropriate safeguards will be implemented to protect personal information during international data transfers.
                </Text>

                <Text style={styles.sectionTitle}>7. Your Privacy Rights</Text>
                <Text style={styles.paragraph}>You may have the right to:</Text>
                <Text style={styles.bullet}>• Access your personal information</Text>
                <Text style={styles.bullet}>• Correct inaccurate information</Text>
                <Text style={styles.bullet}>• Request deletion of personal information</Text>
                <Text style={styles.bullet}>• Withdraw consent where applicable</Text>
                <Text style={styles.bullet}>• Object to certain processing activities</Text>
                <Text style={[styles.paragraph, { marginTop: verticalScale(8) }]}>
                    To exercise these rights, contact us at:
                </Text>
                <Text style={styles.contactLine}>Email: gyanodaya43@gmail.com</Text>

                <Text style={styles.sectionTitle}>8. Data Retention</Text>
                <Text style={styles.paragraph}>
                    We retain information only as long as necessary to provide services and comply with legal requirements.
                </Text>
                <Text style={styles.bullet}>• User Account Information: Retained while your account remains active.</Text>
                <Text style={styles.bullet}>• Application Usage Data: Retained for up to 24 months.</Text>
                <Text style={styles.bullet}>• Legal Compliance Data: Retained as required by applicable law.</Text>
                <Text style={styles.bullet}>• Anonymous or Aggregated Data: May be retained indefinitely.</Text>
                <Text style={[styles.paragraph, { marginTop: verticalScale(8) }]}>
                    You may request deletion of your personal information by contacting us.
                </Text>

                <Text style={styles.sectionTitle}>9. Children's Privacy</Text>
                <Text style={styles.paragraph}>
                    GYANODAYA is intended for students and learners. However, we do not knowingly collect personal information from children under the age required by applicable law without appropriate parental consent.
                </Text>
                <Text style={[styles.paragraph, { marginTop: verticalScale(8) }]}>
                    If you believe that a child has provided personal information without proper authorization, please contact us immediately so that we can take appropriate action.
                </Text>

                <Text style={styles.sectionTitle}>10. Security</Text>
                <Text style={styles.paragraph}>
                    We implement reasonable administrative, technical, and organizational safeguards to protect your information against unauthorized access, disclosure, alteration, or destruction.
                </Text>
                <Text style={[styles.paragraph, { marginTop: verticalScale(8) }]}>
                    While we strive to protect your information, no method of electronic storage or transmission is completely secure.
                </Text>

                <Text style={styles.sectionTitle}>11. Data Breach Notification</Text>
                <Text style={styles.paragraph}>
                    In the event of a data breach affecting personal information, we will notify affected users and relevant authorities as required by applicable law.
                </Text>

                <Text style={styles.sectionTitle}>12. Changes to This Privacy Policy</Text>
                <Text style={styles.paragraph}>
                    We may update this Privacy Policy from time to time.
                </Text>
                <Text style={[styles.paragraph, { marginTop: verticalScale(8) }]}>
                    Any changes will be posted within the Application and on our official privacy policy page. The updated policy will become effective upon publication.
                </Text>

                <Text style={styles.sectionTitle}>13. Your Consent</Text>
                <Text style={styles.paragraph}>
                    By using the Application, you consent to the collection, use, and disclosure of information as described in this Privacy Policy.
                </Text>
                <Text style={[styles.paragraph, { marginTop: verticalScale(8) }]}>
                    You may withdraw consent at any time by contacting us, subject to legal and operational requirements.
                </Text>

                <Text style={styles.sectionTitle}>14. Contact Us</Text>
                <Text style={styles.paragraph}>
                    If you have any questions regarding this Privacy Policy or our privacy practices, please contact:
                </Text>
                <View style={styles.contactContainer}>
                    <Text style={styles.contactName}>JANMEJAY PARIDA</Text>
                    <Text style={styles.contactLine}>GYANODAYA Educational Application</Text>
                    <Text style={styles.contactLine}>Email: gyanodaya43@gmail.com</Text>
                </View>
            </ScrollView>
        </View>
    );
};

const getStyles = (colors: any, tokens: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.Background,
    },
    headerBackground: { backgroundColor: colors.Primary, paddingBottom: verticalScale(16) },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: normalize(20), paddingTop: verticalScale(10) },
    iconButton: { padding: normalize(8), width: normalize(40) },
    headerTitle: { fontSize: normalize(18), fontWeight: 'bold', color: tokens.onAccent },
    content: {
        paddingHorizontal: normalize(24),
        paddingBottom: verticalScale(30),
    },
    title: {
        fontSize: normalize(24),
        fontWeight: '800',
        color: colors.text,
        marginBottom: verticalScale(6),
    },
    updatedText: {
        fontSize: normalize(13),
        color: colors.textSecondary,
        marginBottom: verticalScale(18),
    },
    sectionTitle: {
        fontSize: normalize(16),
        fontWeight: '700',
        color: colors.text,
        marginTop: verticalScale(18),
        marginBottom: verticalScale(8),
    },
    subSectionTitle: {
        fontSize: normalize(14),
        fontWeight: '700',
        color: colors.text,
        marginTop: verticalScale(12),
        marginBottom: verticalScale(4),
    },
    paragraph: {
        fontSize: normalize(14),
        color: colors.textSecondary,
        lineHeight: normalize(22),
    },
    bullet: {
        fontSize: normalize(14),
        color: colors.textSecondary,
        lineHeight: normalize(22),
        marginLeft: normalize(12),
        marginTop: verticalScale(2),
    },
    contactContainer: {
        marginTop: verticalScale(8),
        padding: normalize(12),
        backgroundColor: tokens.surfaceMuted,
        borderRadius: normalize(tokens.radius.sm),
    },
    contactName: {
        fontSize: normalize(14),
        fontWeight: '700',
        color: colors.text,
        marginBottom: verticalScale(2),
    },
    contactLine: {
        fontSize: normalize(14),
        color: colors.textSecondary,
        lineHeight: normalize(22),
    },
});

export default PrivacyPolicyScreen;
