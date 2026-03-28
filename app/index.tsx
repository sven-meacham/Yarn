import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { colors, spacing } from '@/src/theme/tokens';

export default function HomeScreen() {
  async function ensurePermission(mode: 'camera' | 'library') {
    if (mode === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  }

  async function openPicker(mode: 'camera' | 'library') {
    const ok = await ensurePermission(mode);
    if (!ok) return;

    const result =
      mode === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.85,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.85,
          });

    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    router.push({
      pathname: '/processing',
      params: {
        uri: encodeURIComponent(asset.uri),
        mime: asset.mimeType ?? 'image/jpeg',
      },
    });
  }

  return (
    <Screen scroll>
      <View style={styles.hero}>
        <Text style={styles.logo}>YARN</Text>
        <Text style={styles.tagline}>Scan a clothing tag and instantly understand what your clothes are made of.</Text>
      </View>

      <PrimaryButton label="Scan a tag" onPress={() => openPicker('camera')} />
      <View style={styles.gap} />
      <PrimaryButton
        label="Choose from library"
        variant="secondary"
        onPress={() => openPicker('library')}
      />

      <Text style={styles.hint}>Photo-first — aim for a clear shot of the composition and care tag.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: 4,
    color: colors.text,
  },
  tagline: {
    marginTop: spacing.md,
    fontSize: 18,
    lineHeight: 26,
    color: colors.textMuted,
  },
  gap: {
    height: spacing.sm,
  },
  hint: {
    marginTop: spacing.lg,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
});
