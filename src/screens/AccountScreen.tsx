import type { User } from 'firebase/auth';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StateMessage } from '@/components/StateMessage';
import { colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useLocations } from '@/context/LocationsContext';
import { useNotifications } from '@/context/NotificationsContext';
import { useAlertsSetting } from '@/hooks/useAlertsSetting';
import { authErrorMessage, resetPassword, signIn, signOut, signUp } from '@/services/auth';
import { sendTestAlert } from '@/services/userData';
import { errorMessage } from '@/utils/forecast';

export function AccountScreen() {
  const { user, initializing, isAvailable } = useAuth();

  if (!isAvailable) {
    return (
      <StateMessage
        title="Firebase is not configured"
        detail="Add your Firebase web config to .env.local to enable accounts."
      />
    );
  }
  if (initializing) {
    return <StateMessage loading title="Loading account…" />;
  }
  return user ? <SignedIn user={user} /> : <SignInForm />;
}

function SignInForm() {
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const isSignUp = mode === 'signUp';

  const submit = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await (isSignUp ? signUp(email, password) : signIn(email, password));
    } catch (e) {
      setMessage({ text: authErrorMessage(e), isError: true });
    } finally {
      setBusy(false);
    }
  };

  const forgotPassword = async () => {
    if (!email.trim()) {
      setMessage({ text: 'Enter your email first.', isError: true });
      return;
    }
    try {
      await resetPassword(email);
      setMessage({ text: 'Password reset email sent.', isError: false });
    } catch (e) {
      setMessage({ text: authErrorMessage(e), isError: true });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>{isSignUp ? 'Create an account' : 'Sign in'}</Text>
        <Text style={styles.body}>
          Sign in to sync your saved cities across devices and get weather alerts for them.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          textContentType={isSignUp ? 'newPassword' : 'password'}
          onSubmitEditing={submit}
        />

        {message && (
          <Text style={message.isError ? styles.error : styles.success}>{message.text}</Text>
        )}

        <Pressable style={styles.primaryButton} onPress={submit} disabled={busy}>
          {busy ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.primaryButtonText}>{isSignUp ? 'Create account' : 'Sign in'}</Text>
          )}
        </Pressable>

        <Pressable style={styles.linkButton} onPress={() => setMode(isSignUp ? 'signIn' : 'signUp')}>
          <Text style={styles.link}>
            {isSignUp ? 'Already have an account? Sign in' : 'New here? Create an account'}
          </Text>
        </Pressable>
        {!isSignUp && (
          <Pressable style={styles.linkButton} onPress={forgotPassword}>
            <Text style={styles.link}>Forgot password?</Text>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SignedIn({ user }: { user: User }) {
  const { locations, isSynced, syncError } = useLocations();
  const { registration } = useNotifications();
  const alerts = useAlertsSetting(user.uid);
  const [testStatus, setTestStatus] = useState<string | null>(null);

  const pushReady = registration?.token != null;

  const onSendTest = async () => {
    setTestStatus('Sending…');
    try {
      const sent = await sendTestAlert();
      setTestStatus(sent > 0 ? 'Sent. It should arrive in a few seconds.' : 'No registered devices found.');
    } catch (e) {
      setTestStatus(errorMessage(e));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Account</Text>
      <Text style={styles.body}>{user.email}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Saved cities</Text>
        <Text style={styles.body}>
          {syncError
            ? `Sync problem: ${syncError}`
            : isSynced
              ? `${locations.length} ${locations.length === 1 ? 'city is' : 'cities are'} synced across your devices.`
              : 'Connecting…'}
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.row}>
          <View style={styles.flex}>
            <Text style={styles.sectionTitle}>Weather alerts</Text>
            <Text style={styles.body}>
              Storms, heavy rain, snow, extreme heat or frost, and strong wind in your saved cities.
            </Text>
          </View>
          <Switch
            value={alerts.enabled ?? false}
            onValueChange={alerts.toggle}
            disabled={alerts.enabled === null}
          />
        </View>
        {alerts.error && <Text style={styles.error}>{alerts.error}</Text>}
        {registration === null ? (
          <Text style={styles.note}>Setting up notifications…</Text>
        ) : !pushReady ? (
          <Text style={styles.note}>{registration.reason}</Text>
        ) : (
          <>
            <Pressable style={styles.secondaryButton} onPress={onSendTest}>
              <Text style={styles.secondaryButtonText}>Send test notification</Text>
            </Pressable>
            {testStatus && <Text style={styles.note}>{testStatus}</Text>}
          </>
        )}
      </View>

      <Pressable style={styles.signOutButton} onPress={() => signOut()}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20, gap: 12 },
  heading: { color: colors.text, fontSize: 24, fontWeight: '600' },
  body: { color: colors.textSecondary, fontSize: 15, lineHeight: 21 },
  note: { color: colors.textMuted, fontSize: 13, marginTop: 8 },
  error: { color: colors.danger, fontSize: 14 },
  success: { color: colors.accent, fontSize: 14 },
  input: {
    backgroundColor: colors.card,
    color: colors.text,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 17,
  },
  primaryButton: {
    backgroundColor: colors.text,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonText: { color: colors.background, fontSize: 16, fontWeight: '600' },
  linkButton: { alignSelf: 'center', padding: 6 },
  link: { color: colors.accent, fontSize: 15 },
  section: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginTop: 4 },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '600', marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  secondaryButton: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: { color: colors.text, fontSize: 15 },
  signOutButton: { alignSelf: 'center', marginTop: 12, padding: 8 },
  signOutText: { color: colors.danger, fontSize: 16 },
});
