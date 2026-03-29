import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Screen } from '@/src/components/Screen';
import { useScanHistoryStore, type ScanHistoryItem } from '@/src/store/useScanHistoryStore';
import { useScanStore } from '@/src/store/useScanStore';
import { colors, spacing } from '@/src/theme/tokens';
import { dotColor, scoreLabel } from '@/src/utils/tagFields';

export default function HistoryScreen() {
  const items = useScanHistoryStore((s) => s.items);
  const hydrated = useScanHistoryStore((s) => s.hydrated);
  const hydrate = useScanHistoryStore((s) => s.hydrate);

  useFocusEffect(
    useCallback(() => {
      hydrate();
    }, [hydrate]),
  );

  function openItem(item: ScanHistoryItem) {
    useScanStore.getState().setResult(item.snapshot);
    router.push('/results');
  }

  function renderItem({ item }: { item: ScanHistoryItem }) {
    const tint = dotColor(item.snapshot.overallScore);
    const label = scoreLabel(item.snapshot.overallScore);
    return (
      <Pressable style={styles.row} onPress={() => openItem(item)}>
        {item.snapshot.tagImageUri ? (
          <Image source={{ uri: item.snapshot.tagImageUri }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.thumbPh]} />
        )}
        <View style={styles.mid}>
          <Text style={styles.title} numberOfLines={1}>
            {item.snapshot.brandName || item.snapshot.parsed.brand || 'Tag scan'}
          </Text>
          <Text style={styles.sub} numberOfLines={1}>
            {item.snapshot.parsed.country || '—'}
          </Text>
          <View style={styles.ratingRow}>
            <View style={[styles.dot, { backgroundColor: tint }]} />
            <Text style={[styles.ratingText, { color: tint }]}>
              {item.snapshot.overallScore}/100 · {label}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.border} />
      </Pressable>
    );
  }

  return (
    <Screen scroll={false}>
      <FlatList
        style={styles.listFlex}
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        contentContainerStyle={items.length === 0 ? styles.emptyWrap : styles.list}
        ListEmptyComponent={
          hydrated ? (
            <Text style={styles.empty}>No scans yet. Use Scan to photograph a care tag.</Text>
          ) : null
        }
        ItemSeparatorComponent={() => <View style={styles.sep} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listFlex: {
    flex: 1,
  },
  list: {
    paddingBottom: spacing.xl,
  },
  emptyWrap: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  empty: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  sep: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: spacing.md + 56 + spacing.md,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  thumbPh: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  mid: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  sub: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
