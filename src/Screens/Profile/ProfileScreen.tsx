import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Modal,
} from "react-native";
import { Text, Icon } from "@ant-design/react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import BottomNavBar from "../../Components/BottomNavBar";
import * as ImagePicker from "expo-image-picker";
import useAuthStore from "../../store/authStore";
import useProfileStore from "../../store/profileStore";
import { formatDate } from "../../utils/DateUtil";
import { IconName } from "../../utils/IconUtils";
import { checkUsernameAvailability, updateUserProfile } from "../../Services/Profile/ProfileServices";
import debounce from 'lodash/debounce';
import { updateUserCredentials } from "../../Services/Profile/PasswordResetService";
import { TextInput as RNTextInput } from "react-native";

type ProfileScreenProps = {
  navigation: StackNavigationProp<any, "Profile">;
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


const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const logout = useAuthStore((state: any) => state.logout);
  const profile = useProfileStore((state: any) => state.profile);
  const [isResettingCredentials, setIsResettingCredentials] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const newUsernameRef = useRef("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [usernameAvailability, setUsernameAvailability] = useState<'available' | 'unavailable' | 'checking' | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  const getInputStyle = () => {
    switch (usernameAvailability) {
      case 'available':
        return [styles.modalInput, styles.availableInput];
      case 'unavailable':
        return [styles.modalInput, styles.unavailableInput];
      case 'checking':
        return [styles.modalInput, styles.checkingInput];
      default:
        return styles.modalInput;
    }
  };

  const renderInfoItem = (
    icon: IconName,
    title: string,
    value: string | undefined
  ) => (
    <View style={styles.infoItem}>
      <View style={styles.infoIcon}>
        <Icon name={icon} size={24} color="#001529" />
      </View>
      <View style={styles.infoMainContent}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoValue}>{value || "N/A"}</Text>
      </View>
    </View>
  );

  const handleLogout = () => {
    navigation.navigate("Login");
    logout();
  };

  const isStaff = profile?.roles?.some((role: string) =>
    ["teacher", "admin", "staff"].includes(role.toLowerCase())
  );

  const checkUsername = async (username: string) => {
    if (username.length < 3) {
      setUsernameAvailability(null);
      return;
    }
    setIsCheckingUsername(true);
    setUsernameAvailability('checking');
    try {
      if (username === profile?.username) {
        setUsernameAvailability('available');
      } else {
        const isAvailable = await checkUsernameAvailability(username);
        setUsernameAvailability(isAvailable ? 'available' : 'unavailable');
      }
    } catch (error) {
      console.error("Error checking username availability:", error);
      setUsernameAvailability(null);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const debouncedCheckUsername = debounce(checkUsername, 300);

  const handleUsernameChange = (text: string) => {
    setNewUsername(text);
    newUsernameRef.current = text;
    debouncedCheckUsername(text);
  };

  const handleResetCredentials = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match. Please try again.");
      return;
    }

    const finalUsername = newUsernameRef.current;

    if (finalUsername.length < 3) {
      alert("Username must be at least 3 characters long.");
      return;
    }

    if (isCheckingUsername) {
      alert("Please wait while we verify the username availability.");
      return;
    }

    // Force a final check of username availability
    await checkUsername(finalUsername);

    if (usernameAvailability !== 'available') {
      alert("The chosen username is not available. Please choose a different username.");
      return;
    }

    try {
      await updateUserCredentials(profile.userId, finalUsername, newPassword);
      alert("Credentials updated successfully!");
      setIsResettingCredentials(false);
      setNewUsername("");
      newUsernameRef.current = "";
      setNewPassword("");
      setConfirmPassword("");
      setUsernameAvailability(null);
      if (finalUsername) {
        useProfileStore.getState().setProfile({ ...profile, username: finalUsername });
      }
    } catch (error) {
      console.error("Error updating credentials:", error);
      alert("Failed to update credentials. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contentContainer}>
        <View style={styles.profileSection}>
          <Image
            source={{ uri: profile?.profileImage || "https://via.placeholder.com/150" }}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>
            {`${profile?.firstName} ${profile?.lastName}`}
          </Text>
          <Text style={styles.profileGrade}>{profile?.roles.join(", ")}</Text>
          <Text style={styles.profileRollNumber}>
            Username: {profile?.username}
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionHeader}>Personal Information</Text>
          {renderInfoItem("mail", "Email", profile?.email)}
          {renderInfoItem("phone", "Phone", profile?.contactNumber)}
          {renderInfoItem("environment", "Address", profile?.address)}
          {renderInfoItem("calendar", "Date of Birth", formatDate(profile?.dateOfBirth))}
          {renderInfoItem("user", "Gender", profile?.gender)}
          {renderInfoItem("flag", "Nationality", profile?.nationality)}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionHeader}>Official Information</Text>
          {isStaff ? (
            <>
              {renderInfoItem("solution", "Adhaar Number", profile?.adhaarNumber)}
              {renderInfoItem("idcard", "PAN Card Number", profile?.pancardNumber)}
              {renderInfoItem("calendar", "Join Date", formatDate(profile?.joinDate))}
            </>
          ) : (
            <>
              {renderInfoItem("number", "Roll Number", profile?.rollNumber)}
              {renderInfoItem("book", "Grade", profile?.grade)}
            </>
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionHeader}>Emergency Contact</Text>
          {renderInfoItem("user", "Name", profile?.emergencyContactName)}
          {renderInfoItem("phone", "Phone", profile?.emergencyContactNumber)}
        </View>

        {isStaff && (
          <>
            <View style={styles.infoSection}>
              <Text style={styles.sectionHeader}>Qualifications</Text>
              {profile?.qualifications.map((qual: any, index: number) => (
                <View key={index} style={styles.qualificationItem}>
                  <Text style={styles.qualificationTitle}>{qual.degree}</Text>
                  <Text>
                    {qual.fieldOfStudy} - {qual.yearOfPass}
                  </Text>
                  <Text>{qual.instituteName}</Text>
                  <Text>Grade: {qual.gradePercentage}</Text>
                </View>
              ))}
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionHeader}>Previous Employments</Text>
              {profile?.previousEmployments.map((emp: any, index: number) => (
                <View key={index} style={styles.employmentItem}>
                  <Text style={styles.employmentTitle}>
                    {emp?.instituteName}
                  </Text>
                  <Text>{emp?.role}</Text>
                  <Text>{`${formatDate(emp?.joinedDate)} - ${formatDate(
                    emp?.revealedDate
                  )}`}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <TouchableOpacity
          style={styles.resetCredentialsButton}
          onPress={() => setIsResettingCredentials(true)}
        >
          <Icon
            name="lock"
            size={20}
            color="#ffffff"
            style={styles.resetCredentialsIcon}
          />
          <Text style={styles.resetCredentialsButtonText}>Reset Credentials</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon
            name="logout"
            size={20}
            color="#ffffff"
            style={styles.logoutIcon}
          />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={isResettingCredentials}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsResettingCredentials(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reset Credentials</Text>
              <TouchableOpacity onPress={() => setIsResettingCredentials(false)}>
                <Icon name="close" size={24} color="#001529" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={getInputStyle()}
              placeholder="New Username"
              value={newUsername}
              onChangeText={handleUsernameChange}
            />
            <View style={styles.passwordInputContainer}>
              <RNTextInput
                style={[styles.modalInput, styles.passwordInput]}
                placeholder="New Password"
                secureTextEntry={!showNewPassword}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity
                style={styles.eyeIconContainer}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Icon name={showNewPassword ? "eye" : "eye-invisible"} size={24} color="#001529" />
              </TouchableOpacity>
            </View>
            <View style={styles.passwordInputContainer}>
              <RNTextInput
                style={[styles.modalInput, styles.passwordInput]}
                placeholder="Confirm New Password"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeIconContainer}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Icon name={showConfirmPassword ? "eye" : "eye-invisible"} size={24} color="#001529" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleResetCredentials}
            >
              <Text style={styles.modalButtonText}>Update Credentials</Text>
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
    backgroundColor: "#f0f2f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#001529",
    padding: 15,
    borderRadius: 10,
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    zIndex: 1000,
    height: 60,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    marginTop: 80,
  },
  profileSection: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 20,
    margin: 20,
    marginTop: 30,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editImageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  editImageText: {
    color: "#ffffff",
    marginTop: 5,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#001529",
  },
  profileGrade: {
    fontSize: 16,
    color: "#4a4a4a",
    marginTop: 5,
  },
  profileRollNumber: {
    fontSize: 14,
    color: "#4a4a4a",
    marginTop: 5,
  },
  infoSection: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#001529",
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
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
    fontWeight: "bold",
    color: "#001529",
  },
  infoValue: {
    fontSize: 14,
    color: "#4a4a4a",
    marginTop: 5,
  },
  activityItem: {
    fontSize: 14,
    color: "#4a4a4a",
    marginBottom: 5,
  },
  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#001529",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginBottom: 80, // Increased to accommodate BottomNavBar
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 5,
    marginTop: 5,
    fontSize: 14,
    color: "#4a4a4a",
  },
  saveButton: {
    backgroundColor: "#52c41a",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 80,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  resetPasswordButton: {
    flexDirection: "row",
    backgroundColor: "#001529",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  resetPasswordIcon: {
    marginRight: 10,
  },
  resetPasswordButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#001529",
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
  availableInput: {
    borderColor: 'green',
  },
  unavailableInput: {
    borderColor: 'red',
  },
  checkingInput: {
    borderColor: 'orange',
  },
  modalButton: {
    backgroundColor: "#001529",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
  },
  modalButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  qualificationItem: {
    marginBottom: 10,
  },
  qualificationTitle: {
    fontWeight: "bold",
  },
  employmentItem: {
    marginBottom: 10,
  },
  employmentTitle: {
    fontWeight: "bold",
  },
  editNameContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  editNameInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 5,
    marginHorizontal: 5,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001529',
    textAlign: 'center',
    width: '40%',
  },
  editUsernameContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  editUsernameInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 5,
    fontSize: 16,
    color: '#001529',
    textAlign: 'center',
    width: '80%',
  },
  availableUsername: {
    color: 'green',
    marginTop: 5,
  },
  unavailableUsername: {
    color: 'red',
    marginTop: 5,
  },
  checkingUsername: {
    color: 'orange',
    marginTop: 5,
  },
  invalidUsername: {
    color: 'red',
    marginTop: 5,
  },
  resetCredentialsButton: {
    flexDirection: "row",
    backgroundColor: "#001529",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  resetCredentialsIcon: {
    marginRight: 10,
  },
  resetCredentialsButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    marginBottom: 0,
  },
  eyeIconContainer: {
    position: 'absolute',
    right: 10,
    height: '100%',
    justifyContent: 'center',
  },
});

export default ProfileScreen;