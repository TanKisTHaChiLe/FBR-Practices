import { Request, Response } from "express";
import userModel from "../models/User";

export const createUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { first_name, last_name, age } = req.body;

    if (!first_name || !last_name || age === undefined) {
      res
        .status(400)
        .json({ error: "first_name, last_name and age are required" });
      return;
    }

    if (age < 0) {
      res.status(400).json({ error: "Age must be a positive number" });
      return;
    }

    const user = new userModel({ first_name, last_name, age });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const users = await userModel.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);

    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID format" });
      return;
    }

    const user = await userModel.findOne({ id });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);

    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID format" });
      return;
    }

    const { first_name, last_name, age } = req.body;
    const updateData: any = {};

    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (age !== undefined) {
      if (age < 0) {
        res.status(400).json({ error: "Age must be a positive number" });
        return;
      }
      updateData.age = age;
    }

    const user = await userModel.findOneAndUpdate({ id }, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);

    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID format" });
      return;
    }

    const user = await userModel.findOneAndDelete({ id });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ message: "User deleted successfully", user });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
