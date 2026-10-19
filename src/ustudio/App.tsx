// @ts-nocheck -- ported as-is from the original AI Studio project
import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/views/HomeView';
import { ServicesView } from './components/views/ServicesView';
import { AgendaView } from './components/views/AgendaView';
import { ProfileView } from './components/views/ProfileView';
import { DashboardView } from './components/views/DashboardView';
import { PublicStorefront } from './components/storefront/PublicStorefront';

import { ClientModal } from './components/modals/ClientModal';
import { EditItemModal } from './components/modals/EditItemModal';
import { ProductModal } from './components/modals/ProductModal';
import { QuickActionModal } from './components/modals/QuickActionModal';
import { ManualBookingModal } from './components/modals/ManualBookingModal';
import { RescheduleModal } from './components/modals/RescheduleModal';
import { HoursConfigModal } from './components/modals/HoursConfigModal';
import { PaymentConfigModal } from './components/modals/PaymentConfigModal';
import { BookingConfigModal } from './components/modals/BookingConfigModal';
import { ProfileEditModal } from './components/modals/ProfileEditModal';
import { BannerFormModal } from './components/modals/BannerFormModal';
import { CongratulationsModal } from './components/modals/CongratulationsModal';
import { ProductReservationsView } from './components/views/ProductReservationsView';
import { CategoryManagerModal } from './components/modals/CategoryManagerModal';
import { AffiliateModal } from './components/modals/AffiliateModal';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, isStorefrontOpen, toastMessage } = useApp();

  if (isStorefrontOpen) {
    return (
      <div className="studio-theme">
        <PublicStorefront />
        <CongratulationsModal />
      </div>
    );
  }

  return (
    <div className="studio-theme min-h-screen bg-[#050505] text-[#fafafa] flex justify-center selection:bg-[#0284c7] selection:text-white">
      {/* Mobile Shell */}
      <div className="w-full max-w-[430px] min-h-screen bg-[#000000] border-x border-white/5 relative flex flex-col justify-between pb-4 shadow-2xl">
        <div>
          {/* Top Bar on primary tabs (hidden on profile, dashboard, and reservations) */}
          {activeTab !== 'dashboard' &&
            activeTab !== 'profile' &&
            activeTab !== 'product-reservations' &&
            activeTab !== 'crm' && <TopBar />}

          {/* Active View Container */}
          <main className="pt-2">
            {activeTab === 'home' && <HomeView />}
            {activeTab === 'services' && <ServicesView />}
            {activeTab === 'agenda' && <AgendaView />}
            {activeTab === 'profile' && <ProfileView />}
            {activeTab === 'dashboard' && <DashboardView />}
            {(activeTab === 'product-reservations' || activeTab === 'crm') && (
              <ProductReservationsView onBack={() => setActiveTab('home')} />
            )}
          </main>
        </div>

        {/* Bottom Floating Navigation (hide on full product reservations view) */}
        {activeTab !== 'product-reservations' && activeTab !== 'crm' && <BottomNav />}

        {/* Global Modals */}
        <ClientModal />
        <EditItemModal />
        <ProductModal />
        <QuickActionModal />
        <ManualBookingModal />
        <RescheduleModal />
        <HoursConfigModal />
        <PaymentConfigModal />
        <BookingConfigModal />
        <ProfileEditModal />
        <BannerFormModal />
        <CongratulationsModal />
        <CategoryManagerModal />
        <AffiliateModal />

        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-[#262626] border border-white/15 text-white text-xs font-semibold shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150 flex items-center gap-2 max-w-[90vw] truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
