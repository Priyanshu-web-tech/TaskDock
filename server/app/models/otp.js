const { otpType } = require("../constant/constant");

module.exports = (sequelize, DataTypes) => {
  const Otp = sequelize.define(
    "Otp",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      otp: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      otpType: {
        type: DataTypes.ENUM(...Object.values(otpType)),
        allowNull: false,
      },

      otpSentAt: {
        type: DataTypes.BIGINT,
        defaultValue: Date.now,
      },

      otpSent: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },

      otpRetries: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      lastAttempt: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
    },
    {
      tableName: "otp",
      timestamps: true,
      paranoid: true,
    },
  );

  Otp.associate = (models) => {
    Otp.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
  };

  return Otp;
};
