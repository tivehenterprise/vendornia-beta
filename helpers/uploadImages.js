const cloudinary = require("cloudinary")

module.exports = async (req, cloudinaryUrls, next, forVendor) => {
  const images = []
  for (const file of req.files) {
    console.log(file)
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: forVendor ? "vendorImages" : "productImages",
      });
      images.push(result.secure_url);
    } catch (error) {
      return createError(next, "Error uploading images.", 500);
    }
  }
  return images
};
