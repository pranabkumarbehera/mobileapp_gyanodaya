import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../../Navigator/StackNav';
import Colorpath from '../../../Themes/Colorpath';
import { normalize, verticalScale } from '../../../Utils/Helpers/normalize';

type TermsConditionsScreenProps = StackScreenProps<RootStackParamList, 'TermsConditions'>;

const TermsConditionsScreen = ({ navigation }: TermsConditionsScreenProps) => {
    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={Colorpath.Primary} barStyle="light-content" />

            <View style={styles.headerBackground}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.topBar}>
                        <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
                            <Icon name="arrow-left" size={normalize(24)} color="#FFFFFF" />
                        </Pressable>
                        <Text style={styles.headerTitle}>Terms & Conditions</Text>
                        <View style={styles.iconButton} />
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <Text style={styles.title}>Terms & Conditions</Text>
                <Text style={styles.updatedText}>Effective Date: June 17, 2026</Text>
                
                <Text style={styles.paragraph}>
                    Welcome to GYANODAYA, an educational mobile application operated by JANMEJAY PARIDA.
                </Text>
                <Text style={[styles.paragraph, { marginTop: verticalScale(8) }]}>
                    By downloading, accessing, or using the GYANODAYA application, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these Terms, please do not use the Application.
                </Text>

                <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
                <Text style={styles.paragraph}>
                    By accessing or using GYANODAYA, you acknowledge that you have read, understood, and agree to comply with these Terms and Conditions and our Privacy Policy.
                </Text>

                <Text style={styles.sectionTitle}>2. Educational Purpose</Text>
                <Text style={styles.paragraph}>
                    GYANODAYA is designed to provide educational content, study materials, quizzes, mock tests, and related learning resources.
                </Text>
                <Text style={[styles.paragraph, { marginTop: verticalScale(8) }]}>
                    The content provided is intended solely for educational and informational purposes.
                </Text>

                <Text style={styles.sectionTitle}>3. User Accounts</Text>
                <Text style={styles.paragraph}>
                    Users may be required to create an account to access certain features.
                </Text>
                <Text style={[styles.paragraph, { marginTop: verticalScale(4) }]}>You agree to:</Text>
                <Text style={styles.bullet}>• Provide accurate and complete information.</Text>
                <Text style={styles.bullet}>• Maintain the confidentiality of your account credentials.</Text>
                <Text style={styles.bullet}>• Be responsible for all activities occurring under your account.</Text>
                <Text style={[styles.paragraph, { marginTop: verticalScale(8) }]}>
                    We reserve the right to suspend or terminate accounts that provide false information or violate these Terms.
                </Text>

                <Text style={styles.sectionTitle}>4. User Conduct</Text>
                <Text style={styles.paragraph}>You agree not to:</Text>
                <Text style={styles.bullet}>• Use the Application for unlawful purposes.</Text>
                <Text style={styles.bullet}>• Attempt to gain unauthorized access to systems or data.</Text>
                <Text style={styles.bullet}>• Upload harmful, abusive, or offensive content.</Text>
                <Text style={styles.bullet}>• Disrupt or interfere with the operation of the Application.</Text>
                <Text style={styles.bullet}>• Copy, reproduce, or distribute content without authorization.</Text>

                <Text style={styles.sectionTitle}>5. Intellectual Property</Text>
                <Text style={styles.paragraph}>
                    All content available within GYANODAYA, including text, graphics, logos, images, educational materials, software, and design elements, is owned by or licensed to GYANODAYA and is protected by applicable intellectual property laws.
                </Text>
                <Text style={[styles.paragraph, { marginTop: verticalScale(8) }]}>
                    Users may access content solely for personal educational use.
                </Text>

                <Text style={styles.sectionTitle}>6. Payments and Purchases</Text>
                <Text style={styles.paragraph}>
                    Certain features or educational services may require payment.
                </Text>
                <Text style={[styles.paragraph, { marginTop: verticalScale(8) }]}>
                    Payments are securely processed through Razorpay or other authorized payment providers.
                </Text>
                <Text style={[styles.paragraph, { marginTop: verticalScale(8) }]}>
                    We do not store complete payment card information on our servers.
                </Text>
                <Text style={[styles.paragraph, { marginTop: verticalScale(8) }]}>
                    All purchases are subject to applicable pricing and payment terms displayed within the Application.
                </Text>

                <Text style={styles.sectionTitle}>7. Refund Policy</Text>
                <Text style={styles.paragraph}>
                    Refunds, if applicable, shall be governed by the refund policy displayed within the Application or communicated at the time of purchase.
                </Text>
                <Text style={[styles.paragraph, { marginTop: verticalScale(8) }]}>
                    Certain digital educational products may be non-refundable once accessed.
                </Text>

                <Text style={styles.sectionTitle}>8. Third-Party Services</Text>
                <Text style={styles.paragraph}>
                    The Application may integrate third-party services including but not limited to:
                </Text>
                <Text style={styles.bullet}>• Google Play Services</Text>
                <Text style={styles.bullet}>• Razorpay</Text>
                <Text style={[styles.paragraph, { marginTop: verticalScale(8) }]}>
                    These services operate under their own terms and privacy policies.
                </Text>

                <Text style={styles.sectionTitle}>9. Disclaimer of Warranties</Text>
                <Text style={styles.paragraph}>
                    The Application and all content are provided on an "as is" and "as available" basis.
                </Text>
                <Text style={[styles.paragraph, { marginTop: verticalScale(4) }]}>We make no warranties regarding:</Text>
                <Text style={styles.bullet}>• Accuracy of educational content.</Text>
                <Text style={styles.bullet}>• Uninterrupted availability.</Text>
                <Text style={styles.bullet}>• Error-free operation.</Text>
                <Text style={styles.bullet}>• Suitability for any specific examination or purpose.</Text>

                <Text style={styles.sectionTitle}>10. Limitation of Liability</Text>
                <Text style={styles.paragraph}>
                    To the maximum extent permitted by law, GYANODAYA and JANMEJAY PARIDA shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from use of the Application.
                </Text>

                <Text style={styles.sectionTitle}>11. Account Suspension or Termination</Text>
                <Text style={styles.paragraph}>
                    We reserve the right to suspend, restrict, or terminate access to the Application if:
                </Text>
                <Text style={styles.bullet}>• These Terms are violated.</Text>
                <Text style={styles.bullet}>• Fraudulent activity is detected.</Text>
                <Text style={styles.bullet}>• Required by law.</Text>

                <Text style={styles.sectionTitle}>12. Privacy</Text>
                <Text style={styles.paragraph}>
                    Your use of the Application is also governed by our Privacy Policy, which explains how personal information is collected, used, stored, and protected.
                </Text>

                <Text style={styles.sectionTitle}>13. Changes to Terms</Text>
                <Text style={styles.paragraph}>
                    We reserve the right to modify these Terms and Conditions at any time.
                </Text>
                <Text style={[styles.paragraph, { marginTop: verticalScale(8) }]}>
                    Updated versions will be published within the Application and become effective immediately upon posting.
                </Text>
                <Text style={[styles.paragraph, { marginTop: verticalScale(8) }]}>
                    Continued use of the Application after updates constitutes acceptance of the revised Terms.
                </Text>

                <Text style={styles.sectionTitle}>14. Governing Law</Text>
                <Text style={styles.paragraph}>
                    These Terms and Conditions shall be governed by and construed in accordance with the laws of India.
                </Text>
                <Text style={[styles.paragraph, { marginTop: verticalScale(8) }]}>
                    Any disputes arising under these Terms shall be subject to the jurisdiction of the competent courts in India.
                </Text>

                <Text style={styles.sectionTitle}>15. Contact Information</Text>
                <Text style={styles.paragraph}>
                    If you have any questions regarding these Terms and Conditions, please contact:
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFBFF',
    },
    headerBackground: { backgroundColor: Colorpath.Primary, paddingBottom: verticalScale(16) },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: normalize(20), paddingTop: verticalScale(10) },
    iconButton: { padding: normalize(8), width: normalize(40) },
    headerTitle: { fontSize: normalize(18), fontWeight: 'bold', color: '#FFFFFF' },
    content: {
        paddingHorizontal: normalize(24),
        paddingBottom: verticalScale(30),
    },
    title: {
        fontSize: normalize(24),
        fontWeight: '800',
        color: Colorpath.Primary,
        marginBottom: verticalScale(6),
    },
    updatedText: {
        fontSize: normalize(13),
        color: '#6B7280',
        marginBottom: verticalScale(18),
    },
    sectionTitle: {
        fontSize: normalize(16),
        fontWeight: '700',
        color: '#111827',
        marginTop: verticalScale(18),
        marginBottom: verticalScale(8),
    },
    paragraph: {
        fontSize: normalize(14),
        color: '#4B5563',
        lineHeight: normalize(22),
    },
    bullet: {
        fontSize: normalize(14),
        color: '#4B5563',
        lineHeight: normalize(22),
        marginLeft: normalize(12),
        marginTop: verticalScale(2),
    },
    contactContainer: {
        marginTop: verticalScale(8),
        padding: normalize(12),
        backgroundColor: '#F3F4F6',
        borderRadius: normalize(8),
    },
    contactName: {
        fontSize: normalize(14),
        fontWeight: '700',
        color: '#111827',
        marginBottom: verticalScale(2),
    },
    contactLine: {
        fontSize: normalize(14),
        color: '#4B5563',
        lineHeight: normalize(22),
    },
});

export default TermsConditionsScreen;
