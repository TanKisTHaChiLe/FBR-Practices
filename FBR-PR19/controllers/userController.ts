import { Request, Response } from "express";
import User from "../models/User";
import {
  IUserCreate,
  IUserUpdate,
  IApiResponse,
  IValidationError,
} from "../types";

const validateUserData = (
  data: Partial<IUserCreate>,
  isUpdate: boolean = false,
): IValidationError[] => {
  const errors: IValidationError[] = [];

  if (!isUpdate) {
    if (!data.first_name || data.first_name.trim() === "") {
      errors.push({
        field: "first_name",
        message: "Имя обязательно для заполнения",
      });
    }
    if (!data.last_name || data.last_name.trim() === "") {
      errors.push({
        field: "last_name",
        message: "Фамилия обязательна для заполнения",
      });
    }
    if (data.age === undefined || data.age === null) {
      errors.push({
        field: "age",
        message: "Возраст обязателен для заполнения",
      });
    }
  }

  if (data.age !== undefined) {
    if (typeof data.age !== "number" || isNaN(data.age)) {
      errors.push({ field: "age", message: "Возраст должен быть числом" });
    } else if (data.age < 0 || data.age > 150) {
      errors.push({ field: "age", message: "Возраст должен быть от 0 до 150" });
    }
  }

  if (data.first_name !== undefined && data.first_name.trim() === "") {
    errors.push({ field: "first_name", message: "Имя не может быть пустым" });
  }

  if (data.first_name !== undefined && data.first_name.length > 100) {
    errors.push({
      field: "first_name",
      message: "Имя не может превышать 100 символов",
    });
  }

  if (data.last_name !== undefined && data.last_name.trim() === "") {
    errors.push({
      field: "last_name",
      message: "Фамилия не может быть пустой",
    });
  }

  if (data.last_name !== undefined && data.last_name.length > 100) {
    errors.push({
      field: "last_name",
      message: "Фамилия не может превышать 100 символов",
    });
  }

  return errors;
};

export const createUser = async (
  req: Request<{}, {}, IUserCreate>,
  res: Response,
) => {
  try {
    const errors = validateUserData(req.body);
    if (errors.length > 0) {
      const response: IApiResponse = {
        success: false,
        errors: errors.map((e) => e.message),
      };
      return res.status(400).json(response);
    }

    const user = await User.create(req.body);
    const response: IApiResponse<IUserCreate> = {
      success: true,
      data: user,
      message: "Пользователь успешно создан",
    };
    return res.status(201).json(response);
  } catch (error) {
    console.error("Ошибка создания пользователя:", error);

    if (error instanceof Error && error.message.includes("duplicate key")) {
      return res.status(409).json({
        success: false,
        message: "Пользователь с такими данными уже существует",
      });
    }

    const response: IApiResponse = {
      success: false,
      message: "Ошибка сервера при создании пользователя",
      errors: [error instanceof Error ? error.message : "Неизвестная ошибка"],
    };
    return res.status(500).json(response);
  }
};

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.findAll();

    const response: IApiResponse = {
      success: true,
      count: users.length,
      data: users,
      message: `Найдено ${users.length} пользователей`,
    };
    res.status(200).json(response);
  } catch (error) {
    console.error("Ошибка получения пользователей:", error);
    const response: IApiResponse = {
      success: false,
      message: "Ошибка сервера при получении пользователей",
      errors: [error instanceof Error ? error.message : "Неизвестная ошибка"],
    };
    res.status(500).json(response);
  }
};

export const getUserById = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      const response: IApiResponse = {
        success: false,
        message: "ID должен быть числом",
      };
      return res.status(400).json(response);
    }

    const user = await User.findById(id);

    if (!user) {
      const response: IApiResponse = {
        success: false,
        message: `Пользователь с ID ${id} не найден`,
      };
      return res.status(404).json(response);
    }

    const response: IApiResponse = {
      success: true,
      data: user,
    };
    return res.status(200).json(response);
  } catch (error) {
    console.error("Ошибка получения пользователя:", error);
    const response: IApiResponse = {
      success: false,
      message: "Ошибка сервера при получении пользователя",
      errors: [error instanceof Error ? error.message : "Неизвестная ошибка"],
    };
    return res.status(500).json(response);
  }
};

export const updateUser = async (
  req: Request<{ id: string }, {}, IUserUpdate>,
  res: Response,
) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      const response: IApiResponse = {
        success: false,
        message: "ID должен быть числом",
      };
      return res.status(400).json(response);
    }

    const errors = validateUserData(req.body, true);
    if (errors.length > 0) {
      const response: IApiResponse = {
        success: false,
        errors: errors.map((e) => e.message),
      };
      return res.status(400).json(response);
    }

    const existingUser = await User.findById(id);
    if (!existingUser) {
      const response: IApiResponse = {
        success: false,
        message: `Пользователь с ID ${id} не найден`,
      };
      return res.status(404).json(response);
    }

    const user = await User.update(id, req.body);

    const response: IApiResponse = {
      success: true,
      data: user,
      message: "Пользователь успешно обновлен",
    };
    return res.status(200).json(response);
  } catch (error) {
    console.error("Ошибка обновления пользователя:", error);
    const response: IApiResponse = {
      success: false,
      message: "Ошибка сервера при обновлении пользователя",
      errors: [error instanceof Error ? error.message : "Неизвестная ошибка"],
    };
    return res.status(500).json(response);
  }
};

export const deleteUser = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      const response: IApiResponse = {
        success: false,
        message: "ID должен быть числом",
      };
      return res.status(400).json(response);
    }

    const deleted = await User.delete(id);

    if (!deleted) {
      const response: IApiResponse = {
        success: false,
        message: `Пользователь с ID ${id} не найден`,
      };
      return res.status(404).json(response);
    }

    const response: IApiResponse = {
      success: true,
      message: "Пользователь успешно удален",
    };
    return res.status(200).json(response);
  } catch (error) {
    console.error("Ошибка удаления пользователя:", error);
    const response: IApiResponse = {
      success: false,
      message: "Ошибка сервера при удалении пользователя",
      errors: [error instanceof Error ? error.message : "Неизвестная ошибка"],
    };
    return res.status(500).json(response);
  }
};

export const searchUsers = async (req: Request, res: Response) => {
  try {
    const firstName = req.query.first_name as string;

    if (!firstName) {
      const response: IApiResponse = {
        success: false,
        message: "Параметр first_name обязателен для поиска",
      };
      return res.status(400).json(response);
    }

    const users = await User.searchByFirstName(firstName);

    const response: IApiResponse = {
      success: true,
      count: users.length,
      data: users,
      message: `Найдено ${users.length} пользователей`,
    };
    return res.status(200).json(response);
  } catch (error) {
    console.error("Ошибка поиска пользователей:", error);
    const response: IApiResponse = {
      success: false,
      message: "Ошибка сервера при поиске пользователей",
      errors: [error instanceof Error ? error.message : "Неизвестная ошибка"],
    };
    return res.status(500).json(response);
  }
};

export const getUserStats = async (_req: Request, res: Response) => {
  try {
    const total = await User.count();
    const allUsers = await User.findAll();

    const averageAge =
      allUsers.length > 0
        ? allUsers.reduce((sum, user) => sum + user.age, 0) / allUsers.length
        : 0;

    const minAge =
      allUsers.length > 0 ? Math.min(...allUsers.map((u) => u.age)) : 0;

    const maxAge =
      allUsers.length > 0 ? Math.max(...allUsers.map((u) => u.age)) : 0;

    const response: IApiResponse = {
      success: true,
      data: {
        total_users: total,
        average_age: Math.round(averageAge * 10) / 10,
        min_age: minAge,
        max_age: maxAge,
      },
    };
    res.status(200).json(response);
  } catch (error) {
    console.error("Ошибка получения статистики:", error);
    const response: IApiResponse = {
      success: false,
      message: "Ошибка сервера при получении статистики",
    };
    res.status(500).json(response);
  }
};
