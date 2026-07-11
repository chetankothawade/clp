"use strict";

import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";
import { randomUUID } from "crypto";

const SALT_ROUNDS = 10;

export async function up(queryInterface, Sequelize) {
    const hashedPasswordAdmin = await bcrypt.hash("Admin@123", SALT_ROUNDS);
    const hashedPasswordUser = await bcrypt.hash("User@123", SALT_ROUNDS);

    const users = [
        {
            uuid: randomUUID(),
            name: "Super Admin",
            email: "superadmin@yopmail.com",
            password: hashedPasswordAdmin,
            phone: "+911234567890",
            avatar: null,
            role: "super_admin",
            status: "active",
            created_at: new Date(),
            updated_at: new Date(),
        },
        {
            uuid: randomUUID(),
            name: "Admin User",
            email: "admin@yopmail.com",
            password: hashedPasswordAdmin,
            phone: "+911234567891",
            avatar: null,
            role: "admin",
            status: "active",
            created_at: new Date(),
            updated_at: new Date(),
        },
        {
            uuid: randomUUID(),
            name: "Customer User",
            email: "user@yopmail.com",
            password: hashedPasswordUser,
            phone: "+911234567892",
            avatar: null,
            role: "user",
            status: "active",
            created_at: new Date(),
            updated_at: new Date(),
        },
    ];

    // Add 50 random fake users
    for (let i = 0; i < 10; i++) {
        const hashedPassword = await bcrypt.hash("Password@123", SALT_ROUNDS);
        users.push({
            uuid: randomUUID(),
            name: faker.person.fullName(),
            email: faker.internet.email(),
            password: hashedPassword,
            phone: faker.phone.number("+91##########").slice(0, 20),
            avatar: faker.image.avatar(),
            role: "user",
            status: faker.helpers.arrayElement(["active", "inactive", "suspended"]),
            created_at: new Date(),
            updated_at: new Date(),
        });
    }

    return queryInterface.bulkInsert("users", users);
}

export async function down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("users", null, {});
}
