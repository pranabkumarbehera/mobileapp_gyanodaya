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
                    GYANODAYA respects your privacy and is committed to protecting your personal information.
                </Text>

                <Text style={styles.sectionTitle}>01. Information We Collect</Text>
                <Text style={styles.paragraph}>We may collect:</Text>
                <Text style={styles.bullet}>Name</Text>
                <Text style={styles.bullet}>Email Address</Text>
                <Text style={styles.bullet}>Mobile Number</Text>
                <Text style={styles.bullet}>Device Information</Text>
                <Text style={styles.bullet}>App Usage Data</Text>
                <Text style={styles.bullet}>Examination Preferences</Text>

                <Text style={styles.sectionTitle}>02. How We Use Information</Text>
                <Text style={styles.paragraph}>The collected information may be used to:</Text>
                <Text style={styles.bullet}>Provide educational services and study materials</Text>
                <Text style={styles.bullet}>Improve user experience</Text>
                <Text style={styles.bullet}>Respond to user queries</Text>
                <Text style={styles.bullet}>Send important notifications and updates</Text>
                <Text style={styles.bullet}>Analyze application performance</Text>

                <Text style={styles.sectionTitle}>03. Data Protection</Text>
                <Text style={styles.paragraph}>
                    We implement reasonable security measures to protect user information from unauthorized access, alteration, or disclosure.
                </Text>

                <Text style={styles.sectionTitle}>04. Third-Party Services</Text>
                <Text style={styles.paragraph}>The application may use third-party services such as:</Text>
                <Text style={styles.bullet}>Firebase</Text>
                <Text style={styles.paragraph}>
                    These services may collect information according to their respective privacy policies.
                </Text>

                <Text style={styles.sectionTitle}>05. Cookies and Analytics</Text>
                <Text style={styles.paragraph}>
                    We may use cookies or similar technologies to enhance user experience and analyze application usage.
                </Text>

                <Text style={styles.sectionTitle}>06. Children&apos;s Privacy</Text>
                <Text style={styles.paragraph}>
                    GYANODAYA does not knowingly collect personal information from children under 13 years of age without parental consent.
                </Text>

                <Text style={styles.sectionTitle}>07. Data Sharing</Text>
                <Text style={styles.paragraph}>
                    We do not sell, rent, or trade users&apos; personal information to third parties except where required by law.
                </Text>

                <Text style={styles.sectionTitle}>08. User Rights</Text>
                <Text style={styles.paragraph}>
                    Users may request correction, update, or deletion of their personal information by contacting us.
                </Text>

                <Text style={styles.sectionTitle}>09. Changes to Privacy Policy</Text>
                <Text style={styles.paragraph}>
                    We reserve the right to update this Privacy Policy at any time. Updated versions will be posted within the application.
                </Text>

                <Text style={styles.sectionTitle}>10. Contact Information</Text>
                <Text style={styles.paragraph}>
                    If you have any questions regarding this Privacy Policy, please contact us through the contact details provided in the application.
                </Text>
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
