module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define(
    "Task",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "user",
          key: "id",
        },
      },

      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM("todo", "in_progress", "completed"),
        defaultValue: "todo",
        allowNull: false,
      },

      priority: {
        type: DataTypes.ENUM("low", "medium", "high"),
        defaultValue: "medium",
        allowNull: false,
      },

      dueDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "task",
      timestamps: true,
      paranoid: true,
    },
  );

  Task.associate = (models) => {
    Task.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
      onDelete: "CASCADE",
    });
  };

  return Task;
};
