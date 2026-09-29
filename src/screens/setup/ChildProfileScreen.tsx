import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { Card } from '@/components/common/Card';
import { ParentHeader } from '@/components/common/ParentHeader';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { TextField } from '@/components/common/TextField';
import { getAgeGroupIdForAge, SUPPORTED_AGE } from '@/config/ageGroups';
import { useChild } from '@/context/ChildContext';
import { CHILD_AVATARS, DEFAULT_CHILD_AVATAR } from '@/data/childAvatars';
import { routes } from '@/navigation/routes';
import { colors, radius, spacing, touchTarget, typography } from '@/theme';

const DEFAULT_AGE = 7;

export default function ChildProfileScreen() {
  const { child, createChild, updateChild } = useChild();
  const [name, setName] = useState(child?.name ?? '');
  const [age, setAge] = useState(child?.age ?? DEFAULT_AGE);
  const [avatarId, setAvatarId] = useState(child?.avatarId ?? DEFAULT_CHILD_AVATAR.id);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const changeAge = (delta: number) =>
    setAge((current) => Math.min(SUPPORTED_AGE.max, Math.max(SUPPORTED_AGE.min, current + delta)));

  const submit = async () => {
    if (!name.trim()) {
      setError('Please enter your child’s name (a nickname is fine).');
      return;
    }
    setSaving(true);
    if (child) {
      await updateChild({ name: name.trim(), age, avatarId, ageGroupId: getAgeGroupIdForAge(age) });
    } else {
      await createChild({ name, age, avatarId });
    }
    setSaving(false);
    router.push(routes.ageGroup);
  };

  return (
    <ScreenContainer
      keyboardAware
      footer={<AppButton title="Continue" icon="arrow-forward" onPress={submit} loading={saving} />}
    >
      <ParentHeader
        title={child ? `${child.name}’s profile` : 'Create child profile'}
        subtitle="Only a name and age are needed. No medical information is collected."
        onBack={router.canGoBack() ? router.back : undefined}
      />

      <Card style={styles.section}>
        <TextField
          label="Child Name"
          value={name}
          onChangeText={(value) => {
            setName(value);
            setError(null);
          }}
          placeholder="e.g. Adam"
          autoCapitalize="words"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.ageBlock}>
          <Text style={typography.label}>Age</Text>
          <View style={styles.stepper}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Decrease age"
              onPress={() => changeAge(-1)}
              style={styles.stepButton}
            >
              <Ionicons name="remove" size={24} color={colors.primary} />
            </Pressable>
            <Text style={[typography.h1, styles.ageValue]} accessibilityLabel={`Age ${age}`}>
              {age}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Increase age"
              onPress={() => changeAge(1)}
              style={styles.stepButton}
            >
              <Ionicons name="add" size={24} color={colors.primary} />
            </Pressable>
          </View>
          <Text style={typography.caption}>
            NUMU supports ages {SUPPORTED_AGE.min}–{SUPPORTED_AGE.max}.
          </Text>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={typography.label}>Choose an avatar (optional)</Text>
        <View style={styles.avatarGrid}>
          {CHILD_AVATARS.map((avatar) => {
            const selected = avatar.id === avatarId;
            return (
              <Pressable
                key={avatar.id}
                accessibilityRole="button"
                accessibilityLabel={avatar.label}
                accessibilityState={{ selected }}
                onPress={() => setAvatarId(avatar.id)}
                style={[styles.avatar, selected && styles.avatarSelected]}
              >
                <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  error: {
    ...typography.bodySecondary,
    color: colors.attention,
  },
  ageBlock: {
    gap: spacing.xs,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  stepButton: {
    width: touchTarget.min,
    height: touchTarget.min,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ageValue: {
    minWidth: 48,
    textAlign: 'center',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  avatarEmoji: {
    fontSize: 32,
  },
});
