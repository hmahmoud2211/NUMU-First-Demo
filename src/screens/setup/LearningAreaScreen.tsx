import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ParentHeader } from '@/components/common/ParentHeader';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { SelectableCard } from '@/components/common/SelectableCard';
import { useChild } from '@/context/ChildContext';
import { LEARNING_AREAS, type LearningArea } from '@/data/learningAreas';
import { routes } from '@/navigation/routes';
import { spacing } from '@/theme';

export default function LearningAreaScreen() {
  const { child, updateChild } = useChild();

  const select = async (area: LearningArea) => {
    if (!area.available) return;
    await updateChild({ learningArea: area.id });
    // Make Parent Home the root of the stack, then enter the learning module.
    if (router.canDismiss()) router.dismissAll();
    router.replace(routes.parentHome);
    router.push(routes.learningIntro);
  };

  return (
    <ScreenContainer>
      <ParentHeader
        title="Choose an area to practice"
        subtitle={child ? `What would you like ${child.name} to practice?` : undefined}
        onBack={router.canGoBack() ? router.back : undefined}
      />
      <View style={styles.list}>
        {LEARNING_AREAS.map((area) => (
          <SelectableCard
            key={area.id}
            title={area.title}
            description={area.description}
            emoji={area.emoji}
            selected={child?.learningArea === area.id}
            disabled={!area.available}
            badge={area.available ? undefined : 'Coming Soon'}
            onPress={() => select(area)}
          />
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
});
