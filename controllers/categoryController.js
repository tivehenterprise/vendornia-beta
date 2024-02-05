const createError = require("../helpers/createError");
const Category = require("../schemas/categorySchema");

const categoryController = {
  create: async (req, res, next) => {
    const { tag } = req.body;

    if (!tag) {
      return createError(next, "A tag is required.", 400);
    }

    if (typeof tag !== "string") {
      return createError(next, "Tag must be a string", 400);
    }

    try {
      // Check if the provided category tag exists in the Category document
      const categoryDocument = await Category.findOne({});
      if (categoryDocument) {
        const { tags } = categoryDocument;
        if (!tags.includes(tag)) {
          tags.push(tag); // Add the new category tag
          await categoryDocument.save();
        }
      } else {
        // Create a new Category document if none exists
        const newCategory = new Category({ tags: [tag] });
        await newCategory.save();
      }

      res.status(201).json({ tag });
    } catch (error) {
      createError(next, "Server error", 500);
    }
  },

  getTags: async (req, res, next) => {
    try {
      const categoryDocument = await Category.findOne({});
      if (categoryDocument) {
        const { tags } = categoryDocument;
        res.status(200).json({ success: true, message: "", data: tags });
      } else {
        res.status(200).json({ success: true, message: "", data: [] }); // Return an empty array if no Category document exists
      }
    } catch (error) {
      createError(next, "Server error", 500);
    }
  },
};

module.exports = categoryController;
