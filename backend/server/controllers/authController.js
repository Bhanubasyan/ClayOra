const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { sendEmail } = require("../utils/email");

const profileFields = [
  "phone",
  "alternatePhone",
  "address",
  "addressLine1",
  "addressLine2",
  "landmark",
  "city",
  "state",
  "postalCode",
  "country",
  "businessName",
];

const requiredProfileFields = [
  "phone",
  "addressLine1",
  "city",
  "state",
  "postalCode",
  "country",
];

const buildUserResponse = (user, token) => {
  const response = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || "",
    alternatePhone: user.alternatePhone || "",
    address: user.address || "",
    addressLine1: user.addressLine1 || "",
    addressLine2: user.addressLine2 || "",
    landmark: user.landmark || "",
    city: user.city || "",
    state: user.state || "",
    postalCode: user.postalCode || "",
    country: user.country || "India",
    businessName: user.businessName || "",
    isEmailVerified: user.isEmailVerified,
  };

  if (token) {
    response.token = token;
  }

  return response;
};

const createVerificationToken = (user) => {
  const token = crypto.randomBytes(32).toString("hex");
  user.emailVerificationToken = crypto.createHash("sha256").update(token).digest("hex");
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  return token;
};

const sendVerificationEmail = async (user, token) => {
  const clientUrl = (process.env.CLIENT_URL || "http://localhost:3000").replace(/\/$/, "");
  await sendEmail({
    to: user.email,
    subject: "Verify your ClayOra email address",
    html: `<p>Hello ${user.name},</p><p>Please verify your email address to activate your ClayOra account.</p><p><a href="${clientUrl}/verify-email?token=${token}">Verify email address</a></p><p>This link expires in 24 hours.</p>`,
  });
};

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ================= REGISTER =================
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const safeRole = role === "seller" ? "seller" : "buyer";

    const user = await User.create({
      name,
      email,
      password,
      role: safeRole,
    });

    const verificationToken = createVerificationToken(user);
    await user.save();
    await sendVerificationEmail(user, verificationToken);

    res.status(201).json({
      message: "Registration successful. Check your email to verify your account.",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ================= LOGIN =================
exports.loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Administrators are created and controlled internally, so they do not need
    // to be blocked by customer email verification.
    if (user.role !== "admin" && !user.isEmailVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
        needsEmailVerification: true,
      });
    }

    // The login toggle must match the account type. Admin login remains direct.
    if (["buyer", "seller"].includes(role) && user.role !== "admin" && user.role !== role) {
      return res.status(403).json({
        message: `This email is registered as a ${user.role}. Please select ${user.role} before logging in.`,
      });
    }

    res.status(200).json(buildUserResponse(user, generateToken(user._id)));

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

//================= Forgot Password======
exports.forgotPassword = async (req, res) => {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ message: "If an account exists, a reset link has been sent." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // check token by console 
    console.log("RAW RESET TOKEN: ", resetToken);
    console.log("Hased token : " , hashedToken);

    
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    const clientUrl = (process.env.CLIENT_URL || "http://localhost:3000").replace(/\/$/, "");
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your ClayOra password",
      html: `<p>Hello ${user.name},</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in 15 minutes.</p>`,
    });

    res.json({ message: "If an account exists, a reset link has been sent." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to send reset email" });
  }
};

//========================= Reset Password ====================
exports.resetPassword = async (req, res) => {
  try {
    const token = req.params.token || req.body.token || req.query.token;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Reset token is missing" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;


    console.log("TOKEN RECEIVED:", token);
console.log("PASSWORD LENGTH:", password && password.length);
console.log("USER FOUND:", !!user);
console.log("USER EMAIL:", user && user.email);
console.log("USER PASSWORD BEFORE SAVE:", user && user.password);
    await user.save();

    console.log("USER RESET TOKEN IN DB : ", user.resetPasswordToken);
    console.log("USER RESET EXPIRE: ", user.resetPasswordExpire);

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: "This verification link is invalid or has expired." });

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    res.json({ message: "Email verified. You can now log in." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to verify email" });
  }
};

exports.resendVerificationEmail = async (req, res) => {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();
    const user = await User.findOne({ email });
    if (!user || user.isEmailVerified) return res.json({ message: "If this account needs verification, an email has been sent." });

    const verificationToken = createVerificationToken(user);
    await user.save();
    await sendVerificationEmail(user, verificationToken);
    res.json({ message: "Verification email sent. Please check your inbox." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Unable to send verification email" });
  }
};

// ================= PROFILE =================
exports.getUserProfile = async (req, res) => {
  res.status(200).json(req.user);
};

// ================= UPDATE PROFILE =================
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const missingFields = requiredProfileFields.filter(
      (field) => !String(req.body[field] || "").trim()
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Please complete all required profile fields",
        missingFields,
      });
    }

    profileFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    const updatedUser = await user.save();

    res.status(200).json(buildUserResponse(updatedUser));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
