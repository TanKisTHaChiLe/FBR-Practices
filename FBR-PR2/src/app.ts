import express from 'express';
import productsRouter from './routes/products'

const app = express();

app.use(express.json())

app.use('/', productsRouter);

app.listen(3000, () => {
  console.log("Server is runnig");
});
