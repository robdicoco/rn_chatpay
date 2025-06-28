import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Heart, ExternalLink, Globe, Calendar, Users, MapPin } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '@/constants/colors';
import Button from '@/components/Button';
import { organizations } from '@/mocks/organizations';

const { width } = Dimensions.get('window');

export default function OrganizationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const colors = useThemeColors();
  
  // Find the organization by id
  const organization = organizations.find(org => org.id === id);
  
  if (!organization) {
    return (
      <View style={[styles.notFoundContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFoundText, { color: colors.textPrimary }]}>Organization not found</Text>
        <Button 
          title="Go Back" 
          onPress={() => router.back()} 
          variant="primary"
          style={styles.backButton}
        />
      </View>
    );
  }
  
  const handleDonate = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    router.push({
      pathname: '/donate',
      params: { organizationId: organization.id }
    });
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: organization.name,
          headerShown: true,
          headerBackTitle: "Back",
        }}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <Image
            source={{ uri: organization.logo }}
            style={styles.coverImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.gradient}
          />
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: organization.logo }}
              style={styles.logo}
              contentFit="cover"
            />
          </View>
        </View>
        
        <View style={styles.contentContainer}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{organization.name}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {organization.category.charAt(0).toUpperCase() + organization.category.slice(1)}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.description, { color: colors.textPrimary }]}>{organization.description}</Text>
          
          <View style={[styles.videoContainer, { backgroundColor: colors.textSecondary }]}>
            <View style={styles.videoPlaceholder}>
              <ExternalLink size={40} color={colors.white} />
              <Text style={styles.videoPlaceholderText}>Watch our impact video</Text>
            </View>
          </View>
          
          <View style={styles.infoSection}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>About Us</Text>
            <Text style={[styles.infoText, { color: colors.textPrimary }]}>
              {organization.name} is a non-profit organization dedicated to making a positive impact in the world. 
              We work tirelessly to address critical issues and provide support to those in need.
            </Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Globe size={24} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>Global</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Reach</Text>
              </View>
              
              <View style={styles.statItem}>
                <Calendar size={24} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>10+ Years</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Experience</Text>
              </View>
              
              <View style={styles.statItem}>
                <Users size={24} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>1M+</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>People Helped</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.infoSection}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Our Mission</Text>
            <Text style={[styles.infoText, { color: colors.textPrimary }]}>
              Our mission is to create sustainable solutions to the world's most pressing challenges. 
              Through innovative programs and partnerships, we strive to make a lasting difference in communities around the globe.
            </Text>
          </View>
          
          <View style={styles.infoSection}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Where We Work</Text>
            <View style={styles.locationItem}>
              <MapPin size={20} color={colors.primary} style={styles.locationIcon} />
              <Text style={[styles.locationText, { color: colors.textPrimary }]}>Africa, Asia, Latin America, and beyond</Text>
            </View>
          </View>
          
          <View style={styles.impactSection}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.impactGradient}
            >
              <View style={[styles.impactContent, { backgroundColor: colors.card }]}>
                <Text style={[styles.impactTitle, { color: colors.textPrimary }]}>Your Impact</Text>
                <Text style={[styles.impactText, { color: colors.textPrimary }]}>
                  Every donation helps us reach more people in need. Join us in making a difference today.
                </Text>
                
                <View style={styles.impactItems}>
                  <View style={[styles.impactItem, { backgroundColor: 'rgba(46, 204, 113, 0.1)' }]}>
                    <Text style={styles.impactItemValue}>$10</Text>
                    <Text style={[styles.impactItemDescription, { color: colors.textPrimary }]}>Provides clean water for a family for a month</Text>
                  </View>
                  
                  <View style={[styles.impactItem, { backgroundColor: 'rgba(46, 204, 113, 0.1)' }]}>
                    <Text style={styles.impactItemValue}>$50</Text>
                    <Text style={[styles.impactItemDescription, { color: colors.textPrimary }]}>Supplies educational materials for 10 children</Text>
                  </View>
                  
                  <View style={[styles.impactItem, { backgroundColor: 'rgba(46, 204, 113, 0.1)' }]}>
                    <Text style={styles.impactItemValue}>$100</Text>
                    <Text style={[styles.impactItemDescription, { color: colors.textPrimary }]}>Funds emergency medical care for a community</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
          
          <Button
            title="Donate Now"
            onPress={handleDonate}
            gradient
            size="large"
            style={styles.donateButton}
            isLoading={isLoading}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 18,
    marginBottom: 20,
  },
  backButton: {
    width: 200,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  headerContainer: {
    height: 200,
    width: '100%',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
  },
  logoContainer: {
    position: 'absolute',
    bottom: -40,
    left: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 37,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 50,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: '#2ECC71',
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 24,
  },
  videoContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  videoPlaceholderText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationIcon: {
    marginRight: 8,
  },
  locationText: {
    fontSize: 16,
    flex: 1,
  },
  impactSection: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  impactGradient: {
    padding: 1,
  },
  impactContent: {
    borderRadius: 15,
    padding: 16,
  },
  impactTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  impactText: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 24,
  },
  impactItems: {
    gap: 12,
  },
  impactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
  },
  impactItemValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2ECC71',
    width: 60,
  },
  impactItemDescription: {
    fontSize: 14,
    flex: 1,
  },
  donateButton: {
    width: '100%',
    marginTop: 16,
  },
});