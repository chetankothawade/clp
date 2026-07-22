import db from '../models/index.js';
import { BaseRepository } from './base.repository.js';

const { Redemption } = db;

class RedemptionRepository extends BaseRepository {
  constructor() {
    super(Redemption);
  }
}

export const redemptionRepository = new RedemptionRepository();
