module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define(
    "Session",
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

      deviceId: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      accessToken: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      refreshToken: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      lastLogin: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "session",
      timestamps: true,
      paranoid: true,

      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    },
  );

  Session.associate = (models) => {
    Session.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
  };

  return Session;
};
