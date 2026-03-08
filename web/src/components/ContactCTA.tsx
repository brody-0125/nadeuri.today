'use client';

import { useState } from 'react';
import ContactModal from './ContactModal';

export default function ContactCTA() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const gasUrl = process.env.NEXT_PUBLIC_GAS_URL;
  if (!gasUrl) return null;

  return (
    <>
      {!isModalOpen && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center gap-2 bg-status-operating text-white font-semibold transition-opacity hover:opacity-90"
          style={{
            minHeight: '56px',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}
          aria-label="문의하기"
        >
          <span className="material-symbols-outlined text-xl" aria-hidden="true">
            mail
          </span>
          <span>문의하기</span>
        </button>
      )}

      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
