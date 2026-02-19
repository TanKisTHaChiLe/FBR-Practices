import { Request, Response } from "express";

const products = [
  {
    id: 1,
    title: "Кофеварка эспрессо",
    category: "Бытовая техника",
    description:
      "Автоматическая кофеварка для приготовления эспрессо и капучино. Мощность 1450 Вт.",
    price: 4500,
    quantity: 7,
  },
  {
    id: 2,
    title: "Микроволновая печь",
    category: "Бытовая техника",
    description: "Печь Solo с грилем, объем 20 литров, механическое управление.",
    price: 6500,
    quantity: 3,
  },
  {
    id: 3,
    title: "Холодильник",
    category: "Крупная бытовая техника",
    description: "Двухкамерный холодильник с системой No Frost, объем 280 литров.",
    price: 45000,
    quantity: 2,
  },
  {
    id: 4,
    title: "Чайник электрический",
    category: "Мелкая кухонная техника",
    description: "Стальной чайник с заварочным устройством, объем 1.7 литра.",
    price: 2500,
    quantity: 15,
  },
  {
    id: 5,
    title: "Тостер",
    category: "Мелкая кухонная техника",
    description:
      "2-слотовый тостер с регулировкой степени поджаривания и подогревом булочек.",
    price: 3500,
    quantity: 11,
  },
  {
    id: 6,
    title: "Пылесос",
    category: "Уборочная техника",
    description: "Циклонный пылесос с контейнером для пыли и HEPA-фильтром.",
    price: 7800,
    quantity: 5,
  },
  {
    id: 7,
    title: "Утюг",
    category: "Техника для дома",
    description: "Паровой утюг с керамической подошвой и системой самоочистки.",
    price: 3200,
    quantity: 9,
  },
  {
    id: 8,
    title: "Фен для волос",
    category: "Техника для красоты",
    description: "Профессиональный фен с ионизацией и тремя режимами температуры.",
    price: 2900,
    quantity: 14,
  },
  {
    id: 9,
    title: "Мультиварка",
    category: "Кухонная техника",
    description:
      "Мультиварка с 16 программами приготовления и функцией мультиповар.",
    price: 5500,
    quantity: 6,
  },
  {
    id: 10,
    title: "Электромясорубка",
    category: "Кухонная техника",
    description:
      "Мясорубка с металлическим редуктором и насадками для кеббе и соковыжималки.",
    price: 6800,
    quantity: 4,
  },
];

export const getAllProducts = async (req: Request, res: Response) => {
  res.send(products);
};

export const getProductById = async (req: Request, res: Response) => {
  const id = req.params.id;

  const product = products.find((item) => item.id === Number(id));

  if (!product) throw new Error("product not found");

  res.send(product);
};

export const addProduct = async (req: Request, res: Response) => {
  const newProduct = req.body;

  const id = (products.at(-1)?.id || 0) + 1;
  newProduct.id = id;
  products.push(newProduct);

  res.status(201).json(newProduct);
};

export const changeProduct = async (req: Request, res: Response) => {
  const id = req.params.id;
  const product = req.body;

  const index = products.findIndex((item: any) => item.id === Number(id));

  if (index >= 0) {
    products[index] = product;
    res.status(201).send(products[index]);
  } else {
    throw new Error("Product is not found");
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const idProduct = req.params.id;

  const index = products.findIndex(
    (item: any) => item.id === Number(idProduct),
  );

  if (index >= 0) {
    products.splice(index, 1);
    res.status(201).json({ message: "ok" });
  } else {
    throw new Error("Product is not found");
  }
};
