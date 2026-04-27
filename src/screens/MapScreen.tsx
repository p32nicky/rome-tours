import React, { useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTours, FILTER_OPTIONS, TourFilter } from '../hooks/useTours';
import { ViatorProduct } from '../models/ViatorModels';
import { Config } from '../config';
import TourDetailSheet from '../components/TourDetailSheet';
import TourListView from '../components/TourListView';

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const [showList, setShowList] = React.useState(false);

  const {
    tours, loading, error,
    selectedTour, setSelectedTour,
    search, setSearch,
    filter, setFilter,
    refresh,
  } = useTours();

  const handlePinPress = useCallback(async (tour: ViatorProduct) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedTour(tour);
    if (tour.coordinate) {
      mapRef.current?.animateToRegion({
        ...tour.coordinate,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 400);
    }
  }, [setSelectedTour]);

  const handleFilterPress = useCallback(async (key: TourFilter) => {
    await Haptics.selectionAsync();
    setFilter(key);
  }, [setFilter]);

  return (
    <View style={styles.container}>
      {/* ── Map ── */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        initialRegion={Config.ROME_CENTER}
        showsUserLocation
        showsCompass
        showsScale
      >
        {tours.map((tour) => (
          tour.coordinate ? (
            <Marker
              key={tour.productCode}
              coordinate={tour.coordinate}
              onPress={() => handlePinPress(tour)}
            >
              <PricePin
                price={tour.pricing?.summary?.fromPrice}
                isSelected={selectedTour?.productCode === tour.productCode}
              />
            </Marker>
          ) : null
        ))}
      </MapView>

      {/* ── Top overlay ── */}
      <View style={[styles.topOverlay, { paddingTop: insets.top + 8 }]}>
        {/* Search row */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color="#888" style={{ marginRight: 6 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Rome tours…"
              placeholderTextColor="#888"
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={16} color="#888" />
              </TouchableOpacity>
            )}
          </View>

          {/* List / Map toggle */}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowList(true);
            }}
          >
            <Ionicons name="list" size={20} color="#333" />
          </TouchableOpacity>

          {/* Refresh */}
          <TouchableOpacity style={styles.iconBtn} onPress={refresh}>
            <Ionicons name="refresh" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {FILTER_OPTIONS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.chip, filter === f.key && styles.chipActive]}
              onPress={() => handleFilterPress(f.key)}
            >
              <Ionicons
                name={f.icon as any}
                size={12}
                color={filter === f.key ? '#fff' : '#333'}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.chipText, filter === f.key && styles.chipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Loading ── */}
      {loading && (
        <View style={styles.loadingBadge}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.loadingText}>Loading tours…</Text>
        </View>
      )}

      {/* ── Count badge ── */}
      {!loading && !selectedTour && tours.length > 0 && (
        <View style={[styles.countBadge, { bottom: insets.bottom + 32 }]}>
          <Text style={styles.countText}>{tours.length} tours in Rome</Text>
        </View>
      )}

      {/* ── Error ── */}
      {error && !loading && (
        <View style={[styles.errorBadge, { bottom: insets.bottom + 32 }]}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={refresh} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Detail sheet ── */}
      {selectedTour && (
        <TourDetailSheet
          tour={selectedTour}
          onClose={() => setSelectedTour(null)}
        />
      )}

      {/* ── List sheet ── */}
      <TourListView
        tours={tours}
        visible={showList}
        onClose={() => setShowList(false)}
        onSelect={(tour) => {
          setShowList(false);
          setTimeout(() => handlePinPress(tour), 350);
        }}
      />
    </View>
  );
}

// ── Price Pin ────────────────────────────────────────────────

function PricePin({ price, isSelected }: { price?: number; isSelected: boolean }) {
  return (
    <View style={styles.pinWrapper}>
      <View style={[styles.pinBubble, isSelected && styles.pinBubbleSelected]}>
        <Text style={[styles.pinText, isSelected && styles.pinTextSelected]}>
          {price != null ? `$${Math.round(price)}` : '📍'}
        </Text>
      </View>
      <View style={[styles.pinTail, isSelected && styles.pinTailSelected]} />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  topOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    gap: 8,
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },

  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111',
    padding: 0,
  },

  iconBtn: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  filters: {
    paddingHorizontal: 12,
    gap: 8,
    flexDirection: 'row',
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
    marginRight: 6,
  },
  chipActive: { backgroundColor: '#C8102E' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#333' },
  chipTextActive: { color: '#fff' },

  loadingBadge: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  loadingText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  countBadge: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  countText: { fontSize: 13, fontWeight: '600', color: '#333' },

  errorBadge: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    marginHorizontal: 24,
  },
  errorText: { color: '#333', fontSize: 13, textAlign: 'center' },
  retryBtn: { backgroundColor: '#C8102E', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 12 },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  // Pin
  pinWrapper: { alignItems: 'center' },
  pinBubble: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    borderWidth: 1.5,
    borderColor: '#ddd',
  },
  pinBubbleSelected: { backgroundColor: '#C8102E', borderColor: '#C8102E' },
  pinText: { fontSize: 11, fontWeight: '700', color: '#111' },
  pinTextSelected: { color: '#fff' },
  pinTail: {
    width: 0, height: 0,
    borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 7,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderTopColor: '#fff',
    marginTop: -1,
  },
  pinTailSelected: { borderTopColor: '#C8102E' },
});
