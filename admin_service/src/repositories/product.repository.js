import db from '../models/index.js';
import { BaseRepository } from './base.repository.js';

const { Product } = db;

class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }
}

export const productRepository = new ProductRepository();
