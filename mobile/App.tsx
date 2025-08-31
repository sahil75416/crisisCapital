import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import MarketsScreen from './src/screens/MarketsScreen';
import TradeScreen from './src/screens/TradeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { WalletProvider } from './src/context/WalletContext';

const Tab = createBottomTabNavigator();

// Configure chains and providers
const { chains, publicClient } = configureChains(
  [baseSepolia, base],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'Snap_Stake',
  projectId: 'snap-stake-micro-risk-markets',
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
});

export default function App() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <WalletProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <Tab.Navigator
              screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                  let iconName: keyof typeof Ionicons.glyphMap;

                  if (route.name === 'Home') {
                    iconName = focused ? 'home' : 'home-outline';
                  } else if (route.name === 'Markets') {
                    iconName = focused ? 'trending-up' : 'trending-up-outline';
                  } else if (route.name === 'Trade') {
                    iconName = focused ? 'flash' : 'flash-outline';
                  } else if (route.name === 'Profile') {
                    iconName = focused ? 'person' : 'person-outline';
                  } else {
                    iconName = 'help-outline';
                  }

                  return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: 'gray',
                headerStyle: {
                  backgroundColor: '#1a1a1a',
                },
                headerTintColor: '#fff',
                tabBarStyle: {
                  backgroundColor: '#1a1a1a',
                  borderTopColor: '#333',
                },
              })}
            >
              <Tab.Screen 
                name="Home" 
                component={HomeScreen}
                options={{ title: 'Snap_Stake' }}
              />
              <Tab.Screen 
                name="Markets" 
                component={MarketsScreen}
                options={{ title: 'Micro Markets' }}
              />
              <Tab.Screen 
                name="Trade" 
                component={TradeScreen}
                options={{ title: 'Quick Trade' }}
              />
              <Tab.Screen 
                name="Profile" 
                component={ProfileScreen}
                options={{ title: 'Profile' }}
              />
            </Tab.Navigator>
          </NavigationContainer>
        </WalletProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
