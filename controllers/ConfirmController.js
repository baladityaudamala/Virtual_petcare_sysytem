// controllers/ConfirmController.js — Sequelize version
const { ConfirmToken, User } = require("../models/index");

module.exports = {
  confirmUser: async (req, res) => {
    try {
      const token = req.params.token;

      // Check token exists and hasn't expired (1 hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const { Op } = require("sequelize");

      const confirmation = await ConfirmToken.findOne({
        where: {
          token,
          createdAt: { [Op.gte]: oneHourAgo },
        },
      });
      if (!confirmation) return res.status(400).send("Invalid or expired token");

      const user = await User.findByPk(confirmation.userId);
      if (!user) return res.status(400).send("User not found");

      user.confirmed = true;
      await user.save();

      await ConfirmToken.destroy({ where: { token } });

      res.send("<h2>Your email has been verified successfully!</h2>");
    } catch (err) {
      console.log(err);
      res.status(500).send("Server error");
    }
  },
};
