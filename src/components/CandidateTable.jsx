import React from 'react';

const CandidateTable = ({ candidates, onVote }) => {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Candidate Name</th>
            <th>Photo</th>
            <th>Symbol</th>
            <th>Votes</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate, index) => (
            <tr key={candidate.id}>
              <td>{index + 1}</td>
              <td style={{ fontWeight: 600, fontSize: '1.1rem' }}>{candidate.name}</td>
              <td>
                <img 
                  src={candidate.photo} 
                  alt={candidate.name} 
                  className="candidate-photo" 
                />
              </td>
              <td>
                <img 
                  src={candidate.symbol} 
                  alt={`${candidate.name} symbol`} 
                  className="candidate-symbol" 
                />
              </td>
              <td>
                <div className="vote-badge">
                  {candidate.voteCount}
                </div>
              </td>
              <td>
                <button 
                  className="vote-btn" 
                  onClick={() => onVote(candidate)}
                >
                  Vote
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CandidateTable;
