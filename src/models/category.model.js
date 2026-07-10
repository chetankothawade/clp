// models/category.model.js
import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Category = sequelize.define(
        "Category",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            uuid: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                unique: true
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            parentId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: "parent_id",
            },
            status: {
                type: DataTypes.ENUM("active", "inactive"),
                defaultValue: "active",
                allowNull: false,
            },
        },
        {
            tableName: "categories",
            timestamps: true,
            underscored: true
        }
    );

    // ✅ Associations
    Category.associate = (models) => {
        // A category may belong to another category (its parent)
        Category.belongsTo(models.Category, {
            as: "parent",
            foreignKey: { name: "parentId", field: "parent_id" },
        });

        // A category may have multiple subcategories (children)
        Category.hasMany(models.Category, {
            as: "subcategories",
            foreignKey: { name: "parentId", field: "parent_id" },
            inverse: { as: "parent" }
        });
    };

    return Category;
};
