const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// Rota de saúde (health check)
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'auth-service' });
});

module.exports = router;