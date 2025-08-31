import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useWallet } from '../context/WalletContext';

interface DisruptionAlert {
  id: string;
  title: string;
  type: 'DELIVERY' | 'TRANSIT' | 'FLIGHT' | 'SERVICE' | 'WEATHER';
  probability: number;
  resolutionTime: number;
  yesPrice: number;
  noPrice: number;
  volume: number;
  participants: number;
}

const HomeScreen: React.FC = () => {
  const { isConnected, address, balance } = useWallet();
  const [alerts, setAlerts] = useState<DisruptionAlert[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const mockAlerts: DisruptionAlert[] = [
    {
      id: '1',
      title: 'DoorDash Delivery Delay - Downtown SF',
      type: 'DELIVERY',
      probability: 0.78,
      resolutionTime: 25,
      yesPrice: 0.78,
      noPrice: 0.22,
      volume: 1250,
      participants: 47,
    },
    {
      id: '2',
      title: 'NYC Subway L Train Delay',
      type: 'TRANSIT',
      probability: 0.82,
      resolutionTime: 12,
      yesPrice: 0.82,
      noPrice: 0.18,
      volume: 2100,
      participants: 89,
    },
    {
      id: '3',
      title: 'United Flight UA123 SFO→LAX',
      type: 'FLIGHT',
      probability: 0.65,
      resolutionTime: 35,
      yesPrice: 0.65,
      noPrice: 0.35,
      volume: 890,
      participants: 34,
    },
  ];

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setTimeout(() => {
      setAlerts(mockAlerts);
    }, 500);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAlerts();
    setRefreshing(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DELIVERY': return '🍕';
      case 'TRANSIT': return '🚇';
      case 'FLIGHT': return '✈️';
      case 'SERVICE': return '⚡';
      case 'WEATHER': return '🌧️';
      default: return '📊';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'DELIVERY': return '#FF6B6B';
      case 'TRANSIT': return '#4ECDC4';
      case 'FLIGHT': return '#45B7D1';
      case 'SERVICE': return '#96CEB4';
      case 'WEATHER': return '#FFEAA7';
      default: return '#DDA0DD';
    }
  };

  const handleQuickStake = (alert: DisruptionAlert, prediction: boolean) => {
    if (!isConnected) {
      Alert.alert('Wallet Required', 'Please connect your wallet to stake');
      return;
    }

    Alert.alert(
      'Quick Stake',
      `Stake on ${prediction ? 'YES' : 'NO'} for "${alert.title}"?\n\nPrice: $${prediction ? alert.yesPrice.toFixed(2) : alert.noPrice.toFixed(2)} per share`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Stake 0.01 ETH', 
          onPress: () => executeStake(alert, prediction, 0.01)
        },
      ]
    );
  };

  const executeStake = async (alert: DisruptionAlert, prediction: boolean, amount: number) => {
    try {
      Alert.alert('Success', `Staked ${amount} ETH on ${prediction ? 'YES' : 'NO'}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to execute stake');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>⚡ Snap_Stake</Text>
        <Text style={styles.subtitle}>Micro-Risk Markets</Text>
        
        {isConnected ? (
          <View style={styles.walletInfo}>
            <Text style={styles.address}>{address?.slice(0, 6)}...{address?.slice(-4)}</Text>
            <Text style={styles.balance}>{balance?.toFixed(4)} ETH</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.connectButton}>
            <Text style={styles.connectText}>Connect Wallet</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.alertsSection}>
        <Text style={styles.sectionTitle}>🚨 Live Disruption Alerts</Text>
        
        {alerts.map((alert) => (
          <View key={alert.id} style={[styles.alertCard, { borderLeftColor: getTypeColor(alert.type) }]}>
            <View style={styles.alertHeader}>
              <Text style={styles.alertIcon}>{getTypeIcon(alert.type)}</Text>
              <View style={styles.alertInfo}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertMeta}>
                  {alert.participants} traders • ${alert.volume} volume
                </Text>
              </View>
              <View style={styles.probabilityBadge}>
                <Text style={styles.probabilityText}>
                  {Math.round(alert.probability * 100)}%
                </Text>
              </View>
            </View>

            <View style={styles.marketInfo}>
              <Text style={styles.resolutionTime}>
                ⏰ Resolves in {alert.resolutionTime} min
              </Text>
            </View>

            <View style={styles.priceRow}>
              <TouchableOpacity
                style={[styles.priceButton, styles.yesButton]}
                onPress={() => handleQuickStake(alert, true)}
              >
                <Text style={styles.priceLabel}>YES</Text>
                <Text style={styles.priceValue}>${alert.yesPrice.toFixed(2)}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.priceButton, styles.noButton]}
                onPress={() => handleQuickStake(alert, false)}
              >
                <Text style={styles.priceLabel}>NO</Text>
                <Text style={styles.priceValue}>${alert.noPrice.toFixed(2)}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#667eea',
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },
  walletInfo: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  address: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  balance: {
    color: 'white',
    fontSize: 12,
    opacity: 0.8,
  },
  connectButton: {
    backgroundColor: '#2ed573',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  connectText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  alertsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2c3e50',
  },
  alertCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  alertInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  alertMeta: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  probabilityBadge: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  probabilityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  marketInfo: {
    marginBottom: 12,
  },
  resolutionTime: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  priceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  priceButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  yesButton: {
    backgroundColor: '#2ed573',
  },
  noButton: {
    backgroundColor: '#ff4757',
  },
  priceLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  priceValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
