import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { auth } from '../firebaseConfig';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithCredential,
    signInAnonymously,
} from 'firebase/auth';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [guestLoading, setGuestLoading] = useState(false);

    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
    });

    useEffect(() => {
        const handleGoogleResponse = async () => {
            if (response?.type === 'success' && response.authentication) {
                const { idToken } = response.authentication;
                if (!idToken) return;

                const credential = GoogleAuthProvider.credential(idToken);
                try {
                    setLoading(true);
                    await signInWithCredential(auth, credential);
                    navigation.replace('Main');
                } catch (e: any) {
                    Alert.alert('Google sign-in error', e.message ?? 'Something went wrong');
                } finally {
                    setLoading(false);
                }
            }
        };
        handleGoogleResponse();
    }, [response, navigation]);

    const handleEmailAuth = async () => {
        if (!email || !password) {
            Alert.alert('Missing fields', 'Please enter email and password.');
            return;
        }
        setLoading(true);
        try {
            if (mode === 'login') {
                await signInWithEmailAndPassword(auth, email.trim(), password);
            } else {
                await createUserWithEmailAndPassword(auth, email.trim(), password);
            }
            navigation.replace('Main');
        } catch (e: any) {
            Alert.alert('Auth error', e.message ?? 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            Alert.alert('Enter email', 'Please enter your email first.');
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email.trim());
            Alert.alert('Email sent', 'Check your inbox for reset instructions.');
        } catch (e: any) {
            Alert.alert('Error', e.message ?? 'Could not send reset email');
        }
    };

    const handleGoogleSignIn = async () => {
        if (!request) {
            Alert.alert('Not ready', 'Google sign-in is still initializing.');
            return;
        }
        await promptAsync();
    };

    const toggleMode = () => {
        setMode(m => (m === 'login' ? 'register' : 'login'));
    };

    const handleGuestLogin = async () => {
        try {
            setGuestLoading(true);
            await signInAnonymously(auth);
            navigation.replace('Main');
        } catch (e: any) {
            Alert.alert('Guest login failed', e.message ?? 'Please try again.');
        } finally {
            setGuestLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.card}>
                <Text style={styles.appName}>MealQuest</Text>
                <Text style={styles.heading}>
                    {mode === 'login' ? 'Welcome back' : 'Create your account'}
                </Text>
                <Text style={styles.subheading}>
                    {mode === 'login'
                        ? 'Log in to discover recipes tailored to your ingredients.'
                        : 'Sign up to save favorites and sync your recipes.'}
                </Text>

                <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="you@example.com"
                        placeholderTextColor="#6b7280"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor="#6b7280"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.primaryButton, loading && { opacity: 0.7 }]}
                    onPress={handleEmailAuth}
                    disabled={loading || guestLoading}
                >
                    <Text style={styles.primaryButtonText}>
                        {loading
                            ? 'Please wait...'
                            : mode === 'login'
                                ? 'Continue with email'
                                : 'Create account'}
                    </Text>
                </TouchableOpacity>

                <View style={styles.inlineLinks}>
                    <TouchableOpacity onPress={toggleMode}>
                        <Text style={styles.linkText}>
                            {mode === 'login'
                                ? "Don't have an account? Sign up"
                                : 'Already have an account? Log in'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleForgotPassword}>
                        <Text style={styles.linkText}>Forgot password?</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.dividerRow}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerLabel}>OR</Text>
                    <View style={styles.divider} />
                </View>

                <TouchableOpacity
                    style={styles.googleButton}
                    onPress={handleGoogleSignIn}
                    disabled={loading || guestLoading}
                >
                    <Text style={styles.googleIcon}>G</Text>
                    <Text style={styles.googleText}>Continue with Google</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.guestButton}
                    onPress={handleGuestLogin}
                    disabled={guestLoading || loading}
                >
                    <Text style={styles.guestText}>
                        {guestLoading ? 'Starting guest session...' : 'Continue as guest'}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#020617',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    card: {
        backgroundColor: '#020617',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: '#1f2937',
        shadowColor: '#000',
        shadowOpacity: 0.4,
        shadowRadius: 30,
        elevation: 10,
    },
    appName: {
        fontSize: 16,
        letterSpacing: 2,
        color: '#9ca3af',
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    heading: {
        fontSize: 26,
        fontWeight: '800',
        color: '#f97316',
        textAlign: 'center',
        marginTop: 4,
    },
    subheading: {
        fontSize: 13,
        color: '#9ca3af',
        textAlign: 'center',
        marginTop: 6,
        marginBottom: 24,
    },
    fieldGroup: { marginBottom: 12 },
    label: { fontSize: 13, color: '#e5e7eb', marginBottom: 6 },
    input: {
        backgroundColor: '#020617',
        borderWidth: 1,
        borderColor: '#1f2937',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        color: '#f9fafb',
    },
    primaryButton: {
        backgroundColor: '#f97316',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    primaryButtonText: {
        color: '#111827',
        fontSize: 15,
        fontWeight: '600',
    },
    inlineLinks: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        gap: 12,
    },
    linkText: {
        color: '#9ca3af',
        fontSize: 13,
        textDecorationLine: 'underline',
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    divider: { flex: 1, height: 1, backgroundColor: '#1f2937' },
    dividerLabel: { marginHorizontal: 10, color: '#6b7280', fontSize: 12 },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#4b5563',
        paddingVertical: 10,
        paddingHorizontal: 12,
        justifyContent: 'center',
    },
    googleIcon: {
        width: 24,
        height: 24,
        textAlign: 'center',
        textAlignVertical: 'center',
        borderRadius: 12,
        backgroundColor: '#ffffff',
        color: '#000000',
        marginRight: 8,
        fontWeight: '700',
    },
    googleText: {
        color: '#e5e7eb',
        fontSize: 14,
        fontWeight: '500',
    },
    guestButton: {
        marginTop: 12,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#4b5563',
        alignItems: 'center',
    },
    guestText: {
        color: '#e5e7eb',
        fontSize: 14,
        fontWeight: '500',
    },
});
