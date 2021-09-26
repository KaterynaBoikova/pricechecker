const express = require('express');
const router = express.Router();
const getPrices = require('./getPricesController');
const { asyncWrapper } = require('./helpers/asyncWrapper');

router.get('/zamokukr', asyncWrapper(getPrices.getPricesZamokUkrController));
router.get('/kremin', asyncWrapper(getPrices.getPricesKreminController));
router.get('/houselock', asyncWrapper(getPrices.getPricesHLController));
router.get('/topzamok', asyncWrapper(getPrices.getPricesTopZamokController));
router.get('/kupizamok', asyncWrapper(getPrices.getPricesKupiZamokController));
router.get('/ukrlock', asyncWrapper(getPrices.getPricesUkrLockController));
router.get('/svitzamkiv', asyncWrapper(getPrices.getPricesSvitZamkivController));
router.get('/zamochniki', asyncWrapper(getPrices.getPricesZamochnikiController));
router.get('/740', asyncWrapper(getPrices.getPrices740Controller));

module.exports = router;
