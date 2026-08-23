const prisma = require("../config/db");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { writeLog } = require("../utils/logger");

exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { id: "asc" } });
    return successResponse(res, categories, "Categories fetched successfully.");
  } catch (error) { next(error); }
};

exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await prisma.category.findUnique({ where: { id: req.params.id }, include: { products: true } });
    if (!category) return errorResponse(res, "Category not found.", 404);
    return successResponse(res, category, "Category details fetched successfully.");
  } catch (error) { next(error); }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { id, name, iconName, iconFamily, bgColor, badge } = req.body;
    const category = await prisma.category.create({
      data: { id: id || "cat-" + Date.now(), name, iconName, iconFamily, bgColor, badge: badge || null },
    });
    await writeLog({
      type: "SUCCESS",
      action: "Category Created",
      category: "product",
      details: `New category "${name}" (ID: ${category.id}) added to store — Icon: ${iconName || "default"}, Theme: ${bgColor || "#FFF0F5"}`,
      actor: "Admin",
    });
    return successResponse(res, category, "Category created successfully.", 201);
  } catch (error) { next(error); }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, iconName, iconFamily, bgColor, badge } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (iconName !== undefined) data.iconName = iconName;
    if (iconFamily !== undefined) data.iconFamily = iconFamily;
    if (bgColor !== undefined) data.bgColor = bgColor;
    if (badge !== undefined) data.badge = badge;

    const updated = await prisma.category.upsert({
      where: { id },
      update: data,
      create: { id, name: name || "New Category", iconName: iconName || "sparkles", iconFamily: iconFamily || "Ionicons", bgColor: bgColor || "#FFF0F5", badge: badge || null },
    });
    await writeLog({
      type: "INFO",
      action: "Category Updated",
      category: "product",
      details: `Category "${updated.name}" (ID: ${id}) modified — Fields updated: ${Object.keys(data).join(", ")}`,
      actor: "Admin",
    });
    return successResponse(res, updated, "Category updated successfully.");
  } catch (error) { next(error); }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cat = await prisma.category.findUnique({ where: { id } });
    await prisma.category.delete({ where: { id } });
    await writeLog({
      type: "WARN",
      action: "Category Deleted",
      category: "product",
      details: `Category "${cat?.name || id}" (ID: ${id}) permanently deleted from store`,
      actor: "Admin",
    });
    return successResponse(res, { id }, "Category deleted successfully.");
  } catch (error) { next(error); }
};
