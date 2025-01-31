const {
  saveTask,
  loadTask,
  listTasks,
  deleteTask,
} = require("../utils/agent-tasks");

function agentTaskEndpoints(app) {
  if (!app) return;

  // Save a task configuration
  app.post(
    "/agent-task/save",
    // [validatedRequest, strictMultiUserRoleValid([ROLES.admin, ROLES.manager])],
    async (request, response) => {
      try {
        const { name, config, uuid } = request.body;

        if (!name || !config) {
          return response.status(400).json({
            success: false,
            error: "Name and config are required",
          });
        }

        const result = await saveTask(name, config, uuid);
        if (!result.success) {
          return response.status(500).json({
            success: false,
            error: "Failed to save task",
          });
        }

        return response.status(200).json({
          success: true,
          task: { name, config, uuid: result.uuid },
        });
      } catch (error) {
        console.error("Error saving task:", error);
        return response.status(500).json({
          success: false,
          error: error.message,
        });
      }
    }
  );

  // List all available tasks
  app.get(
    "/agent-task/list",
    // [validatedRequest, strictMultiUserRoleValid([ROLES.admin, ROLES.manager])],
    async (_request, response) => {
      try {
        const tasks = await listTasks();
        return response.status(200).json({
          success: true,
          tasks,
        });
      } catch (error) {
        console.error(error);
        return response.status(500).json({
          success: false,
          error: error.message,
        });
      }
    }
  );

  // Get a specific task by UUID
  app.get(
    "/agent-task/:uuid",
    // [validatedRequest, strictMultiUserRoleValid([ROLES.admin, ROLES.manager])],
    async (request, response) => {
      try {
        const { uuid } = request.params;
        const task = await loadTask(uuid);
        if (!task) {
          return response.status(404).json({
            success: false,
            error: "Task not found",
          });
        }

        return response.status(200).json({
          success: true,
          task,
        });
      } catch (error) {
        console.error(error);
        return response.status(500).json({
          success: false,
          error: error.message,
        });
      }
    }
  );

  // Run a specific task
  app.post(
    "/agent-task/:uuid/run",
    // [validatedRequest, strictMultiUserRoleValid([ROLES.admin, ROLES.manager])],
    async (request, response) => {
      try {
        const { uuid } = request.params;
        const { variables = {} } = request.body;

        // TODO: Implement task execution
        console.log("Running task with UUID:", uuid);

        return response.status(200).json({
          success: true,
          results: {
            success: true,
            results: "test",
            variables: variables,
          },
        });
      } catch (error) {
        console.error(error);
        return response.status(500).json({
          success: false,
          error: error.message,
        });
      }
    }
  );

  // Delete a specific task
  app.delete(
    "/agent-task/:uuid",
    // [validatedRequest, strictMultiUserRoleValid([ROLES.admin, ROLES.manager])],
    async (request, response) => {
      try {
        const { uuid } = request.params;
        const result = await deleteTask(uuid);

        if (!result.success) {
          return response.status(500).json({
            success: false,
            error: result.error || "Failed to delete task",
          });
        }

        return response.status(200).json({
          success: true,
        });
      } catch (error) {
        console.error(error);
        return response.status(500).json({
          success: false,
          error: error.message,
        });
      }
    }
  );
}

module.exports = { agentTaskEndpoints };
