import db from '../models/index.js';
import { BaseRepository } from './base.repository.js';

const { Purchase } = db;

class PurchaseRepository extends BaseRepository {
  constructor() {
    super(Purchase);
  }
}

export const purchaseRepository = new PurchaseRepository();
