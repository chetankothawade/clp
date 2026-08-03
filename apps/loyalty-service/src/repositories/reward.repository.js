import db from '../models/index.js';
import { BaseRepository } from './base.repository.js';

const { Reward } = db;

class RewardRepository extends BaseRepository {
  constructor() {
    super(Reward);
  }
}

export const rewardRepository = new RewardRepository();
