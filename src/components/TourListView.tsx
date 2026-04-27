import React, { useRef, useEffect } from 'react';
import {
  View, Text, Image, TouchableOpacity,
  StyleSheet, FlatList,
} from 'react-native';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ViatorProduct, getPrimaryImageUrl, formatDuration } from '../models/ViatorModels';

interface Props {
  tours: ViatorProduct[];
  visible: boolean;
  onClose: () => void;
  onSelect: (tour: ViatorProduct) => void;
}

const SNAP_POINTS = ['60%', '92%'];

export default function TourListView({ tours, visible, onClose, onSelect }: Props) {
  const sheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) sheetRef.current?.snapToIndex(0);
    else sheetRef.current?.close();
  }, [visible]);

  if (!visible) return null;

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      snapPoints={SNAP_POINTS}
      enablePanDownToClose
      onClose={onClose}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.sheetBg}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rome Tours ({tours.length})</Text>
        <TouchableOpacity onPress={onClose} style={styles.doneBtn}>
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </View>

      <BottomSheetFlatList
        data={tours}
        keyExtractor={(t) => t.productCode}
        renderItem={({ item }) => (
          <TourRow tour={item} onPress={() => onSelect(item)} />
        )}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: insets.bottom + 16, gap: 10 }}
        ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
      />
    </BottomSheet>
  );
}

function TourRow({ tour, onPress }: { tour: ViatorProduct; onPress: () => void }) {
  const imageUrl = getPrimaryImageUrl(tour);
  const rating = tour.reviews?.combinedAverageRating;
  const price = tour.pricing?.summary?.fromPrice;

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.thumb} resizeMode="cover" />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder]}>
          <Ionicons name="business" size={28} color="#ccc" />
        </View>
      )}

      <View style={styles.rowContent}>
        <Text style={styles.rowTitle} numberOfLines={2}>{tour.title}</Text>

        <View style={styles.rowStats}>
          {rating != null && (
            <View style={styles.rowStat}>
              <Ionicons name="star" size={11} color="#f59e0b" />
              <Text style={styles.rowStatText}>{rating.toFixed(1)}</Text>
            </View>
          )}
          {tour.duration && (
            <Text style={styles.rowDuration}>{formatDuration(tour.duration)}</Text>
          )}
        </View>

        <View style={styles.rowBottom}>
          {tour.flags?.includes('FREE_CANCELLATION') && (
            <Text style={styles.freeCancel}>Free cancel</Text>
          )}
          {tour.flags?.includes('LIKELY_TO_SELL_OUT') && (
            <Ionicons name="flame" size={13} color="#ea580c" />
          )}
          <View style={{ flex: 1 }} />
          {price != null && (
            <Text style={styles.rowPrice}>From ${Math.round(price)}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  handle: { backgroundColor: '#ccc', width: 40 },
  sheetBg: { backgroundColor: '#fff', borderRadius: 24 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111' },
  doneBtn: { paddingHorizontal: 4, paddingVertical: 4 },
  doneBtnText: { fontSize: 16, color: '#C8102E', fontWeight: '600' },

  row: {
    flexDirection: 'row', gap: 12,
    backgroundColor: '#f9f9f9', borderRadius: 14, padding: 10,
    marginBottom: 10,
  },
  thumb: { width: 80, height: 80, borderRadius: 10 },
  thumbPlaceholder: { backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' },

  rowContent: { flex: 1, gap: 4, justifyContent: 'space-between' },
  rowTitle: { fontSize: 14, fontWeight: '600', color: '#111', lineHeight: 19 },

  rowStats: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowStat: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  rowStatText: { fontSize: 12, fontWeight: '600', color: '#333' },
  rowDuration: { fontSize: 12, color: '#888' },

  rowBottom: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  freeCancel: { fontSize: 11, fontWeight: '600', color: '#16a34a' },
  rowPrice: { fontSize: 14, fontWeight: '700', color: '#C8102E' },
});
