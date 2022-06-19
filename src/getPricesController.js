const pricesServices = require('./getPriceService');
const zamokUkr = require("../zamokUkr.json");
const topZamok = require("../topZamok.json");

const getPricesTopZamokController = async (req, res, next) => {
    //const topZamok = await pricesServices.getTopZamok();
    // return res.status(200).json({topZamok});
    return res.status(200).json({"topZamok":topZamok});
};
const getPricesZamokUkrController = async (req, res, next) => {
    // const zamokUkr = await pricesServices.getZamokUkr();
    // return res.status(200).json({zamokUkr});
    return res.status(200).json({"zamokUkr": zamokUkr});
};



const getPricesKreminController = async (req, res, next) => {
    const kremin = await pricesServices.getKremin();
    return res.status(200).json({kremin});
};
const getPricesHLController = async (req, res, next) => {
    const houseLock = await pricesServices.getHL();
    return res.status(200).json({houseLock});
};
const getPricesKupiZamokController = async (req, res, next) => {
    const kupiZamok = await pricesServices.getKupiZamok();
    return res.status(200).json({kupiZamok});
};
const getPricesUkrLockController = async (req, res, next) => {
    const ukrLock = await pricesServices.getUkrLock();
    return res.status(200).json({ukrLock});
};
const getPricesSvitZamkivController = async (req, res, next) => {
    const svitZamkiv = await pricesServices.getSvitZamkiv();
    return res.status(200).json({svitZamkiv});
};
const getPricesZamochnikiController = async (req, res, next) => {
    const zamochniki = await pricesServices.getZamochniki();
    return res.status(200).json({zamochniki});
};
const getPrices740Controller = async (req, res, next) => {
    const ua740 = await pricesServices.get740();
    return res.status(200).json({ua740});
};
module.exports = {
    getPricesZamokUkrController,
    getPricesKreminController,
    getPricesHLController,
    getPricesTopZamokController,
    getPricesKupiZamokController,
    getPricesUkrLockController,
    getPricesSvitZamkivController,
    getPricesZamochnikiController,
    getPrices740Controller,
}