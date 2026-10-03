import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GameButton } from '@/components/world/ui/GameButton';
import { Sheet } from '@/components/world/ui/Sheet';
import { useWorld } from '@/context/WorldContext';
import { gameColors, gameType } from '@/theme';

type SettingsPanelProps = {
  visible: boolean;
  onClose: () => void;
  onParentArea: () => void;
};

/** Child-safe settings. The parent area needs a long press so it is not opened by accident. */
export function SettingsPanel({ visible, onClose, onParentArea }: SettingsPanelProps) {
  const { progress, setVoice } = useWorld();
  const [showHint, setShowHint] = useState(false);
  const voice = progress.settings.voice;
  return (
    <Sheet visible={visible} onClose={onClose} placement="center">
      <View style={styles.body}>
        <Text style={[gameType.title, styles.center]}>Settings</Text>

        <View style={styles.row}>
          <View style={styles.flex}>
            <Text style={gameType.heading}>Read aloud</Text>
            <Text style={gameType.label}>Hear questions and messages</Text>
          </View>
          <GameButton
            size="sm"
            title={voice ? 'On' : 'Off'}
            ionicon={voice ? 'volume-high' : 'volume-mute'}
            color={voice ? gameColors.green : gameColors.locked}
            edge={voice ? gameColors.greenEdge : gameColors.lockedEdge}
            accessibilityLabel={`Read aloud ${voice ? 'on' : 'off'}`}
            accessibilityState={{ checked: voice }}
            onPress={() => setVoice(!voice)}
          />
        </View>

        <View style={styles.parent}>
          <Text style={gameType.heading}>For grown-ups</Text>
          <Text style={[gameType.label, showHint && styles.hint]}>
            {showHint ? 'Keep your finger on the button a little longer.' : 'Press and hold to open the parent area.'}
          </Text>
          <GameButton
            title="Hold for Parent Area"
            ionicon="lock-closed"
            color={gameColors.primary}
            edge={gameColors.primaryEdge}
            delayLongPress={1200}
            onLongPress={() => {
              setShowHint(false);
              onParentArea();
            }}
            accessibilityHint="Press and hold for about one second"
            style={styles.hold}
            onPress={() => setShowHint(true)}
          />
        </View>

        <GameButton title="Back to the world" color={gameColors.orange} edge={gameColors.orangeEdge} onPress={onClose} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: 18,
  },
  center: {
    textAlign: 'center',
  },
  flex: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 20,
    backgroundColor: gameColors.white,
  },
  parent: {
    gap: 6,
    padding: 14,
    borderRadius: 20,
    backgroundColor: gameColors.white,
  },
  hold: {
    marginTop: 6,
  },
  hint: {
    color: gameColors.primaryEdge,
  },
});
