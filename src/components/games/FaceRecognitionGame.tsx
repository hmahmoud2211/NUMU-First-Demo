import { useWindowDimensions, View, StyleSheet } from 'react-native';

import { EmotionImage } from '@/components/emotion/EmotionImage';
import { pickAgeText } from '@/config/ageGroups';
import { useChild } from '@/context/ChildContext';
import { EMOTION_LESSONS } from '@/data/emotionLessons';
import { useChoiceAnswer } from '@/hooks/useChoiceAnswer';
import type { FaceQuestion } from '@/types/learning';

import { ChoiceQuestionView } from './ChoiceQuestionView';
import type { GameComponentProps } from './types';

/** Level 1: look at a face and choose the feeling. */
export function FaceRecognitionGame({ question, source, onComplete, onCompare }: GameComponentProps<FaceQuestion>) {
  const { ageGroup } = useChild();
  const { width, height } = useWindowDimensions();
  const answer = useChoiceAnswer(question, source);
  const lesson = EMOTION_LESSONS[question.targetEmotion];
  const maxSize = ageGroup.imageSize === 'large' ? 300 : 240;
  const size = Math.min(width - 48, height * 0.34, maxSize);

  return (
    <ChoiceQuestionView
      question={question}
      answer={answer}
      hint={pickAgeText(lesson.faceHint, ageGroup.id)}
      onNext={() => onComplete([answer.buildResult()])}
      onCompare={onCompare}
      stimulus={
        <View style={styles.imageWrap}>
          <EmotionImage
            image={question.image}
            size={size}
            highlight={answer.status === 'retry' || answer.status === 'revealed' ? lesson.hintPart : null}
            revealEmotion={answer.done}
          />
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  imageWrap: {
    alignItems: 'center',
  },
});
