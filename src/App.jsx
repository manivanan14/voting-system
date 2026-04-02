import React, { useState, useEffect } from 'react';
import './index.css';
import CandidateTable from './components/CandidateTable';

function App() {
  const [candidates, setCandidates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch candidates from the backend
  useEffect(() => {
    fetchCandidates();
  }, []);

  const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.31.30:5001';

  const fetchCandidates = async () => {
    try {
      const response = await fetch(`${API_URL}/api/candidates`);
      const data = await response.json();
      setCandidates(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
      setIsLoading(false);
      // Fallback to empty or error state if backend is not yet synced
    }
  };

  const handleVote = async (candidate) => {
    try {
      const response = await fetch(`${API_URL}/api/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId: candidate.id }),
      });

      if (response.ok) {
        setSelectedCandidate(candidate);
        setShowModal(true);
        fetchCandidates();
      } else if (response.status === 403) {
        const errorData = await response.json();
        alert(errorData.message || 'You have already voted!');
      } else {
        alert('Failed to cast vote. Please try again later.');
      }
    } catch (error) {
      console.error('Failed to cast vote:', error);
      alert('Failed to connect to backend. Please ensure the server is running.');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCandidate(null);
  };

  const shareOnWhatsApp = () => {
    const shareUrl = window.location.origin === 'http://localhost:5173' ? 'http://192.168.31.30:5173' : window.location.href;
    const text = encodeURIComponent(`வாக்களிப்பது உங்கள் உரிமை! நான் ${selectedCandidate?.name}-க்கு வாக்களித்துள்ளேன். இந்த இணைப்பைப் பயன்படுத்தி உங்கள் வாக்கை பதிவு செய்யுங்கள்: ${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="App">
      <header>
        <h1>உங்கல் ஓட்டு  உங்கல் உரிமை </h1>
        <p className="subtitle">
          உங்கள் குரலுக்கு மதிப்பு உண்டு. பாதுகாப்பாக வாக்களித்து, ஒரு தாக்கத்தை ஏற்படுத்துங்கள்.        </p>
        <button className="copy-link-btn" onClick={copyLink}>
          லிங்க்கை நகலெடு (Copy Link) 🔗
        </button>
      </header>

      {isLoading ? (
        <div style={{ color: '#64748b', fontSize: '1.2rem', marginTop: '4rem' }}>
          Loading candidates...
        </div>
      ) : candidates.length > 0 ? (
        <CandidateTable
          candidates={candidates}
          onVote={handleVote}
        />
      ) : (
        <div style={{ padding: '4rem', color: '#64748b' }}>
          <p>No candidates found. Please ensure the database is seeded.</p>
          <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
            Hint: Run <code>http://192.168.31.30:5001/api/seed</code> to add initial data.
          </p>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-icon">✅</div>
            <div className="modal-title">Voted Successfully</div>
            <div className="modal-message">
              You have successfully cast your vote for <strong>{selectedCandidate?.name}</strong>.
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="share-btn-wa" onClick={shareOnWhatsApp}>
                WhatsApp-இல் பகிரவும் 📱
              </button>
              <button className="close-btn" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
