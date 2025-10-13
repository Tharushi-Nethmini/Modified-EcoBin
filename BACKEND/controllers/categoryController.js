const Category = require('../models/Category');
const { categorySchema } = require('../validation/categoryValidation');

// Add Category
exports.addCategory = async (req, res) => {
    // security fix: validate input with Joi
    const { error } = categorySchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { name, description } = req.body;

    const newCategory = new Category({
        name,
        description,
    });

    try {
        await newCategory.save();
        res.status(200).json("Category Added");
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};

// View All Categories
exports.viewCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};

// Update Category
exports.updateCategory = async (req, res) => {
    const categoryId = req.params.categoryId;

    // security fix: validate input with Joi
    const { error } = categorySchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { name, description } = req.body;

    const updateCategory = { name, description };

    try {
        await Category.findByIdAndUpdate(categoryId, updateCategory);
        res.status(200).send({ status: "Category Updated" });
    } catch (err) {
        console.log(err);
        res.status(500).send({ status: "Error with updating category", error: err.message });
    }
};

// Delete Category
exports.deleteCategory = async (req, res) => {
    const categoryId = req.params.categoryId;

    try {
        await Category.findByIdAndDelete(categoryId);
        res.status(200).send({ status: "Category Deleted" });
    } catch (err) {
        console.log(err.message);
        res.status(500).send({ status: "Error with deleting category", error: err.message });
    }
};

// Fetch Single Category
exports.getCategory = async (req, res) => {
    const categoryId = req.params.categoryId;

    try {
        const category = await Category.findById(categoryId);
        res.status(200).send({ status: "Category Fetched", category });
    } catch (err) {
        console.log(err.message);
        res.status(500).send({ status: "Error with fetching category", error: err.message });
    }
};
