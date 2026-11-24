const router = require("express").Router();
const { register, login, getUser, deleteUser, forgotPassword, resetPassword } = require("../controllers/UserController");
const auth = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me/:id", getUser);
router.delete("/:id", deleteUser);

// current user from token
router.get("/", auth, async (req, res) => {
  try {
    const User = require("../models/User");
    const user = await User.findByPk(req.user, {
      attributes: { exclude: ["password"] },
    });
    if (!user) return res.status(404).json({ msg: "User not found" });
    const u = user.toJSON();
    u._id = u.id; // alias for frontend compatibility
    res.json(u);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
