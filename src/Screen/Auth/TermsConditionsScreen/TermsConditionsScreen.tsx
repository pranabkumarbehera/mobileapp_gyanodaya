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
                <Text style={styles.updatedText}>Last Updated: June 2026</Text>
                <Text style={styles.paragraph}>
                    Welcome to GYANODAYA. By using this application, you agree to the following terms and conditions:
                </Text>

                <Text style={styles.sectionTitle}>01. Purpose of the Application</Text>
                <Text style={styles.paragraph}>
                    GYANODAYA provides educational content including Mock Tests, Notes, Question Banks, YouTube Classes, and study materials for examinations such as SSB TGT, PGT, RHT, LTR, OTET, OSSTET, CTET, B.Ed., and other competitive examinations.
                </Text>

                <Text style={styles.sectionTitle}>02. User Responsibilities</Text>
                <Text style={styles.bullet}>Users must use the application only for lawful educational purposes.</Text>
                <Text style={styles.bullet}>Users shall not copy, reproduce, distribute, or sell any content available in the application without permission.</Text>
                <Text style={styles.bullet}>Users are responsible for maintaining the confidentiality of their login credentials.</Text>

                <Text style={styles.sectionTitle}>03. Intellectual Property</Text>
                <Text style={styles.paragraph}>
                    All study materials, notes, mock tests, designs, logos, and content available in the application are the property of GYANODAYA unless otherwise stated.
                </Text>

                <Text style={styles.sectionTitle}>04. Accuracy of Information</Text>
                <Text style={styles.paragraph}>
                    We strive to provide accurate and updated educational content. However, GYANODAYA does not guarantee the completeness, accuracy, or suitability of any information.
                </Text>

                <Text style={styles.sectionTitle}>05. External Links</Text>
                <Text style={styles.paragraph}>
                    The application may contain links to YouTube or other third-party websites. We are not responsible for the content, privacy practices, or services provided by such third parties.
                </Text>

                <Text style={styles.sectionTitle}>06. Limitation of Liability</Text>
                <Text style={styles.paragraph}>
                    GYANODAYA shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use of the application.
                </Text>

                <Text style={styles.sectionTitle}>07. Modification of Services</Text>
                <Text style={styles.paragraph}>
                    We reserve the right to modify, suspend, or discontinue any feature of the application at any time without prior notice.
                </Text>

                <Text style={styles.sectionTitle}>08. Termination</Text>
                <Text style={styles.paragraph}>
                    We may suspend or terminate access to users who violate these terms and conditions.
                </Text>

                <Text style={styles.sectionTitle}>09. Changes to Terms</Text>
                <Text style={styles.paragraph}>
                    These Terms & Conditions may be updated from time to time. Continued use of the application constitutes acceptance of the revised terms.
                </Text>

                <Text style={styles.sectionTitle}>10. Contact Us</Text>
                <Text style={styles.paragraph}>
                    For any questions regarding these Terms & Conditions, please contact us through the details provided in the application.
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

export default TermsConditionsScreen;
