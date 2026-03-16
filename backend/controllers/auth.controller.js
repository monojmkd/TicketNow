const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Cost factor 10 in dev, 8 in production on free-tier servers.
// bcrypt at cost 10 takes ~300ms on a fast machine but ~2000ms on Render's
// shared free tier CPU — long enough to hold a DB connection and time out.
// Cost 8 is still secure (2^8 = 256 rounds) and runs in ~100ms.
const BCRYPT_ROUNDS = process.env.NODE_ENV === "production" ? 8 : 10;

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role)
      return res.status(400).json({ message: "Missing required fields" });

    if (!["organizer", "customer"].includes(role))
      return res.status(400).json({ message: "role must be organizer or customer" });

    const existing = await User.findOne({ where: { email } });
    if (existing)
      return res.status(409).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await User.create({ name, email, password: hashedPassword, role });

    const { password: _omit, ...safeUser } = user.toJSON();

    res.status(201).json(safeUser);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Missing required fields" });

    const user = await User.findOne({ where: { email } });

    const hashToCompare = user
      ? user.password
      : "$2a$08$invalidhashfortimingXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
    const match = await bcrypt.compare(password, hashToCompare);

    if (!user || !match)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({ token });
  } catch (err) {
    next(err);
  }
};