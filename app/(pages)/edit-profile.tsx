import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';

const EditProfileScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [title, setTitle] = useState('');

  const handleSave = () => {
    // Save logic here
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton}>
        <Icon name="arrow-left" size={28} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.header}>Edit Profile</Text>
      <TouchableOpacity style={styles.photoButton}>
        <Text style={styles.photoButtonText}>Change Photo</Text>
      </TouchableOpacity>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Your Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="[display_name]"
          placeholderTextColor="#888"
        />
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="[email]"
          placeholderTextColor="#888"
        />
        <Text style={styles.label}>Your Age</Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          placeholder="[age]"
          placeholderTextColor="#888"
          keyboardType="numeric"
        />
        <Text style={styles.label}>Your Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="[userTitle]"
          placeholderTextColor="#888"
        />
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
      {/* Add your wave SVG or image at the bottom as needed */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181A20',
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 24,
    zIndex: 10,
  },
  header: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  photoButton: {
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 32,
    marginBottom: 32,
  },
  photoButtonText: {
    color: '#bbb',
    fontSize: 16,
  },
  inputGroup: {
    marginBottom: 32,
  },
  label: {
    color: '#bbb',
    fontSize: 14,
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#23262F',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#23262F',
  },
  saveButton: {
    backgroundColor: '#16C098',
    borderRadius: 32,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;