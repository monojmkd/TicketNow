const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role)
      return res.status(400).json({ message: "Missing required fields" });

    if (!["organizer", "customer"].includes(role))
      return res
        .status(400)
        .json({ message: "role must be organizer or customer" });

    const existing = await User.findOne({ where: { email } });
    if (existing)
      return res.status(409).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // Never send the password hash back to the client.
    // user.toJSON() gives a plain object; we just delete the field.
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

    // Always run bcrypt.compare even when user is not found.
    // Without this, timing differences let an attacker enumerate valid emails.
    const hashToCompare = user
      ? user.password
      : "$2a$10$invalidhashfortimingXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
    const match = await bcrypt.compare(password, hashToCompare);

    if (!user || !match)
      return res.status(401).json({ message: "Invalid credentials" });

    // Always set expiresIn. Without it the token is valid forever —
    // a leaked token can never be invalidated.
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    );

    res.json({ token });
  } catch (err) {
    next(err);
  }
};
