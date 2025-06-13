import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Heart } from 'lucide-react-native';
import { router } from 'expo-router';
import { useThemeColors } from '@/constants/colors';
import { Organization } from '@/mocks/organizations';

interface OrganizationCardProps {
  organization: Organization;
  onPress?: () => void;
}

export default function OrganizationCard({ organization, onPress }: OrganizationCardProps) {
  const colors = useThemeColors();
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Navigate to organization details screen within tabs
      router.push(`/(tabs)/organization/${organization.id}`);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.logoContainer}>
        <Image
          source={{ uri: organization.logo }}
          style={styles.logo}
          contentFit="cover"
          transition={300}
        />
      </View>
      <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={2}>{organization.name}</Text>
      <TouchableOpacity 
        style={styles.donateButton}
        onPress={handlePress}
      >
        <Heart size={14} color={colors.white} />
        <Text style={styles.donateText}>Donate</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 120,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: '#2C2C2C',
  },
  logo: {
    width: 60,
    height: 60,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    height: 40,
  },
  donateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2ECC71',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    width: '100%',
  },
  donateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
});