import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Bid {
  id: string;
  mechanicId: string;
  mechanicName: string;
  amount: number;
  estimatedTime: string;
  message: string;
  createdAt: string;
}

export interface Mechanic {
  _id: string;
  id?: string;
  fullName: string;
  location: string;
  profileImage?: string;
  rating: number;
  specialties: string[];
  reviews: {
    id: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
  }[];
}

interface Listing {
  id: string;
  ownerId: string;
  ownerName: string;
  vehicleLicensePlate: string;
  description: string;
  images: string[];
  location: string;
  status: 'open' | 'assigned' | 'completed';
  createdAt: string;
  bids: Bid[];
  selectedBidId?: string | null;
}

interface ListingsState {
  listings: Listing[];
  mechanics: Mechanic[];
  selectedListing: Listing | null;
  selectedMechanic: Mechanic | null;
  isLoading: boolean;
  error: string | null;
  industrialZones: string[];
  selectedZone: string | null;
}

const initialState: ListingsState = {
  listings: [],
  mechanics: [],
  selectedListing: null,
  selectedMechanic: null,
  isLoading: false,
  error: null,
  industrialZones: [
    'Ostim Sanayi Bölgesi',
    'İvedik Sanayi Bölgesi',
    'Sincan Sanayi Bölgesi',
    'Başkent Sanayi Bölgesi',
    'Anadolu Sanayi Bölgesi',
    'Çorum'
  ],
  selectedZone: null,
};

const listingsSlice = createSlice({
  name: 'listings',
  initialState,
  reducers: {
    fetchListingsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchListingsSuccess: (state, action: PayloadAction<Listing[]>) => {
      state.isLoading = false;
      state.listings = action.payload;
    },
    fetchListingsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    fetchMechanicsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchMechanicsSuccess: (state, action: PayloadAction<Mechanic[]>) => {
      state.isLoading = false;
      state.mechanics = action.payload;
    },
    fetchMechanicsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setSelectedListing: (state, action: PayloadAction<Listing | null>) => {
      state.selectedListing = action.payload;
    },
    setSelectedMechanic: (state, action: PayloadAction<Mechanic | null>) => {
      state.selectedMechanic = action.payload;
    },
    addNewListing: (state, action: PayloadAction<Listing>) => {
      state.listings.unshift(action.payload);
    },
    updateListing: (state, action: PayloadAction<Partial<Listing> & { id: string }>) => {
      const index = state.listings.findIndex(listing => listing.id === action.payload.id);
      if (index !== -1) {
        state.listings[index] = { ...state.listings[index], ...action.payload };
        if (state.selectedListing?.id === action.payload.id) {
          state.selectedListing = { ...state.selectedListing, ...action.payload };
        }
      }
    },
    addBidToListing: (state, action: PayloadAction<{ listingId: string; bid: Bid }>) => {
      const { listingId, bid } = action.payload;
      const listing = state.listings.find(l => l.id === listingId);
      if (listing) {
        listing.bids.push(bid);
        if (state.selectedListing?.id === listingId) {
          state.selectedListing.bids.push(bid);
        }
      }
    },
    selectBid: (state, action: PayloadAction<{ listingId: string; bidId: string }>) => {
      const { listingId, bidId } = action.payload;
      const listing = state.listings.find(l => l.id === listingId);
      if (listing) {
        listing.selectedBidId = bidId;
        listing.status = 'assigned';
        if (state.selectedListing?.id === listingId) {
          state.selectedListing.selectedBidId = bidId;
          state.selectedListing.status = 'assigned';
        }
      }
    },
    setSelectedZone: (state, action: PayloadAction<string | null>) => {
      state.selectedZone = action.payload;
    },
    updateListingStatus: (state, action: PayloadAction<{ listingId: string; status: 'open' | 'assigned' | 'completed' }>) => {
      const listing = state.listings.find(l => l.id === action.payload.listingId);
      if (listing) {
        listing.status = action.payload.status;
      }
    },
  },
});

export const {
  fetchListingsStart,
  fetchListingsSuccess,
  fetchListingsFailure,
  fetchMechanicsStart,
  fetchMechanicsSuccess,
  fetchMechanicsFailure,
  setSelectedListing,
  setSelectedMechanic,
  addNewListing,
  updateListing,
  addBidToListing,
  selectBid,
  setSelectedZone,
  updateListingStatus,
} = listingsSlice.actions;

export default listingsSlice.reducer;