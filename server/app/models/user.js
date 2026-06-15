const { userType } = require("../constant/constant");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      userType: {
        type: DataTypes.ENUM(userType.ADMIN, userType.USER),
        defaultValue: userType.USER,
      },

      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      lastName: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
        set(value) {
          this.setDataValue("email", value.toLowerCase().trim());
        },
      },

      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      loginAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      lockUntil: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
    },
    {
      tableName: "user",
      timestamps: true,
      paranoid: true,

    },
  );

  User.associate = (models) => {
    User.hasMany(models.Task, {
      foreignKey: "userId",
      as: "tasks",
    });
  };

  return User;
};
