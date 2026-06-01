const configureCloudinary = require("../config/cloudinary");

const DATA_URI_REGEX = /^data:image\/[a-zA-Z0-9.+-]+;base64,/;

const isDataUriImage = (value) =>
  typeof value === "string" && DATA_URI_REGEX.test(value.trim());

const isRemoteImageUrl = (value) =>
  typeof value === "string" && /^https?:\/\//i.test(value.trim());

const uploadImage = async (image, folder) => {
  const cloudinary = configureCloudinary();
  const result = await cloudinary.uploader.upload(image, {
    folder,
    resource_type: "image",
  });

  return result.secure_url;
};

const normalizeImages = async (images, folder, maxImages = 6) => {
  const values = Array.isArray(images) ? images : [];
  const trimmed = values
    .filter((value) => typeof value === "string" && value.trim())
    .slice(0, maxImages);

  return Promise.all(
    trimmed.map(async (value) => {
      if (isDataUriImage(value)) {
        return uploadImage(value, folder);
      }

      if (isRemoteImageUrl(value)) {
        return value.trim();
      }

      return null;
    })
  ).then((results) => results.filter(Boolean));
};

const normalizeSingleImage = async (image, folder) => {
  if (typeof image !== "string" || !image.trim()) {
    return "";
  }

  if (isDataUriImage(image)) {
    return uploadImage(image, folder);
  }

  if (isRemoteImageUrl(image)) {
    return image.trim();
  }

  return "";
};

module.exports = {
  normalizeImages,
  normalizeSingleImage,
};
