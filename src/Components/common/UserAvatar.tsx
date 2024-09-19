import React from 'react';
import { Avatar } from 'react-native-paper';

interface UserAvatarProps {
  size?: number;
  source?: { uri: string };
}

const UserAvatar: React.FC<UserAvatarProps> = ({ size = 64, source }) => {
  return source ? (
    <Avatar.Image size={size} source={source} />
  ) : (
    <Avatar.Icon size={size} icon="account" />
  );
};

export default UserAvatar;