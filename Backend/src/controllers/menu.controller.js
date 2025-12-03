import * as menuService from "../services/menu.service.js";

export const getAllMenus = async (req, res) => {
  try {
    const menus = await menuService.getAllMenus();
    res.json(menus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createMenu = async (req, res) => {
  try {
    const { name, link, isActive, order } = req.body;
    if (!name || !link) {
      return res.status(400).json({ message: "Name and Link are required" });
    }
    const newMenu = await menuService.createMenu({
      name,
      link,
      isActive: isActive === undefined ? true : isActive,
      order: Number(order) || 0,
    });
    res.status(201).json(newMenu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMenu = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.order) updates.order = Number(updates.order);
    
    const updatedMenu = await menuService.updateMenu(req.params.id, updates);
    if (!updatedMenu) {
      return res.status(404).json({ message: "Menu not found" });
    }
    res.json(updatedMenu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMenu = async (req, res) => {
  try {
    const success = await menuService.deleteMenu(req.params.id);
    if (!success) {
      return res.status(404).json({ message: "Menu not found" });
    }
    res.json({ message: "Menu deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
