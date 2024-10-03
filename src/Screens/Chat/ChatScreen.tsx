import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  ActivityIndicator,
  Platform,
  Animated,
  ScrollView,
  Keyboard,
  Easing,
} from 'react-native';
import { Text, Icon } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { formatDate, isSameDay } from '../../utils/StringUtil';
import { Audio } from 'expo-av';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'other';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  image?: string;
  file?: {
    name: string;
    uri: string;
    type: string;
  };
  voiceNote?: {
    uri: string;
    duration: number;
  };
}

type ChatScreenProps = {
  navigation: StackNavigationProp<any, 'Chat'>;
  route: {
    params: {
      groupName: string;
    };
  };
};

// Add this function before the VoiceNote component
const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const AudioWaveform: React.FC<{ isActive: boolean, duration: number }> = ({ isActive, duration }) => {
  const bars = 50; // Increased number of bars for better full-width appearance
  const animatedValues = useRef(Array(bars).fill(0).map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (isActive) {
      const animations = animatedValues.map((value, index) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(value, {
              toValue: Math.random(),
              duration: 500 + index * 10,
              useNativeDriver: false,
            }),
            Animated.timing(value, {
              toValue: Math.random() * 0.5,
              duration: 500 + index * 10,
              useNativeDriver: false,
            }),
          ])
        );
      });
      Animated.parallel(animations).start();
    } else {
      animatedValues.forEach(value => value.setValue(Math.random() * 0.5));
    }
  }, [isActive]);

  return (
    <View style={styles.waveformContainer}>
      {animatedValues.map((value, index) => (
        <Animated.View
          key={index}
          style={[
            styles.waveformBar,
            {
              height: value.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: isActive ? '#001529' : '#B0B0B0',
            },
          ]}
        />
      ))}
    </View>
  );
};

const VoiceNote: React.FC<{ voiceNote: Message['voiceNote'] }> = ({ voiceNote }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [duration, setDuration] = useState(voiceNote?.duration || 0);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const loadSound = async () => {
    if (!sound && voiceNote) {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: voiceNote.uri },
        { progressUpdateIntervalMillis: 100 },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPlaybackPosition(status.positionMillis / 1000);
      setDuration(status.durationMillis ? status.durationMillis / 1000 : voiceNote?.duration || 0);
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPlaybackPosition(0);
        sound?.setPositionAsync(0);
      }
    }
  };

  const playPauseVoiceNote = async () => {
    await loadSound();
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        if (playbackPosition >= duration) {
          await sound.setPositionAsync(0);
          setPlaybackPosition(0);
        }
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <View style={styles.voiceNoteContainer}>
      <TouchableOpacity onPress={playPauseVoiceNote} style={styles.playPauseButton}>
        <Icon name={isPlaying ? "pause" : "play-circle"} size={24} color="#001529" />
      </TouchableOpacity>
      <View style={styles.voiceNoteContent}>
        <AudioWaveform isActive={isPlaying} duration={duration} />
        <View style={styles.voiceNoteFooter}>
          <Text style={styles.voiceNoteDuration}>
            {formatDuration(Math.floor(playbackPosition))}
          </Text>
          <Text style={styles.voiceNoteTotalDuration}>
            {formatDuration(Math.floor(duration))}
          </Text>
        </View>
      </View>
    </View>
  );
};

const ChatScreen: React.FC<ChatScreenProps> = ({ navigation, route }) => {
  const groupName = route.params?.groupName || 'Group Chat';
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerHeight = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimer = useRef<number | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fetch messages from API or load from local storage
    const fetchMessages = async () => {
      // Replace this with actual API call or data loading logic
      const dummyMessages: Message[] = [
        { id: '1', text: 'Hello!', sender: 'other', timestamp: new Date(Date.now() - 3600000), status: 'read' },
        { id: '2', text: 'Hi there!', sender: 'user', timestamp: new Date(Date.now() - 3540000), status: 'read' },
        { id: '3', text: 'How are you?', sender: 'other', timestamp: new Date(Date.now() - 3480000), status: 'read' },
        { id: '4', text: 'I\'m good, thanks! How about you?', sender: 'user', timestamp: new Date(Date.now() - 3420000), status: 'read' },
        { id: '5', text: 'I\'m doing great! Thanks for asking.', sender: 'other', timestamp: new Date(Date.now() - 3360000), status: 'read' },
        { id: '6', text: 'That\'s wonderful to hear!', sender: 'user', timestamp: new Date(Date.now() - 3300000), status: 'read' },
        { id: '7', text: 'By the way, check out this image:', sender: 'other', timestamp: new Date(Date.now() - 3240000), status: 'read' },
        { 
          id: '8', 
          text: '', 
          sender: 'other', 
          timestamp: new Date(Date.now() - 3180000), 
          status: 'read',
          image: 'https://img.freepik.com/free-photo/person-washing-carrots-kitchen_23-2150316427.jpg?t=st=1727937004~exp=1727940604~hmac=79d84254c6d4e225afdbbc5ae60bcb5d02e9854e376754ed3d55b3e1c6ea5cdb&w=996' // This is a placeholder URL
        },
        { id: '9', text: 'Wow, that\'s amazing!', sender: 'user', timestamp: new Date(Date.now() - 3120000), status: 'read' },
        { id: '10', text: 'I\'m glad you like it!', sender: 'other', timestamp: new Date(Date.now() - 3060000), status: 'read' },
        { id: '11', text: 'Do you have any plans for the weekend?', sender: 'user', timestamp: new Date(Date.now() - 3000000), status: 'read' },
        { id: '12', text: 'Not yet, but I\'m thinking about going hiking. You?', sender: 'other', timestamp: new Date(Date.now() - 2940000), status: 'read' },
        { id: '13', text: 'That sounds fun! I might catch up on some reading.', sender: 'user', timestamp: new Date(Date.now() - 2880000), status: 'read' },
        { 
          id: '14', 
          text: '', 
          sender: 'user', 
          timestamp: new Date(Date.now() - 2820000), 
          status: 'read',
          voiceNote: {
            uri: 'https://example.com/dummy-voice-note.mp3', // Replace with actual voice note URL
            duration: 15 // Duration in seconds
          }
        },
        { id: '15', text: 'I sent you a voice note. Did you receive it?', sender: 'user', timestamp: new Date(Date.now() - 2760000), status: 'read' },
        { id: '16', text: 'Yes, I got it. Thanks!', sender: 'other', timestamp: new Date(Date.now() - 2700000), status: 'read' },
      ];
      setMessages(dummyMessages);
    };

    fetchMessages();

    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  const sendMessage = useCallback(() => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
        sender: 'user',
        timestamp: new Date(),
        status: 'sent',
      };
      setMessages(prevMessages => [newMessage, ...prevMessages]);
      setInputText('');
      // Simulate message status updates
      setTimeout(() => updateMessageStatus(newMessage.id, 'delivered'), 1000);
      setTimeout(() => updateMessageStatus(newMessage.id, 'read'), 2000);
    }
  }, [inputText]);

  const updateMessageStatus = (messageId: string, status: 'sent' | 'delivered' | 'read') => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === messageId ? { ...msg, status } : msg
      )
    );
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      sendMediaMessage(result.assets[0].uri);
    }
  };

  const sendMediaMessage = (uri: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text: '',
      sender: 'user',
      timestamp: new Date(),
      status: 'sent',
      image: uri,
    };

    setMessages(prevMessages => [newMessage, ...prevMessages]);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
    Animated.timing(emojiPickerHeight, {
      toValue: showEmojiPicker ? 0 : 200,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const onEmojiSelected = (emoji: string) => {
    setInputText(prevText => prevText + emoji);
  };

  const deleteMessage = (messageId: string) => {
    setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
  };

  const renderDateMarker = (date: Date) => (
    <View style={styles.dateMarkerContainer}>
      <Text style={styles.dateMarkerText}>{formatDate(date)}</Text>
    </View>
  );

  const renderItem = useCallback(({ item, index }: { item: Message; index: number }) => {
    const showDateMarker = index === messages.length - 1 || !isSameDay(item.timestamp, messages[index + 1].timestamp);

    return (
      <>
        {showDateMarker && renderDateMarker(item.timestamp)}
        <View
          style={[styles.messageBubble, item.sender === 'user' ? styles.userMessage : styles.otherMessage]}
        >
          {item.sender === 'other' && (
            <Image source={{ uri: 'https://via.placeholder.com/40' }} style={styles.avatar} />
          )}
          <View style={styles.messageContent}>
            {item.image && <Image source={{ uri: item.image }} style={styles.messageImage} />}
            {item.file && (
              <View style={styles.fileAttachment}>
                <Icon name="file" size={24} color="#001529" />
                <Text style={styles.fileName}>{item.file.name}</Text>
              </View>
            )}
            {item.voiceNote && <VoiceNote voiceNote={item.voiceNote} />}
            {item.text && <Text style={[styles.messageText, item.sender === 'other' && styles.otherMessageText]}>{item.text}</Text>}
            <View style={styles.messageFooter}>
              <Text style={styles.timestamp}>{formatDate(item.timestamp, 'h:mm A')}</Text>
              {item.sender === 'user' && (
                <Icon name={item.status === 'sent' ? 'check' : item.status === 'delivered' ? 'check-circle' : 'check-circle'} 
                      size={16} 
                      color={item.status === 'read' ? '#4CAF50' : '#8E8E93'} 
                      style={styles.statusIcon} />
              )}
            </View>
          </View>
        </View>
      </>
    );
  }, [messages]);

  const renderEmojiPicker = () => (
    <Animated.View style={[styles.emojiPickerContainer, { height: emojiPickerHeight }]}>
      <View style={styles.emojiList}>
        {['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🎉'].map(emoji => (
          <TouchableOpacity key={emoji} onPress={() => onEmojiSelected(emoji)} style={styles.emojiButton}>
            <Text style={styles.emoji}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: false,
      });

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        sendFileMessage(file.uri, file.name, file.mimeType || 'application/octet-stream');
      }
    } catch (err) {
      console.error('Error picking document:', err);
    }
  };

  const sendFileMessage = (uri: string, name: string, type: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text: '',
      sender: 'user',
      timestamp: new Date(),
      status: 'sent',
      file: { name, uri, type },
    };

    setMessages(prevMessages => [newMessage, ...prevMessages]);
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async (save: boolean = true) => {
    if (!recording) return;

    setIsRecording(false);
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
    }
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);

    if (save && uri) {
      const { sound } = await recording.createNewLoadedSoundAsync();
      const status = await sound.getStatusAsync();
      if ('durationMillis' in status) {
        const duration = status.durationMillis! / 1000;
        sendVoiceNote(uri, duration);
      } else {
        sendVoiceNote(uri, recordingDuration);
      }
    }
    setRecordingDuration(0);
  };

  const sendVoiceNote = (uri: string, duration: number) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text: '',
      sender: 'user',
      timestamp: new Date(),
      status: 'sent',
      voiceNote: { uri, duration },
    };

    setMessages(prevMessages => [newMessage, ...prevMessages]);
  };

  const handleMicPress = () => {
    if (isRecording) {
      stopRecording(true); // Stop and save the recording
    } else {
      startRecording();
    }
  };

  const handleCancelRecording = () => {
    stopRecording(false); // Stop without saving the recording
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{groupName}</Text>
          <Text style={styles.headerSubtitle}>Group Chat</Text>
        </View>
        <TouchableOpacity style={styles.headerRightButton}>
          <Icon name="more" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.chatContainer}>
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          inverted
          ListFooterComponent={() => (
            isTyping ? (
              <View style={styles.typingIndicator}>
                <Text style={styles.typingText}>Other user is typing...</Text>
                <ActivityIndicator size="small" color="#001529" />
              </View>
            ) : null
          )}
        />
      </View>

      <View style={styles.inputContainer}>
        {isRecording ? (
          <View style={styles.recordingContainer}>
            <Icon name="audio" size={24} color="#ff4d4f" />
            <View style={styles.recordingContent}>
              <AudioWaveform isActive={true} duration={recordingDuration} />
              <Text style={styles.recordingDuration}>{formatDuration(recordingDuration)}</Text>
            </View>
            <TouchableOpacity onPress={handleCancelRecording} style={styles.stopRecordingButton}>
              <Icon name="close" size={24} color="#ff4d4f" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.inputWrapper}>
            <TouchableOpacity style={styles.emojiButton} onPress={toggleEmojiPicker}>
              <Icon name="smile" size={24} color="#999" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachButton} onPress={pickDocument}>
              <Icon name="paper-clip" size={24} color="#999" />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message"
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <Icon name="camera" size={24} color="#999" />
            </TouchableOpacity>
          </View>
        )}
        {inputText.trim() ? (
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Icon name="send" size={24} color="#ffffff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.micButton, isRecording && styles.recordingButton]}
            onPress={handleMicPress}
          >
            <Icon name={isRecording ? "dashboard" : "audio"} size={24} color={isRecording ? "#ff4d4f" : "#ffffff"} />
          </TouchableOpacity>
        )}
      </View>

      {renderEmojiPicker()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  chatContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#001529",
    padding: 15,
    height: 70, // Increased height to accommodate two lines of text
  },
  backButton: {
    width: 24,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  headerSubtitle: {
    color: "#ffffff",
    fontSize: 14,
    opacity: 0.8,
  },
  headerRightButton: {
    width: 24,
  },
  messageList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  messageBubble: {
    flexDirection: 'row',
    maxWidth: '80%',
    padding: 10,
    borderRadius: 20,
    marginVertical: 5,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#001529',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
  },
  messageContent: {
    flex: 1,
  },
  messageText: {
    fontSize: 16,
    color: '#ffffff',
  },
  otherMessageText: {
    color: '#001529',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 5,
  },
  timestamp: {
    fontSize: 12,
    color: '#8E8E93',
    marginRight: 5,
  },
  statusIcon: {
    marginLeft: 2,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f2f5',
  },
  typingText: {
    color: '#001529',
    marginRight: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#001529',
    marginLeft: 5,
    marginRight: 5,
  },
  emojiButton: {
    padding: 5,
    marginRight: 5,
  },
  attachButton: {
    padding: 5,
    marginRight: 5,
  },
  imageButton: {
    padding: 5,
    marginLeft: 5,
  },
  sendButton: {
    backgroundColor: '#001529',
    borderRadius: 50,
    padding: 10,
  },
  micButton: {
    backgroundColor: '#001529',
    borderRadius: 50,
    padding: 10,
  },
  recordingButton: {
    backgroundColor: '#ff4d4f',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 10,
    marginBottom: 5,
  },
  fileAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E5EA',
    padding: 10,
    borderRadius: 10,
    marginBottom: 5,
  },
  fileName: {
    marginLeft: 10,
    color: '#001529',
    fontSize: 14,
  },
  emojiPickerContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    overflow: 'hidden',
  },
  emojiList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 10,
  },
  emoji: {
    fontSize: 24,
  },
  dateMarkerContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  dateMarkerText: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    color: '#001529',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  voiceNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E5EA',
    borderRadius: 20,
    padding: 10,
    marginBottom: 5,
    width: '100%', // Ensure full width
  },
  playPauseButton: {
    marginRight: 10,
  },
  voiceNoteContent: {
    flex: 1,
    width: '100%', // Ensure full width
  },
  voiceNoteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    width: '100%', // Ensure full width
  },
  voiceNoteDuration: {
    fontSize: 12,
    color: '#001529',
  },
  voiceNoteTotalDuration: {
    fontSize: 12,
    color: '#001529',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    width: '100%', // Ensure full width
  },
  waveformBar: {
    flex: 1, // Use flex to distribute space evenly
    marginHorizontal: 1,
    borderRadius: 1,
  },
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    flex: 1,
  },
  recordingContent: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
  },
  recordingDuration: {
    fontSize: 12,
    color: '#001529',
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  stopRecordingButton: {
    padding: 5,
  },
});

export default ChatScreen;