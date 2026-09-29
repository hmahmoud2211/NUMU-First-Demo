export type ChildAvatarOption = {
  id: string;
  emoji: string;
  label: string;
};

export const CHILD_AVATARS: ChildAvatarOption[] = [
  { id: 'lion', emoji: '🦁', label: 'Lion' },
  { id: 'rocket', emoji: '🚀', label: 'Rocket' },
  { id: 'panda', emoji: '🐼', label: 'Panda' },
  { id: 'star', emoji: '🌟', label: 'Star' },
  { id: 'fox', emoji: '🦊', label: 'Fox' },
  { id: 'whale', emoji: '🐳', label: 'Whale' },
];

export const DEFAULT_CHILD_AVATAR = CHILD_AVATARS[0];

export function getChildAvatar(id: string | undefined): ChildAvatarOption {
  return CHILD_AVATARS.find((avatar) => avatar.id === id) ?? DEFAULT_CHILD_AVATAR;
}
