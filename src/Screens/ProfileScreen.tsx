import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, TextInput, Modal } from 'react-native';
import { Text, Icon } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import BottomNavBar from '../Components/BottomNavBar';
import * as ImagePicker from 'expo-image-picker';
import useAuthStore from '../store/authStore';
import useProfileStore from '../store/profileStore';


type ProfileScreenProps = {
  navigation: StackNavigationProp<any, 'Profile'>;
};

interface UserInfo {
  name: string;
  grade: string;
  email: string;
  phone: string;
  address: string;
  parentName: string;
  parentPhone: string;
  rollNumber: string;
  dateOfBirth: string;
  bloodGroup: string;
  emergencyContact: string;
  admissionDate: string;
  extracurricularActivities: string[];
  profileImage: string;
}

type IconName = 'mail' | 'phone' | 'environment' | 'calendar' | 'heart' | 'solution' | 'user' | 'alert' | 'camera' | 'check' | 'edit' | 'logout' | 'lock' | 'close' | 'zoom-out' | 'flag' | 'idcard' | 'number' | 'book'; // Updated 'solution1' to 'solution'

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isResetingPassword, setIsResetingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: 'John Doe',
    grade: '10th Grade',
    email: 'johndoe@example.com',
    phone: '+1 234 567 8900',
    address: '123 School Street, City, Country',
    parentName: 'Jane Doe',
    parentPhone: '+1 234 567 8901',
    rollNumber: '2023001',
    dateOfBirth: '15 May 2005',
    bloodGroup: 'A+',
    emergencyContact: '+1 234 567 8902',
    admissionDate: '1 June 2020',
    extracurricularActivities: ['Basketball', 'Debate Club', 'Chess'],
    profileImage: 'https://via.placeholder.com/150',
  });

  const logout = useAuthStore((state: any) => state.logout);
  const profile =  useProfileStore((state: any) => state.profile);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const renderInfoItem = (icon: IconName, title: string, value: string | undefined) => (
    <View style={styles.infoItem}>
      <View style={styles.infoIcon}>
        <Icon name={icon} size={24} color="#001529" />
      </View>
      <View style={styles.infoMainContent}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoValue}>{value || 'N/A'}</Text>
      </View>
    </View>
  );

  const handleSaveChanges = () => {
    // Here you would typically send the updated userInfo to your backend
    setIsEditing(false);
  };

  const handleImagePick = async () => {
    if (isEditing) {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        alert("Permission to access camera roll is required!");
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!pickerResult.canceled) {
        setUserInfo({ ...userInfo, profileImage: pickerResult.assets[0].uri });
      }
    }
  };

  const handleResetPassword = () => {
    if (newPassword === confirmPassword) {
      // Here you would typically send the new password to your backend
      alert('Password reset successfully!');
      setIsResetingPassword(false);
      setNewPassword('');
      setConfirmPassword('');
    } else {
      alert('Passwords do not match. Please try again.');
    }
  };

  const handleLogout = () => {
    navigation.navigate("Login")
    logout();
  };

  const isStaff = profile.roles.some((role: string) => ['teacher', 'admin', 'staff'].includes(role.toLowerCase()));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Icon name={isEditing ? "check" : "edit"} size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contentContainer}>
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={handleImagePick} style={styles.imageContainer}>
            <Image
              source={{ uri: 'https://via.placeholder.com/150' }}
              style={styles.profileImage}
            />
            {isEditing && (
              <View style={styles.editImageOverlay}>
                <Icon name="camera" size={24} color="#ffffff" />
                <Text style={styles.editImageText}>Edit</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.profileName}>{`${profile.firstName} ${profile.lastName}`}</Text>
          <Text style={styles.profileGrade}>{profile.roles.join(', ')}</Text>
          <Text style={styles.profileRollNumber}>Username: {profile.username}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionHeader}>Personal Information</Text>
          {renderInfoItem('mail', 'Email', profile.email)}
          {renderInfoItem('phone', 'Phone', profile.contactNumber)}
          {renderInfoItem('environment', 'Address', profile.address)}
          {renderInfoItem('calendar', 'Date of Birth', formatDate(profile.dateOfBirth))}
          {renderInfoItem('user', 'Gender', profile.gender)}
          {renderInfoItem('flag', 'Nationality', profile.nationality)}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionHeader}>Official Information</Text>
          {isStaff ? (
            <>
              {renderInfoItem('solution', 'Adhaar Number', profile.adhaarNumber)}
              {renderInfoItem('idcard', 'PAN Card Number', profile.pancardNumber)}
              {renderInfoItem('calendar', 'Join Date', formatDate(profile.joinDate))}
            </>
          ) : (
            <>
              {renderInfoItem('number', 'Roll Number', profile.rollNumber)}
              {renderInfoItem('book', 'Grade', profile.grade)}
            </>
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionHeader}>Emergency Contact</Text>
          {renderInfoItem('user', 'Name', profile.emergencyContactName)}
          {renderInfoItem('phone', 'Phone', profile.emergencyContactNumber)}
        </View>

        {isStaff && (
          <>
            <View style={styles.infoSection}>
              <Text style={styles.sectionHeader}>Qualifications</Text>
              {profile.qualifications.map((qual: any, index: number) => (
                <View key={index} style={styles.qualificationItem}>
                  <Text style={styles.qualificationTitle}>{qual.degree}</Text>
                  <Text>{qual.fieldOfStudy} - {qual.yearOfPass}</Text>
                  <Text>{qual.instituteName}</Text>
                  <Text>Grade: {qual.gradePercentage}</Text>
                </View>
              ))}
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionHeader}>Previous Employments</Text>
              {profile.previousEmployments.map((emp: any, index: number) => (
                <View key={index} style={styles.employmentItem}>
                  <Text style={styles.employmentTitle}>{emp.instituteName}</Text>
                  <Text>{emp.role}</Text>
                  <Text>{`${formatDate(emp.joinedDate)} - ${formatDate(emp.revealedDate)}`}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <TouchableOpacity 
          style={styles.resetPasswordButton} 
          onPress={() => setIsResetingPassword(true)}
        >
          <Icon name="lock" size={20} color="#ffffff" style={styles.resetPasswordIcon} />
          <Text style={styles.resetPasswordButtonText}>Reset Password</Text>
        </TouchableOpacity>

        {isEditing ? (
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon name="logout" size={20} color="#ffffff" style={styles.logoutIcon} />
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal
        visible={isResetingPassword}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsResetingPassword(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reset Password</Text>
              <TouchableOpacity onPress={() => setIsResetingPassword(false)}>
                <Icon name="close" size={24} color="#001529" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="New Password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Confirm New Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleResetPassword}>
              <Text style={styles.modalButtonText}>Reset Password</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#001529',
    padding: 15,
    borderRadius: 10,
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 1000,
    height: 60,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    marginTop: 80,
  },
  profileSection: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    margin: 20,
    marginTop: 30,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImageText: {
    color: '#ffffff',
    marginTop: 5,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#001529',
  },
  profileGrade: {
    fontSize: 16,
    color: '#4a4a4a',
    marginTop: 5,
  },
  profileRollNumber: {
    fontSize: 14,
    color: '#4a4a4a',
    marginTop: 5,
  },
  infoSection: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001529',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  infoIcon: {
    marginRight: 15,
  },
  infoMainContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001529',
  },
  infoValue: {
    fontSize: 14,
    color: '#4a4a4a',
    marginTop: 5,
  },
  activityItem: {
    fontSize: 14,
    color: '#4a4a4a',
    marginBottom: 5,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#001529',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 80, // Increased to accommodate BottomNavBar
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 5,
    marginTop: 5,
    fontSize: 14,
    color: '#4a4a4a',
  },
  saveButton: {
    backgroundColor: '#52c41a',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 80,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetPasswordButton: {
    flexDirection: 'row',
    backgroundColor: '#001529',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  resetPasswordIcon: {
    marginRight: 10,
  },
  resetPasswordButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#001529',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    width: '100%',
    fontSize: 16,
  },
  modalButton: {
    backgroundColor: '#001529',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  qualificationItem: {
    marginBottom: 10,
  },
  qualificationTitle: {
    fontWeight: 'bold',
  },
  employmentItem: {
    marginBottom: 10,
  },
  employmentTitle: {
    fontWeight: 'bold',
  },
});

export default ProfileScreen;