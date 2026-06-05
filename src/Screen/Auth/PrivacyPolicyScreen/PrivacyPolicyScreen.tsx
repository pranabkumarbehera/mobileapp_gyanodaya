import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../../Navigator/StackNav';
import Colorpath from '../../../Themes/Colorpath';
import { normalize, verticalScale } from '../../../Utils/Helpers/normalize';

type PrivacyPolicyScreenProps = StackScreenProps<RootStackParamList, 'PrivacyPolicy'>;

const PrivacyPolicyScreen = ({ navigation }: PrivacyPolicyScreenProps) => {
    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={Colorpath.Primary} barStyle="light-content" />

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
                <Text style={styles.updatedText}>Last Updated: June 2026</Text>
                <Text style={styles.paragraph}>
                    Welcome to Gyanodaya. We respect your privacy and are committed to protecting your personal information.
                </Text>

                <Text style={styles.sectionTitle}>Information We Collect</Text>
                <Text style={styles.paragraph}>We may collect the following information:</Text>
                <Text style={styles.bullet}>Name</Text>
                <Text style={styles.bullet}>Email Address</Text>
                <Text style={styles.bullet}>Mobile Number</Text>
                <Text style={styles.bullet}>Profile Information</Text>
                <Text style={styles.bullet}>Course Progress and Test Results</Text>
                <Text style={styles.bullet}>Payment Information (processed through secure payment gateways)</Text>
                <Text style={styles.bullet}>Device Information and Usage Analytics</Text>

                <Text style={styles.sectionTitle}>How We Use Your Information</Text>
                <Text style={styles.paragraph}>We use your information to:</Text>
                <Text style={styles.bullet}>Create and manage your account</Text>
                <Text style={styles.bullet}>Provide educational content and services</Text>
                <Text style={styles.bullet}>Process payments</Text>
                <Text style={styles.bullet}>Track course progress and test performance</Text>
                <Text style={styles.bullet}>Send important notifications and updates</Text>
                <Text style={styles.bullet}>Improve our platform and user experience</Text>
                <Text style={styles.bullet}>Provide customer support</Text>

                <Text style={styles.sectionTitle}>Data Security</Text>
                <Text style={styles.paragraph}>
                    We implement reasonable security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.
                </Text>

                <Text style={styles.sectionTitle}>Third-Party Services</Text>
                <Text style={styles.paragraph}>We may use third-party services such as:</Text>
                <Text style={styles.bullet}>Payment Gateways</Text>
                <Text style={styles.bullet}>Analytics Services</Text>
                <Text style={styles.bullet}>Cloud Hosting Providers</Text>
                <Text style={styles.bullet}>Email and Notification Services</Text>
                <Text style={styles.paragraph}>
                    These providers may process your information in accordance with their own privacy policies.
                </Text>

                <Text style={styles.sectionTitle}>Cookies and Analytics</Text>
                <Text style={styles.paragraph}>
                    Our website and applications may use cookies and analytics tools to improve user experience and understand platform usage.
                </Text>

                <Text style={styles.sectionTitle}>Children&apos;s Privacy</Text>
                <Text style={styles.paragraph}>
                    Our services are intended for students and learners. Users under the age of 18 should use our services under parental or guardian supervision.
                </Text>

                <Text style={styles.sectionTitle}>Changes to this Policy</Text>
                <Text style={styles.paragraph}>
                    We reserve the right to update this Privacy Policy at any time. Changes will be posted on this page.
                </Text>

                <Text style={styles.sectionTitle}>Contact Us</Text>
                <Text style={styles.paragraph}>For privacy-related concerns, contact:</Text>
                <Text style={styles.contactLine}>Gyanodaya Support</Text>
                <Text style={styles.contactLine}>Email: support@gyanodaya.cloud</Text>
                <Text style={styles.contactLine}>Website: gyanodaya.cloud</Text>
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
        marginLeft: normalize(6),
    },
    contactLine: {
        fontSize: normalize(14),
        color: '#4B5563',
        lineHeight: normalize(22),
    },
});

export default PrivacyPolicyScreen;
