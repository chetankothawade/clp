// models/index.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import createCmsModel from './cms.model.js';


const db = { CMS: createCmsModel(sequelize, DataTypes) };

db.sequelize = sequelize;
db.Sequelize = sequelize.constructor;

export default db;
