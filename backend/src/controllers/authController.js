const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { normalizeSingleImage } = require("../utils/imageUploads");

const sanitizeUser = (user) => {
  const defaultAddress =
    user.addresses?.find((item) => item.isDefault) || user.addresses?.[0];

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || "",
    gender: user.gender || "",
    dob: user.dob || "",
    profileImage: user.profileImage || "",
    emailVerified: Boolean(user.emailVerified),
    address: {
      label: defaultAddress?.label || user.address?.label || "Home",
      line1: defaultAddress?.line1 || user.address?.line1 || "",
      line2: defaultAddress?.line2 || user.address?.line2 || "",
      city: defaultAddress?.city || user.address?.city || "",
      state: defaultAddress?.state || user.address?.state || "",
      postalCode: defaultAddress?.postalCode || user.address?.postalCode || "",
      country: defaultAddress?.country || user.address?.country || "India",
    },
    addresses: (user.addresses || []).map((item) => ({
      id: item._id,
      label: item.label || "Home",
      type: item.type || "Home",
      fullName: item.fullName || "",
      phone: item.phone || "",
      line1: item.line1 || "",
      line2: item.line2 || "",
      city: item.city || "",
      state: item.state || "",
      postalCode: item.postalCode || "",
      country: item.country || "India",
      isDefault: Boolean(item.isDefault),
    })),
    paymentMethods: (user.paymentMethods || []).map((item) => ({
      id: item._id,
      type: item.type || "card",
      label: item.label || "",
      cardLast4: item.cardLast4 || "",
      upiId: item.upiId || "",
      walletProvider: item.walletProvider || "",
      isDefault: Boolean(item.isDefault),
    })),
    preferences: {
      emailNotifications: user.preferences?.emailNotifications ?? true,
      smsAlerts: user.preferences?.smsAlerts ?? false,
      orderUpdates: user.preferences?.orderUpdates ?? true,
      promotionalOffers: user.preferences?.promotionalOffers ?? true,
    },
  };
};

const sendAuthError = (res, error, fallbackMessage) => {
  console.error(error);

  if (error?.name === "ValidationError") {
    const message = Object.values(error.errors)
      .map((item) => item.message)
      .join(", ");

    return res.status(400).json({ message });
  }

  if (error?.code === 11000) {
    return res.status(400).json({ message: "User already exists" });
  }

  return res.status(500).json({
    message: error?.message || fallbackMessage,
  });
};

const normalizeAddresses = (addresses = [], fallbackName = "", fallbackPhone = "") =>
  addresses.map((item, index) => ({
    label: item.label?.trim() || item.type?.trim() || "Home",
    type: ["Home", "Work", "Other"].includes(item.type) ? item.type : "Home",
    fullName: item.fullName?.trim() || fallbackName,
    phone: item.phone?.trim() || fallbackPhone,
    line1: item.line1?.trim() || "",
    line2: item.line2?.trim() || "",
    city: item.city?.trim() || "",
    state: item.state?.trim() || "",
    postalCode: item.postalCode?.trim() || "",
    country: item.country?.trim() || "India",
    isDefault:
      typeof item.isDefault === "boolean"
        ? item.isDefault
        : index === 0,
  }));

const normalizePaymentMethods = (paymentMethods = []) =>
  paymentMethods.map((item, index) => ({
    type: ["card", "upi", "wallet", "cod"].includes(item.type)
      ? item.type
      : "card",
    label: item.label?.trim() || "",
    cardLast4: item.cardLast4?.trim() || "",
    upiId: item.upiId?.trim() || "",
    walletProvider: item.walletProvider?.trim() || "",
    isDefault:
      typeof item.isDefault === "boolean"
        ? item.isDefault
        : index === 0,
  }));

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const allowedRole = role === "seller" ? "seller" : "buyer";

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: allowedRole,
    });

    generateToken(res, user);

    return res.status(201).json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return sendAuthError(res, error, "Unable to create account");
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    generateToken(res, user);

    return res.status(200).json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return sendAuthError(res, error, "Unable to login");
  }
};

exports.logout = async (req, res) => {
  const sameSite = process.env.COOKIE_SAME_SITE || "lax";
  const secureCookie =
    process.env.COOKIE_SECURE === "true" ||
    process.env.NODE_ENV === "production";

  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    sameSite,
    secure: secureCookie,
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return sendAuthError(res, error, "Unable to fetch user");
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      name,
      email,
      phone,
      gender,
      dob,
      profileImage,
      currentPassword,
      newPassword,
      address = {},
      addresses,
      paymentMethods,
      preferences,
    } = req.body;

    if (typeof name === "string" && name.trim()) {
      user.name = name.trim();
    }

    if (typeof email === "string" && email.trim()) {
      const normalizedEmail = email.trim().toLowerCase();

      if (normalizedEmail !== user.email) {
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
          return res.status(400).json({ message: "Email already in use" });
        }
      }

      user.email = normalizedEmail;
    }

    if (typeof phone === "string") {
      user.phone = phone.trim();
    }

    if (typeof gender === "string") {
      user.gender = gender;
    }

    if (typeof dob === "string") {
      user.dob = dob;
    }

    if (typeof profileImage === "string") {
      user.profileImage = await normalizeSingleImage(
        profileImage,
        "techbazaar/profiles"
      );
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          message: "Current password is required to set a new password",
        });
      }

      const userWithPassword = await User.findById(req.user.id).select("+password");
      const isMatch = await userWithPassword.comparePassword(currentPassword);

      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      if (String(newPassword).length < 6) {
        return res.status(400).json({
          message: "New password must be at least 6 characters long",
        });
      }

      user.password = newPassword;
    }

    if (Array.isArray(addresses)) {
      const normalizedAddresses = normalizeAddresses(addresses, user.name, user.phone);
      const hasDefault = normalizedAddresses.some((item) => item.isDefault);
      user.addresses = normalizedAddresses.map((item, index) => ({
        ...item,
        isDefault: hasDefault ? item.isDefault : index === 0,
      }));
    }

    if (address && typeof address === "object") {
      user.address = {
        label:
          typeof address.label === "string" && address.label.trim()
            ? address.label.trim()
            : user.address?.label || "Home",
        line1:
          typeof address.line1 === "string"
            ? address.line1.trim()
            : user.address?.line1 || "",
        line2:
          typeof address.line2 === "string"
            ? address.line2.trim()
            : user.address?.line2 || "",
        city:
          typeof address.city === "string"
            ? address.city.trim()
            : user.address?.city || "",
        state:
          typeof address.state === "string"
            ? address.state.trim()
            : user.address?.state || "",
        postalCode:
          typeof address.postalCode === "string"
            ? address.postalCode.trim()
            : user.address?.postalCode || "",
        country:
          typeof address.country === "string" && address.country.trim()
            ? address.country.trim()
            : user.address?.country || "India",
      };
    }

    if (Array.isArray(paymentMethods)) {
      const normalizedPaymentMethods = normalizePaymentMethods(paymentMethods);
      const hasDefault = normalizedPaymentMethods.some((item) => item.isDefault);
      user.paymentMethods = normalizedPaymentMethods.map((item, index) => ({
        ...item,
        isDefault: hasDefault ? item.isDefault : index === 0,
      }));
    }

    if (preferences && typeof preferences === "object") {
      user.preferences = {
        emailNotifications:
          typeof preferences.emailNotifications === "boolean"
            ? preferences.emailNotifications
            : user.preferences?.emailNotifications ?? true,
        smsAlerts:
          typeof preferences.smsAlerts === "boolean"
            ? preferences.smsAlerts
            : user.preferences?.smsAlerts ?? false,
        orderUpdates:
          typeof preferences.orderUpdates === "boolean"
            ? preferences.orderUpdates
            : user.preferences?.orderUpdates ?? true,
        promotionalOffers:
          typeof preferences.promotionalOffers === "boolean"
            ? preferences.promotionalOffers
            : user.preferences?.promotionalOffers ?? true,
      };
    }

    if ((!user.addresses || user.addresses.length === 0) && user.address?.line1) {
      user.addresses = normalizeAddresses(
        [
          {
            label: user.address.label || "Home",
            type: "Home",
            fullName: user.name,
            phone: user.phone,
            line1: user.address.line1,
            line2: user.address.line2,
            city: user.address.city,
            state: user.address.state,
            postalCode: user.address.postalCode,
            country: user.address.country,
            isDefault: true,
          },
        ],
        user.name,
        user.phone
      );
    }

    const defaultAddress =
      user.addresses?.find((item) => item.isDefault) || user.addresses?.[0];
    if (defaultAddress) {
      user.address = {
        label: defaultAddress.label,
        line1: defaultAddress.line1,
        line2: defaultAddress.line2,
        city: defaultAddress.city,
        state: defaultAddress.state,
        postalCode: defaultAddress.postalCode,
        country: defaultAddress.country,
      };
    }

    await user.save();

    return res.status(200).json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return sendAuthError(res, error, "Unable to update profile");
  }
};
