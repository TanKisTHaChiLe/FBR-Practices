import { Request, Response } from "express";

const products = [
  {
    id: 1,
    название: "Кофеварка",
    стоимость: 4500,
  },
  {
    id: 2,
    название: "Микроволновая печь",
    стоимость: 6500,
  },
  {
    id: 3,
    название: "Холодильник",
    стоимость: 45000,
  },
  {
    id: 4,
    название: "Чайник",
    стоимость: 2500,
  },
  {
    id: 5,
    название: "Тостер",
    стоимость: 3500,
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
