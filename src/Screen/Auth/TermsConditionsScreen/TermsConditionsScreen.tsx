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
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#FAFBFF" barStyle="dark-content" />

            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={normalize(20)} color="#111827" />
                </Pressable>
                <Text style={styles.headerTitle}>Terms & Conditions</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <Text style={styles.title}>Terms & Conditions</Text>
                <Text style={styles.updatedText}>Last Updated: June 2026</Text>
                <Text style={styles.paragraph}>
                    By accessing or using Gyanodaya, you agree to comply with these Terms & Conditions.
                </Text>

                <Text style={styles.sectionTitle}>Account Registration</Text>
                <Text style={styles.paragraph}>Users must provide accurate information during registration.</Text>
                <Text style={styles.paragraph}>You are responsible for maintaining the confidentiality of your account credentials.</Text>

                <Text style={styles.sectionTitle}>Educational Content</Text>
                <Text style={styles.paragraph}>
                    All study materials, videos, tests, notes, question banks, and content available on Gyanodaya are protected by intellectual property laws.
                </Text>
                <Text style={styles.paragraph}>Users may not:</Text>
                <Text style={styles.bullet}>Copy content</Text>
                <Text style={styles.bullet}>Distribute content</Text>
                <Text style={styles.bullet}>Resell content</Text>
                <Text style={styles.bullet}>Share login credentials</Text>
                <Text style={styles.bullet}>Upload content without authorization</Text>

                <Text style={styles.sectionTitle}>User Conduct</Text>
                <Text style={styles.paragraph}>Users agree not to:</Text>
                <Text style={styles.bullet}>Use the platform for unlawful activities</Text>
                <Text style={styles.bullet}>Attempt unauthorized access</Text>
                <Text style={styles.bullet}>Interfere with platform operations</Text>
                <Text style={styles.bullet}>Share offensive or harmful content</Text>

                <Text style={styles.sectionTitle}>Course Access</Text>
                <Text style={styles.paragraph}>Course access is granted according to the purchased plan.</Text>
                <Text style={styles.paragraph}>Access periods may vary depending on the course or subscription.</Text>

                <Text style={styles.sectionTitle}>Mock Tests and Results</Text>
                <Text style={styles.paragraph}>
                    Performance reports and test scores are provided for educational purposes only and do not guarantee examination success.
                </Text>

                <Text style={styles.sectionTitle}>Account Suspension</Text>
                <Text style={styles.paragraph}>
                    We reserve the right to suspend or terminate accounts that violate these Terms.
                </Text>

                <Text style={styles.sectionTitle}>Limitation of Liability</Text>
                <Text style={styles.paragraph}>Gyanodaya shall not be liable for:</Text>
                <Text style={styles.bullet}>Examination outcomes</Text>
                <Text style={styles.bullet}>Temporary service interruptions</Text>
                <Text style={styles.bullet}>Technical issues beyond our control</Text>
                <Text style={styles.bullet}>Loss of data due to user negligence</Text>

                <Text style={styles.sectionTitle}>Modifications</Text>
                <Text style={styles.paragraph}>
                    We may modify these Terms at any time. Continued use of the platform constitutes acceptance of updated Terms.
                </Text>

                <Text style={styles.sectionTitle}>Contact</Text>
                <Text style={styles.contactLine}>Email: support@gyanodaya.cloud</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFBFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: normalize(20),
        paddingTop: verticalScale(8),
        paddingBottom: verticalScale(16),
    },
    backButton: {
        width: normalize(36),
        height: normalize(36),
        borderRadius: normalize(18),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
    headerTitle: {
        fontSize: normalize(18),
        fontWeight: '700',
        color: '#111827',
    },
    headerSpacer: {
        width: normalize(36),
    },
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

export default TermsConditionsScreen;
