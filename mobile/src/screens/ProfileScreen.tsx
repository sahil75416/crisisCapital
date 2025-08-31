import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useWallet } from '../context/WalletContext';

interface Position {
  id: string;
  marketTitle: string;
  prediction: boolean;
  amount: number;
  shares: number;
  currentValue: number;
  status: 'ACTIVE' | 'WON' | 'LOST';
}

interface Transaction {
  id: string;
  type: 'BUY' | 'SELL' | 'PAYOUT';
  marketTitle: string;
  amount: number;
  timestamp: string;
}

const ProfileScreen: React.FC = () => {
  const { isConnected, address, balance, connectWallet, disconnectWallet } = useWallet();
  const [positions, setPositions] = useState<Position[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'positions' | 'history'>('positions');

  const mockPositions: Position[] = [
    {
      id: '1',
      marketTitle: 'DoorDash Delivery Delay - Downtown SF',
      prediction: true,
      amount: 0.05,
      shares: 0.064,
      currentValue: 0.052,
      status: 'ACTIVE',
    },
    {
      id: '2',
      marketTitle: 'NYC Subway L Train Delay',
      prediction: false,
      amount: 0.02,
      shares: 0.111,
      currentValue: 0.018,
      status: 'ACTIVE',
    },
    {
      id: '3',
      marketTitle: 'Amazon Prime Delivery - Seattle',
      prediction: true,
      amount: 0.01,
      shares: 0.022,
      currentValue: 0.022,
      status: 'WON',
    },
  ];

  const mockTransactions: Transaction[] = [
    {
      id: '1',
      type: 'BUY',
      marketTitle: 'DoorDash Delivery Delay - Downtown SF',
      amount: 0.05,
      timestamp: '2024-01-15T18:30:00Z',
    },
    {
      id: '2',
      type: 'BUY',
      marketTitle: 'NYC Subway L Train Delay',
      amount: 0.02,
      timestamp: '2024-01-15T17:45:00Z',
    },
    {
      id: '3',
      type: 'PAYOUT',
      marketTitle: 'Amazon Prime Delivery - Seattle',
      amount: 0.022,
      timestamp: '2024-01-15T16:20:00Z',
    },
  ];

  useEffect(() => {
    if (isConnected) {
      setPositions(mockPositions);
      setTransactions(mockTransactions);
    }
  }, [isConnected]);

  const getTotalValue = () => {
    return positions.reduce((total, position) => total + position.currentValue, 0);
  };

  const getTotalPnL = () => {
    const invested = positions.reduce((total, position) => total + position.amount, 0);
    const current = getTotalValue();
    return current - invested;
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect your wallet?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Disconnect', onPress: disconnectWallet, style: 'destructive' },
      ]
    );
  };

  if (!isConnected) {
    return (
      <View style={styles.container}>
        <View style={styles.connectContainer}>
          <Text style={styles.connectTitle}>👤 Profile</Text>
          <Text style={styles.connectSubtitle}>Connect your wallet to view your profile</Text>
          <TouchableOpacity style={styles.connectButton} onPress={connectWallet}>
            <Text style={styles.connectButtonText}>Connect Wallet</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>👤 Profile</Text>
        
        <View style={styles.walletCard}>
          <View style={styles.walletInfo}>
            <Text style={styles.addressText}>
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </Text>
            <Text style={styles.balanceText}>
              {balance?.toFixed(4)} ETH
            </Text>
          </View>
          <TouchableOpacity style={styles.disconnectButton} onPress={handleDisconnect}>
            <Text style={styles.disconnectText}>Disconnect</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{positions.length}</Text>
            <Text style={styles.statLabel}>Active Positions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{getTotalValue().toFixed(4)} ETH</Text>
            <Text style={styles.statLabel}>Portfolio Value</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[
              styles.statValue,
              getTotalPnL() >= 0 ? styles.profitText : styles.lossText
            ]}>
              {getTotalPnL() >= 0 ? '+' : ''}{getTotalPnL().toFixed(4)} ETH
            </Text>
            <Text style={styles.statLabel}>P&L</Text>
          </View>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'positions' && styles.activeTab]}
          onPress={() => setActiveTab('positions')}
        >
          <Text style={[styles.tabText, activeTab === 'positions' && styles.activeTabText]}>
            Positions
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'positions' ? (
        <View style={styles.content}>
          {positions.map((position) => (
            <View key={position.id} style={styles.positionCard}>
              <Text style={styles.positionTitle}>{position.marketTitle}</Text>
              <View style={styles.positionDetails}>
                <View style={styles.positionRow}>
                  <Text style={styles.positionLabel}>Prediction:</Text>
                  <Text style={[
                    styles.positionValue,
                    position.prediction ? styles.yesText : styles.noText
                  ]}>
                    {position.prediction ? 'YES' : 'NO'}
                  </Text>
                </View>
                <View style={styles.positionRow}>
                  <Text style={styles.positionLabel}>Invested:</Text>
                  <Text style={styles.positionValue}>{position.amount.toFixed(4)} ETH</Text>
                </View>
                <View style={styles.positionRow}>
                  <Text style={styles.positionLabel}>Shares:</Text>
                  <Text style={styles.positionValue}>{position.shares.toFixed(4)}</Text>
                </View>
                <View style={styles.positionRow}>
                  <Text style={styles.positionLabel}>Current Value:</Text>
                  <Text style={[
                    styles.positionValue,
                    position.currentValue >= position.amount ? styles.profitText : styles.lossText
                  ]}>
                    {position.currentValue.toFixed(4)} ETH
                  </Text>
                </View>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: position.status === 'ACTIVE' ? '#667eea' : 
                                   position.status === 'WON' ? '#2ed573' : '#ff4757' }
              ]}>
                <Text style={styles.statusText}>{position.status}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.content}>
          {transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionHeader}>
                <Text style={[
                  styles.transactionType,
                  { color: transaction.type === 'BUY' ? '#ff4757' : 
                           transaction.type === 'SELL' ? '#ffa502' : '#2ed573' }
                ]}>
                  {transaction.type}
                </Text>
                <Text style={styles.transactionAmount}>
                  {transaction.type === 'PAYOUT' ? '+' : '-'}{transaction.amount.toFixed(4)} ETH
                </Text>
              </View>
              <Text style={styles.transactionTitle}>{transaction.marketTitle}</Text>
              <Text style={styles.transactionTime}>
                {new Date(transaction.timestamp).toLocaleDateString()} {new Date(transaction.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  connectContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  connectTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  connectSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 32,
  },
  connectButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  connectButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  walletCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  walletInfo: {
    flex: 1,
  },
  addressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  balanceText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  disconnectButton: {
    backgroundColor: '#ff4757',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disconnectText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  profitText: {
    color: '#2ed573',
  },
  lossText: {
    color: '#ff4757',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#667eea',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  activeTabText: {
    color: 'white',
  },
  content: {
    padding: 20,
  },
  positionCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  positionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  positionDetails: {
    marginBottom: 12,
  },
  positionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  positionLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  positionValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  yesText: {
    color: '#2ed573',
  },
  noText: {
    color: '#ff4757',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  transactionCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  transactionTitle: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 4,
  },
  transactionTime: {
    fontSize: 12,
    color: '#7f8c8d',
  },
});

export default ProfileScreen;
