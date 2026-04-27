import React, { useRef, useEffect, useCallback } from 'react';
import {
  View, Text, Image, TouchableOpacity, ScrollView,
  StyleSheet, Linking, Share, Platform,
} from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ViatorProduct,
  getPrimaryImageUrl,
  formatDuration,
  buildAffiliateUrl,
} from '../models/ViatorModels';
import { Config } from '../config';

interface Props {
  tour: ViatorProduct;
  onClose: () => void;
}

const SNAP_POINTS = ['48%', '92%'];

export default function TourDetailSheet({ tour, onClose }: Props) {
  const sheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    sheetRef.current?.snapToIndex(0);
  }, [tour.productCode]);

  const handleBook = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const url = tour.productUrl
      ? buildAffiliateUrl(tour.productUrl, Config.AFFILIATE_PARTNER_ID, Config.AFFILIATE_CAMPAIGN_ID)
      : null;
    if (url) {
      await WebBrowser.openBrowserAsync(url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        toolbarColor: '#C8102E',
      });
    }
  }, [tour]);

  const handleShare = useCallback(async () => {
    const url = tour.productUrl
      ? buildAffiliateUrl(tour.productUrl, Config.AFFILIATE_PARTNER_ID, Config.AFFILIATE_CAMPAIGN_ID)
      : tour.productUrl ?? '';
    await Share.share({
      title: tour.title,
      message: `Check out this Rome tour: ${tour.title}\n${url}`,
      url,
    });
  }, [tour]);

  const imageUrl = getPrimaryImageUrl(tour);
  const rating = tour.reviews?.combinedAverageRating;
  const totalReviews = tour.reviews?.totalReviews;
  const price = tour.pricing?.summary?.fromPrice;
  const hasFreeCancellation = tour.flags?.includes('FREE_CANCELLATION');
  const likelyToSellOut = tour.flags?.includes('LIKELY_TO_SELL_OUT');

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
      <BottomSheetScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>

        {/* Hero image */}
        <View style={styles.heroContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <Ionicons name="business" size={48} color="rgba(255,255,255,0.5)" />
            </View>
          )}

          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={20} color="#333" />
          </TouchableOpacity>

          {/* Share button */}
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Badges */}
          <View style={styles.badges}>
            {hasFreeCancellation && (
              <View style={[styles.badge, styles.badgeGreen]}>
                <Ionicons name="checkmark-circle" size={11} color="#16a34a" />
                <Text style={[styles.badgeText, { color: '#16a34a' }]}>Free cancel</Text>
              </View>
            )}
            {likelyToSellOut && (
              <View style={[styles.badge, styles.badgeOrange]}>
                <Ionicons name="flame" size={11} color="#ea580c" />
                <Text style={[styles.badgeText, { color: '#ea580c' }]}>Selling fast</Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text style={styles.title}>{tour.title}</Text>

          {/* Stats row */}
          <View style={styles.statsRow}>
            {rating != null && (
              <View style={styles.stat}>
                <Ionicons name="star" size={14} color="#f59e0b" />
                <Text style={styles.statText}>
                  {rating.toFixed(1)}
                  {totalReviews ? ` (${totalReviews.toLocaleString()})` : ''}
                </Text>
              </View>
            )}
            {tour.duration && (
              <View style={styles.stat}>
                <Ionicons name="time-outline" size={14} color="#888" />
                <Text style={[styles.statText, { color: '#888' }]}>{formatDuration(tour.duration)}</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* Price + Book */}
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.fromLabel}>From</Text>
              <View style={styles.priceInline}>
                <Text style={styles.price}>{price != null ? `$${Math.round(price)}` : 'See pricing'}</Text>
                {price != null && <Text style={styles.perPerson}> / person</Text>}
              </View>
            </View>
            <TouchableOpacity style={styles.bookBtn} onPress={handleBook}>
              <Text style={styles.bookBtnText}>Book Now</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Description */}
          {tour.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About this tour</Text>
              <Text style={styles.description}>{tour.description}</Text>
            </View>
          ) : null}

          {/* Categories */}
          {tour.categories && tour.categories.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <View style={styles.tags}>
                {tour.categories.map((c) =>
                  c.name ? (
                    <View key={c.id} style={styles.tag}>
                      <Text style={styles.tagText}>{c.name}</Text>
                    </View>
                  ) : null
                )}
              </View>
            </View>
          )}
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  handle: { backgroundColor: '#ccc', width: 40 },
  sheetBg: { backgroundColor: '#fff', borderRadius: 24 },

  heroContainer: { position: 'relative' },
  heroImage: { width: '100%', height: 220 },
  heroPlaceholder: {
    backgroundColor: '#fca5a5',
    alignItems: 'center', justifyContent: 'center',
  },

  closeBtn: {
    position: 'absolute', top: 12, left: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 }, elevation: 2,
  },
  shareBtn: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 }, elevation: 2,
  },

  content: { padding: 16, gap: 12 },

  badges: { flexDirection: 'row', gap: 8 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
  },
  badgeGreen: { backgroundColor: '#dcfce7' },
  badgeOrange: { backgroundColor: '#ffedd5' },
  badgeText: { fontSize: 11, fontWeight: '600' },

  title: { fontSize: 20, fontWeight: '700', color: '#111', lineHeight: 26 },

  statsRow: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 14, fontWeight: '500', color: '#333' },

  divider: { height: 1, backgroundColor: '#f0f0f0' },

  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fromLabel: { fontSize: 12, color: '#888' },
  priceInline: { flexDirection: 'row', alignItems: 'baseline' },
  price: { fontSize: 28, fontWeight: '800', color: '#111' },
  perPerson: { fontSize: 14, color: '#888' },

  bookBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#C8102E',
    paddingHorizontal: 20, paddingVertical: 13,
    borderRadius: 30,
    shadowColor: '#C8102E', shadowOpacity: 0.35, shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  bookBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  section: { gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  description: { fontSize: 14, color: '#555', lineHeight: 22 },

  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  tagText: { fontSize: 12, color: '#555', fontWeight: '500' },
});
