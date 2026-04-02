const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// API Endpoints

// Get all candidates with vote counts
app.get('/api/candidates', async (req, res) => {
  try {
    const candidates = await prisma.candidate.findMany({
      include: {
        _count: {
          select: { votes: true }
        }
      }
    });
    const result = candidates.map(c => ({
      ...c,
      voteCount: c._count.votes
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch candidates', details: error.message });
  }
});

// Cast a vote
app.post('/api/vote', async (req, res) => {
  const { candidateId } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (!candidateId) {
    return res.status(400).json({ error: 'Candidate ID is required' });
  }

  try {
    const existingVote = await prisma.vote.findUnique({
      where: { voterIp: ip }
    });

    if (existingVote) {
      return res.status(403).json({ 
        error: 'Already voted', 
        message: 'You have already cast your vote from this device.' 
      });
    }

    const vote = await prisma.vote.create({
      data: {
        candidateId: parseInt(candidateId),
        voterIp: ip
      },
    });
    res.json({ message: 'Vote recorded successfully', vote });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(403).json({ error: 'Already voted', message: 'Duplicate vote detected.' });
    }
    res.status(500).json({ error: 'Failed to record vote', details: error.message });
  }
});

// Seed initial data
app.post('/api/seed', async (req, res) => {
  try {
    await prisma.vote.deleteMany({});
    await prisma.candidate.deleteMany({});

    const candidates = await prisma.candidate.createMany({
      data: [
        { name: 'TVK', photo: '/candidates/vijay_tvk.jpg', symbol: '/candidates/symbol_aiadmk.jpg' },
        { name: 'ADMK', photo: '/candidates/eps_admk.png', symbol: '/candidates/symbol_mdmk.png' },
        { name: 'DMK', photo: '/candidates/stalin_dmk.jpg', symbol: '/candidates/symbol_dmk.jpg' },
        { name: 'NTK', photo: '/candidates/seeman_ntk.jpg', symbol: '/candidates/symbol_ntk.png' },
      ]
    });
    res.json({ message: 'Seeded successfully with new symbols', candidates });
  } catch (error) {
    res.status(500).json({ error: 'Failed to seed data', details: error.message });
  }
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
