import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Colorpath from '../../Themes/Colorpath';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigator/StackNav';

type MockTestRulesScreenProps = StackScreenProps<RootStackParamList, 'MockTestRules'>;

const MockTestRulesScreen = ({ navigation }: MockTestRulesScreenProps) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.blobTopRight} />
            <View style={styles.blobBottomLeft} />

            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={20} color="#FFFFFF" />
                </Pressable>
                <Text style={styles.headerTitle}>Mock Test Rules</Text>
                <View style={{ width: 20 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.glassCard}>
                    <Text style={styles.timeAllowed}>Time Allowed: <Text style={styles.timeBold}>120 Mins</Text></Text>
                    
                    <Text style={styles.warningText}>Minus Marking Rules (0.33 point per incorrect response)</Text>
                    
                    <View style={styles.ruleItem}>
                        <Icon name="circle" size={8} color="#FFFFFF" solid style={styles.bullet} />
                        <Text style={styles.ruleText}>Read each question carefully before marking your answer.</Text>
                    </View>
                    <View style={styles.ruleItem}>
                        <Icon name="circle" size={8} color="#FFFFFF" solid style={styles.bullet} />
                        <Text style={styles.ruleText}>Use the Previous and Next buttons to move between pages.</Text>
                    </View>
                    <View style={styles.ruleItem}>
                        <Icon name="circle" size={8} color="#FFFFFF" solid style={styles.bullet} />
                        <Text style={styles.ruleText}>Submit all pages before the timer ends to save your score.</Text>
                    </View>
                    <View style={styles.ruleItem}>
                        <Icon name="circle" size={8} color="#FFFFFF" solid style={styles.bullet} />
                        <Text style={styles.ruleText}>Do not switch away from the app. This is a secure testing environment.</Text>
                    </View>
                </View>

                <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('MockTestQuestion')}>
                    <Text style={styles.primaryButtonText}>Start Test</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colorpath.Primary },
    blobTopRight: { position: 'absolute', top: -50, right: -50, width: 300, height: 300, borderRadius: 150, backgroundColor: Colorpath.Secondary, opacity: 0.1 },
    blobBottomLeft: { position: 'absolute', bottom: -50, left: -50, width: 300, height: 300, borderRadius: 150, backgroundColor: Colorpath.Tertiary, opacity: 0.1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: normalize(20), borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    headerTitle: { fontSize: normalize(20), fontWeight: 'bold', color: '#FFFFFF' },
    scrollContent: { padding: normalize(20), flexGrow: 1, justifyContent: 'center' },
    glassCard: { backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: normalize(20), borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)', padding: normalize(24), marginBottom: verticalScale(40) },
    timeAllowed: { fontSize: normalize(18), color: '#FFFFFF', marginBottom: verticalScale(16) },
    timeBold: { fontWeight: 'bold' },
    warningText: { color: '#FF4444', fontSize: normalize(14), fontWeight: 'bold', marginBottom: verticalScale(20) },
    ruleItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: verticalScale(12) },
    bullet: { marginTop: verticalScale(6), marginRight: normalize(12) },
    ruleText: { color: 'rgba(255,255,255,0.8)', fontSize: normalize(14), flex: 1, lineHeight: verticalScale(20) },
    primaryButton: { backgroundColor: Colorpath.Secondary, borderRadius: normalize(12), height: verticalScale(55), justifyContent: 'center', alignItems: 'center', shadowColor: Colorpath.Secondary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5 },
    primaryButtonText: { color: '#FFFFFF', fontSize: normalize(18), fontWeight: 'bold' },
});

export default MockTestRulesScreen;
