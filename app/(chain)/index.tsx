import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';

import { useConfigStore } from '@/store/config-store';
import Button from '@/components/Button';
import { useThemeColors } from '@/constants/colors';


const BLOCKCHAINS = ['XION', 'STELLAR', 'TON', 'STARKNET'] as const;

export default function ConfigScreen() {
  const { blockchain, setBlockchain } = useConfigStore();
  const colors = useThemeColors();

  return (
    <View  style={[styles.container,{paddingVertical: 16}, { backgroundColor: colors.background }]}>     
      <Text style={[styles.title, { color: colors.textPrimary }]}>Select Blockchain</Text>
      <View style={{paddingVertical: 16}}>
        {BLOCKCHAINS.map((chain) => (
          <View key={chain} style={{paddingVertical: 16, paddingHorizontal: 16}}>
            <Button
              size='large'
              onPress={() => setBlockchain(chain)}
              className={`p-4 mb-2 rounded-lg ${chain === blockchain 
                  ? 'bg-primary' 
                  : 'bg-muted'}`}
              title={chain}
            >
              <Text className={`text-lg ${chain === blockchain 
                  ? 'text-primary-foreground' 
                  : 'text-foreground'}`}>
                {chain}
              </Text>
            </Button>
          </View>
        ))}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,    
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  contentContainer: {
    paddingHorizontal: 24,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
  },
  featureContainer: {
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureIcon: {
    marginRight: 16,
  },
  featureIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconText: {
    fontSize: 20,
  },
  featureText: {
    fontSize: 16,
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 50 : 30,
  },
 
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
    elevation: 2,
  },
  text: {
    fontSize: 20,
    fontWeight: '500',
  },
  icon: {
  width: 40,
  height: 40,
  marginRight: 16
    }
})

