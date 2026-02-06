import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Switch,
} from 'react-native';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { DrawerParamList, RootStackParamList } from '../../App';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

type DrawerProps = DrawerScreenProps<DrawerParamList, 'Profile'>;
type StackProps = NativeStackScreenProps<RootStackParamList>;
type Props = DrawerProps & StackProps;

export default function ProfileScreen(_props: Props) {
    const navigation = useNavigation<StackProps['navigation']>();
    const user = auth.currentUser;
    const [isDark, setIsDark] = React.useState(true); // visual only for now

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (e: any) {
            Alert.alert('Logout failed', e.message ?? 'Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="chevron-back" size={18} color="#e5e7eb" />
            </TouchableOpacity>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.subtitle}>Manage your MealQuest account</Text>

            <View style={styles.card}>
                <Text style={styles.sectionLabel}>Signed in as</Text>
                <Text style={styles.valueText}>
                    {user?.email ?? 'Guest user'}
                </Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionLabel}>Appearance</Text>
                <View style={styles.row}>
                    <Text style={styles.valueText}>Dark Mode</Text>
                    <Switch
                        value={isDark}
                        onValueChange={setIsDark}
                        trackColor={{ false: '#4b5563', true: '#f97316' }}
                        thumbColor="#f9fafb"
                    />
                </View>
                <Text style={styles.hintText}>
                    (For now, this is just a visual toggle. You can wire real theming later.)
                </Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionLabel}>Account</Text>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Log out</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#020617', paddingHorizontal: 16, paddingTop: 16 },
    title: { color: '#f9fafb', fontSize: 22, fontWeight: '800' },
    subtitle: { color: '#9CA3AF', fontSize: 13, marginTop: 4, marginBottom: 16 },

    card: {
        backgroundColor: '#020617',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1f2937',
        padding: 16,
        marginBottom: 12,
    },
    sectionLabel: {
        color: '#9CA3AF',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 6,
    },
    valueText: {
        color: '#f9fafb',
        fontSize: 14,
        fontWeight: '500',
    },
    row: {
        marginTop: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    hintText: {
        color: '#6b7280',
        fontSize: 11,
        marginTop: 8,
    },
    logoutButton: {
        marginTop: 8,
        paddingVertical: 10,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#b91c1c',
        alignItems: 'center',
    },
    logoutText: {
        color: '#fecaca',
        fontSize: 14,
        fontWeight: '600',
    },
    backButton: {
        width: 42,
        height: 42,
        borderRadius: 16,
        borderWidth: 1,
        left: -4,
        marginBottom: 16,
        borderColor: '#1f2937',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backIcon: {
        color: '#e5e7eb',
        fontSize: 22,
        fontWeight: '600',
        top: -4,
    },
});
