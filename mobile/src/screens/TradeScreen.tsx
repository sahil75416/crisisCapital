import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { useWallet } from '../context/WalletContext';

const TradeScreen: React.FC = () => {
  const { isConnected, balance } = useWallet();
  const [selectedMarket, setSelectedMarket] = useState<any>(null);
  const [prediction, setPrediction] = useState<boolean | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [isTrading, setIsTrading] = useState(false);

  const mockMarket = {
    id: '1',
    title: 'DoorDash Delivery Delay - Downtown SF',
    type: 'DELIVERY',
    probability: 0.78,
    yesPrice: 0.78,
    noPrice: 0.22,
    volume: 1250,
    participants: 47,
    resolutionTime: 25,
  };

  const calculatePayout = () => {
    if (!amount || !prediction) return 0;
    const stake = parseFloat(amount);
    const price = prediction ? mockMarket.yesPrice : mockMarket.noPrice;
    return stake / price;
  };

  const executeTrade = async () => {
    if (!isConnected) {
      Alert.alert('Wallet Required', 'Please connect your wallet to trade');
      return;
    }

    if (!prediction || !amount) {
      Alert.alert('Invalid Trade', 'Please select prediction and enter amount');
      return;
    }

    const stake = parseFloat(amount);
    if (stake <= 0 || stake > (balance || 0)) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount within your balance');
      return;
    }

    setIsTrading(true);
    
    try {
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Trade Executed!',
        `Successfully staked ${amount} ETH on ${prediction ? 'YES' : 'NO'}\n\nPotential payout: ${calculatePayout().toFixed(4)} shares`,
        [{ text: 'OK', onPress: () => resetForm() }]
      );
    } catch (error) {
      Alert.alert('Trade Failed', 'Please try again');
    } finally {
      setIsTrading(false);
    }
  };

  const resetForm = () => {
    setPrediction(null);
    setAmount('');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⚡ Trade</Text>
      </View>

      <View style={styles.marketCard}>
        <Text style={styles.marketIcon}>🍕</Text>
        <Text style={styles.marketTitle}>{mockMarket.title}</Text>
        <Text style={styles.marketMeta}>
          {mockMarket.participants} traders • ${mockMarket.volume} volume
        </Text>
        <Text style={styles.resolutionTime}>
          ⏰ Resolves in {mockMarket.resolutionTime} min
        </Text>
      </View>

      <View style={styles.predictionSection}>
        <Text style={styles.sectionTitle}>Select Prediction</Text>
        <View style={styles.predictionButtons}>
          <TouchableOpacity
            style={[
              styles.predictionButton,
              styles.yesButton,
              prediction === true && styles.selectedPrediction
            ]}
            onPress={() => setPrediction(true)}
          >
            <Text style={styles.predictionLabel}>YES</Text>
            <Text style={styles.predictionSubtext}>Delay will occur</Text>
            <Text style={styles.predictionPrice}>${mockMarket.yesPrice.toFixed(2)}</Text>
            <Text style={styles.predictionOdds}>
              {Math.round(mockMarket.probability * 100)}% chance
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.predictionButton,
              styles.noButton,
              prediction === false && styles.selectedPrediction
            ]}
            onPress={() => setPrediction(false)}
          >
            <Text style={styles.predictionLabel}>NO</Text>
            <Text style={styles.predictionSubtext}>On-time delivery</Text>
            <Text style={styles.predictionPrice}>${mockMarket.noPrice.toFixed(2)}</Text>
            <Text style={styles.predictionOdds}>
              {Math.round((1 - mockMarket.probability) * 100)}% chance
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.amountSection}>
        <Text style={styles.sectionTitle}>Stake Amount</Text>
        <TextInput
          style={styles.amountInput}
          placeholder="0.01"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <Text style={styles.balanceText}>
          Balance: {balance?.toFixed(4) || '0.0000'} ETH
        </Text>
        
        <View style={styles.quickAmounts}>
          {['0.01', '0.05', '0.1'].map((quickAmount) => (
            <TouchableOpacity
              key={quickAmount}
              style={styles.quickAmountButton}
              onPress={() => setAmount(quickAmount)}
            >
              <Text style={styles.quickAmountText}>{quickAmount} ETH</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {amount && prediction !== null && (
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Trade Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Prediction:</Text>
              <Text style={styles.summaryValue}>
                {prediction ? 'YES' : 'NO'} - Delay will {prediction ? 'occur' : 'not occur'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Stake:</Text>
              <Text style={styles.summaryValue}>{amount} ETH</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Price per share:</Text>
              <Text style={styles.summaryValue}>
                ${prediction ? mockMarket.yesPrice.toFixed(2) : mockMarket.noPrice.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Potential payout:</Text>
              <Text style={[styles.summaryValue, styles.payoutValue]}>
                {calculatePayout().toFixed(4)} shares
              </Text>
            </View>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.executeButton,
          (!isConnected || !prediction || !amount || isTrading) && styles.disabledButton
        ]}
        onPress={executeTrade}
        disabled={!isConnected || !prediction || !amount || isTrading}
      >
        <Text style={styles.executeButtonText}>
          {isTrading ? 'Processing...' : 
           !isConnected ? 'Connect Wallet' :
           !prediction || !amount ? 'Select Prediction & Amount' :
           'Execute Trade'}
        </Text>
      </TouchableOpacity>
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
    backgroundColor: 'white',
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  marketCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  marketIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  marketTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  marketMeta: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  resolutionTime: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '500',
  },
  predictionSection: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  predictionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  predictionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  yesButton: {
    backgroundColor: '#2ed573',
  },
  noButton: {
    backgroundColor: '#ff4757',
  },
  selectedPrediction: {
    borderColor: '#2c3e50',
    borderWidth: 3,
  },
  predictionLabel: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  predictionSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginBottom: 8,
  },
  predictionPrice: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  predictionOdds: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
  },
  amountSection: {
    margin: 20,
  },
  amountInput: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
  },
  balanceText: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontSize: 14,
    marginBottom: 16,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: 8,
  },
  quickAmountButton: {
    flex: 1,
    backgroundColor: '#f1f2f6',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickAmountText: {
    color: '#2c3e50',
    fontSize: 14,
    fontWeight: '500',
  },
  summarySection: {
    margin: 20,
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#7f8c8d',
    fontSize: 14,
  },
  summaryValue: {
    color: '#2c3e50',
    fontSize: 14,
    fontWeight: '500',
  },
  payoutValue: {
    color: '#2ed573',
    fontWeight: 'bold',
  },
  executeButton: {
    backgroundColor: '#667eea',
    margin: 20,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  executeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TradeScreen;
