import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';

interface Market {
  id: string;
  title: string;
  type: 'DELIVERY' | 'TRANSIT' | 'FLIGHT' | 'SERVICE' | 'WEATHER';
  probability: number;
  yesPrice: number;
  noPrice: number;
  volume: number;
  participants: number;
  resolutionTime: number;
  status: 'ACTIVE' | 'RESOLVED' | 'CANCELLED';
}

const MarketsScreen: React.FC = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const mockMarkets: Market[] = [
    {
      id: '1',
      title: 'DoorDash Delivery Delay - Downtown SF',
      type: 'DELIVERY',
      probability: 0.78,
      yesPrice: 0.78,
      noPrice: 0.22,
      volume: 1250,
      participants: 47,
      resolutionTime: 25,
      status: 'ACTIVE',
    },
    {
      id: '2',
      title: 'NYC Subway L Train Delay',
      type: 'TRANSIT',
      probability: 0.82,
      yesPrice: 0.82,
      noPrice: 0.18,
      volume: 2100,
      participants: 89,
      resolutionTime: 12,
      status: 'ACTIVE',
    },
    {
      id: '3',
      title: 'Amazon Prime Delivery - Seattle',
      type: 'DELIVERY',
      probability: 0.45,
      yesPrice: 0.45,
      noPrice: 0.55,
      volume: 890,
      participants: 34,
      resolutionTime: 0,
      status: 'RESOLVED',
    },
  ];

  useEffect(() => {
    setMarkets(mockMarkets);
  }, []);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#2ed573';
      case 'RESOLVED': return '#3742fa';
      case 'CANCELLED': return '#ff4757';
      default: return '#7f8c8d';
    }
  };

  const filteredMarkets = markets.filter(market => {
    const matchesFilter = filter === 'ALL' || market.type === filter || market.status === filter;
    const matchesSearch = market.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Markets</Text>
        
        <TextInput
          style={styles.searchInput}
          placeholder="Search markets..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {['ALL', 'ACTIVE', 'RESOLVED', 'DELIVERY', 'TRANSIT', 'FLIGHT'].map((filterOption) => (
            <TouchableOpacity
              key={filterOption}
              style={[
                styles.filterButton,
                filter === filterOption && styles.activeFilter
              ]}
              onPress={() => setFilter(filterOption)}
            >
              <Text style={[
                styles.filterText,
                filter === filterOption && styles.activeFilterText
              ]}>
                {filterOption}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.marketsList}>
        {filteredMarkets.map((market) => (
          <View key={market.id} style={styles.marketCard}>
            <View style={styles.marketHeader}>
              <Text style={styles.marketIcon}>{getTypeIcon(market.type)}</Text>
              <View style={styles.marketInfo}>
                <Text style={styles.marketTitle}>{market.title}</Text>
                <Text style={styles.marketMeta}>
                  {market.participants} traders • ${market.volume} volume
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(market.status) }]}>
                <Text style={styles.statusText}>{market.status}</Text>
              </View>
            </View>

            {market.status === 'ACTIVE' && (
              <View style={styles.resolutionInfo}>
                <Text style={styles.resolutionText}>
                  ⏰ Resolves in {market.resolutionTime} min
                </Text>
                <Text style={styles.probabilityText}>
                  {Math.round(market.probability * 100)}% chance
                </Text>
              </View>
            )}

            <View style={styles.priceRow}>
              <View style={styles.priceCard}>
                <Text style={styles.priceLabel}>YES</Text>
                <Text style={styles.priceValue}>${market.yesPrice.toFixed(2)}</Text>
              </View>
              <View style={styles.priceCard}>
                <Text style={styles.priceLabel}>NO</Text>
                <Text style={styles.priceValue}>${market.noPrice.toFixed(2)}</Text>
              </View>
            </View>

            {market.status === 'ACTIVE' && (
              <TouchableOpacity style={styles.tradeButton}>
                <Text style={styles.tradeButtonText}>Trade</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
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
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#f1f2f6',
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterButton: {
    backgroundColor: '#f1f2f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: '#667eea',
  },
  filterText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  activeFilterText: {
    color: 'white',
  },
  marketsList: {
    flex: 1,
    padding: 20,
  },
  marketCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  marketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  marketIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  marketInfo: {
    flex: 1,
  },
  marketTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  marketMeta: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  resolutionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resolutionText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  probabilityText: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  priceCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '600',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  tradeButton: {
    backgroundColor: '#667eea',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  tradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MarketsScreen;
