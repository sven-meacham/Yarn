import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors, radius, spacing } from '@/src/theme/tokens';
import type { UserDetailFields } from '@/src/utils/mergeUserDetails';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (fields: UserDetailFields) => void;
  initialBrand: string;
  initialMaterialsText: string;
  initialCountry: string;
};

export function AddDetailsModal({
  visible,
  onClose,
  onSave,
  initialBrand,
  initialMaterialsText,
  initialCountry,
}: Props) {
  const [brand, setBrand] = useState(initialBrand);
  const [materialsText, setMaterialsText] = useState(initialMaterialsText);
  const [country, setCountry] = useState(initialCountry);

  useEffect(() => {
    if (visible) {
      setBrand(initialBrand);
      setMaterialsText(initialMaterialsText);
      setCountry(initialCountry);
    }
  }, [visible, initialBrand, initialMaterialsText, initialCountry]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Add tag details</Text>
          <Text style={styles.hint}>
            Improves scoring when the scan missed a field. Use one material per line like{' '}
            <Text style={styles.mono}>60% cotton</Text>.
          </Text>

          <Text style={styles.label}>Brand</Text>
          <TextInput
            style={styles.input}
            value={brand}
            onChangeText={setBrand}
            placeholder="e.g. Nike"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.label}>Materials</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={materialsText}
            onChangeText={setMaterialsText}
            placeholder={'60% cotton\n40% polyester'}
            placeholderTextColor={colors.textMuted}
            multiline
          />

          <Text style={styles.label}>Made in (country)</Text>
          <TextInput
            style={styles.input}
            value={country}
            onChangeText={setCountry}
            placeholder="e.g. Vietnam"
            placeholderTextColor={colors.textMuted}
          />

          <View style={styles.actions}>
            <Pressable onPress={onClose} style={styles.secondary}>
              <Text style={styles.secondaryText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                onSave({ brand, materialsText, country });
                onClose();
              }}
              style={styles.primary}
            >
              <Text style={styles.primaryText}>Save & rescore</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg * 2,
    borderTopRightRadius: radius.lg * 2,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  hint: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  mono: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: colors.text,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
  multiline: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  secondary: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  primary: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.accent,
  },
  primaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
