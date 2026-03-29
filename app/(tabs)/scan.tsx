import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { YarnBallButton } from '@/src/components/YarnBallButton';
import { fontBrand } from '@/src/theme/fonts';
import { colors, spacing } from '@/src/theme/tokens';

/** Must match corner bracket size — scan line stays inside so it never crosses the white L-shapes */
const VIEWFINDER_CORNER = 32;
const SCAN_LINE_HEIGHT = 3;
/** Tiny gap so the bar doesn’t sit flush on corner strokes (avoids antialiasing bleed) */
const SCAN_LINE_PAD = 2;

export default function ScanTabScreen() {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [capturing, setCapturing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [scanAnim]);

  async function openLibrary() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.88,
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

  async function captureAndAnalyze() {
    if (!cameraRef.current || capturing || !cameraReady) return;
    try {
      setCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.88 });
      if (!photo?.uri) return;
      router.push({
        pathname: '/processing',
        params: {
          uri: encodeURIComponent(photo.uri),
          mime: 'image/jpeg',
        },
      });
    } finally {
      setCapturing(false);
    }
  }

  if (Platform.OS === 'web') {
    return (
      <Screen scroll>
        <View style={styles.webBox}>
          <Text style={styles.webTitle}>YARN</Text>
          <Text style={styles.webCopy}>
            Live camera runs on iOS and Android. On web, choose a tag photo from your library.
          </Text>
          <PrimaryButton label="Choose tag photo" onPress={openLibrary} />
        </View>
      </Screen>
    );
  }

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.permText}>Loading camera…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.center, { padding: spacing.lg }]}>
        <Text style={styles.permText}>Camera access is needed to scan tags.</Text>
        <PrimaryButton label="Allow camera" onPress={requestPermission} />
      </View>
    );
  }

  const frameH = 220;
  const lineY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      VIEWFINDER_CORNER + SCAN_LINE_PAD,
      frameH - VIEWFINDER_CORNER - SCAN_LINE_HEIGHT - SCAN_LINE_PAD,
    ],
  });

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        mode="picture"
        onCameraReady={() => setCameraReady(true)}
      />

      <View style={styles.overlay} pointerEvents="box-none">
        <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
          <Text style={styles.logo}>YARN</Text>
          <Pressable onPress={openLibrary} style={styles.libBtn} hitSlop={12}>
            <Ionicons name="images-outline" size={26} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.frameOuter}>
          <View style={[styles.frameArea, { height: frameH }]}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
            <Animated.View style={[styles.scanLine, { transform: [{ translateY: lineY }] }]} />
          </View>
          <Text style={styles.frameHint}>Align the care tag inside the corners</Text>
        </View>

        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
          <YarnBallButton onPress={captureAndAnalyze} disabled={capturing || !cameraReady} />
          <Text style={styles.captureHint}>
            {!cameraReady ? 'Starting camera…' : capturing ? 'Analyzing…' : 'Tap the yarn ball to analyze'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  logo: {
    fontFamily: fontBrand,
    fontSize: 26,
    letterSpacing: 1,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  libBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  frameOuter: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  /** Viewfinder-style corners only — no full box border */
  frameArea: {
    width: '100%',
    maxWidth: 320,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: VIEWFINDER_CORNER,
    height: VIEWFINDER_CORNER,
    borderColor: 'rgba(255,255,255,0.95)',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 2,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 2,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 2,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 2,
  },
  scanLine: {
    position: 'absolute',
    left: VIEWFINDER_CORNER,
    right: VIEWFINDER_CORNER,
    height: SCAN_LINE_HEIGHT,
    backgroundColor: '#22C55E',
    opacity: 0.95,
  },
  frameHint: {
    marginTop: spacing.md,
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  bottomBar: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  captureHint: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  permText: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  webBox: {
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  webTitle: {
    fontFamily: fontBrand,
    fontSize: 40,
    letterSpacing: 2,
    color: colors.text,
  },
  webCopy: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMuted,
  },
});
