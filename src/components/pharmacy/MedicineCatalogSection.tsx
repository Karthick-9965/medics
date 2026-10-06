import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { MedicineItem } from '../../constants/medicinesData';
import { MEDICINE_CATEGORIES } from '../../constants/appData';
import MedicineCard from './MedicineCard';

export interface MedicineCatalogSectionProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  filteredMedicines: MedicineItem[];
  cart: { [id: string]: number };
  cartItemsCount: number;
  totalAmount: string;
  onAddToCart: (id: string) => void;
  onRemoveFromCart: (id: string) => void;
  onProceedToCheckout: () => void;
}

/**
 * Reusable Medicine Catalog section with search, category filters, and bottom cart bar.
 */
export default function MedicineCatalogSection({
  searchQuery,
  onSearchChange,
  activeCategory,
  onSelectCategory,
  filteredMedicines,
  cart,
  cartItemsCount,
  totalAmount,
  onAddToCart,
  onRemoveFromCart,
  onProceedToCheckout,
}: MedicineCatalogSectionProps) {
  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={Colors.secondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search medicines, vitamins, tablets..."
          placeholderTextColor={Colors.secondary}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')}>
            <Ionicons name="close-circle" size={18} color={Colors.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Pills Header */}
      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {MEDICINE_CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, isSelected && styles.catChipSelected]}
                onPress={() => onSelectCategory(cat)}
                activeOpacity={0.7}
              >
                <Text style={[styles.catText, isSelected && styles.catTextSelected]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Medicine List */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.medList}
      >
        {filteredMedicines.length === 0 ? (
          <View style={styles.emptyCatalogContainer}>
            <Ionicons name="medical-outline" size={44} color={Colors.secondary} />
            <Text style={styles.emptyCatalogTitle}>No medicines found</Text>
            <Text style={styles.emptyCatalogSubtitle}>
              No items matched "{activeCategory !== 'All' ? activeCategory : searchQuery}".
            </Text>
            <TouchableOpacity
              style={styles.resetFilterBtn}
              onPress={() => {
                onSelectCategory('All');
                onSearchChange('');
              }}
            >
              <Text style={styles.resetFilterText}>Show All Medicines</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredMedicines.map((med) => (
            <MedicineCard
              key={med.id}
              medicine={med}
              quantity={cart[med.id] || 0}
              onAdd={() => onAddToCart(med.id)}
              onRemove={() => onRemoveFromCart(med.id)}
            />
          ))
        )}
      </ScrollView>

      {/* View Cart Sticky Bar */}
      {cartItemsCount > 0 && (
        <View style={styles.cartBar}>
          <View>
            <Text style={styles.cartBarItems}>{cartItemsCount} items added</Text>
            <Text style={styles.cartBarTotal}>₹{totalAmount}</Text>
          </View>
          <TouchableOpacity
            style={styles.viewCartBtn}
            onPress={onProceedToCheckout}
            activeOpacity={0.8}
          >
            <Text style={styles.viewCartText}>View Cart & Checkout</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.white} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgPage,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13.5,
    color: Colors.black,
  },
  categoriesWrapper: {
    marginVertical: 10,
  },
  categoriesRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.cardBgSecondary,
  },
  catChipSelected: {
    backgroundColor: Colors.primary,
  },
  catText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.textDark,
  },
  catTextSelected: {
    color: Colors.white,
    fontWeight: '700',
  },
  medList: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  emptyCatalogContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyCatalogTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.black,
    marginTop: 10,
  },
  emptyCatalogSubtitle: {
    fontSize: 13,
    color: Colors.secondary,
    textAlign: 'center',
    marginVertical: 6,
  },
  resetFilterBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginTop: 10,
  },
  resetFilterText: {
    color: Colors.white,
    fontSize: 12.5,
    fontWeight: '700',
  },
  cartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cartBarItems: {
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: '600',
  },
  cartBarTotal: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.primary,
  },
  viewCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  viewCartText: {
    color: Colors.white,
    fontSize: 13.5,
    fontWeight: '700',
  },
});
